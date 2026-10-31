# Benchmark: cómo funcionan apps similares (análisis con REA)

**Fecha:** 2026-10-30. **Herramienta:** [REA, Reverse Engineer Anything](https://github.com/morluto/rea) v6.8.0, comando `analyze-web-bundle` sobre un Chrome headless aislado (CDP en loopback). REA hace **análisis estático** de los scripts que el sitio sirve al navegador, sin ejecutarlos ni iniciar sesión. Entrega rutas, endpoints candidatos y huellas de librerías, con su evidencia. Las rutas son *candidatos*: que existan en el bundle no prueba que se usen, ni cuánto.

Cómo reproducirlo:

```bash
chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<perfil-temporal> about:blank
curl -X PUT "http://127.0.0.1:9333/json/new?https://www.doctoralia.cl/"   # devuelve el targetId
npx rea-agents@latest analyze-web-bundle http://127.0.0.1:9333 <targetId> --observation-ms 4000 \
  --detail summary --evidence_output ./doctoralia.evidence --view '{"kind":"javascript-routes","collection":"routes","limit":60}'
```

## 1. El mercado: los pocos que lo intentaron no siguen en pie

| Referente | Modelo | Estado (verificado 2026-10-30) |
|---|---|---|
| **Studentist** (Rumania) | Estudiantes que necesitan pacientes ↔ pacientes que pagan solo materiales, con supervisión docente. Ganó el premio WSA. | `studentist.io` no resuelve. En el único snapshot del Wayback Machine (2019) era un **dominio estacionado**: nunca hubo producto público. |
| **Diagnóstico Dental** (Chile, 2022) | Diagnóstico online → presupuestos de clínicas asociadas; gratis para pacientes y con membresía para odontólogos; apoyo CORFO. | `diagnosticodental.cl` no resuelve y no tiene snapshots. |
| **YachayDent** (Perú) | Web que conecta pacientes de bajos recursos con estudiantes supervisados. | Es una tesis; no se encontró producto operativo. |
| Apps de "koas" (Indonesia: Jember, Bandung, UMY) | Pacientes ↔ estudiantes en práctica clínica. | Prototipos académicos; la investigación de Bandung dice que no existe un medio que los conecte. |
| **Columbia CDM** (EE. UU.) | Algoritmo **institucional** que asigna pacientes de la clínica de la facultad según las competencias que le faltan a cada estudiante. | Funciona dentro de la universidad, no como marketplace abierto. |

**Lectura (interpretación, no medida):** la necesidad es real y se repite en varios países (estudiantes que no consiguen pacientes para cumplir requisitos, pacientes sin acceso económico), pero **ningún marketplace abierto sobrevivió**. El caso que funciona (Columbia) lo hace porque está **dentro de la institución** que valida la supervisión y es dueña de la agenda clínica. Para DentaMeet 2.0 esto apunta a una alianza con al menos una facultad antes que a crecer como app abierta.

## 2. Tinder: la mecánica del "match" (REA, `tinder.com`)

43 scripts analizados, 196 rutas candidatas únicas. Agrupadas por función:

| Función | Rutas observadas (extracto) | Qué le aporta a DentaMeet |
|---|---|---|
| Mazo de recomendaciones | `/v2/recs/core`, `/v2/explore/recs` | El servidor arma el mazo; el cliente no descarga a todos para filtrar (lo contrario del hallazgo 3 de 1.x). |
| Swipe | `/like/{userId}`, `/like/{userId}/super`, `/pass/{userId}` | Like y pass son acciones atómicas del servidor. 1.x ya lo hace vía RPC. |
| "Le gustas a" | `/v2/fast-match`, `/v2/fast-match/count`, `/v2/fast-match/teasers` | Ver quién te eligió y aceptar: un match en un toque, sin swipe doble. **Base del modelo "postulación + aceptación".** |
| Matches y mensajes | `/v2/matches`, `/v2/matches/{matchId}/messages`, `/v2/seen/{matchId}`, `/updates`, `/ws/generate` | Chat in-app con lectura y tiempo real. En 2.0 se pospone; WhatsApp alcanza para el piloto. |
| Expiración | `/v1/match-expiration/archived-matches` | Los matches inactivos se archivan. Aplica a casos que no se agendan. |
| Confianza y seguridad | `/v4/report/new`, `/v4/report/tree`, `/v2/block/profile/direct`, `/v1/appeals/cases` | Reportar y bloquear con un árbol de motivos. Imprescindible con pacientes reales. |
| Verificación | `/v2/verification/selfie/*`, `/v1/identity-verification/*`, `/verification/underage/*` | Insignia "verificado". En DentaMeet: verificar que el estudiante pertenece a la universidad. |
| Consentimientos | `/v2/profile/consents`, `/v2/consents/geo`, `/verification/consents` | Consentimiento explícito y versionado por tipo de dato. Clave con la Ley 21.719. |
| Onboarding | `/v2/onboarding/fields`, `/v2/onboarding/photo`, `/v2/onboarding/complete` | Onboarding por pasos con campos dirigidos por el servidor. |
| Monetización | `/v2/subscriptions/web`, `/boost`, `/v1/paywall/offers`, `/v2/purchase/*` | No aplica al piloto: el paciente no debe pagar por acceder. |

## 3. Doctoralia: reservar hora en un marketplace de salud (REA, `doctoralia.cl`)

86 scripts analizados (React + Vite según las huellas). Endpoints de la capa de datos:

| Endpoint | Función | Qué le aporta a DentaMeet |
|---|---|---|
| `slots.getDayAvailability`, `bookingWidget.getDoctorSlots`, `bookingWidget.getClinicSlots` | Disponibilidad real por profesional **y por clínica** | Las horas salen de la agenda de quien atiende y del lugar, no de una lista fija (hallazgo 5 de 1.x). |
| `search.getDoctorAvailability`, `search.getFacilityAvailability` | Búsqueda que ya trae disponibilidad | Al buscar se muestra la próxima hora libre, no solo el perfil. |
| `search.getAddressBookingEligibility` | Si una dirección puede reservar | Elegibilidad por zona: **el paciente debe poder llegar a la clínica universitaria.** |
| `recommendations.getRecommendedDoctors`, `recommendations.getDoctorNextAvailability` | Recomendación con próxima disponibilidad | Recomendar estudiantes y casos con hora próxima. |
| `opinions.getDoctorOpinions` | Opiniones verificadas | Feedback post-cita visible en el perfil del estudiante (en 1.x es privado). |

Rutas de contenido público con rol de SEO: `/tratamientos-servicios`, `/enfermedades`, `/especialidades-medicas`, `/preguntas-respuestas`, `/clinicas`, `/app-pacientes`. También páginas legales específicas para pacientes (`/politica-de-privacidad-del-paciente`, `/gdpr/patient-data`) y una zona "pro" con `/planes` (la monetización está del lado del profesional, no del paciente).

**Lecciones para 2.0:** (1) el lugar de la atención es una entidad de primer nivel (clínica), (2) la disponibilidad real reemplaza las horas fijas, (3) las opiniones dan confianza, (4) el contenido por tratamiento atrae tráfico orgánico ("endodoncia económica Santiago") y (5) si hay cobro, lo paga la institución o el profesional, no el paciente.

## 4. Conclusión para el diseño de 2.0

1. **Del swipe simétrico a "postulación + aceptación".** El paciente publica su necesidad (un *caso*). El estudiante busca o swipea casos que calzan con sus requisitos clínicos y postula, y el paciente acepta. Es el "le gustas a" de Tinder llevado al modelo de Columbia. Se conserva el swipe como UX del estudiante y la marca "Tinder dental", pero el match ya no depende de que ambos swipeen.
2. **La clínica universitaria como lugar de atención.** La cita ocurre en la clínica de la facultad, en un turno real del estudiante.
3. **Confianza primero:** estudiante verificado, reportar y bloquear, consentimiento explícito y opiniones post-cita.
4. **Servidor arma el mazo** (vista o RPC con paginación), nunca descargar a todos.
5. **Distribución vía institución:** piloto con una facultad antes que app abierta; los referentes abiertos no sobrevivieron.

## Fuentes

- REA: https://github.com/morluto/rea
- Studentist (WSA): https://wsa-global.org/winner/studentist/
- Diagnóstico Dental: https://www.eldinamo.cl/empren-d/2022/06/17/lanzan-plataforma-online-que-conecta-pacientes-con-odontologos/ y https://www.df.cl/df-lab/transformacion-digital/plataforma-realiza-diagnostico-dental-y-conecta-a-pacientes-con
- YachayDent: https://tesis.pucp.edu.pe/items/491a38e0-14cf-4f6e-a053-0fa6eb51c17e
- Columbia CDM: https://www.dental.columbia.edu/news/cdm-has-developed-algorithm-optimize-matching-patients-and-students
- Koas Indonesia: https://openlibrarypublications.telkomuniversity.ac.id/index.php/artdesign/article/view/14235 y https://sipora.polije.ac.id/45881/
