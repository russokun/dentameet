# Design System: DentaMeet

## Overview

**Creative North Star: "Los dos lados del match"**

El sistema nace del hero partido de la landing: un campo **esmeralda** (quien busca tratamiento) junto a un campo **azul noche** (quien estudia odontología), con el match en la costura. Dentro de la app esa idea se vuelve un marco: **cromo azul noche** (barra superior, barra inferior en móvil, la tarjeta de "Lo siguiente", el modal de match) alrededor de una **base clara** donde se trabaja, y **esmeralda solo para la acción principal y los estados activos**.

La dirección es de herramienta de uso diario en el celular, a veces al sol: base clara legible, objetivos táctiles grandes, una sola columna en 360–430 px y navegación inferior de cinco pestañas. El carácter viene del peso tipográfico (Inter en negro para títulos), de las píldoras del hero y de un movimiento corto que explica el cambio de estado, no de adornos.

Elegido con el usuario el 2026-10-31: base clara con acentos del hero, gestos y transiciones (no coreografías), Inter se mantiene.

**Key Characteristics:**
- Base clara (`slate-50`) + cromo azul noche (`slate-950`) + esmeralda 400 para la acción.
- Píldoras en todos los botones (como los CTA del hero); tarjetas `rounded-3xl`.
- Elevación con sombras en capas, no con bordes.
- Una sola familia: Inter, con títulos en `font-black` y `tracking-tight`.
- Movimiento de 150–250 ms con la escala de transitions-dev; todo con alternativa para `prefers-reduced-motion`.

## Colors

### Primary
- **Esmeralda 400** (#34d399): el campo del hero. Botón principal (`.btn-primary`, con tinta azul noche encima: contraste ~10:1), píldora de la pestaña activa, check de éxito, badge de compatibilidad, barra de progreso.
- **Esmeralda 300** (#6ee7b7): hover del botón principal; títulos pequeños sobre azul noche ("Lo siguiente").
- **Esmeralda 700/800** (#047857 / #065f46): texto esmeralda sobre fondo claro (razones del match, enlaces), siempre ≥ 4,5:1.

### Neutral
- **Azul noche** (`slate-950`, #020617): barra superior e inferior de la app, `.app-card-ink`, modal de match, toasts, botón `.btn-ink`, y la tinta del texto principal.
- **Base** (`slate-50`, #f8fafc): fondo de las pantallas de la app.
- **Superficie** (blanco): `.app-card`, campos, botón secundario.
- **Texto secundario** (`slate-600`, #475569): metadatos y descripciones. No se usa `slate-400` para texto sobre blanco.

### Semantic
- **Error / peligro** (`rose-600/700`): `.btn-danger`, toast destructivo, campo inválido (`.field-error`, anillo `rose-500`).
- **Por confirmar** (`amber-50/800`), **confirmada** (`emerald-50/800`), **atendida** (`slate-100/700`), **cancelada** (`rose-50/800`): insignias de estado de las citas, siempre con texto.

## Typography

- **Inter** en toda la app (300–800). Títulos de página `text-3xl lg:text-4xl font-black tracking-tight` con `text-balance`; títulos de tarjeta `text-lg`/`text-xl font-black`; cuerpo 16 px, secundario 14 px.
- Números que cambian con `tabular-nums` (contadores, horas, puntajes).
- Excepción consciente: Inter es la fuente por defecto de muchos generadores; se mantiene por decisión del usuario y por consistencia con la landing.

## Components

| Clase / componente | Uso |
|---|---|
| `.btn-primary` | Una acción principal por pantalla o tarjeta. Píldora esmeralda 400, tinta azul noche, press 0,96. |
| `.btn-secondary` | Acciones secundarias. Blanco con anillo interior de 1 px (sombra, no borde). |
| `.btn-ink` | Acción fuerte neutra sobre superficies esmeralda. |
| `.btn-danger` | Confirmar cancelaciones, reportes y bloqueos. |
| `.app-card` | Superficie de trabajo: blanco, `rounded-3xl`, sombra en tres capas. |
| `.app-card-ink` | La superficie más importante de la pantalla ("Lo siguiente"): azul noche con halo esmeralda. |
| `.field` / `.field-error` | Inputs, selects y textareas: `rounded-2xl`, alto mínimo 48 px, anillo esmeralda al enfocar. |
| `PageHeader` | Título, contexto y acción principal de cada pantalla. |
| `SegmentedControl` | Opciones excluyentes con píldora que se desliza (Citas, Reportar/Bloquear). |
| `AppTabBar` / `AppNavbar` | Navegación azul noche; la píldora esmeralda se desliza a la sección activa (`layoutId`). |
| `MatchCard` | Tarjeta del mazo: franja de identidad azul noche con iniciales, razones del match en esmeralda 800, botones pasar/like de 64 px. |
| `MatchModal` | El momento del match: hoja inferior en móvil, iniciales que se juntan, acción "Escribir por WhatsApp". |
| `Toaster` + `SuccessCheck` | Toast azul noche que sube desde abajo; la variante `success` dibuja un check. |
| `SafetyDialog` | Reportar o bloquear (Radix Dialog). |

Radios concéntricos: tarjeta `rounded-3xl` (24 px) con padding 20–24 px → elementos internos `rounded-2xl` o píldora.

## Motion

Tokens en `:root` (escala de transitions-dev): `--duration-quick` 150 ms, `--duration-fast` 250 ms, `--ease-smooth-out` `cubic-bezier(0.22, 1, 0.36, 1)`, `--ease-bounce` `cubic-bezier(0.34, 1.36, 0.64, 1)` (solo para el check de éxito y el pop del like).

| Momento | Movimiento |
|---|---|
| Cambio de pantalla | Deslizamiento de 16 px + blur 3 px en la dirección de las pestañas, 250 ms de entrada / 150 ms de salida. Al terminar se limpian `filter` y `transform` (si no, rompen `position: fixed`). |
| Pestaña activa | Píldora con resorte (`stiffness 520, damping 38`). |
| Mazo | Arrastre con física (framer-motion `drag`), umbral 100 px o velocidad 600; salida rotada 18°. |
| Like | Pop del corazón 1 → 1,35 → 1 antes de que salga la tarjeta. Sin toast por like (acción de alta frecuencia). |
| Match | Iniciales que se acercan y corazón que aparece con resorte. Sin confeti. |
| Toast | Sube 16 px con fundido y blur en 400 ms; sale en 200 ms. |
| Éxito | Check: círculo con rebote + trazo que se dibuja. |

Con `prefers-reduced-motion` todo pasa a fundidos o a cambios instantáneos; ningún contenido depende del movimiento para entenderse.

## Accessibility

- Contraste AA en todo texto; tinta azul noche sobre esmeralda 400 en el botón principal.
- Objetivos táctiles ≥ 44 px (botones del mazo 64 px, pestañas 62 px de alto).
- Foco visible en todo control (anillo de 4 px), "Saltar al contenido", diálogos con `role="dialog"`, Escape y foco inicial.

## Exceptions (conscious)

- Inter como única familia (ver Typography).
- `text-gradient`, `.mesh-gradient` y `.glass-card*` siguen definidas en `index.css` pero ya no las usa ninguna pantalla (Nosotros, Contacto y Acceso se rehicieron con el sistema el 2026-10-31); se pueden borrar.

## Public pages

Las páginas públicas usan el mismo mundo a escala de póster: campos de color completos (esmeralda 400 o azul noche) en vez de degradados, títulos `font-black` de 5–7rem con `tracking-[-0.035em]`, botones `.btn-premium-*` (las mismas píldoras de la app, 52 px de alto) y `.premium-card` (misma elevación que `.app-card`, sin levitar al pasar el mouse). Acceso (`/auth`) es un hero partido: promesa sobre esmeralda, formulario en tarjeta blanca sobre azul noche.
