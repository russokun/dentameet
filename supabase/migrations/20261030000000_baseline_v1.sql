-- DentaMeet 1.x — esquema base reconstruido desde el código del frontend (2026-10-30).
--
-- Los dos proyectos Supabase originales ya no existen (sus hosts no resuelven DNS) y el
-- repo nunca versionó el esquema. Esta migración recrea lo mínimo que el frontend 1.x
-- usa: tablas person, swipes, matches, appointments y feedback, la vista person_public
-- y la RPC create_or_update_match_rpc. Es una reconstrucción: los nombres de columnas
-- y FKs salen de las consultas en src/services/*, no de un dump.
--
-- Cambios conscientes respecto del 1.x original (que se infería del código):
--   * person_public NO expone telefono ni email: antes cualquier usuario logueado podía
--     leer el teléfono de todos. El teléfono solo se ve tras un match mutuo (RLS de person).
--   * person_public excluye al propio usuario, a quienes ya swipeó y a sus matches, para
--     que el mazo no repita perfiles (antes reaparecían los perfiles con like no mutuo).

-- ---------------------------------------------------------------------------
-- person: perfil 1:1 con auth.users
-- ---------------------------------------------------------------------------
create table public.person (
  id                    uuid primary key references auth.users (id) on delete cascade,
  email                 text,
  nombre                text,
  apellido              text,
  telefono              text,
  role                  text not null default 'paciente'
                          check (role in ('paciente', 'estudiante', 'dentameeter')),
  region                text,
  comuna                text,
  edad                  integer check (edad is null or edad between 18 and 100),
  universidad           text,
  etapa_formacion       text,
  especialidades        text[] not null default '{}',
  tratamientos_interes  text[] not null default '{}',
  horarios_disponibles  text[] not null default '{}',
  descripcion           text,
  onboarding_completed  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- swipes: cada like/pass de un usuario sobre otro
-- ---------------------------------------------------------------------------
create table public.swipes (
  swiper_id   uuid not null references public.person (id) on delete cascade,
  target_id   uuid not null references public.person (id) on delete cascade,
  is_like     boolean not null,
  created_at  timestamptz not null default now(),
  primary key (swiper_id, target_id),
  check (swiper_id <> target_id)
);

-- ---------------------------------------------------------------------------
-- matches: par ordenado (user1_id < user2_id), solo se crea con like mutuo
-- ---------------------------------------------------------------------------
create table public.matches (
  id          uuid primary key default gen_random_uuid(),
  user1_id    uuid not null references public.person (id) on delete cascade,
  user2_id    uuid not null references public.person (id) on delete cascade,
  is_mutual   boolean not null default true,
  created_at  timestamptz not null default now(),
  check (user1_id < user2_id),
  unique (user1_id, user2_id)
);

-- ---------------------------------------------------------------------------
-- appointments: citas entre los dos usuarios de un match
-- ---------------------------------------------------------------------------
create table public.appointments (
  id                     uuid primary key default gen_random_uuid(),
  user1_id               uuid not null references public.person (id) on delete cascade,
  user2_id               uuid not null references public.person (id) on delete cascade,
  fecha_hora             timestamptz not null,
  tratamiento            text not null,
  notas                  text,
  status                 text not null default 'pendiente'
                           check (status in ('pendiente', 'confirmada', 'completada', 'cancelada')),
  confirmado_por_user1   boolean not null default false,
  confirmado_por_user2   boolean not null default false,
  notas_cancelacion      text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- feedback: evaluación post-cita
-- ---------------------------------------------------------------------------
create table public.feedback (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid references public.appointments (id) on delete set null,
  evaluador_id    uuid not null references public.person (id) on delete cascade,
  evaluado_id     uuid not null references public.person (id) on delete cascade,
  rating          integer not null check (rating between 1 and 5),
  comentario      text,
  recomendaria    boolean,
  created_at      timestamptz not null default now()
);

create index swipes_target_idx        on public.swipes (target_id);
create index matches_user2_idx        on public.matches (user2_id);
create index appointments_user1_idx   on public.appointments (user1_id, fecha_hora);
create index appointments_user2_idx   on public.appointments (user2_id, fecha_hora);
create index feedback_evaluado_idx    on public.feedback (evaluado_id);
create index feedback_evaluador_idx   on public.feedback (evaluador_id);
create index feedback_appointment_idx on public.feedback (appointment_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger person_updated_at       before update on public.person
  for each row execute function public.set_updated_at();
create trigger appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();

-- ¿El usuario actual tiene match mutuo con p_other?
create or replace function public.is_matched_with(p_other uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.matches m
    where m.is_mutual
      and ((m.user1_id = auth.uid() and m.user2_id = p_other)
        or (m.user2_id = auth.uid() and m.user1_id = p_other))
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.person       enable row level security;
alter table public.swipes       enable row level security;
alter table public.matches      enable row level security;
alter table public.appointments enable row level security;
alter table public.feedback     enable row level security;

-- person: cada uno ve su fila y la de sus matches mutuos (para teléfono/WhatsApp)
create policy person_select on public.person for select to authenticated
  using (id = (select auth.uid()) or public.is_matched_with(id));
create policy person_insert on public.person for insert to authenticated
  with check (id = (select auth.uid()));
create policy person_update on public.person for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy person_delete on public.person for delete to authenticated
  using (id = (select auth.uid()));

-- swipes: solo lectura de los propios; se escriben vía RPC
create policy swipes_select on public.swipes for select to authenticated
  using (swiper_id = (select auth.uid()));

-- matches: los participantes los ven y pueden deshacerlos; se crean vía RPC
create policy matches_select on public.matches for select to authenticated
  using ((select auth.uid()) in (user1_id, user2_id));
create policy matches_delete on public.matches for delete to authenticated
  using ((select auth.uid()) in (user1_id, user2_id));

-- appointments: solo entre usuarios con match mutuo
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

-- feedback: lo ven evaluador y evaluado; solo se evalúa a la contraparte de una cita propia
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
-- person_public: el "mazo" de candidatos, sin datos de contacto.
-- Se ejecuta con los permisos del dueño (no security_invoker) para poder listar
-- perfiles ajenos sin abrir la tabla person; por eso solo expone columnas no sensibles.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- RPC: registrar like/pass y crear el match si el like es mutuo.
-- Contrato usado por MatchService.createMatch: devuelve { match, isMutual }.
-- ---------------------------------------------------------------------------
create or replace function public.create_or_update_match_rpc(p_is_like boolean, p_target uuid)
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
