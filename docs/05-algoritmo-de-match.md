# Algoritmo de match: cómo DentaMeet elige qué mostrar

**Estado:** diseño, 2026-10-30. Base: ingeniería inversa del cliente web de Tinder con REA (`docs/02-benchmark-rea.md`), el modelo de Columbia CDM y el PRD 2.0 (`docs/01-prd-2-0.md`).

## 1. Qué se puede saber de Tinder (y qué no)

El ranking de Tinder corre en sus servidores; ningún análisis del navegador lo muestra. Lo que REA sí deja ver es el **contrato del cliente**: qué guarda la app, qué datos trae cada recomendación y qué límites aplica. Hallazgos en el bundle principal de `tinder.com` (2026-10-30):

| Observado en el cliente | Qué revela | Traducción para DentaMeet |
|---|---|---|
| `recs.queues` con `QUEUE_MAIN` y `activeQueue`; `getRecs` = `/v2/recs/core` | El servidor entrega **colas** de recomendaciones ya ordenadas; el cliente solo las consume | El mazo se arma en Postgres (RPC), nunca filtrando 1.000 perfiles en el navegador como hoy en 1.x |
| `getFastMatchRecs` = `/v2/fast-match`, `fastMatchCount`, `fastMatchTeasers` | Una **segunda cola**: quienes ya te dieron like | El paciente ve sus **postulantes** (ya lo eligieron) antes que perfiles nuevos |
| `likes.likes_remaining`, `likes.rate_limited_until`, `session.outOfLikes`, `superlikes.remaining`, `resets_at` | **Likes limitados** por ventana de tiempo | Tope de postulaciones activas por estudiante: evita que postule a todo y deje casos colgados |
| `previousRec`, `previouslySwiped`, acción `rewind` | Se puede **deshacer** el último swipe | "Deshacer" el último pase (gratis en DentaMeet) |
| `recSwipeNote` = `/v2/like/{userId}/swipenote` | **Like con mensaje** | Postular con un mensaje corto ("Estoy en 5.º, atiendo martes y jueves") |
| `badges` con `selfie_*` e `id_dob_*` | **Insignias de verificación** en la tarjeta | Insignia "estudiante verificado" (correo institucional o certificado) |
| `experiment_info.user_interests`, `selected_descriptors` | La tarjeta trae **intereses en común**, y viene de un experimento (A/B) | La tarjeta muestra **por qué** aparece: "Calza con tu requisito de endodoncia · a 4 km de tu clínica" |
| `getArchivedMatches` = `/v1/match-expiration/archived-matches` | Los matches **expiran** si nadie actúa | Casos y matches sin cita en N días se archivan |
| `counts.swipeCount`, `rightSwipeCount`; fuente del swipe (`BUTTON`, `SWIPE`, `KEYBOARD`) | Se registra cada swipe con su origen | Tabla de eventos para medir y ajustar pesos |
| `botRiskTier`, `behaviorFlags`, `globalScore` | Puntaje de **riesgo de bot** en el cliente | Limitar a cuentas que swipean a velocidad no humana |
| `boost.multiplier`, `duration` | Visibilidad **comprada** | No aplica: en salud no se vende visibilidad. Se usa la idea al revés: dar más exposición a casos que llevan días esperando |

Lo que Tinder ha dicho públicamente sobre su orden (sin verificar desde el código): dejó atrás el puntaje tipo Elo y prioriza a personas **activas**, **cercanas** y con **probabilidad de devolver el like**. La última es la idea más útil para DentaMeet: mostrar primero a quien probablemente acepte.

## 2. Diferencias clave con una app de citas

- **No es simétrico.** Un paciente necesita *un* tratamiento; un estudiante necesita *N* casos de tipos concretos antes de una fecha (fin de semestre). Es más parecido a **asignar casos a requisitos** (Columbia) que a buscar pareja.
- **La escasez está en los casos.** Hay más estudiantes con requisitos que pacientes dispuestos: el algoritmo tiene que cuidar que ningún caso quede sin ver, y que ningún estudiante acapare.
- **Hay un lugar físico.** La atención es en la clínica de la universidad del estudiante: la distancia que importa es *paciente → clínica*, no paciente → estudiante.
- **Seguridad antes que engagement.** Nada de mecánicas para retener (rachas, boosts pagados, likes "a ciegas").

## 3. El algoritmo

### 3.1 Filtros duros (si no pasa, no aparece)

1. Roles complementarios (estudiante ve casos de pacientes, y al revés para "le gustas a").
2. Caso `publicado`, no expirado, sin bloqueo ni reporte entre ambos.
3. No visto antes por este estudiante (`case_swipes`), salvo que el caso se haya renovado.
4. Estudiante **verificado** y con tope de postulaciones activas disponible.
5. Tratamiento del caso ∈ requisitos pendientes del estudiante (o, si no cargó requisitos, ∈ sus especialidades).
6. Distancia paciente → clínica del estudiante ≤ radio que el paciente aceptó (por defecto 25 km o la misma región).
7. **Urgencias** (dolor agudo, infección) no entran al mazo: se derivan a la red de urgencia pública con un mensaje claro.

### 3.2 Puntaje (orden dentro del mazo)

`puntaje = 0,35·ajuste + 0,20·cercanía + 0,15·horario + 0,15·reciprocidad + 0,10·espera + 0,05·actividad`, cada componente entre 0 y 1:

| Componente | Cálculo | Por qué |
|---|---|---|
| **Ajuste de requisito** | Tratamiento exacto del requisito = 1; misma especialidad = 0,6. Multiplicado por la urgencia del requisito: `faltantes / total` y cercanía a la fecha de cierre del ramo | Lo que más vale para el estudiante es cerrar su ramo a tiempo |
| **Cercanía** | `exp(−km / 10)` con centroides de comuna (paciente) y clínica (estudiante) | Un paciente que vive cerca va a la cita |
| **Horario** | Fracción de los turnos del estudiante que caen en la disponibilidad del paciente | Si no hay horario común, el match no termina en cita |
| **Reciprocidad** | Probabilidad estimada de que el paciente acepte: tasa de aceptación histórica del paciente (suavizada) × reputación del estudiante (citas atendidas, opiniones, cancelaciones) | La idea de Tinder: mostrar primero a quien probablemente diga que sí |
| **Espera** | Sube con los días que el caso lleva publicado sin postulantes, satura a los 7 días | Equidad: que ningún caso quede sin ver (el "boost" invertido) |
| **Actividad** | 1 si el paciente entró en las últimas 72 h, decae después | No mostrar casos de gente que ya no responde |

**Exposición justa:** cada caso tiene un tope de vistas por día; al llegar, baja de posición para dar lugar a otros. Al revés, un caso con muchas vistas y ninguna postulación se marca para revisar (¿tratamiento poco común, descripción poco clara?).

**Diversidad:** en cada página del mazo, como máximo 2 casos seguidos del mismo tratamiento, para que el estudiante no vea siempre lo mismo.

### 3.3 Por qué aparece (explicable)

Cada tarjeta trae hasta tres razones legibles, generadas por la misma RPC: "Calza con tu requisito de endodoncia (te faltan 2)", "A 4 km de tu clínica", "Disponible en tus turnos de los martes". Es lo que Tinder hace con los intereses en común, y en salud además da confianza.

### 3.4 Límites y controles

- **Tope de postulaciones activas:** 10 por estudiante (ajustable). Se libera cuando el paciente acepta o rechaza, o cuando el caso expira.
- **Ritmo:** más de 60 swipes por minuto pausa el mazo 5 minutos (antibots).
- **Deshacer:** el último pase, sin costo.
- **Expiración:** un caso sin postulantes en 14 días expira (el paciente lo renueva con un toque); un match sin cita en 10 días se archiva y libera el cupo.

### 3.5 Implementación

- RPC `student_case_deck(p_limit int, p_cursor text)` en Postgres que aplica filtros, calcula el puntaje y devuelve `{case, score, reasons[]}` paginado. `security definer` y sin datos de contacto.
- RPC `patient_applicants(p_case uuid)`: la cola "le gustas a" del paciente, ordenada por reputación y ajuste.
- Tabla `deck_events(actor, case_id, action, source, score, created_at)`: impresiones, postulaciones, pases y su origen (botón, swipe, teclado). Sirve para recalibrar pesos con datos reales del piloto.
- Pesos en una tabla `match_weights` versionada, no en código, para ajustarlos sin deploy.
- Pruebas en PGlite: un caso urgente nunca aparece en el mazo, un estudiante sin cupo no ve casos, la espera sube el orden, el tope de exposición funciona.

### 3.6 Puente para 1.x (antes de 2.0)

Con el esquema actual (`person`, `swipes`, `matches`) ya se puede pasar el mazo al servidor: una RPC `match_deck(p_limit)` que excluya vistos y matches, puntúe por comuna/región, coincidencia tratamiento↔especialidad, horarios en común y completitud del perfil, y devuelva razones. Reemplaza el filtrado en el cliente de `MatchService.getPotentialMatches` (hallazgo 3 de `docs/00-estado-1x.md`).
