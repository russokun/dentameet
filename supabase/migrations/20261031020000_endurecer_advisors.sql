-- Endurecimiento según los advisors de seguridad de Supabase (2026-10-31).

-- person_public ya no la usa el cliente (el mazo sale de match_deck). Pasa a security_invoker:
-- respeta el RLS de quien consulta en vez del de su dueño (lint 0010).
alter view public.person_public set (security_invoker = true);

-- search_path fijo en la función de timestamps heredada del proyecto original (lint 0011)
do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_timestamps' and pronamespace = 'public'::regnamespace) then
    alter function public.set_timestamps() set search_path = '';
  end if;
end $$;

-- Las tablas nuevas no son visibles sin sesión, ni por REST ni por GraphQL (lint 0026)
revoke all on public.blocks, public.reports, public.treatment_specialties from anon;
