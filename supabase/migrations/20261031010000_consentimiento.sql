-- Consentimiento explícito para tratar datos de salud (Ley 21.719): fecha y versión del
-- texto aceptado en el onboarding.
alter table public.person add column if not exists consentimiento_at timestamptz;
alter table public.person add column if not exists consentimiento_version text;

-- Los perfiles creados antes de este cambio quedan con consentimiento_at en null: hay que
-- pedírselo al volver a entrar (pendiente en B1 del roadmap).
comment on column public.person.consentimiento_at is
  'Momento en que la persona aceptó el uso de sus datos (incluidos los de salud) para hacer match. Null = pendiente.';
