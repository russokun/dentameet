// Recorrido completo de la app contra el backend simulado (npm run dev:demo en :5174).
// Usa el Chrome instalado; no descarga navegadores. Uso: npm run test:e2e
import { chromium } from 'playwright-core'

const BASE = process.env.E2E_URL || 'http://localhost:5174'
const browser = await chromium.launch({ channel: 'chrome' })
const page = await (await browser.newContext({ viewport: { width: 1280, height: 860 } })).newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
let failed = 0
const step = async (label, fn) => {
  try { await fn(); console.log('PASS ' + label) } catch (e) { failed++; console.log('FAIL ' + label + ' → ' + e.message.split('\n')[0]) }
}
const see = (text, opts) => page.getByText(text, opts).first().waitFor({ timeout: 6000 })

await step('Panel muestra la próxima cita y el resumen', async () => {
  await page.goto(`${BASE}/dashboard`)
  await see('Hola, Camila')
  await see('Endodoncia con Matías')
})

await step('Descubrir arma el mazo en el servidor y explica por qué aparece', async () => {
  await page.goto(`${BASE}/matches`)
  await see('perfiles compatibles cerca de ti')
  await see('Calza en Limpieza dental')
})

await step('Like mutuo abre el modal de match', async () => {
  // El orden lo decide el puntaje; se pasa hasta llegar a Valentina (la que ya dio like en el demo)
  for (let i = 0; i < 3; i++) {
    const card = page.locator('[aria-hidden="false"] article[aria-label^="Valentina"]')
    if (await card.count()) break
    await page.getByRole('button', { name: /^Pasar a / }).first().click()
    await page.waitForTimeout(600)
  }
  await page.getByRole('button', { name: 'Dar like a Valentina' }).click()
  await see('Es un Match', { exact: false })
})

await step('Mis matches lista el nuevo match y permite agendar', async () => {
  // Navegación dentro de la app: el backend del demo vive en memoria y un reload lo reinicia
  await page.keyboard.press('Escape')
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Matches' }).click()
  await see('Valentina Muñoz')
  await page.locator('li', { hasText: 'Valentina Muñoz' }).getByRole('link', { name: 'Agendar' }).click()
  await see('Proponer una cita')
})

await step('Proponer una cita la deja en Próximas', async () => {
  const d = new Date(Date.now() + 5 * 864e5)
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  await page.fill('#fecha', iso)
  await page.fill('#hora', '10:30')
  await page.selectOption('#tratamiento', 'Limpieza dental')
  await page.fill('#notas', 'Clínica de la facultad, piso 2')
  await page.getByRole('button', { name: 'Proponer cita' }).click()
  await see('Cita propuesta')
  await page.locator('li', { hasText: 'Valentina' }).filter({ hasText: 'Limpieza dental' }).waitFor({ timeout: 6000 })
})

await step('Confirmar asistencia', async () => {
  await page.locator('li', { hasText: 'Valentina' }).getByRole('button', { name: 'Confirmar asistencia' }).click()
  await see('Asistencia confirmada')
})

await step('Opinar sobre una cita atendida', async () => {
  await page.goto(`${BASE}/feedback`)
  await see('Limpieza dental con Matías')
  await page.getByRole('button', { name: '5 estrellas' }).click()
  await page.getByLabel('Tu comentario').fill('Muy amable y explicó todo el procedimiento.')
  await page.getByRole('button', { name: 'Enviar opinión' }).click()
  await see('Gracias por tu opinión')
})

await step('Reportar a un match lo saca de la lista', async () => {
  await page.goto(`${BASE}/my-matches`)
  await page.locator('li', { hasText: 'Matías González' }).getByRole('button', { name: 'Reportar o bloquear' }).click()
  await page.getByLabel('No se presentó a la cita').check()
  await page.getByRole('button', { name: 'Enviar reporte' }).click()
  await see('Reporte enviado')
  await page.waitForTimeout(400)
  if (await page.locator('li', { hasText: 'Matías González' }).count()) throw new Error('Matías sigue en la lista')
})

await step('Onboarding de 4 pasos crea el perfil con consentimiento', async () => {
  await page.goto(`${BASE}/profile/setup`)
  await page.getByRole('radio', { name: /Busco tratamiento/ }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.fill('#nombre', 'Camila'); await page.fill('#apellido', 'Rojas'); await page.fill('#telefono', '912345678'); await page.fill('#edad', '31')
  await page.selectOption('#region', 'Región Metropolitana'); await page.selectOption('#comuna', 'Ñuñoa')
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await see('Elige al menos un tratamiento')
  await page.getByRole('button', { name: 'Endodoncia', exact: true }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('button', { name: 'Crear mi perfil' }).click()
  await see('Necesitamos tu autorización')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Crear mi perfil' }).click()
  await page.waitForURL('**/matches', { timeout: 6000 })
})

await step('Sin errores de JavaScript en todo el recorrido', async () => {
  if (errors.length) throw new Error(errors.join(' | '))
})

await browser.close()
console.log(failed ? `${failed} paso(s) fallaron` : 'Recorrido completo OK')
process.exitCode = failed ? 1 : 0
