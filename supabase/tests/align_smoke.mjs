// Prueba de la alineación del proyecto real: carga una reproducción del esquema de 2025 con
// datos ficticios, aplica las migraciones posteriores a baseline_v1 y verifica que los datos
// se conservan y que se cierran las fugas. Uso: npm run test:db
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const migrations = join(here, '..', 'migrations')
const db = new PGlite()
const q = async (sql, p) => (await db.query(sql, p)).rows
await db.exec(`
  create role anon; create role authenticated; create role service_role;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth, public to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`)
await db.exec(readFileSync(join(here, 'fixtures', 'real_schema_2025.sql'), 'utf8'))

const P = '00000000-0000-0000-0000-0000000000a1', S = '00000000-0000-0000-0000-0000000000b2', T = '00000000-0000-0000-0000-0000000000c3'
await db.exec(`insert into auth.users values ('${P}','p@x'),('${S}','s@x'),('${T}','t@x');
  insert into public.person (id,email,role,nombre,apellido,telefono,region,comuna,tratamientos_interes,especialidades,horarios_disponibles,onboarding_completed) values
  ('${P}','p@x','paciente','Paula','Rey','911111111','Región Metropolitana','Ñuñoa','{Endodoncia}',null,'{Tarde (14:00-18:00)}',true),
  ('${S}','s@x','estudiante','Sergio','Paz','922222222','Región Metropolitana','Ñuñoa',null,'{Endodoncista}','{Tarde (14:00-18:00)}',true),
  ('${T}','t@x','estudiante','Tamara','Lagos','933333333','Región Metropolitana','Macul',null,'{Ortodoncista}',null,true);
  -- un match antiguo guardado con el par al revés y un like pendiente de T hacia P
  insert into public.matches (user1_id,user2_id,user1_liked,user2_liked,is_mutual) values ('${S}','${P}',true,true,true);
  insert into public.swipes (actor,target) values ('${T}','${P}');
  insert into public.appointments (user1_id,user2_id,fecha_hora,tratamiento,status) values ('${P}','${S}',now() - interval '3 days','Endodoncia','completada');`)

const leakBefore = await (async () => { await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${T}',false);`); try { return (await q(`select telefono from public.person where id='${P}'`)).length } finally { await db.exec('reset role') } })()

const after = readdirSync(migrations).filter((f) => f.endsWith('.sql') && !f.includes('baseline_v1')).sort()
for (const f of after) await db.exec(readFileSync(join(migrations, f), 'utf8'))

const as = async (uid, fn) => { await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false);`); try { return await fn() } finally { await db.exec('reset role') } }
const check = (label, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + '[real] ' + label); if (!cond) process.exitCode = 1 }

check('la fuga existía antes: un usuario cualquiera leía el teléfono de otro', leakBefore === 1)
check('los perfiles se conservan', (await q('select count(*)::int n from public.person'))[0].n === 3)
check('el like pendiente se conserva como like', (await q('select is_like from public.swipes'))[0]?.is_like === true)
check('el match antiguo queda ordenado (user1 < user2)', (await q('select (user1_id < user2_id) ok from public.matches'))[0]?.ok === true)
check('fuga cerrada: T ya no lee el teléfono de P', (await as(T, () => q(`select telefono from public.person where id='${P}'`))).length === 0)
check('P sí lee el teléfono de su match S', (await as(P, () => q(`select telefono from public.person where id='${S}'`)))[0]?.telefono === '922222222')
check('T no ve los likes de otros (swipes con RLS)', (await as(P, () => q('select * from public.swipes'))).length === 0)
let err = null; try { await db.exec('set role anon'); await q('select * from public.person_public') } catch (e) { err = e } finally { await db.exec('reset role') }
check('anon ya no puede listar person_public', err !== null)
const r = (await as(P, () => q(`select public.create_or_update_match_rpc(true,'${T}') r`)))[0].r
check('el like pendiente de T se convierte en match cuando P da like', r.isMutual === true)
check('el mazo de P funciona con el esquema alineado', Array.isArray(await as(P, () => q('select * from public.match_deck(10)'))))
const appt = (await as(P, () => q('select id from public.appointments')))[0]
await as(P, () => q(`insert into public.feedback (appointment_id,evaluador_id,evaluado_id,rating,comentario,recomendaria) values ('${appt.id}','${P}','${S}',5,'Muy buena atención',true)`))
check('las opiniones ahora funcionan (feedback tenía RLS sin políticas)', (await as(S, () => q('select rating from public.feedback')))[0]?.rating === 5)
