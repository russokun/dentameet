# Requisitos técnicos: DentaMeet 2.0

**Estado:** borrador, 2026-10-30. Alineado con el stack habitual de los proyectos (ilife, agenda-os, NexarOS): Next.js + TypeScript + Supabase + Vercel.

## 1. Arquitectura

```
Navegador (móvil) ──► Next.js App Router en Vercel (gru1)
                        ├─ Server Components: landing, SEO por tratamiento, perfiles públicos
                        ├─ Server Actions + Zod: toda escritura
                        └─ src/proxy.ts: sesión y rutas protegidas
                                │
                                ▼
                       Supabase (sa-east-1, plan free, organización PROPIA)
                        ├─ Auth (correo+contraseña, OTP de 6 dígitos)
                        ├─ Postgres + RLS en todas las tablas
                        ├─ RPCs con la lógica del match (el motor vive en Postgres)
                        └─ pg_cron: expirar casos y recordatorios
```

**Estrategia de migración desde 1.x:** mismo repo, rama `v2`. La rama `master` (1.x en vitrina) sigue desplegada hasta que 2.0 la reemplace en el mismo proyecto Vercel. No hay datos que migrar (los backends de 1.x ya no existen). La migración `baseline_v1` sirve para revivir 1.x si se decide reabrirlo; 2.0 parte con migraciones propias.

## 2. Stack

Next.js (App Router), TypeScript estricto, Tailwind v4, Supabase (`@supabase/ssr`), Zod, Vitest, PGlite para probar la BD sin Docker y `lucide-react`. Sin librerías de estado global: Server Components, Server Actions y `useOptimistic`. Cada dependencia nueva se justifica en el PR.

## 3. Modelo de datos 2.0 (identificadores en inglés)

| Tabla | Propósito | Notas |
|---|---|---|
| `profiles` | 1:1 con `auth.users`: nombre, teléfono, comuna, roles | El teléfono nunca se expone en vistas públicas |
| `universities`, `clinics` | Catálogo de facultades y sus clínicas (dirección, comuna, coordenadas) | Seed desde el catálogo de 1.x |
| `treatments` | Catálogo de tratamientos (código, nombre, especialidad) | Reemplaza los arrays de texto libre de 1.x |
| `student_profiles` | Universidad, clínica, año y estado de verificación | `verified_at`, `verification_method` |
| `student_requirements` | Tratamientos que el estudiante necesita y cuántos | Alimenta el mazo |
| `student_shifts` | Turnos de clínica (día, hora y clínica) | Disponibilidad real, como `getClinicSlots` de Doctoralia |
| `cases` | Caso del paciente: tratamiento, comuna, disponibilidad, estado, `expires_at` | Máquina de estados de `docs/01-prd-2-0.md` §5 |
| `case_swipes` | Postular o pasar por estudiante y caso | El mazo excluye los vistos |
| `applications` | Postulación con mensaje y estado | Una sola puede quedar aceptada por caso |
| `appointments` | Caso, clínica, `starts_at`, confirmaciones y cancelación | Solo entre el paciente y el estudiante aceptado |
| `reviews` | Opinión post-cita | Pública en el perfil del estudiante |
| `reports`, `blocks` | Confianza y seguridad | Árbol de motivos como enum |
| `consents` | Usuario, propósito, versión, `granted_at`, `revoked_at` | Prueba del consentimiento (Ley 21.719) |
| `waitlist` | Correo y rol de interés | Sin datos de salud |

**Motor del match (RPCs `security definer`, probadas con PGlite):** `apply_to_case`, `accept_application` (acepta una y rechaza el resto de forma atómica), `propose_appointment`, `confirm_appointment`, `cancel_appointment`, `complete_appointment` y `student_case_deck(limit, cursor)` (mazo paginado en el servidor). Un job de `pg_cron` diario expira los casos.

## 4. Requisitos no funcionales

- Mobile-first a 360 px, objetivos táctiles ≥ 44 px y contraste AA.
- LCP < 2,5 s en 4G para la landing y las páginas SEO (SSR, sin bundles de 700 KB).
- Funciona con conexión inestable: las acciones de swipe son optimistas y se revierten si fallan.
- Accesible por teclado; `prefers-reduced-motion` respetado.

## 5. Seguridad y datos personales (checklist)

- [ ] RLS activo en todas las tablas; las pruebas cubren a un usuario B que intenta leer o escribir datos de A.
- [ ] La service role key jamás va en el cliente ni en `NEXT_PUBLIC_*`.
- [ ] **Cero `console.log` con datos personales.** Regla de lint `no-console` en `src/`.
- [ ] El teléfono y el correo solo se revelan tras `accept_application`.
- [ ] Consentimiento explícito, versionado y revocable antes de guardar tratamientos de interés.
- [ ] Exportación (JSON) y eliminación de la cuenta (US-15).
- [ ] Política de privacidad y términos publicados antes de abrir el registro.
- [ ] Límite de postulaciones por estudiante y por hora (anti-spam).
- [ ] Respaldo: `pg_dump` semanal (GitHub Action) a un artefacto privado. **Los planes free de Supabase pausan proyectos inactivos; ❓ es la causa probable de que se perdieran los dos backends de 1.x.**

## 6. Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=https://dentameet-cl.vercel.app
SUPABASE_SERVICE_ROLE_KEY=      # solo jobs del servidor; nunca en el cliente
```

## 7. Testing

- `npm run test:db`: migraciones en PGlite con un esquema `auth` simulado y recorridos de RLS (ya existe para la base 1.x).
- Vitest para la lógica pura (validaciones Zod y helpers de fechas y zona horaria `America/Santiago`).
- Smoke manual en producción por bloque: registro → caso → postulación → aceptación → cita.

## 8. Costos (plan cero)

| Servicio | Plan | Límite que importa |
|---|---|---|
| Vercel | Hobby | Solo uso no comercial; si hay cobro, pasar a Pro |
| Supabase | Free | 2 proyectos activos por organización; se pausa tras inactividad; 500 MB de BD |
| Correo transaccional | Supabase Auth (SMTP integrado) | Límite bajo de envíos por hora; para recordatorios usar Resend free |
| Dominio | Ninguno (`*.vercel.app`) | Retomar cuando haya fondos |
