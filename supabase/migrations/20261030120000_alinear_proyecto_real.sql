-- Alinea el proyecto Supabase real de DentaMeet (xkgnatklzehzixnfhklb, esquema de jul-2025)
-- con la forma de baseline_v1, conservando los datos. Es idempotente: en una base creada
-- desde baseline_v1 no cambia nada.
--
-- Lo que corrige en el proyecto real (auditado el 2026-10-31):
--   * swipes tenía RLS desactivado: cualquiera con la clave anon podía leer y escribir likes.
--   * person tenía "Allow select for all authenticated users": cualquier usuario logueado
--     leía teléfono y correo de todos.
--   * person_public estaba concedida a anon: sin sesión se podían listar perfiles.
--   * feedback tenía RLS sin políticas: la página de opiniones nunca funcionaba.
--   * swipes(actor, target) sin is_like; matches podía guardar el par en cualquier orden.

-- ---------------------------------------------------------------------------
-- swipes: actor/target → swiper_id/target_id + is_like (las filas existentes son likes)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'swipes' and column_name = 'actor') then
    alter table public.swipes rename column actor to swiper_id;
    alter table public.swipes rename column target to target_id;
  end if;
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'swipes' and column_name = 'is_like') then
    alter table public.swipes add column is_like boolean not null default true;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'swipes_swiper_id_fkey') then
    alter table public.swipes add constraint swipes_swiper_id_fkey
      foreign key (swiper_id) references public.person (id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'swipes_target_id_fkey') then
    alter table public.swipes add constraint swipes_target_id_fkey
      foreign key (target_id) references public.person (id) on delete cascade;
  end if;
end $$;

create index if not exists swipes_target_idx on public.swipes (target_id);

-- ---------------------------------------------------------------------------
-- matches: par ordenado (user1_id < user2_id) para que la RPC no duplique
-- ---------------------------------------------------------------------------
update public.matches
   set user1_id = user2_id, user2_id = user1_id
 where user1_id > user2_id;

-- ---------------------------------------------------------------------------
-- RLS: se borran TODAS las políticas de estas tablas y se recrean las de baseline_v1
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public'
             and tablename in ('person', 'swipes', 'matches', 'appointments', 'feedback')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.person       enable row level security;
alter table public.swipes       enable row level security;
alter table public.matches      enable row level security;
alter table public.appointments enable row level security;
alter table public.feedback     enable row level security;

create or replace function public.is_matched_with(p_other uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.matches m
    where m.is_mutual
      and ((m.user1_id = auth.uid() and m.user2_id = p_other)
        or (m.user2_id = auth.uid() and m.user1_id = p_other))
  );
$$;

create policy person_select on public.person for select to authenticated
  using (id = (select auth.uid()) or public.is_matched_with(id));
create policy person_insert on public.person for insert to authenticated
  with check (id = (select auth.uid()));
create policy person_update on public.person for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy person_delete on public.person for delete to authenticated
  using (id = (select auth.uid()));

create policy swipes_select on public.swipes for select to authenticated
  using (swiper_id = (select auth.uid()));

create policy matches_select on public.matches for select to authenticated
  using ((select auth.uid()) in (user1_id, user2_id));
create policy matches_delete on public.matches for delete to authenticated
  using ((select auth.uid()) in (user1_id, user2_id));

create policy appointments_select on public.appointments for select to authenticated
  using ((select auth.uid()) in (user1_id, user2_id));
create policy appointments_insert on public.appointments for insert to authenticated
  with check (
    (select auth.uid()) in (user1_id, user2_id)
    and public.is_matched_with(case when user1_id = (select auth.uid()) then user2_id else user1_id end)
  );
create policy appointments_update on public.appointments for update to authenticated
  using ((select auth.uid()) in (user1_id, user2_id))
  with check ((select auth.uid()) in (user1_id, user2_id));

create policy feedback_select on public.feedback for select to authenticated
  using ((select auth.uid()) in (evaluador_id, evaluado_id));
create policy feedback_insert on public.feedback for insert to authenticated
  with check (
    evaluador_id = (select auth.uid())
    and exists (
      select 1 from public.appointments a
      where a.id = appointment_id
        and (select auth.uid()) in (a.user1_id, a.user2_id)
        and evaluado_id in (a.user1_id, a.user2_id)
        and evaluado_id <> (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- person_public: sin contacto, solo para usuarios con sesión
-- ---------------------------------------------------------------------------
drop view if exists public.person_public;
create view public.person_public as
  select p.id, p.nombre, p.apellido, p.role, p.region, p.comuna, p.edad,
         p.universidad, p.etapa_formacion, p.especialidades, p.tratamientos_interes,
         p.horarios_disponibles, p.descripcion, p.created_at
  from public.person p
  where auth.uid() is not null
    and p.id <> auth.uid()
    and p.onboarding_completed
    and not exists (select 1 from public.swipes s
                    where s.swiper_id = auth.uid() and s.target_id = p.id)
    and not exists (select 1 from public.matches m
                    where (m.user1_id = auth.uid() and m.user2_id = p.id)
                       or (m.user2_id = auth.uid() and m.user1_id = p.id));

revoke all on public.person_public from anon, public;
grant select on public.person_public to authenticated;

-- Ninguna tabla de la app es accesible sin sesión
revoke all on public.person, public.swipes, public.matches, public.appointments, public.feedback from anon;

-- ---------------------------------------------------------------------------
-- RPC de match: misma firma y mismo contrato { match, isMutual } que usa el frontend
-- ---------------------------------------------------------------------------
drop function if exists public.create_or_update_match_rpc(boolean, uuid);
create function public.create_or_update_match_rpc(p_is_like boolean, p_target uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_me     uuid := auth.uid();
  v_match  public.matches;
  v_mutual boolean := false;
begin
  if v_me is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_target is null or p_target = v_me then
    raise exception 'invalid target' using errcode = '22023';
  end if;

  insert into public.swipes (swiper_id, target_id, is_like)
  values (v_me, p_target, p_is_like)
  on conflict (swiper_id, target_id)
    do update set is_like = excluded.is_like, created_at = now();

  if p_is_like and exists (
    select 1 from public.swipes
    where swiper_id = p_target and target_id = v_me and is_like
  ) then
    insert into public.matches (user1_id, user2_id, is_mutual)
    values (least(v_me, p_target), greatest(v_me, p_target), true)
    on conflict (user1_id, user2_id) do update set is_mutual = true
    returning * into v_match;
    v_mutual := true;
  end if;

  return jsonb_build_object(
    'match', case when v_mutual then to_jsonb(v_match) else null end,
    'isMutual', v_mutual
  );
end $$;

revoke execute on function public.create_or_update_match_rpc(boolean, uuid) from anon, public;
grant execute on function public.create_or_update_match_rpc(boolean, uuid) to authenticated;
revoke execute on function public.is_matched_with(uuid) from anon, public;
grant execute on function public.is_matched_with(uuid) to authenticated;
