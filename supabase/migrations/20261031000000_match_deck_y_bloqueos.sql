-- DentaMeet 1.x — mazo en el servidor y bloqueos/reportes (2026-10-31).
--
-- 1. match_deck(p_limit): el servidor arma y ordena el mazo con puntaje y razones legibles
--    (docs/05-algoritmo-de-match.md §3.6). Reemplaza el filtrado en el cliente que bajaba
--    hasta 1.000 perfiles.
-- 2. blocks / reports: reportar o bloquear a alguien lo saca del mazo, corta el match y
--    oculta su teléfono.

-- ---------------------------------------------------------------------------
-- Tratamiento (lo que busca el paciente) → especialidades (lo que trabaja el estudiante)
-- ---------------------------------------------------------------------------
create table public.treatment_specialties (
  treatment  text not null,
  specialty  text not null,
  primary key (treatment, specialty)
);

insert into public.treatment_specialties (treatment, specialty) values
  ('Limpieza dental', 'Odontología general'), ('Limpieza dental', 'Periodoncista'),
  ('Blanqueamiento', 'Estética dental'), ('Blanqueamiento', 'Odontología general'),
  ('Ortodoncia', 'Ortodoncista'), ('Ortodoncia', 'Ortopedia maxilar'),
  ('Endodoncia', 'Endodoncista'),
  ('Implantes', 'Implantología'), ('Implantes', 'Cirujano oral'),
  ('Prótesis', 'Protesista'),
  ('Cirugía oral', 'Cirujano oral'),
  ('Periodoncia', 'Periodoncista'),
  ('Estética dental', 'Estética dental'),
  ('Odontopediatría', 'Odontopediatra'),
  ('Urgencias dentales', 'Odontología general'),
  ('Radiografías', 'Radiología oral'),
  ('Extracción', 'Cirujano oral'), ('Extracción', 'Odontología general'),
  ('Coronas', 'Protesista'),
  ('Carillas', 'Estética dental'), ('Carillas', 'Protesista'),
  ('Puentes', 'Protesista'),
  ('Rehabilitación oral', 'Protesista'), ('Rehabilitación oral', 'Odontología general');

alter table public.treatment_specialties enable row level security;
create policy treatment_specialties_read on public.treatment_specialties for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Bloqueos y reportes
-- ---------------------------------------------------------------------------
create table public.blocks (
  blocker_id  uuid not null references public.person (id) on delete cascade,
  blocked_id  uuid not null references public.person (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.person (id) on delete cascade,
  reported_id  uuid not null references public.person (id) on delete cascade,
  reason       text not null check (reason in ('perfil_falso', 'acoso', 'no_asistio', 'cobro_indebido', 'atencion_fuera_de_clinica', 'otro')),
  details      text check (char_length(details) <= 1000),
  status       text not null default 'abierto' check (status in ('abierto', 'revisado', 'cerrado')),
  created_at   timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

create index blocks_blocked_idx on public.blocks (blocked_id);
create index reports_reported_idx on public.reports (reported_id);

alter table public.blocks  enable row level security;
alter table public.reports enable row level security;

-- Cada uno ve sus propios bloqueos y reportes; se escriben vía RPC
create policy blocks_select  on public.blocks  for select to authenticated using (blocker_id = (select auth.uid()));
create policy reports_select on public.reports for select to authenticated using (reporter_id = (select auth.uid()));

-- ¿Hay un bloqueo en cualquier dirección entre el usuario actual y p_other?
create or replace function public.is_blocked_with(p_other uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.blocks b
    where (b.blocker_id = auth.uid() and b.blocked_id = p_other)
       or (b.blocked_id = auth.uid() and b.blocker_id = p_other)
  );
$$;

-- Un bloqueo también apaga el match: sin teléfono visible ni citas nuevas
create or replace function public.is_matched_with(p_other uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.matches m
    where m.is_mutual
      and ((m.user1_id = auth.uid() and m.user2_id = p_other)
        or (m.user2_id = auth.uid() and m.user1_id = p_other))
  ) and not public.is_blocked_with(p_other);
$$;

create or replace function public.block_user(p_target uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'not authenticated' using errcode = '42501'; end if;
  if p_target is null or p_target = v_me then raise exception 'invalid target' using errcode = '22023'; end if;

  insert into public.blocks (blocker_id, blocked_id) values (v_me, p_target) on conflict do nothing;
  -- El match se deshace y las citas futuras se cancelan
  delete from public.matches
   where (user1_id = v_me and user2_id = p_target) or (user2_id = v_me and user1_id = p_target);
  update public.appointments
     set status = 'cancelada', notas_cancelacion = 'Cancelada por bloqueo'
   where status in ('pendiente', 'confirmada')
     and fecha_hora > now()
     and ((user1_id = v_me and user2_id = p_target) or (user2_id = v_me and user1_id = p_target));
end $$;

create or replace function public.report_user(p_target uuid, p_reason text, p_details text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := auth.uid();
  v_id uuid;
begin
  if v_me is null then raise exception 'not authenticated' using errcode = '42501'; end if;
  insert into public.reports (reporter_id, reported_id, reason, details)
  values (v_me, p_target, p_reason, nullif(trim(p_details), ''))
  returning id into v_id;
  -- Quien reporta deja de ver a la otra persona
  perform public.block_user(p_target);
  return v_id;
end $$;

-- ---------------------------------------------------------------------------
-- person_public: además de vistos y matches, excluye bloqueos en ambas direcciones
-- ---------------------------------------------------------------------------
create or replace view public.person_public as
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
                       or (m.user2_id = auth.uid() and m.user1_id = p.id))
    and not exists (select 1 from public.blocks b
                    where (b.blocker_id = auth.uid() and b.blocked_id = p.id)
                       or (b.blocked_id = auth.uid() and b.blocker_id = p.id));

-- ---------------------------------------------------------------------------
-- match_deck: filtros duros + puntaje 0–100 + razones
--   tratamiento ↔ especialidad  hasta 40
--   ubicación                   misma comuna 30 · misma región 15
--   horario en común            15
--   ya te dio like              10  (sube la probabilidad de match, sin revelarlo)
--   perfil completo             hasta 5
-- ---------------------------------------------------------------------------
create or replace function public.match_deck(p_limit int default 20)
returns table (
  id uuid, nombre text, apellido text, role text, region text, comuna text, edad int,
  universidad text, etapa_formacion text, especialidades text[], tratamientos_interes text[],
  horarios_disponibles text[], descripcion text, score int, reasons text[]
)
language plpgsql stable security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_me public.person;
begin
  select * into v_me from public.person where person.id = auth.uid();
  if v_me.id is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  return query
  with candidates as (
    select p.*
    from public.person p
    where p.id <> v_me.id
      and p.onboarding_completed
      and case v_me.role
            when 'paciente'    then p.role in ('estudiante', 'dentameeter')
            when 'estudiante'  then p.role in ('paciente', 'dentameeter')
            else                    p.role in ('paciente', 'estudiante')
          end
      and not exists (select 1 from public.swipes s where s.swiper_id = v_me.id and s.target_id = p.id)
      and not exists (select 1 from public.matches m
                      where (m.user1_id = v_me.id and m.user2_id = p.id) or (m.user2_id = v_me.id and m.user1_id = p.id))
      and not exists (select 1 from public.blocks b
                      where (b.blocker_id = v_me.id and b.blocked_id = p.id) or (b.blocked_id = v_me.id and b.blocker_id = p.id))
  ),
  scored as (
    select c.*,
      -- quién busca y quién trabaja en este par
      case when v_me.role = 'estudiante' or (v_me.role = 'dentameeter' and c.role = 'paciente')
           then c.tratamientos_interes else v_me.tratamientos_interes end as wants,
      case when v_me.role = 'estudiante' or (v_me.role = 'dentameeter' and c.role = 'paciente')
           then v_me.especialidades else c.especialidades end as offers,
      (select array_agg(h) from unnest(coalesce(c.horarios_disponibles, '{}')) h
        where h = any(coalesce(v_me.horarios_disponibles, '{}'))) as shared_hours,
      exists (select 1 from public.swipes s where s.swiper_id = c.id and s.target_id = v_me.id and s.is_like) as liked_me
    from candidates c
  ),
  fit as (
    select s.*,
      (select array_agg(distinct w order by w) from unnest(coalesce(s.wants, '{}')) w
        where exists (select 1 from public.treatment_specialties ts
                      where ts.treatment = w and ts.specialty = any(coalesce(s.offers, '{}')))) as matched_treatments
    from scored s
  )
  select f.id, f.nombre, f.apellido, f.role, f.region, f.comuna, f.edad, f.universidad, f.etapa_formacion,
         f.especialidades, f.tratamientos_interes, f.horarios_disponibles, f.descripcion,
         least(100,
           least(40, 20 * coalesce(cardinality(f.matched_treatments), 0))
           + case when f.comuna is not null and f.comuna = v_me.comuna then 30
                  when f.region is not null and f.region = v_me.region then 15 else 0 end
           + case when coalesce(cardinality(f.shared_hours), 0) > 0 then 15 else 0 end
           + case when f.liked_me then 10 else 0 end
           + (case when f.descripcion is not null and f.descripcion <> '' then 2 else 0 end)
           + (case when coalesce(cardinality(f.horarios_disponibles), 0) > 0 then 1 else 0 end)
           + (case when f.universidad is not null or coalesce(cardinality(f.tratamientos_interes), 0) > 0 then 2 else 0 end)
         )::int as score,
         array_remove(array[
           case when coalesce(cardinality(f.matched_treatments), 0) > 0
                then 'Calza en ' || array_to_string(f.matched_treatments[1:2], ' y ') end,
           case when f.comuna is not null and f.comuna = v_me.comuna then 'Misma comuna: ' || f.comuna
                when f.region is not null and f.region = v_me.region then 'Misma región' end,
           case when coalesce(cardinality(f.shared_hours), 0) > 0
                then 'Horario en común: ' || split_part(f.shared_hours[1], ' (', 1) end
         ], null) as reasons
  from fit f
  order by score desc, f.created_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 50));
end $$;

revoke execute on function public.match_deck(int) from anon, public;
grant execute on function public.match_deck(int) to authenticated;
revoke execute on function public.block_user(uuid) from anon, public;
grant execute on function public.block_user(uuid) to authenticated;
revoke execute on function public.report_user(uuid, text, text) from anon, public;
grant execute on function public.report_user(uuid, text, text) to authenticated;
revoke execute on function public.is_blocked_with(uuid) from anon, public;
grant execute on function public.is_blocked_with(uuid) to authenticated;
