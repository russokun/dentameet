import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { Star, Quote, ThumbsUp, Calendar } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AppointmentService } from '@/services/appointmentService'
import { FeedbackService } from '@/services/feedbackService'
import { formatDate } from '@/utils/matchUtils'
import { toast } from '@/components/ui/use-toast'
import PageHeader from '@/components/layout/PageHeader'

const other = (row, userId) => (row.user1_id === userId ? row.user2 : row.user1) || {}

const Stars = ({ value, size = 'h-4 w-4', label }) => (
  <span className="inline-flex gap-0.5" role="img" aria-label={label ?? `${value} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`${size} ${n <= value ? 'text-amber-500 fill-amber-400' : 'text-slate-300'}`} aria-hidden="true" />
    ))}
  </span>
)

// Formulario de una opinión pendiente
const ReviewForm = ({ appointment, userId, onDone }) => {
  const person = other(appointment, userId)
  const [rating, setRating] = useState(0)
  const [comentario, setComentario] = useState('')
  const [recomendaria, setRecomendaria] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (rating === 0) return setError('Elige de 1 a 5 estrellas.')
    if (comentario.trim().length < 10) return setError('Cuéntanos un poco más (al menos 10 caracteres).')
    setError('')
    setSaving(true)
    try {
      await FeedbackService.createFeedback({
        appointment_id: appointment.id,
        evaluador_id: userId,
        evaluado_id: person.id || (appointment.user1_id === userId ? appointment.user2_id : appointment.user1_id),
        rating,
        comentario: comentario.trim(),
        recomendaria,
      })
      toast({ title: 'Gracias por tu opinión', description: 'Ayuda a que la comunidad sea más confiable.' })
      onDone()
    } catch {
      toast({ title: 'No se pudo enviar', description: 'Intenta de nuevo en un momento.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const idBase = `review-${appointment.id}`

  return (
    <form onSubmit={submit} className="app-card p-5 sm:p-6 space-y-4" noValidate>
      <div>
        <h3 className="text-lg font-black text-slate-900">
          {appointment.tratamiento} con {person.nombre} {person.apellido}
        </h3>
        <p className="text-sm text-slate-600 inline-flex items-center gap-1.5 mt-0.5">
          <Calendar className="h-4 w-4" aria-hidden="true" /> {formatDate(appointment.fecha_hora)}
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-bold text-slate-700 mb-1.5">¿Cómo fue tu experiencia?</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-pressed={rating === n}
              aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
              className="h-11 w-11 inline-flex items-center justify-center rounded-xl hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/30"
            >
              <Star className={`h-7 w-7 transition-colors ${n <= rating ? 'text-amber-500 fill-amber-400' : 'text-slate-300'}`} aria-hidden="true" />
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${idBase}-comentario`} className="block text-sm font-bold text-slate-700 mb-1.5">Tu comentario</label>
        <textarea
          id={`${idBase}-comentario`}
          rows={3}
          maxLength={500}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Puntualidad, trato, claridad para explicar…"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 resize-none"
        />
      </div>

      <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
        <input
          type="checkbox"
          checked={recomendaria}
          onChange={(e) => setRecomendaria(e.target.checked)}
          className="h-5 w-5 rounded border-slate-400 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-slate-800 font-medium">Recomendaría a {person.nombre || 'esta persona'}</span>
      </label>

      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Enviando…' : 'Enviar opinión'}</button>
      </div>
    </form>
  )
}

const Feedback = () => {
  const { user } = useAuth()
  const [pending, setPending] = useState([])
  const [received, setReceived] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const load = async () => {
    try {
      setLoadError(false)
      const [appointments, given, got] = await Promise.all([
        AppointmentService.getAppointments(user.id),
        FeedbackService.getFeedback(user.id, 'given'),
        FeedbackService.getFeedback(user.id, 'received'),
      ])
      const reviewed = new Set(given.map((f) => f.appointment_id))
      setPending(appointments.filter((a) => a.status === 'completada' && !reviewed.has(a.id)))
      setReceived(got)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) load()
  }, [user])

  const average = received.length ? received.reduce((s, f) => s + f.rating, 0) / received.length : 0
  const recommend = received.length ? Math.round((received.filter((f) => f.recomendaria).length / received.length) * 100) : 0

  return (
    <>
      <Helmet>
        <title>Opiniones | DentaMeet</title>
      </Helmet>

      <PageHeader title="Opiniones" subtitle="Después de cada cita atendida, pacientes y estudiantes se evalúan." />

      {loadError ? (
        <div role="alert" className="app-card p-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <p className="flex-1 text-slate-700">No pudimos cargar tus opiniones. Revisa tu conexión e intenta de nuevo.</p>
          <button type="button" className="btn-secondary" onClick={load}>Reintentar</button>
        </div>
      ) : loading ? (
        <div className="app-card p-6 space-y-3" role="status" aria-label="Cargando opiniones">
          <div className="h-5 w-1/3 rounded bg-slate-100 animate-pulse motion-reduce:animate-none" />
          <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse motion-reduce:animate-none" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <section aria-labelledby="por-opinar" className="lg:col-span-3">
            <h2 id="por-opinar" className="text-lg font-black text-slate-900 mb-3">Por opinar</h2>
            {pending.length === 0 ? (
              <div className="app-card p-6 text-slate-600">
                No tienes citas atendidas sin opinión. Cuando marques una cita como atendida, podrás evaluarla aquí.{' '}
                <Link to="/appointments" className="font-bold text-emerald-700 hover:text-emerald-800">Ver mis citas</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map((a) => (
                  <ReviewForm key={a.id} appointment={a} userId={user.id} onDone={load} />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="recibidas" className="lg:col-span-2">
            <h2 id="recibidas" className="text-lg font-black text-slate-900 mb-3">Lo que dicen de ti</h2>
            {received.length === 0 ? (
              <div className="app-card p-6 text-center">
                <Quote className="h-8 w-8 text-slate-400 mx-auto mb-3" aria-hidden="true" />
                <p className="text-slate-600">Aún no recibes opiniones.</p>
              </div>
            ) : (
              <div className="app-card overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-6">
                  <div>
                    <p className="text-3xl font-black text-slate-900 tabular-nums">{average.toFixed(1)}</p>
                    <Stars value={Math.round(average)} label={`Promedio ${average.toFixed(1)} de 5`} />
                  </div>
                  <p className="text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-900"><ThumbsUp className="h-4 w-4 text-emerald-700" aria-hidden="true" />{recommend}%</span>{' '}
                    te recomendaría · {received.length} {received.length === 1 ? 'opinión' : 'opiniones'}
                  </p>
                </div>
                <ul className="divide-y divide-slate-100">
                  {received.map((f) => (
                    <li key={f.id} className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <Stars value={f.rating} />
                        <span className="text-xs text-slate-500">{formatDate(f.created_at)}</span>
                      </div>
                      {f.comentario && <p className="mt-2 text-slate-700 leading-relaxed">“{f.comentario}”</p>}
                      {f.evaluador?.nombre && <p className="mt-1 text-sm text-slate-500">{f.evaluador.nombre}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}

export default Feedback
