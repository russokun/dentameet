# DentaMeet 1.x: estado actual (status quo)

**Fecha del diagnóstico:** 2026-10-30. Sale de leer el repo completo (`russokun/dentameet`, 26 commits, 2025-07-01 → 2026-05-09), del historial de `.env` y de pruebas contra la infraestructura. Lo que no se pudo verificar está marcado ❓.

## 1. Qué es

"Tinder dental": conecta **pacientes** que buscan tratamientos dentales accesibles con **estudiantes de odontología** que necesitan pacientes para cumplir sus requisitos clínicos. Hay un tercer rol, **DentaMeeter**, para un estudiante que además necesita tratamiento. Está enfocado en Chile: regiones y comunas, universidades con odontología y WhatsApp con prefijo `+56`.

Flujo 1.x: registro → perfil por rol (onboarding en pasos) → mazo de perfiles con puntaje de compatibilidad → like o pass → **match mutuo** → contacto por WhatsApp → cita (fecha y hora) → confirmación de ambos → feedback (1–5, ¿recomendarías?).

## 2. Stack

| Capa | 1.x |
|---|---|
| Frontend | Vite 7 + React 18 (JavaScript, sin TypeScript), React Router 6, Tailwind 3, Radix, framer-motion, react-hook-form + Zod 4 |
| Backend | Supabase (Auth + Postgres + RLS + una RPC). **Sin migraciones versionadas en el repo.** |
| Deploy | Antes en `dentameet.net` (vencido). Desde 2026-10-30 en Vercel: `dentameet-cl.vercel.app` |

## 3. Infraestructura: lo que se encontró el 2026-10-30

- **Los dos backends Supabase del historial ya no existen.** `ddratlwjhbatgnyphpxk` (el último, mayo 2026) y `xkgnatklzehzixnfhklb` (julio 2025) devuelven NXDOMAIN. Tampoco aparecen en la cuenta Supabase conectada, que solo tiene la organización *Nutrablue*. ❓ Si estaban en otra cuenta, se pausaron y se eliminaron. **Los datos de usuarios de 1.x se dan por perdidos.**
- **El dominio `dentameet.net` venció.** El correo `contacto@dentameet.net` (Footer, Contacto y el formulario `mailto`) ya no recibe nada. Si un tercero compra el dominio, recibiría esos correos.
- **El nombre "DentaMeet" lo usa otra empresa.** `dentameet.vercel.app` pertenece a un "DentaMeet, Inc." (un marketplace sin relación con este proyecto). Es un riesgo de marca y de SEO.
- **El build fallaba en Linux.** `Matches.jsx` y `MyMatches.jsx` importaban `@/services/MatchService`, pero el archivo es `matchService.js`. En Windows no se nota; Vercel falla. *(Corregido el 2026-10-30.)*

## 4. Lo que se hizo el 2026-10-30 para dejarlo en pie

- [x] `vercel.json` con rewrites de SPA (las rutas profundas ya no dan 404), headers de seguridad y caché de assets.
- [x] **Modo vitrina:** sin `VITE_SUPABASE_*`, la app ya no queda en blanco (antes `createClient` lanzaba con la URL de relleno). La landing y las páginas públicas funcionan, y `/auth` muestra "Estamos preparando DentaMeet 2.0".
- [x] Proyecto Vercel `dentameet-cl` (equipo `russokuns-projects`) conectado a GitHub y desplegado en producción: https://dentameet-cl.vercel.app
- [x] OG, canonical y JSON-LD apuntan a Vercel y no al dominio vencido.
- [x] **Esquema reconstruido** en `supabase/migrations/20261030000000_baseline_v1.sql` desde las consultas del frontend: `person`, `swipes`, `matches`, `appointments`, `feedback`, la vista `person_public` y la RPC `create_or_update_match_rpc`. Hay 15 pruebas en `npm run test:db` (PGlite, sin Docker) que cubren mazo → like → match → cita → feedback y el aislamiento por RLS.
- [ ] **Falta un backend vivo.** Hay que crear un proyecto Supabase propio (fuera de la organización Nutrablue), aplicar la migración y cargar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel. Ver `docs/04-roadmap-2-0.md` B0.

## 5. Deuda técnica y de producto (auditoría)

| # | Hallazgo | Severidad | Dónde |
|---|---|---|---|
| 1 | **El teléfono de todos los usuarios era legible por cualquier usuario logueado.** El código pedía `person_public.*` y usaba `telefono` en el puntaje. En la reconstrucción `person_public` ya no expone teléfono ni email, y el teléfono solo se ve tras un match mutuo. | Alta | `matchService.js`, migración base |
| 2 | **187 `console.*`; 64 imprimen perfiles, emails o usuarios** en la consola del navegador en producción, incluido un volcado de "TODOS los perfiles en la BD". | Alta (privacidad) | `matchService.js`, `AuthContext.jsx`, `AppRouter.jsx` |
| 3 | El mazo descarga hasta 1.000 perfiles y filtra en el cliente. No escala y expone datos de más. | Alta | `MatchService.getPotentialMatches` |
| 4 | Los enlaces a `/terms` y `/privacy` del formulario de registro llevan al home: **no existen términos ni política de privacidad** y se recolectan datos de salud (tratamientos de interés). | Alta (legal, ver Ley 21.719) | `AuthPage.jsx` |
| 5 | Las horas disponibles para citas están fijas en el código (09:00–18:00) y no usan los horarios del estudiante. No se dice dónde ocurre la atención. | Media | `appointmentService.getAvailableSlots` |
| 6 | Antes de este arreglo, los perfiles con like no mutuo reaparecían en el mazo. *(Corregido en la vista.)* | Media | `person_public` |
| 7 | El rol "DentaMeeter" mezcla dos necesidades en un solo perfil y complica las reglas de compatibilidad (8 ramas `if`). | Media | `ProfileSetup.jsx`, `calculateCompatibilityScore` |
| 8 | Hay páginas duplicadas: `pages/Profile.jsx` y `pages/profile/Profile.jsx`, y `AuthForm.jsx` además de `Login/Register`. | Baja | `src/pages` |
| 9 | Un solo bundle de 722 KB (220 KB gzip), sin code-splitting. Los source maps son públicos. | Baja | `vite.config.js` |
| 10 | El repo no tiene README, tests, script de lint ni tipos. | Media | raíz |
| 11 | Hay `.env` en el historial de git (claves anon de proyectos ya eliminados; riesgo bajo hoy). | Baja | commits `160f99a`, `7c0eb20` |
| 12 | El formulario de contacto usa `mailto:` hacia un dominio vencido. | Alta (se pierden leads) | `Contact.jsx`, `Footer.jsx` |

## 6. Lo que 1.x hizo bien y conviene conservar

- La propuesta de valor es clara y de alto impacto social, con branding propio ("PacienteFácil", el tono y redes en TikTok, Instagram y LinkedIn).
- El onboarding por rol tiene buen catálogo de datos de Chile: 16 regiones con sus comunas, 20 universidades, etapas de formación y tratamientos.
- El match atómico vía RPC (no desde el cliente) y la confirmación doble de citas.
- El SEO y la AEO ya trabajados (metadatos y JSON-LD), y una landing pulida.
