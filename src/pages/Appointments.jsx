import React, { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Plus, CheckCircle2, Clock, MapPin, MessageCircle, X, AlertCircle, Heart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AppointmentService } from '@/services/appointmentService'
import { MatchService } from '@/services/matchService'
import { appointmentSchema, TRATAMIENTOS } from '@/lib/zodSchemas'
import { generateWhatsAppURL, generateWhatsAppMessage, formatDate, formatTime } from '@/utils/matchUtils'
import { getHorasPorRango } from '@/utils/appointmentUtils'
import { toast } from '@/components/ui/use-toast'
import PageHeader from '@/components/layout/PageHeader'

const STATUS = {
  pendiente: { label: 'Por confirmar', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  confirmada: { label: 'Confirmada', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  completada: { label: 'Atendida', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  cancelada: { label: 'Cancelada', className: 'bg-rose-50 text-rose-800 border-rose-200' },
}

const fieldClass = (hasError) =>
  `w-full min-h-[44px] px-4 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-colors ${
    hasError ? 'border-rose-400' : 'border-slate-300'
  }`

const other = (row, userId) => (row.user1_id === userId ? row.user2 : row.user1) || {}
const iConfirmed = (a, userId) => (a.user1_id === userId ? a.confirmado_por_user1 : a.confirmado_por_user2)
const theyConfirmed = (a, userId) => (a.user1_id === userId ? a.confirmado_por_user2 : a.confirmado_por_user1)
const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const Appointments = () => {
  const { user, profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [appointments, setAppointments] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [cancelingId, setCancelingId] = useState(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(appointmentSchema)
  })

  const load = async () => {
    try {
      setLoadError(false)
      const [a, m] = await Promise.all([
        AppointmentService.getAppointments(user.id),
        MatchService.getMatches(user.id),
      ])
      setAppointments(a)
      setMatches(m)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && profile) load()
  }, [user, profile])

  // Desde "Mis matches → Agendar" llega ?nueva=<matchId>
  useEffect(() => {
    const preset = searchParams.get('nueva')
    if (preset && matches.some((m) => m.id === preset)) {
      setSelectedMatchId(preset)
      setShowCreateForm(true)
    }
  }, [searchParams, matches])

  const selectedMatch = matches.find((m) => m.id === selectedMatchId)
  const partner = selectedMatch ? other(selectedMatch, user.id) : null

  // Tratamientos sugeridos: lo que busca el paciente y lo que trabaja el estudiante; si no hay datos, el catálogo
  const treatmentOptions = useMemo(() => {
    if (!selectedMatch) return TRATAMIENTOS
    const people = [selectedMatch.user1, selectedMatch.user2].filter(Boolean)
    const fromProfiles = people.flatMap((p) => [...(p.tratamientos_interes || [])])
    const unique = [...new Set(fromProfiles)]
    return unique.length > 0 ? [...unique, ...TRATAMIENTOS.filter((t) => !unique.includes(t))] : TRATAMIENTOS
  }, [selectedMatch])

  // Horas en que ambos dijeron estar disponibles (sugerencias; la hora final es libre)
  const suggestedHours = useMemo(() => {
    if (!selectedMatch?.user1 || !selectedMatch?.user2) return []
    const hours = (p) => (p.horarios_disponibles || []).flatMap((r) => getHorasPorRango(r))
    const a = hours(selectedMatch.user1)
    const b = hours(selectedMatch.user2)
    return a.filter((h) => b.includes(h))
  }, [selectedMatch])

  const closeForm = () => {
    setShowCreateForm(false)
    setSelectedMatchId('')
    reset()
    if (searchParams.get('nueva')) setSearchParams({}, { replace: true })
  }

  const handleCreateAppointment = async (data) => {
    if (!selectedMatch) return
    setSubmitting(true)
    try {
      await AppointmentService.createAppointment({
        user1_id: selectedMatch.user1_id,
        user2_id: selectedMatch.user2_id,
        // Hora local de Chile → ISO con zona, para que no se corra al guardarla
        fecha_hora: new Date(`${data.fecha}T${data.hora}:00`).toISOString(),
        tratamiento: data.tratamiento,
        notas: data.notas?.trim() || null
      })
      toast({ title: 'Cita propuesta', description: `${partner?.nombre || 'La otra persona'} tiene que confirmarla.` })
      closeForm()
      load()
    } catch {
      toast({ title: 'No se pudo crear la cita', description: 'Revisa tu conexión e intenta de nuevo.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  // Confirmar mi asistencia: la cita queda "confirmada" solo cuando ambos confirmaron
  const handleConfirm = async (appointment) => {
    setBusyId(appointment.id)
    try {
      const both = theyConfirmed(appointment, user.id)
      await AppointmentService.updateAppointmentStatus(appointment.id, both ? 'confirmada' : null, user.id)
      toast({
        title: 'Asistencia confirmada',
        description: both ? 'Ambos confirmaron. ¡Nos vemos en la clínica!' : 'Falta que la otra persona confirme.'
      })
      load()
    } catch {
      toast({ title: 'No se pudo confirmar', description: 'Intenta de nuevo en un momento.', variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  const handleComplete = async (appointment) => {
    setBusyId(appointment.id)
    try {
      await AppointmentService.updateAppointmentStatus(appointment.id, 'completada', user.id)
      toast({ title: 'Cita marcada como atendida', description: 'Ya puedes dejar tu opinión.' })
      load()
    } catch {
      toast({ title: 'No se pudo actualizar la cita', variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  const handleCancel = async (appointment) => {
    setBusyId(appointment.id)
    try {
      await AppointmentService.cancelAppointment(appointment.id, user.id)
      toast({ title: 'Cita cancelada', description: 'Avísale por WhatsApp a la otra persona.' })
      setCancelingId(null)
      load()
    } catch {
      toast({ title: 'No se pudo cancelar la cita', variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  const handleWhatsAppContact = (appointment) => {
    const otherUser = other(appointment, user.id)
    if (!otherUser?.telefono) {
      toast({
        title: 'Sin número de WhatsApp',
        description: `${otherUser?.nombre || 'Esta persona'} aún no agrega su teléfono a su perfil.`,
        variant: 'destructive'
      })
      return
    }
    const message = generateWhatsAppMessage(profile, otherUser, appointment)
    window.open(generateWhatsAppURL(otherUser.telefono, message), '_blank', 'noopener,noreferrer')
  }

  const now = Date.now()
  const upcoming = appointments
    .filter((a) => ['pendiente', 'confirmada'].includes(a.status) && new Date(a.fecha_hora).getTime() >= now)
    .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
  const past = appointments
    .filter((a) => a.status === 'completada' || (a.status !== 'cancelada' && new Date(a.fecha_hora).getTime() < now))
    .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))
  const canceled = appointments.filter((a) => a.status === 'cancelada')

  return (
    <>
      <Helmet>
        <title>Mis citas | DentaMeet</title>
      </Helmet>

      <PageHeader
        title="Mis citas"
        subtitle="Propón una hora a tus matches y confirma tu asistencia."
        actions={
          !showCreateForm && (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              disabled={matches.length === 0}
              className="btn-primary"
              title={matches.length === 0 ? 'Necesitas un match para agendar' : undefined}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nueva cita
            </button>
          )
        }
      />

      {loadError && (
        <div role="alert" className="app-card p-5 mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" aria-hidden="true" />
          <p className="flex-1 text-slate-700">No pudimos cargar tus citas. Revisa tu conexión e intenta de nuevo.</p>
          <button type="button" className="btn-secondary" onClick={load}>Reintentar</button>
        </div>
      )}

      {/* Nueva cita */}
      {showCreateForm && (
        <section aria-labelledby="nueva-cita" className="app-card p-5 sm:p-6 mb-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 id="nueva-cita" className="text-xl font-black text-slate-900">Proponer una cita</h2>
              <p className="text-sm text-slate-600 mt-1">La otra persona recibe la propuesta y la confirma desde sus citas.</p>
            </div>
            <button type="button" onClick={closeForm} aria-label="Cerrar" className="h-11 w-11 -mr-2 -mt-2 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleCreateAppointment)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="match" className="block text-sm font-bold text-slate-700 mb-1.5">Con quién</label>
              <select id="match" value={selectedMatchId} onChange={(e) => setSelectedMatchId(e.target.value)} className={fieldClass(false)} required>
                <option value="">Elige uno de tus matches</option>
                {matches.map((m) => {
                  const p = other(m, user.id)
                  return (
                    <option key={m.id} value={m.id}>
                      {[p.nombre, p.apellido].filter(Boolean).join(' ') || 'Match sin nombre'}
                      {p.universidad ? ` · ${p.universidad}` : ''}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fecha" className="block text-sm font-bold text-slate-700 mb-1.5">Fecha</label>
                <input id="fecha" type="date" min={today()} {...register('fecha')} className={fieldClass(errors.fecha)} aria-invalid={!!errors.fecha} />
                {errors.fecha && <p className="text-sm text-rose-700 mt-1">{errors.fecha.message}</p>}
              </div>
              <div>
                <label htmlFor="hora" className="block text-sm font-bold text-slate-700 mb-1.5">Hora</label>
                <input id="hora" type="time" step="900" {...register('hora')} className={fieldClass(errors.hora)} aria-invalid={!!errors.hora} />
                {errors.hora && <p className="text-sm text-rose-700 mt-1">{errors.hora.message}</p>}
                {suggestedHours.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-600 mb-1.5">Ambos están disponibles:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedHours.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setValue('hora', h, { shouldValidate: true })}
                          className="min-h-[36px] rounded-full border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-800 tabular-nums"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="tratamiento" className="block text-sm font-bold text-slate-700 mb-1.5">Tratamiento</label>
              <select id="tratamiento" {...register('tratamiento')} className={fieldClass(errors.tratamiento)} aria-invalid={!!errors.tratamiento}>
                <option value="">Elige el tratamiento</option>
                {treatmentOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.tratamiento && <p className="text-sm text-rose-700 mt-1">{errors.tratamiento.message}</p>}
            </div>

            <div>
              <label htmlFor="notas" className="block text-sm font-bold text-slate-700 mb-1.5">
                Lugar y notas <span className="font-medium text-slate-500">(opcional)</span>
              </label>
              <textarea
                id="notas"
                rows={3}
                placeholder="Ej. Clínica odontológica de la facultad, piso 2. Llevar carnet."
                {...register('notas')}
                className={`${fieldClass(false)} resize-none`}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeForm} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={!selectedMatch || submitting} className="btn-primary">
                {submitting ? 'Enviando…' : 'Proponer cita'}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <div className="space-y-3" role="status" aria-label="Cargando citas">
          {[0, 1].map((i) => (
            <div key={i} className="app-card p-5 space-y-3">
              <div className="h-5 w-24 rounded-full bg-slate-100 animate-pulse motion-reduce:animate-none" />
              <div className="h-6 w-1/3 rounded bg-slate-100 animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      ) : appointments.length === 0 && !showCreateForm ? (
        <div className="app-card text-center px-6 py-12 max-w-md mx-auto">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl mx-auto mb-5 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-emerald-700" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Todavía no tienes citas</h2>
          {matches.length > 0 ? (
            <>
              <p className="text-slate-600 mb-6">Coordina con tu match por WhatsApp y propón una hora en la clínica.</p>
              <button type="button" onClick={() => setShowCreateForm(true)} className="btn-primary">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Proponer una cita
              </button>
            </>
          ) : (
            <>
              <p className="text-slate-600 mb-6">Para agendar necesitas un match. Empieza por descubrir perfiles compatibles.</p>
              <Link to="/matches" className="btn-primary">
                <Heart className="h-4 w-4" aria-hidden="true" />
                Descubrir
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {upcoming.length > 0 && (
            <section aria-labelledby="proximas">
              <h2 id="proximas" className="text-lg font-black text-slate-900 mb-3">
                Próximas <span className="text-slate-500 font-semibold tabular-nums">({upcoming.length})</span>
              </h2>
              <ul className="space-y-3">
                {upcoming.map((a) => {
                  const p = other(a, user.id)
                  const status = STATUS[a.status] || STATUS.pendiente
                  const mine = iConfirmed(a, user.id)
                  const theirs = theyConfirmed(a, user.id)
                  const busy = busyId === a.id
                  return (
                    <li key={a.id} className="app-card p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${status.className}`}>
                            {status.label}
                          </span>
                          <h3 className="mt-2 text-lg font-black text-slate-900">
                            {a.tratamiento}
                            {p.nombre && <span className="font-semibold text-slate-600"> con {p.nombre} {p.apellido}</span>}
                          </h3>
                          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" aria-hidden="true" />{formatDate(a.fecha_hora)}</span>
                            <span className="inline-flex items-center gap-1.5 tabular-nums"><Clock className="h-4 w-4" aria-hidden="true" />{formatTime(a.fecha_hora)}</span>
                          </p>
                          {a.notas && (
                            <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-700">
                              <MapPin className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />{a.notas}
                            </p>
                          )}
                          {a.status === 'pendiente' && (
                            <p className="mt-2 text-sm text-slate-600">
                              {mine ? `Esperando que ${p.nombre || 'la otra persona'} confirme.` : 'Te falta confirmar tu asistencia.'}
                            </p>
                          )}
                        </div>

                        {cancelingId === a.id ? (
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
                            <p className="text-sm font-semibold text-slate-900">¿Cancelar esta cita?</p>
                            <button type="button" onClick={() => handleCancel(a)} disabled={busy} className="btn-primary bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500/30">
                              Sí, cancelar
                            </button>
                            <button type="button" onClick={() => setCancelingId(null)} className="btn-secondary">No</button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:shrink-0 lg:justify-end">
                            {!mine && (
                              <button type="button" onClick={() => handleConfirm(a)} disabled={busy} className="btn-primary col-span-2 sm:col-span-1">
                                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                Confirmar asistencia
                              </button>
                            )}
                            <button type="button" onClick={() => handleWhatsAppContact(a)} className="btn-secondary">
                              <MessageCircle className="h-4 w-4" aria-hidden="true" />
                              WhatsApp
                            </button>
                            <button type="button" onClick={() => setCancelingId(a.id)} className="btn-secondary text-rose-700 hover:bg-rose-50 hover:border-rose-300">
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                      {theirs && !mine && (
                        <p className="mt-3 text-xs font-semibold text-emerald-800">{p.nombre || 'La otra persona'} ya confirmó.</p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {past.length > 0 && (
            <section aria-labelledby="historial">
              <h2 id="historial" className="text-lg font-black text-slate-900 mb-3">
                Historial <span className="text-slate-500 font-semibold tabular-nums">({past.length})</span>
              </h2>
              <ul className="app-card divide-y divide-slate-100 overflow-hidden">
                {past.map((a) => {
                  const p = other(a, user.id)
                  const attended = a.status === 'completada'
                  return (
                    <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">{a.tratamiento}</p>
                        <p className="text-sm text-slate-600">
                          {formatDate(a.fecha_hora)}{p.nombre ? ` · con ${p.nombre} ${p.apellido || ''}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {attended ? (
                          <>
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS.completada.className}`}>Atendida</span>
                            <Link to="/feedback" className="text-sm font-bold text-emerald-700 hover:text-emerald-800 px-2 py-2">Opinar</Link>
                          </>
                        ) : (
                          <button type="button" onClick={() => handleComplete(a)} disabled={busyId === a.id} className="btn-secondary">
                            Marcar como atendida
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {canceled.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer list-none text-sm font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 min-h-[44px]">
                Canceladas ({canceled.length})
              </summary>
              <ul className="mt-2 app-card divide-y divide-slate-100 overflow-hidden">
                {canceled.map((a) => (
                  <li key={a.id} className="p-4 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">{a.tratamiento}</span> · {formatDate(a.fecha_hora)}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </>
  )
}

export default Appointments
