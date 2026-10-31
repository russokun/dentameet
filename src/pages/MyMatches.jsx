import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Heart, MessageCircle, Calendar, Users, MapPin, GraduationCap, AlertCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { MatchService } from '@/services/matchService'
import { toast } from '@/components/ui/use-toast'
import PageHeader from '@/components/layout/PageHeader'
import SafetyDialog from '@/components/matches/SafetyDialog'

const ROLE_LABEL = { estudiante: 'Estudiante', paciente: 'Paciente', dentameeter: 'DentaMeeter' }

const initials = (p) =>
  `${(p?.nombre || '').trim().charAt(0)}${(p?.apellido || '').trim().charAt(0)}`.toUpperCase() || '?'

const MyMatches = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    let active = true
    const loadMatches = async () => {
      try {
        setLoading(true)
        setError(false)
        const userMatches = await MatchService.getMatches(user.id)
        if (active) setMatches(userMatches)
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadMatches()
    return () => { active = false }
  }, [user?.id])

  const handleSendMessage = (otherUser) => {
    const message = `¡Hola ${otherUser.nombre}! Somos match en DentaMeet. Me gustaría coordinar una hora contigo.`
    const phoneNumber = otherUser.telefono?.replace(/[^\d]/g, '') || ''

    if (phoneNumber) {
      window.open(`https://wa.me/56${phoneNumber.replace(/^56/, '')}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    } else {
      toast({
        title: 'Sin número de WhatsApp',
        description: `${otherUser.nombre || 'Esta persona'} aún no agrega su teléfono a su perfil.`,
        variant: 'destructive'
      })
    }
  }

  return (
    <>
      <Helmet>
        <title>Mis matches | DentaMeet</title>
      </Helmet>

      <PageHeader
        title="Mis matches"
        subtitle={
          loading
            ? 'Cargando tus matches…'
            : matches.length === 0
              ? 'Cuando ambos se den like, aparecerán aquí.'
              : `${matches.length} ${matches.length === 1 ? 'match activo' : 'matches activos'}. Escríbele y agenden una hora.`
        }
        actions={
          <Link to="/matches" className="btn-secondary">
            <Users className="h-4 w-4" aria-hidden="true" />
            Descubrir más
          </Link>
        }
      />

      {error ? (
        <div role="alert" className="app-card p-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" aria-hidden="true" />
          <p className="flex-1 text-slate-700">No pudimos cargar tus matches. Revisa tu conexión e intenta de nuevo.</p>
          <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-label="Cargando matches">
          {[0, 1, 2].map((i) => (
            <div key={i} className="app-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 animate-pulse motion-reduce:animate-none" />
                <div className="h-5 w-32 rounded bg-slate-100 animate-pulse motion-reduce:animate-none" />
              </div>
              <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse motion-reduce:animate-none" />
              <div className="h-11 w-full rounded-xl bg-slate-100 animate-pulse motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="app-card text-center px-6 py-12 max-w-md mx-auto">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl mx-auto mb-5 flex items-center justify-center">
            <Heart className="h-8 w-8 text-emerald-700" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Aún no tienes matches</h2>
          <p className="text-slate-600 mb-6">Da like a los perfiles que te interesen. Si la otra persona también lo hace, será un match.</p>
          <button type="button" onClick={() => navigate('/matches')} className="btn-primary">
            Empezar a descubrir
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => {
            const otherUser = (match.user1_id === user.id ? match.user2 : match.user1) || {}
            const since = new Date(match.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })

            return (
              <li key={match.id} className="app-card p-5 flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="h-12 w-12 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center font-black">
                    {initials(otherUser)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-black text-lg text-slate-900 truncate">
                      {otherUser.nombre} {otherUser.apellido}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {ROLE_LABEL[otherUser.role] || 'Usuario'} · match desde el {since}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 space-y-1.5 text-sm text-slate-700">
                  {otherUser.universidad && (
                    <div className="flex items-start gap-2">
                      <dt className="sr-only">Universidad</dt>
                      <GraduationCap className="h-4 w-4 mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
                      <dd>{otherUser.universidad}{otherUser.etapa_formacion ? ` · ${otherUser.etapa_formacion}` : ''}</dd>
                    </div>
                  )}
                  {(otherUser.comuna || otherUser.region) && (
                    <div className="flex items-start gap-2">
                      <dt className="sr-only">Ubicación</dt>
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
                      <dd>{[otherUser.comuna, otherUser.region].filter(Boolean).join(', ')}</dd>
                    </div>
                  )}
                </dl>

                {otherUser.descripcion && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3">{otherUser.descripcion}</p>
                )}

                <div className="mt-auto pt-5 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => handleSendMessage(otherUser)} className="btn-primary px-3">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    WhatsApp
                  </button>
                  <Link to={`/appointments?nueva=${match.id}`} className="btn-secondary px-3">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    Agendar
                  </Link>
                </div>
                <SafetyDialog
                  person={otherUser}
                  onDone={() => setMatches((list) => list.filter((m) => m.id !== match.id))}
                  trigger={
                    <button type="button" className="mt-3 self-center min-h-[40px] px-3 text-sm font-semibold text-slate-500 hover:text-rose-700 rounded-lg">
                      Reportar o bloquear
                    </button>
                  }
                />
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

export default MyMatches
