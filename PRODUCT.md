# Product

<!-- impeccable:product-schema 1 -->
<!-- Redactado el 2026-10-30 a partir del código de 1.x y de docs/01-prd-2-0.md, SIN entrevista previa:
     lo que no sea literal de esos documentos está marcado "(inferido)". Corrige lo que no calce. -->

## Platform

web (mobile-first; PWA en 2.0)

## Users

Dos lados de un mismo mercado en Chile:
- **Pacientes:** adultos que necesitan tratamiento dental y no pueden pagar una consulta privada. Entran desde el celular, a menudo con datos móviles, y desconfían de "que me atienda un estudiante" (inferido).
- **Estudiantes de odontología** de 3.º a 6.º año e internos: necesitan pacientes con casos específicos para aprobar sus ramos clínicos. Son nativos digitales y están acostumbrados a apps de match.

## Product Purpose

Conectar la necesidad de tratamiento accesible con la necesidad de pacientes para formación clínica, y **derivar la atención a la clínica universitaria**, donde el estudiante atiende con supervisión docente. Éxito del piloto: ≥ 60 % de los casos asignados en ≤ 7 días y ≥ 10 citas atendidas en 6 semanas (`docs/01-prd-2-0.md` §8).

## Positioning

"Tinder dental": la mecánica de match vuelve simple y cercano algo que hoy pasa por grupos de Facebook. A diferencia de un marketplace de odontólogos (Doctoralia) o de los intentos abiertos que no sobrevivieron (Studentist, Diagnóstico Dental), DentaMeet gira en torno al **caso clínico** y a la **clínica universitaria**: el paciente publica lo que necesita y el estudiante que lo necesita para su carrera postula.

## Operating Context

- Celular, a una mano, en pausas cortas. El estudiante swipea casos entre clases; el paciente publica su caso y espera postulantes.
- Conectividad inestable (eventos, metro, datos móviles): 1.x ya avisaba "usa tus datos móviles" ante fallas de red.
- El contacto se cierra por WhatsApp tras el match.
- Despliegue: Vercel (`dentameet-cl.vercel.app`, sin dominio propio por falta de fondos) + Supabase free propio.

## Capabilities and Constraints

- Datos de salud = datos sensibles (Ley 21.719): consentimiento explícito, datos mínimos y contacto revelado solo tras la aceptación.
- Estudiantes verificados como alumnos de su universidad; reportar y bloquear siempre disponibles.
- Textos en es-CL, con tuteo; objetivos táctiles ≥ 44 px; contraste AA.
- **Abierto:** universidad piloto, marca ("DentaMeet" lo usa otra empresa; "PacienteFácil" como alternativa), cobro (por defecto gratis para el paciente).

## Brand

Nombre "DentaMeet - PacienteFácil". La landing de 1.x usa fondo oscuro (`slate-950`), acentos esmeralda y azul, tipografía muy pesada (`font-black`) y glassmorphism. Las redes son TikTok (`@dentameet_pacientefacil`), Instagram y LinkedIn; Facebook dejó de ser la red principal.
