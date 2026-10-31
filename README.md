# DentaMeet · PacienteFácil

"Tinder dental" chileno: conecta pacientes que buscan tratamientos dentales accesibles con estudiantes de odontología que necesitan pacientes para su formación clínica.

**Producción:** https://dentameet-cl.vercel.app (1.x en modo vitrina mientras se prepara 2.0)

## Correr en local

```bash
npm install
cp .env.example .env   # opcional: sin variables la app corre en modo vitrina
npm run dev
```

## Base de datos

El esquema vive en `supabase/migrations/`. Para probarlo sin Docker:

```bash
npm run test:db
```

## Documentación

Empieza por [`CLAUDE.md`](CLAUDE.md) y después [`docs/`](docs/): estado de 1.x, PRD 2.0, benchmark con REA, requisitos técnicos y roadmap.
