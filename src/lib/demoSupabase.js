// Supabase simulado en memoria, SOLO para desarrollo local (VITE_DEMO_MODE=true).
// Permite recorrer las rutas privadas sin backend: sesión iniciada como paciente demo,
// mazo con estudiantes, un match mutuo, citas y feedback. Nada se persiste.

const ME = '00000000-0000-4000-8000-000000000001'
const iso = (days, hour = 10) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

const person = (id, fields) => ({
  id,
  email: `${fields.nombre.toLowerCase()}@demo.cl`,
  apellido: '',
  telefono: '912345678',
  region: 'Región Metropolitana',
  comuna: 'Ñuñoa',
  edad: 24,
  universidad: null,
  etapa_formacion: null,
  especialidades: [],
  tratamientos_interes: [],
  horarios_disponibles: [],
  descripcion: null,
  onboarding_completed: true,
  created_at: iso(-40),
  updated_at: iso(-2),
  ...fields,
})

const db = {
  person: [
    person(ME, {
      nombre: 'Camila', apellido: 'Rojas', role: 'paciente', edad: 31,
      tratamientos_interes: ['Limpieza dental', 'Endodoncia'],
      horarios_disponibles: ['Tarde (14:00-18:00)', 'Fines de semana'],
      descripcion: 'Tengo una molestia en una muela hace semanas y busco atención accesible.',
    }),
    person('00000000-0000-4000-8000-000000000002', {
      nombre: 'Matías', apellido: 'González', role: 'estudiante', universidad: 'Universidad de Chile',
      etapa_formacion: '5to año', especialidades: ['Endodoncista', 'Odontología general'],
      horarios_disponibles: ['Tarde (14:00-18:00)'],
      descripcion: 'Estudiante de 5.º año, me faltan 3 endodoncias para cerrar el ramo clínico.',
    }),
    person('00000000-0000-4000-8000-000000000003', {
      nombre: 'Valentina', apellido: 'Muñoz', role: 'estudiante', comuna: 'Providencia',
      universidad: 'Pontificia Universidad Católica de Chile', etapa_formacion: '4to año',
      especialidades: ['Periodoncista'], horarios_disponibles: ['Mañana (8:00-12:00)'],
      descripcion: 'Atiendo en la clínica de la facultad con supervisión docente.',
    }),
    person('00000000-0000-4000-8000-000000000004', {
      nombre: 'Josefa', apellido: 'Pérez Valenzuela de la Fuente', role: 'estudiante', comuna: 'Macul',
      universidad: 'Universidad Andrés Bello', etapa_formacion: 'Interno',
      especialidades: ['Odontología general', 'Estética dental', 'Implantología'],
      horarios_disponibles: ['Tarde (14:00-18:00)', 'Solo días de semana'],
    }),
    person('00000000-0000-4000-8000-000000000005', {
      nombre: 'Diego', apellido: 'Soto', role: 'estudiante', region: 'Región de Valparaíso', comuna: 'Viña del Mar',
      universidad: 'Universidad de Valparaíso', etapa_formacion: '6to año', especialidades: ['Protesista'],
    }),
  ],
  swipes: [],
  blocks: [],
  matches: [
    { id: 'm-1', user1_id: ME, user2_id: '00000000-0000-4000-8000-000000000002', is_mutual: true, created_at: iso(-3) },
  ],
  appointments: [
    {
      id: 'a-1', user1_id: ME, user2_id: '00000000-0000-4000-8000-000000000002', fecha_hora: iso(4, 15),
      tratamiento: 'Endodoncia', notas: 'Clínica odontológica, Universidad de Chile', status: 'pendiente',
      confirmado_por_user1: true, confirmado_por_user2: false, notas_cancelacion: null,
      created_at: iso(-2), updated_at: iso(-2),
    },
    {
      id: 'a-2', user1_id: ME, user2_id: '00000000-0000-4000-8000-000000000002', fecha_hora: iso(-10, 11),
      tratamiento: 'Limpieza dental', notas: null, status: 'completada',
      confirmado_por_user1: true, confirmado_por_user2: true, notas_cancelacion: null,
      created_at: iso(-15), updated_at: iso(-10),
    },
  ],
  feedback: [
    {
      id: 'f-1', appointment_id: 'a-2', evaluador_id: '00000000-0000-4000-8000-000000000002', evaluado_id: ME,
      rating: 5, comentario: 'Muy puntual y clara con sus síntomas.', recomendaria: true, created_at: iso(-9),
    },
  ],
}

const byId = (id) => db.person.find((p) => p.id === id) || null
const RELATIONS = {
  user1: (row) => byId(row.user1_id),
  user2: (row) => byId(row.user2_id),
  evaluador: (row) => byId(row.evaluador_id),
  evaluado: (row) => byId(row.evaluado_id),
  appointment: (row) => db.appointments.find((a) => a.id === row.appointment_id) || null,
}

// person_public: igual que la vista de la migración base (sin contacto, sin vistos ni matches)
const personPublic = () =>
  db.person
    .filter((p) => p.id !== ME && p.onboarding_completed)
    .filter((p) => !db.swipes.some((s) => s.swiper_id === ME && s.target_id === p.id))
    .filter((p) => !db.matches.some((m) => [m.user1_id, m.user2_id].includes(ME) && [m.user1_id, m.user2_id].includes(p.id)))
    .map(({ telefono, email, ...rest }) => rest)

// Versión simplificada de la RPC match_deck (la real vive en Postgres)
const SPECIALTY_FOR = {
  'Limpieza dental': ['Odontología general', 'Periodoncista'],
  Endodoncia: ['Endodoncista'],
  Ortodoncia: ['Ortodoncista'],
  Prótesis: ['Protesista'],
  Periodoncia: ['Periodoncista'],
  Blanqueamiento: ['Estética dental', 'Odontología general'],
}
const demoDeck = (limit) => {
  const me = byId(ME)
  return personPublic()
    .filter((p) => !db.blocks.includes(p.id) && p.role !== me.role)
    .map((p) => {
      const fits = me.tratamientos_interes.filter((t) => (SPECIALTY_FOR[t] || []).some((s) => p.especialidades.includes(s)))
      const shared = (p.horarios_disponibles || []).filter((h) => me.horarios_disponibles.includes(h))
      const sameComuna = p.comuna === me.comuna
      const sameRegion = p.region === me.region
      const score = Math.min(100, Math.min(40, fits.length * 20) + (sameComuna ? 30 : sameRegion ? 15 : 0) + (shared.length ? 15 : 0) + (p.descripcion ? 2 : 0))
      const reasons = [
        fits.length && `Calza en ${fits.slice(0, 2).join(' y ')}`,
        sameComuna ? `Misma comuna: ${p.comuna}` : sameRegion && 'Misma región',
        shared.length && `Horario en común: ${shared[0].split(' (')[0]}`,
      ].filter(Boolean)
      return { ...p, score, reasons }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

const tableRows = (table) => (table === 'person_public' ? personPublic() : db[table] || [])

const likeToRegex = (pattern) =>
  new RegExp('^' + String(pattern).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*') + '$', 'i')

const parseList = (v) => String(v).replace(/^\(|\)$/g, '').split(',').map((s) => s.trim().replace(/^"|"$/g, ''))

const cond = (col, op, val) => (row) => {
  const v = row[col]
  switch (op) {
    case 'eq': return String(v) === String(val)
    case 'neq': return String(v) !== String(val)
    case 'gt': return v > val
    case 'gte': return v >= val
    case 'lt': return v < val
    case 'lte': return v <= val
    case 'in': return (Array.isArray(val) ? val : parseList(val)).map(String).includes(String(v))
    case 'ilike': return likeToRegex(val).test(v ?? '')
    case 'is': return v === val || (val === null && v == null)
    default: return true
  }
}

// "user1_id.eq.X,user2_id.eq.Y" → OR de condiciones
const orCond = (expr) => {
  const parts = expr.split(',').map((p) => {
    const [col, op, ...rest] = p.split('.')
    return cond(col, op, rest.join('.'))
  })
  return (row) => parts.some((fn) => fn(row))
}

class Query {
  constructor(table) {
    this.table = table
    this.filters = []
    this.mode = 'select'
    this.payload = null
    this.sorts = []
    this.max = null
    this.one = null
    this.wantSelect = false
    this.selectStr = '*'
    this.countExact = false
  }
  select(str = '*', opts = {}) {
    this.wantSelect = true
    this.selectStr = str
    this.countExact = opts.count === 'exact'
    return this
  }
  insert(payload) { this.mode = 'insert'; this.payload = payload; return this }
  upsert(payload) { this.mode = 'insert'; this.payload = payload; return this }
  update(payload) { this.mode = 'update'; this.payload = payload; return this }
  delete() { this.mode = 'delete'; return this }
  eq(c, v) { this.filters.push(cond(c, 'eq', v)); return this }
  neq(c, v) { this.filters.push(cond(c, 'neq', v)); return this }
  gt(c, v) { this.filters.push(cond(c, 'gt', v)); return this }
  gte(c, v) { this.filters.push(cond(c, 'gte', v)); return this }
  lt(c, v) { this.filters.push(cond(c, 'lt', v)); return this }
  lte(c, v) { this.filters.push(cond(c, 'lte', v)); return this }
  in(c, v) { this.filters.push(cond(c, 'in', v)); return this }
  ilike(c, v) { this.filters.push(cond(c, 'ilike', v)); return this }
  is(c, v) { this.filters.push(cond(c, 'is', v)); return this }
  not(c, op, v) { const fn = cond(c, op, v); this.filters.push((r) => !fn(r)); return this }
  or(expr) { this.filters.push(orCond(expr)); return this }
  filter(c, op, v) { this.filters.push(cond(c, op, v)); return this }
  order(c, { ascending = true } = {}) { this.sorts.push([c, ascending]); return this }
  limit(n) { this.max = n; return this }
  range(from, to) { this.max = to + 1; return this }
  single() { this.one = 'single'; return this }
  maybeSingle() { this.one = 'maybe'; return this }

  withRelations(row) {
    const out = { ...row }
    for (const m of this.selectStr.matchAll(/(\w+):\w+/g)) {
      if (RELATIONS[m[1]]) out[m[1]] = RELATIONS[m[1]](row)
    }
    return out
  }

  run() {
    const now = new Date().toISOString()
    let rows
    if (this.mode === 'insert') {
      const list = (Array.isArray(this.payload) ? this.payload : [this.payload]).map((p) => ({
        id: p.id || `demo-${Math.random().toString(36).slice(2, 10)}`, created_at: now, ...p,
      }))
      const target = db[this.table]
      for (const r of list) {
        const i = target.findIndex((x) => x.id === r.id)
        if (i >= 0) target[i] = { ...target[i], ...r }
        else target.push(r)
      }
      rows = list
    } else {
      rows = tableRows(this.table).filter((r) => this.filters.every((fn) => fn(r)))
      if (this.mode === 'update') rows.forEach((r) => Object.assign(r, this.payload))
      if (this.mode === 'delete') db[this.table] = db[this.table].filter((r) => !rows.includes(r))
    }
    for (const [c, asc] of this.sorts.reverse()) {
      rows = [...rows].sort((a, b) => (a[c] > b[c] ? 1 : a[c] < b[c] ? -1 : 0) * (asc ? 1 : -1))
    }
    const count = rows.length
    if (this.max != null) rows = rows.slice(0, this.max)
    rows = rows.map((r) => this.withRelations(r))

    if (this.mode !== 'select' && !this.wantSelect) return { data: null, error: null, count }
    if (this.one) {
      if (rows.length === 0 && this.one === 'single') {
        return { data: null, error: { code: 'PGRST116', message: 'No rows found' }, count }
      }
      return { data: rows[0] ?? null, error: null, count }
    }
    return { data: rows, error: null, count }
  }

  then(resolve, reject) {
    return new Promise((r) => setTimeout(r, 150)).then(() => this.run()).then(resolve, reject)
  }
}

const session = { user: { id: ME, email: byId(ME).email }, access_token: 'demo' }

export const createDemoClient = () => ({
  from: (table) => new Query(table),
  rpc: async (fn, args) => {
    if (fn === 'match_deck') return { data: demoDeck(args?.p_limit ?? 20), error: null }
    if (fn === 'block_user' || fn === 'report_user') {
      db.blocks.push(args.p_target)
      db.matches = db.matches.filter((m) => ![m.user1_id, m.user2_id].includes(args.p_target))
      return { data: null, error: null }
    }
    if (fn !== 'create_or_update_match_rpc') return { data: null, error: { message: `RPC ${fn} no simulada` } }
    db.swipes.push({ swiper_id: ME, target_id: args.p_target, is_like: args.p_is_like })
    // En demo, Valentina siempre "ya te dio like" para poder ver el modal de match
    const mutual = args.p_is_like && args.p_target === '00000000-0000-4000-8000-000000000003'
    let match = null
    if (mutual) {
      match = { id: `m-${Date.now()}`, user1_id: ME, user2_id: args.p_target, is_mutual: true, created_at: new Date().toISOString() }
      db.matches.push(match)
    }
    return { data: { match, isMutual: mutual }, error: null }
  },
  auth: {
    getSession: async () => ({ data: { session }, error: null }),
    getUser: async () => ({ data: { user: session.user }, error: null }),
    onAuthStateChange: (cb) => {
      setTimeout(() => cb('SIGNED_IN', session), 0)
      return { data: { subscription: { unsubscribe() {} } } }
    },
    signInWithPassword: async () => ({ data: { user: session.user, session }, error: null }),
    signUp: async () => ({ data: { user: session.user, session }, error: null }),
    signOut: async () => ({ error: null }),
  },
})
