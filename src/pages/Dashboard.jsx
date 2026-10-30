import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import {
  Users,
  Calendar,
  Heart,
  User,
  Star,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { MatchService } from '../services/matchService'
import { AppointmentService } from '../services/appointmentService'
import { formatDate, formatTime } from '../utils/matchUtils'
import PageHeader from '../components/layout/PageHeader'

// Campos que de verdad existen en `person` y que mejoran el match, por rol
const PROFILE_FIELDS = {
  paciente: [
    ['telefono', 'Teléfono'],
    ['comuna', 'Comuna'],
    ['edad', 'Edad'],
    ['tratamientos_interes', 'Tratamientos de interés'],
    ['horarios_disponibles', 'Horarios disponibles'],
    ['descripcion', 'Descripción'],
  ],
  estudiante: [
    ['telefono', 'Teléfono'],
    ['comuna', 'Comuna'],
    ['universidad', 'Universidad'],
    ['etapa_formacion', 'Etapa de formación'],
    ['especialidades', 'Especialidades'],
    ['horarios_disponibles', 'Horarios disponibles'],
    ['descripcion', 'Descripción'],
  ],
}
PROFILE_FIELDS.dentameeter = [...PROFILE_FIELDS.estudiante, ['tratamientos_interes', 'Tratamientos de interés']]

const isFilled = (v) => (Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && String(v).trim() !== '')

const COPY = {
  paciente: { subtitle: 'Encuentra estudiantes de odontología para tu tratamiento.', discover: 'Descubrir estudiantes' },
  estudiante: { subtitle: 'Encuentra pacientes para tus requisitos clínicos.', discover: 'Descubrir pacientes' },
  dentameeter: { subtitle: 'Conecta como paciente y como estudiante.', discover: 'Descubrir perfiles' },
}

const otherPerson = (row, userId) => (row.user1_id === userId ? row.user2 : row.user1)

const Dashboard = () => {
  const { profile, user } = useAuth()
  const [matches, setMatches] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      try {
        setError(null)
        const [m, a] = await Promise.all([
          MatchService.getMatches(user.id),
          AppointmentService.getAppointments(user.id),
        ])
        if (!active) return
        setMatches(m)
        setAppointments(a)
      } catch (e) {
        if (active) setError('No pudimos cargar tu información. Revisa tu conexión e intenta de nuevo.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [user])

  const role = profile?.role || 'paciente'
  const copy = COPY[role] || COPY.paciente
  const fields = PROFILE_FIELDS[role] || PROFILE_FIELDS.paciente
  const missing = fields.filter(([key]) => !isFilled(profile?.[key]))
  const completeness = Math.round(((fields.length - missing.length) / fields.length) * 100)

  const now = Date.now()
  const upcoming = appointments
    .filter((a) => a.status !== 'cancelada' && a.status !== 'completada' && new Date(a.fecha_hora).getTime() >= now)
    .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
  const next = upcoming[0]
  const nextWith = next ? otherPerson(next, user.id) : null
  const iConfirmed = next ? (next.user1_id === user.id ? next.confirmado_por_user1 : next.confirmado_por_user2) : false

  const stats = [
    { label: 'Matches', value: matches.length, icon: Heart, to: '/my-matches' },
    { label: 'Citas', value: upcoming.length, icon: Calendar, to: '/appointments' },
    { label: 'Perfil', value: `${completeness}%`, icon: User, to: '/profile' },
  ]

  const actions = [
    { title: copy.discover, description: 'Revisa perfiles compatibles cerca de ti', to: '/matches', icon: Users },
    { title: 'Mis matches', description: 'Coordina por WhatsApp y agenda', to: '/my-matches', icon: Heart },
    { title: 'Mis citas', description: 'Confirma, reprograma o cancela', to: '/appointments', icon: Calendar },
    { title: 'Opiniones', description: 'Evalúa tus citas atendidas', to: '/feedback', icon: Star },
  ]

  return (
    <>
      <Helmet>
        <title>Panel | DentaMeet</title>
      </Helmet>

      <PageHeader
        title={profile?.nombre ? `Hola, ${profile.nombre}` : 'Hola'}
        subtitle={copy.subtitle}
        actions={
          <Link to="/matches" className="btn-primary">
            <Heart className="h-4 w-4" aria-hidden="true" />
            {copy.discover}
          </Link>
        }
      />

      {error && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Lo siguiente que tienes que hacer */}
      <section aria-labelledby="siguiente" className="app-card p-5 sm:p-6 mb-6">
        <h2 id="siguiente" className="text-sm font-bold text-slate-600 mb-3">Lo siguiente</h2>
        {loading ? (
          <div className="space-y-2 animate-pulse motion-reduce:animate-none" aria-label="Cargando">
            <div className="h-6 w-2/3 rounded bg-slate-100" />
            <div className="h-4 w-1/2 rounded bg-slate-100" />
          </div>
        ) : next ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xl font-black text-slate-900">
                {next.tratamiento}
                {nextWith?.nombre && <span className="font-semibold text-slate-600"> con {nextWith.nombre}</span>}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" aria-hidden="true" />{formatDate(next.fecha_hora)}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden="true" />{formatTime(next.fecha_hora)}</span>
                {next.notas && <span className="inline-flex items-center gap-1.5 min-w-0"><MapPin className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="truncate">{next.notas}</span></span>}
              </p>
            </div>
            <Link to="/appointments" className={iConfirmed ? 'btn-secondary' : 'btn-primary'}>
              {iConfirmed ? <><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Ver cita</> : 'Confirmar asistencia'}
            </Link>
          </div>
        ) : matches.length > 0 ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-700">
              Tienes {matches.length === 1 ? 'un match' : `${matches.length} matches`} sin cita. Escríbele por WhatsApp y agenden una hora.
            </p>
            <Link to="/my-matches" className="btn-primary">Ver mis matches</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-700">Aún no tienes matches. Revisa perfiles compatibles y da like a quienes te interesen.</p>
            <Link to="/matches" className="btn-primary">{copy.discover}</Link>
          </div>
        )}
      </section>

      {/* Resumen */}
      <dl className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to} className="app-card p-4 sm:p-5 hover:border-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30">
            <dt className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600">
              <Icon className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </dt>
            <dd className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {loading && typeof value === 'number' ? '·' : value}
            </dd>
          </Link>
        ))}
      </dl>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accesos */}
        <nav aria-label="Accesos rápidos" className="lg:col-span-2 app-card divide-y divide-slate-100 overflow-hidden">
          {actions.map(({ title, description, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-4 p-4 sm:p-5 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:bg-emerald-50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-slate-900">{title}</span>
                <span className="block text-sm text-slate-600">{description}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        {/* Perfil */}
        <section aria-labelledby="perfil-progreso" className="app-card p-5 sm:p-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 id="perfil-progreso" className="text-lg font-black text-slate-900">Tu perfil</h2>
            <span className="text-sm font-semibold text-slate-600 tabular-nums">{completeness}%</span>
          </div>
          <div
            className="h-2 rounded-full bg-slate-100 overflow-hidden"
            role="progressbar"
            aria-valuenow={completeness}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Perfil completado"
          >
            <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${completeness}%` }} />
          </div>
          {missing.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">Tu perfil está completo. Así es más fácil que te encuentren.</p>
          ) : (
            <>
              <p className="mt-4 text-sm text-slate-600">Completa estos datos para mejorar tus matches:</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {missing.map(([key, label]) => (
                  <li key={key} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{label}</li>
                ))}
              </ul>
              <Link to="/profile" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800">
                Completar perfil <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </section>
      </div>
    </>
  )
}

export default Dashboard
