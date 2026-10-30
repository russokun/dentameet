// Smoke test del esquema base sin Docker: corre las migraciones en PGlite con un
// esquema auth simulado y recorre mazo → like → match → cita → feedback con RLS.
// Uso: npm run test:db
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations')
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
for (const f of readdirSync(dir).filter(f => f.endsWith('.sql')).sort()) await db.exec(readFileSync(join(dir, f), 'utf8'))
await db.exec(`grant select, insert, update, delete on all tables in schema public to authenticated;`)
const A='00000000-0000-0000-0000-00000000000a', B='00000000-0000-0000-0000-00000000000b', C='00000000-0000-0000-0000-00000000000c'
await db.exec(`insert into auth.users values ('${A}','a@x'),('${B}','b@x'),('${C}','c@x');
  insert into public.person (id,email,nombre,telefono,role,region,comuna,onboarding_completed) values
  ('${A}','a@x','Ana','911111111','paciente','Región Metropolitana','Ñuñoa',true),
  ('${B}','b@x','Beto','922222222','estudiante','Región Metropolitana','Ñuñoa',true),
  ('${C}','c@x','Caro','933333333','estudiante','Región Metropolitana','Macul',true);`)
const as = async (uid, fn) => { await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false);`); try { return await fn() } finally { await db.exec('reset role') } }
const check = (label, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + label); if (!cond) process.exitCode = 1 }

check('A ve 2 candidatos en el mazo', (await as(A, () => q('select id from public.match_deck(10)'))).length === 2)
check('person_public no expone telefono', !(await q("select column_name from information_schema.columns where table_name='person_public'")).some(c => c.column_name === 'telefono'))
check('A no lee el telefono de B antes del match', (await as(A, () => q(`select telefono from person where id='${B}'`))).length === 0)
const r1 = (await as(A, () => q(`select public.create_or_update_match_rpc(true,'${B}') r`)))[0].r
check('like A->B no es mutuo', r1.isMutual === false && r1.match === null)
check('B ya no aparece en el mazo de A', !(await as(A, () => q('select id from public.match_deck(10)'))).some(x => x.id === B))
const r2 = (await as(B, () => q(`select public.create_or_update_match_rpc(true,'${A}') r`)))[0].r
check('like B->A crea match mutuo', r2.isMutual === true && r2.match && r2.match.is_mutual === true)
check('A lee el telefono de B tras el match', (await as(A, () => q(`select telefono from person where id='${B}'`)))[0]?.telefono === '922222222')
check('C no ve el match A-B', (await as(C, () => q('select * from matches'))).length === 0)
check('C no lee perfiles ajenos', (await as(C, () => q(`select * from person where id<>'${C}'`))).length === 0)
let err = null; try { await as(C, () => q(`insert into appointments (user1_id,user2_id,fecha_hora,tratamiento) values ('${C}','${A}',now(),'Limpieza')`)) } catch (e) { err = e }
check('C no puede agendar con A sin match', err !== null)
await as(A, () => q(`insert into appointments (user1_id,user2_id,fecha_hora,tratamiento) values ('${A}','${B}',now(),'Limpieza dental')`))
const appt = (await as(B, () => q('select * from appointments')))[0]
check('B ve la cita creada por A', appt?.status === 'pendiente')
err = null; try { await as(A, () => q(`insert into feedback (appointment_id,evaluador_id,evaluado_id,rating) values ('${appt.id}','${A}','${C}',5)`)) } catch (e) { err = e }
check('A no puede evaluar a C (no está en la cita)', err !== null)
await as(A, () => q(`insert into feedback (appointment_id,evaluador_id,evaluado_id,rating,recomendaria) values ('${appt.id}','${A}','${B}',5,true)`))
check('A evalúa a B por la cita', (await as(B, () => q('select rating from feedback')))[0]?.rating === 5)
err = null; try { await as(A, () => q(`select public.create_or_update_match_rpc(true,'${A}')`)) } catch (e) { err = e }
check('RPC rechaza auto-like', err !== null)
err = null; try { await db.exec(`set role anon`); await q('select * from person_public') } catch (e) { err = e } finally { await db.exec('reset role') }
check('anon no puede leer person_public', err !== null)

// --- match_deck y bloqueos (20261031000000) ---
const D = '00000000-0000-0000-0000-00000000000d', E = '00000000-0000-0000-0000-00000000000e'
await db.exec(`insert into auth.users values ('${D}','d@x'),('${E}','e@x');
  update public.person set tratamientos_interes='{Endodoncia,Limpieza dental}', horarios_disponibles='{Tarde (14:00-18:00)}' where id='${A}';
  insert into public.person (id,email,nombre,role,region,comuna,especialidades,horarios_disponibles,onboarding_completed) values
  ('${D}','d@x','Dani','estudiante','Región Metropolitana','Ñuñoa','{Endodoncista}','{Tarde (14:00-18:00)}',true),
  ('${E}','e@x','Eli','estudiante','Región de Valparaíso','Valparaíso','{Ortodoncista}','{}',true);`)
const deck = await as(A, () => q('select id, score, reasons from public.match_deck(10)'))
check('match_deck excluye el match existente (B)', !deck.some(r => r.id === B))
check('match_deck ordena primero al estudiante que calza (D)', deck[0]?.id === D)
check('match_deck explica por qué aparece', deck[0]?.reasons.some(r => r.startsWith('Calza en Endodoncia')) && deck[0]?.reasons.some(r => r.startsWith('Misma comuna')))
check('match_deck puntúa más bajo al que no calza (E)', (deck.find(r => r.id === E)?.score ?? 999) < deck[0].score)
check('el paciente no aparece en el mazo de otro paciente', !(await as(A, () => q('select id from public.match_deck(10)'))).some(r => r.id === A))
await as(A, () => q(`select public.block_user('${B}')`))
check('bloquear deshace el match', (await as(B, () => q('select * from matches'))).length === 0)
check('tras bloquear, A ya no lee el teléfono de B', (await as(A, () => q(`select telefono from person where id='${B}'`))).length === 0)
check('bloquear cancela la cita futura', (await as(B, () => q(`select status from appointments where fecha_hora > now()`))).every(r => r.status === 'cancelada'))
await as(C, () => q(`select public.report_user('${D}', 'acoso', 'mensajes insistentes')`))
check('reportar guarda el reporte', (await as(C, () => q('select reason from reports')))[0]?.reason === 'acoso')
check('reportar también bloquea: D sale del mazo de C', !(await as(C, () => q('select id from public.match_deck(10)'))).some(r => r.id === D))
check('el bloqueado tampoco ve a quien lo reportó', !(await as(D, () => q('select id from public.match_deck(10)'))).some(r => r.id === C))
err = null; try { await as(C, () => q(`select public.report_user('${D}', 'no_existe')`)) } catch (e) { err = e }
check('reportar con motivo inválido falla', err !== null)
