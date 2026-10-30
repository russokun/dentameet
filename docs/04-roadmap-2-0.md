# Roadmap DentaMeet 2.0: bloques para Claude Code

**Actualizado:** 2026-10-30. Es un documento vivo: se marca `[x]` lo que se cierra y se cambia la fecha de arriba.

Regla: **un bloque a la vez**. Al terminar un bloque se marca su checklist y se pasa al siguiente. Los bloques B0 y B1 tienen fecha dura por la Ley 21.719 (vigencia el **1 de diciembre de 2026**, salvo que se apruebe el boletín 18.623-07 que la posterga un año).

| Marca | Significa |
|---|---|
| `[x]` | Hecho y verificable en el repo o en producción |
| `[ ]` | Pendiente |
| ❓ | No verificado desde el repo (cuentas externas, terceros) |
| **A** / **C** / **A+C** | Lo hace Agustín / Claude puede avanzarlo / ambos |

## Línea de tiempo

```
2026  nov ──────────── dic ──────────── 2027 ene ─────── feb ─────── mar ──────
      B0 rescate       B3 fundaciones 2.0     B5 estudiante   B7 confianza  B8 PILOTO
      B1 legal ◆1-dic  B4 paciente            B6 agenda ◆HITO              (inicio año
      B2 facultad (en paralelo, A) ──────────────────────────►              académico)
```

El piloto apunta a **marzo de 2027**, cuando empieza el año académico y los estudiantes buscan pacientes para sus ramos clínicos.

## Prompt inicial para Claude Code

> Lee `CLAUDE.md` y los documentos de `docs/` en el orden indicado. Ejecuta el siguiente bloque sin marcar de `docs/04-roadmap-2-0.md`. Antes de escribir código, dame un plan de máximo 5 líneas y pregúntame lo que sea ambiguo y afecte el esquema, lo legal o la confianza.

---

## B0 · Rescate de 1.x (ahora)

- [x] **C** · Clonar el repo y diagnosticar el estado (`docs/00-estado-1x.md`).
- [x] **C** · Corregir el build en Linux (imports con mayúsculas) y agregar `vercel.json` con rewrites de SPA.
- [x] **C** · Modo vitrina: sin backend la app ya no queda en blanco y `/auth` avisa "preparando 2.0".
- [x] **C** · Proyecto Vercel `dentameet-cl` en `russokuns-projects`, conectado a GitHub y en producción: https://dentameet-cl.vercel.app
- [x] **C** · Reconstruir el esquema en `supabase/migrations/20261030000000_baseline_v1.sql`; `npm run test:db` con 15/15 en verde.
- [ ] **A** · Commit y push de estos cambios a `master`. Ojo: con el repo conectado, cada push a `master` despliega a producción.
- [ ] **A** · Crear una **organización Supabase propia** ("DentaMeet", plan free, región São Paulo). No usar la organización *Nutrablue* (es de un cliente).
- [ ] **A+C** · Crear el proyecto `dentameet`, aplicar la migración base y cargar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel (production y preview). *Solo si se decide reabrir 1.x; ver B1.*
- [ ] **A** · Correo de contacto que funcione (Gmail del proyecto o formulario hacia Supabase) para reemplazar `contacto@dentameet.net`.
- [ ] **A** · Revisar en NIC Chile o en el registrador si `dentameet.net` se puede recuperar barato, o dejarlo ir y decidir la marca (ver `docs/01-prd-2-0.md` §9).

## B1 · Legal y confianza mínima → **antes del 1 de diciembre de 2026**

- [ ] **A** · Decidir: ¿1.x se queda en vitrina con lista de espera (recomendado) o se reabre el registro?
- [ ] **C** · Quitar los 187 `console.*` (64 con datos personales) y agregar la regla de lint `no-console`.
- [ ] **C** · Lista de espera (correo y rol, sin datos de salud) en la landing, guardada en Supabase con RLS de solo inserción.
- [ ] **C** · Borrador de **política de privacidad** y **términos** en `/privacidad` y `/terminos`, sin rutas rotas.
- [ ] **A** · Que una persona con criterio legal revise esos textos (por ejemplo, la clínica jurídica de tu universidad). ❓
- [ ] **C** · Consentimiento explícito y versionado (tabla `consents`) si se reabre el registro de 1.x.

## B2 · Validación con una facultad (en paralelo, **A**)

- [ ] **A** · Entrevistar a 5 estudiantes de 3.º a 5.º año: qué requisitos clínicos tienen, cómo consiguen pacientes hoy y cuánto tardan.
- [ ] **A** · Entrevistar a 5 potenciales pacientes: qué les frena de ir a una clínica universitaria.
- [ ] **A** · Conversar con un coordinador o docente de clínica: ¿puede un paciente derivado por DentaMeet entrar a la agenda? ¿Qué validación pide la facultad?
- [ ] **A** · Confirmar el **riesgo legal**: el estudiante solo puede atender dentro de la clínica universitaria y con supervisión. DentaMeet no debe facilitar atenciones fuera de ella. ❓
- [ ] **A** · Conseguir un compromiso de piloto (correo o carta del docente o de la dirección de escuela).
- [ ] **C** · Volcar los hallazgos en `docs/01-prd-2-0.md`: requisitos reales, expiración, tope de postulaciones y métricas.

## B3 · Fundaciones 2.0

- [ ] **C** · Rama `v2`: Next.js (App Router) + TS estricto + Tailwind v4 + ESLint + Vitest. Reutilizar logos, catálogo de regiones y comunas, universidades y tratamientos de 1.x.
- [ ] **C** · Clientes Supabase (`server`/`client`), `src/proxy.ts` para la sesión, login y registro con OTP de 6 dígitos para recuperación.
- [ ] **C** · Migraciones 2.0 (`docs/03-requisitos-tecnicos.md` §3), seed de catálogos y `src/types/database.ts` generado.
- [ ] **C** · Pruebas de RLS y RPCs en PGlite (`npm run test:db`) con usuario A y usuario B.
- [ ] **C** · `PRODUCT.md` y `DESIGN.md` actualizados; pasada de Impeccable sobre el sistema visual heredado de 1.x.
- [ ] **A+C** · Preview de Vercel por rama y CI con lint + tsc + test en cada PR.

## B4 · Lado paciente

- [ ] **C** · Onboarding paciente con consentimiento *(US-02, US-03)*.
- [ ] **C** · Publicar, editar, renovar y cancelar caso *(US-04)*.
- [ ] **C** · Ver postulantes y aceptar uno, con rechazo automático del resto y contacto revelado *(US-08, US-09)*.

## B5 · Lado estudiante

- [ ] **C** · Onboarding estudiante: universidad, clínica, año, requisitos y turnos.
- [ ] **C** · Verificación por correo institucional, o certificado revisado por admin *(US-05)*.
- [ ] **C** · Mazo de casos paginado en el servidor, con swipe para postular o pasar *(US-06, US-07)*.

## B6 · Agenda en clínica → **HITO: flujo completo usable**

- [ ] **C** · Proponer hora dentro de un turno, confirmar, cancelar y reprogramar *(US-10, US-11)*.
- [ ] **C** · Recordatorio por correo 24 h antes (pg_cron + Resend free).
- [ ] **A+C** · Recorrido real de punta a punta en producción con dos cuentas reales.

## B7 · Confianza y operación

- [ ] **C** · Opiniones post-cita públicas *(US-12)*.
- [ ] **C** · Reportar y bloquear *(US-13)*; panel admin con verificaciones y reportes *(US-14)*.
- [ ] **C** · Exportar y eliminar la cuenta *(US-15)*; expiración de casos con pg_cron.
- [ ] **C** · Respaldo semanal con `pg_dump` vía GitHub Action.

## B8 · Lanzamiento del piloto (marzo de 2027)

- [ ] **C** · Páginas SEO por tratamiento y por clínica, con SSR y datos estructurados *(US-16)*.
- [ ] **C** · Vercel Web Analytics y un tablero simple con las métricas del piloto (`docs/01-prd-2-0.md` §8).
- [ ] **A** · Difusión en la facultad piloto (centro de estudiantes, docentes) y en las redes de DentaMeet.
- [ ] **A+C** · Retrospectiva a las 6 semanas: ¿se cumplieron las métricas? Decidir si se escala, se ajusta o se cierra.

## Después del piloto (en este orden)

1. Chat in-app (si WhatsApp genera fricción o problemas de privacidad).
2. Notificaciones por WhatsApp o push vía n8n.
3. Panel del coordinador de clínica.
4. Segunda universidad y reglas de requisitos por facultad.
5. Monetización institucional (convenio o B2B) y dominio propio.

## Si queda poco tiempo

Prioridad estricta: **B0 → B1 → B2**. Con eso, DentaMeet queda en línea, cumple la ley, junta una lista de espera y tiene validada la alianza que los referentes caídos nunca tuvieron. Construir 2.0 (B3+) sin B2 es repetir el error de Studentist.
