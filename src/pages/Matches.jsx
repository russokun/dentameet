import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { Heart, Users, Sparkles, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { MatchService } from '@/services/MatchService'
import MatchCard from '@/components/matches/MatchCard'
import MatchModal from '@/components/matches/MatchModal'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

const Matches = () => {
  const { user, profile, loading: authLoading } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadingAttempted, setLoadingAttempted] = useState(false)

  // Cargar perfiles compatibles
  const loadProfiles = async (showLoader = true) => {
    if (!user?.id || !profile?.role) return
    if (profilesLoading || isRefreshing) return
    if (loadingAttempted && profiles.length > 0) return // Ya se cargó exitosamente
    
    try {
      if (showLoader) setProfilesLoading(true)
      else setIsRefreshing(true)
      setLoadingAttempted(true)
      
      const compatibleProfiles = await MatchService.getPotentialMatches(
        user.id, 
        profile.role, 
        15
      )
      
      setProfiles(compatibleProfiles)
      setCurrentIndex(0)
    } catch (error) {
      console.error('Error loading profiles:', error)
      setLoadingAttempted(false) // Permitir reintentar en caso de error
      toast({
        title: "Error",
        description: "No se pudieron cargar los perfiles. Intenta nuevamente.",
        variant: "destructive"
      })
    } finally {
      setProfilesLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Solo cargar cuando tengamos user y profile válidos y no hayamos intentado cargar
    if (user?.id && profile?.role && !loadingAttempted) {
      loadProfiles()
    }
  }, [user?.id, profile?.role, loadingAttempted])

  // Manejar like
  const handleLike = async (likedProfile) => {
    try {
      const result = await MatchService.recordAction(user.id, likedProfile.id, 'liked')
      
      if (result.isMatch) {
        // ¡Hay match!
        setMatchedProfile(likedProfile)
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
      toast({
        title: "Error",
        description: "No se pudo enviar el like. Intenta nuevamente.",
        variant: "destructive"
      })
    }
  }

  // Manejar pass
  const handlePass = async (passedProfile) => {
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

  // Estados de carga simplificados
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <motion.div className="text-center">
          <motion.div
            className="w-16 h-16 bg-[#00C853] rounded-full mx-auto mb-4 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Heart className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-700">Verificando autenticación...</h2>
        </motion.div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <motion.div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Acceso requerido</h2>
          <p className="text-gray-500 mt-2">Por favor inicia sesión para ver matches</p>
          <Button onClick={() => window.location.href = '/auth/login'} className="mt-4">
            Iniciar Sesión
          </Button>
        </motion.div>
      </div>
    )
  }

  if (profilesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <motion.div className="text-center">
          <motion.div
            className="w-16 h-16 bg-[#00C853] rounded-full mx-auto mb-4 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Heart className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-700">Buscando matches perfectos...</h2>
          <p className="text-gray-500 mt-2">Esto puede tomar unos segundos</p>
          
          {/* Botón de emergencia después de 3 segundos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          >
            <Button
              onClick={() => {
                setProfilesLoading(false)
                setLoadingAttempted(true)
                toast({
                  title: "Carga omitida",
                  description: "Puedes intentar refrescar manualmente"
                })
              }}
              variant="outline"
              className="mt-4"
            >
              Omitir carga
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // No hay más perfiles
  const hasNoMoreProfiles = currentIndex >= profiles.length

  return (
    <>
      <Helmet>
        <title>Descubrir - DentaMeet | Encuentra tu match perfecto</title>
        <meta name="description" content="Descubre perfiles compatibles en DentaMeet. Conecta con estudiantes de odontología o encuentra pacientes ideales." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#1A237E] to-[#00C853] rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Descubrir</h1>
                  <p className="text-sm text-gray-600">
                    {profiles.length - currentIndex} perfiles disponibles
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setLoadingAttempted(false) // Reset para permitir nueva carga
                  loadProfiles(false)
                }}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto p-4">
          {hasNoMoreProfiles ? (
            /* Estado vacío */
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-[#1A237E]/10 to-[#00C853]/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Has visto todos los perfiles!
              </h2>
              
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                No hay más personas por descubrir en este momento. Vuelve más tarde para ver nuevos perfiles.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => loadProfiles()}
                  className="bg-gradient-to-r from-[#00C853] to-[#4CAF50] hover:from-[#00B04F] hover:to-[#45A049] text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Buscar nuevos perfiles
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/my-matches'}
                  className="w-full py-3 rounded-xl"
                >
                  Ver mis matches
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Stack de cards */
            <div className="relative h-[600px]">
              <AnimatePresence mode="popLayout">
                {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => (
                  <MatchCard
                    key={`${profile.id}-${currentIndex + index}`}
                    profile={profile}
                    onLike={handleLike}
                    onPass={handlePass}
                    isTopCard={index === 0}
                  />
                ))}
              </AnimatePresence>

              {/* Indicadores de acción */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                <motion.div
                  className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>Deslizar ← para pasar</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Deslizar → para like</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de match */}
        <MatchModal
          isVisible={showMatchModal}
          matchedProfile={matchedProfile}
          onClose={() => setShowMatchModal(false)}
          onSendMessage={handleSendMessage}
        />
      </div>
    </>
  )
}

export default Matches
