-- Reproducción del esquema del proyecto real (xkgnatklzehzixnfhklb) tal como estaba el
-- 2026-10-31, auditado por introspección: columnas, restricciones, políticas (incluidas las
-- que filtraban datos) y la vista. Solo para pruebas; los datos son ficticios.

create table public.person (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null, role text not null check (role in ('paciente','estudiante','dentameeter')),
  nombre text not null, apellido text not null, telefono text not null, region text not null, comuna text not null,
  edad integer, universidad text, etapa_formacion text, descripcion text,
  tratamientos_interes text[], especialidades text[], horarios_disponibles text[],
  onboarding_completed boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.swipes (
  actor uuid not null, target uuid not null, created_at timestamptz not null default now(),
  primary key (actor, target)
);
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid references public.person (id) on delete cascade,
  user2_id uuid references public.person (id) on delete cascade,
  user1_liked boolean default false, user2_liked boolean default false, is_mutual boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  unique (user1_id, user2_id)
);
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid, user2_id uuid,
  fecha_hora timestamptz not null, tratamiento text not null,
  status text not null default 'pendiente' check (status in ('pendiente','confirmada','completada','cancelada')),
  notas text, notas_cancelacion text,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  confirmado_por_user1 boolean default false, confirmado_por_user2 boolean default false,
  constraint appointments_user1_id_fkey foreign key (user1_id) references public.person (id),
  constraint appointments_user2_id_fkey foreign key (user2_id) references public.person (id)
);
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  evaluador_id uuid references public.person (id) on delete cascade,
  evaluado_id uuid references public.person (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comentario text not null, recomendaria boolean not null,
  created_at timestamptz default now(),
  unique (evaluador_id, evaluado_id, appointment_id)
);

alter table public.person enable row level security;
alter table public.appointments enable row level security;
alter table public.matches enable row level security;
alter table public.feedback enable row level security;   -- sin políticas (bug real)
-- swipes sin RLS (bug real)

create policy "Allow select for all authenticated users" on public.person for select using (auth.uid() is not null);
create policy "Users can insert own profile" on public.person for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.person for update using (auth.uid() = id);
create policy "Allow select for participants" on public.appointments for select using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "Allow insert for participants" on public.appointments for insert with check (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "Allow update for participants" on public.appointments for update using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy select_own_matches on public.matches for select using (auth.uid() = user1_id or auth.uid() = user2_id);

create view public.person_public as
  select id, nombre, apellido, role, region, comuna, especialidades, tratamientos_interes from public.person;

grant all on public.person_public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
