# DentaMeet (PacienteFácil): contexto para Claude Code

"Tinder dental" chileno: conecta pacientes que buscan tratamientos dentales accesibles con estudiantes de odontología que necesitan pacientes para sus requisitos clínicos. **Hoy:** 1.x (Vite + React) está en producción en modo vitrina en https://dentameet-cl.vercel.app, sin backend. **Próximo:** DentaMeet 2.0 (Next.js), según `docs/04-roadmap-2-0.md`.

## Orden de lectura (antes de tocar código)
1. `docs/00-estado-1x.md`: qué hay, qué se rompió y qué se arregló
2. `docs/01-prd-2-0.md`: modelo de caso clínico, alcance y qué NO se hace
3. `docs/02-benchmark-rea.md`: cómo funcionan los similares (evidencia REA)
4. `docs/03-requisitos-tecnicos.md`: arquitectura, modelo de datos y checklist de seguridad
5. `docs/04-roadmap-2-0.md`: bloques, orden y quién hace qué
6. `supabase/migrations/*.sql`: esquema (no editar migraciones aplicadas; extender con migraciones nuevas)

## Stack
- **1.x (rama `master`):** Vite 7 + React 18 (JS) + Tailwind 3 + Radix + Supabase. Deploy en Vercel, proyecto `dentameet-cl` (equipo `russokuns-projects`), conectado a GitHub: **cada push a `master` despliega a producción**.
- **2.0 (rama `v2`, por crear):** Next.js App Router + TypeScript estricto + Tailwind v4 + Supabase (`@supabase/ssr`) + Zod + Vitest. Mismo proyecto Vercel.

## Reglas no negociables
- **Datos de salud = datos sensibles** (Ley 21.719, vigente desde el 2026-12-01). Nada de `console.log` con perfiles, correos ni teléfonos. Consentimiento explícito antes de guardar tratamientos de interés.
- El teléfono y el correo de un usuario **solo se revelan tras un match o una aceptación**. `person_public` (1.x) y cualquier vista pública nunca los exponen.
- **La lógica del match vive en Postgres** (RPCs `security definer` + RLS). El cliente no inserta matches ni decide quién ve a quién.
- Todo cambio de BD va en una **migración nueva** en `supabase/migrations/` y se prueba con `npm run test:db` (PGlite, sin Docker).
- La service role key jamás va en el cliente ni en variables `VITE_*` o `NEXT_PUBLIC_*`.
- **Supabase propio:** no crear nada en la organización *Nutrablue* (es de un cliente).
- Rutas de import con las mayúsculas exactas del archivo (Vercel compila en Linux).
- DentaMeet deriva a **clínicas universitarias con supervisión docente**; no diseñar flujos de atención fuera de ellas.

## Convenciones
- Textos de UI en español (es-CL), con tuteo. En 2.0, código e identificadores en inglés (1.x usa español: `nombre`, `comuna`…; no mezclar dentro de un mismo módulo).
- Mobile-first (360 px), objetivos táctiles ≥ 44 px, contraste AA, animaciones con `motion-safe:`.
- Sin dependencias nuevas sin justificarlas. Costo de operación ≈ 0 (planes free).

## Forma de trabajo
- Por bloques de `docs/04-roadmap-2-0.md`. Al empezar un bloque: plan de máximo 5 líneas, y después implementar.
- Si algo ambiguo afecta el esquema, lo legal o la confianza, **preguntar antes de asumir**.
- Avisar directo si se ve una mala práctica o una vulnerabilidad.

## Definition of Done (por bloque)
- `npm run build` pasa (y `tsc --noEmit` en 2.0); `npm run test:db` en verde.
- Probado en viewport móvil y en el preview de Vercel.
- Sin secretos en el repo; `.env.example` actualizado.
- Checklist del bloque marcado en `docs/04-roadmap-2-0.md`.

## Comandos (1.x)
`npm run dev` · `npm run build` · `npm run preview` · `npm run test:db` · `npx vercel deploy --prod --scope russokuns-projects`
