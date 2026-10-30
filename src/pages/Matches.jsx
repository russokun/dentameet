
// ...imports and component start below
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { Users, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { MatchService } from '@/services/matchService'
import MatchCard from '@/components/matches/MatchCard'
import MatchModal from '@/components/matches/MatchModal'
import PageHeader from '@/components/layout/PageHeader'
import { toast } from '@/components/ui/use-toast'

const Matches = () => {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadingAttempted, setLoadingAttempted] = useState(false)
  const isMountedRef = useRef(true)

  // Cargar perfiles compatibles
  const loadProfiles = async (showLoader = true) => {
    // Verificar si el componente sigue montado
    if (!isMountedRef.current) {
      console.log('Component unmounted, skipping load')
      return
    }
    
    // Múltiples guards para evitar ejecuciones duplicadas
    if (!user?.id || !profile?.role) {
      console.log('Missing user or profile data')
      return
    }
    if (profilesLoading || isRefreshing) {
      console.log('Already loading profiles')
      return
    }
    if (loadingAttempted && profiles.length > 0) {
      console.log('Already loaded profiles successfully')
      return
    }
    
    console.log('Starting to load profiles...')
    
    // Debug: verificar usuarios por rol
    
    try {
      if (showLoader) setProfilesLoading(true)
      else setIsRefreshing(true)
      setLoadingAttempted(true)
      
      const compatibleProfiles = await MatchService.getPotentialMatches(
        user.id, 
        profile.role, 
        15
      )
      
      // Verificar nuevamente si el componente sigue montado antes de actualizar estado
      if (!isMountedRef.current) {
        console.log('Component unmounted during load, skipping state update')
        return
      }
      
      console.log('Loaded profiles:', compatibleProfiles?.length || 0)
      setProfiles(compatibleProfiles || [])
      setCurrentIndex(0)
    } catch (error) {
      console.error('Error loading profiles:', error)
      if (isMountedRef.current) {
        setLoadingAttempted(false) // Permitir reintentar en caso de error
        toast({
          title: "Error",
          description: "No se pudieron cargar los perfiles. Intenta nuevamente.",
          variant: "destructive"
        })
      }
    } finally {
      if (isMountedRef.current) {
        setProfilesLoading(false)
        setIsRefreshing(false)
        console.log('Finished loading profiles')
      }
    }
  }

  useEffect(() => {
    // Solo cargar una vez cuando tengamos los datos necesarios
    if (user?.id && profile?.role && !loadingAttempted && !profilesLoading) {
      console.log('Loading profiles for user:', user.id, 'role:', profile.role)
      // Delay pequeño para asegurar que el componente esté completamente montado
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          loadProfiles()
        }
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [user?.id, profile?.role])
  
  // useEffect separado para debug y timeout de seguridad
  useEffect(() => {
    if (profilesLoading && isMountedRef.current) {
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          console.warn('Loading timeout - forcing completion')
          setProfilesLoading(false)
          setLoadingAttempted(true)
        }
      }, 8000) // 8 segundos máximo
      
      return () => clearTimeout(timeoutId)
    }
  }, [profilesLoading])

  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    isMountedRef.current = true // Asegurar que esté en true al montar
    console.log('Matches component mounted')
    
    return () => {
      console.log('Matches component unmounting - cleaning up')
      isMountedRef.current = false
    }
  }, [])

  // Manejar like
  const handleLike = async (likedProfile) => {
    if (!likedProfile || !likedProfile.id) {
      console.warn('handleLike called with invalid profile', likedProfile)
      setCurrentIndex(prev => prev + 1)
      return
    }

    try {
      const result = await MatchService.recordAction(user.id, likedProfile.id, 'liked')
      
      if (result.isMatch) {
        // ¡Hay match! El mazo no trae el teléfono; tras el match RLS deja leer el perfil completo
        const fullProfile = await MatchService.getUserById(likedProfile.id).catch(() => null)
        setMatchedProfile(fullProfile ? { ...likedProfile, ...fullProfile } : likedProfile)
        setShowMatchModal(true)
        
        toast({
          title: "🎉 ¡Es un Match!",
          description: `Tú y ${likedProfile.nombre} se han gustado mutuamente`,
        })
      } else {
        toast({
          title: "❤️ Like enviado",
          description: `Le diste like a ${likedProfile.nombre}`,
        })
      }
      
      // Avanzar al siguiente perfil
      setCurrentIndex(prev => prev + 1)
    } catch (error) {
      console.error('Error recording like:', error)
      // Manejo especial para errores de Row Level Security (RLS)
      if (error && (error.code === '42501' || (error.original && error.original.code === '42501'))) {
        toast({
          title: "Acción bloqueada por seguridad",
          description: "No se pudo registrar el like porque las políticas RLS en la tabla 'matches' lo impiden. Revisa las policies en Supabase (INSERT/UPDATE) o crea una RPC segura.",
          variant: "destructive"
        })
      } else if (error && (error.code === 'RPC_MISSING' || (error.message && error.message.toLowerCase().includes('rpc')))) {
        toast({
          title: "Función RPC faltante",
          description: "La función RPC `create_or_update_match_rpc` no fue encontrada en la base de datos. Crea la función en Supabase o ejecuta las migraciones proporcionadas.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar el like. Intenta nuevamente.",
          variant: "destructive"
        })
      }
    }
  }

  // Manejar pass
  const handlePass = async (passedProfile) => {
    if (!passedProfile || !passedProfile.id) {
      console.warn('handlePass called with invalid profile', passedProfile)
      setCurrentIndex(prev => prev + 1)
      return
    }

    try {
      await MatchService.recordAction(user.id, passedProfile.id, 'passed')
      setCurrentIndex(prev => prev + 1)
    } catch (error) {
      console.error('Error recording pass:', error)
      // Continuar de todas formas
      setCurrentIndex(prev => prev + 1)
    }
  }

  // Manejar mensaje de WhatsApp
  const handleSendMessage = (profile) => {
    const message = `¡Hola ${profile.nombre}! Somos match en DentaMeet 🦷✨ Me gustaría coordinar contigo.`
    const phoneNumber = profile.telefono?.replace(/[^\d]/g, '') || ''
    
    if (phoneNumber) {
      window.open(`https://wa.me/56${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
    } else {
      toast({
        title: "Información de contacto no disponible",
        description: "Este usuario no ha proporcionado su número de WhatsApp",
        variant: "destructive"
      })
    }
    
    setShowMatchModal(false)
  }

  const hasNoMoreProfiles = currentIndex >= profiles.length
  const remaining = Math.max(profiles.length - currentIndex, 0)
  const lookingFor = profile?.role === 'paciente' ? 'estudiantes' : profile?.role === 'estudiante' ? 'pacientes' : 'perfiles'

  const refresh = () => {
    setLoadingAttempted(false) // Reset para permitir nueva carga
    loadProfiles(false)
  }

  return (
    <>
      <Helmet>
        <title>Descubrir | DentaMeet</title>
        <meta name="description" content="Descubre perfiles compatibles en DentaMeet. Conecta con estudiantes de odontología o encuentra pacientes." />
      </Helmet>

      <PageHeader
        title="Descubrir"
        subtitle={
          authLoading || profilesLoading
            ? `Buscando ${lookingFor} compatibles…`
            : remaining > 0
              ? `${remaining} ${remaining === 1 ? 'perfil compatible' : 'perfiles compatibles'} cerca de ti`
              : `No hay más ${lookingFor} por ahora`
        }
        actions={
          <button type="button" onClick={refresh} disabled={isRefreshing || profilesLoading} className="btn-secondary">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
            Actualizar
          </button>
        }
      />

      <div className="max-w-md mx-auto">
        {authLoading || profilesLoading ? (
          /* Cargando: esqueleto con la forma de la tarjeta */
          <div className="app-card overflow-hidden" role="status" aria-label="Buscando perfiles">
            <div className="h-72 bg-slate-100 animate-pulse motion-reduce:animate-none" />
            <div className="p-6 space-y-3">
              <div className="h-6 w-1/2 rounded bg-slate-100 animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        ) : hasNoMoreProfiles ? (
          /* Estado vacío */
          <div className="app-card text-center px-6 py-12">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl mx-auto mb-5 flex items-center justify-center">
              <Users className="h-8 w-8 text-emerald-700" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Ya viste todos los perfiles</h2>
            <p className="text-slate-600 mb-6 max-w-xs mx-auto">
              Cuando se sumen {lookingFor} de tu zona aparecerán aquí. Mientras, revisa tus matches.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button type="button" onClick={() => navigate('/my-matches')} className="btn-primary">
                Ver mis matches
              </button>
              <button type="button" onClick={refresh} disabled={isRefreshing} className="btn-secondary">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Buscar de nuevo
              </button>
            </div>
          </div>
        ) : (
          /* Stack de cards */
          <>
            <div className="relative h-[560px] sm:h-[600px]">
              <AnimatePresence mode="popLayout">
                {profiles.slice(currentIndex, currentIndex + 3).map((p, index) => (
                  <MatchCard
                    key={`${p.id}-${currentIndex + index}`}
                    profile={p}
                    onLike={handleLike}
                    onPass={handlePass}
                    isTopCard={index === 0}
                  />
                ))}
              </AnimatePresence>
            </div>
            <p className="mt-4 text-center text-sm text-slate-600">
              Desliza a la derecha para dar like o a la izquierda para pasar.
            </p>
          </>
        )}
      </div>

      {/* Modal de match */}
      <MatchModal
        isVisible={showMatchModal}
        matchedProfile={matchedProfile}
        onClose={() => setShowMatchModal(false)}
        onSendMessage={handleSendMessage}
      />
    </>
  )
}

export default Matches
