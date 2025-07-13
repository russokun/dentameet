import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { 
  Heart, 
  X, 
  User, 
  MapPin, 
  GraduationCap,
  Calendar,
  Phone,
  MessageCircle,
  Filter,
  RotateCcw
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { MatchService } from '@/services/matchService'
import { generateWhatsAppURL, generateWhatsAppMessage, calculateMatchScore } from '@/utils/matchUtils'
import { toast } from '@/components/ui/use-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const Matches = () => {
  const { user, profile } = useAuth()
  const [potentialMatches, setPotentialMatches] = useState([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [swipeDirection, setSwipeDirection] = useState(null)
  const [matches, setMatches] = useState([])
  const [activeTab, setActiveTab] = useState('discover') // 'discover' | 'matches'

  useEffect(() => {
    if (user && profile) {
      loadPotentialMatches()
      loadMatches()
    }
  }, [user, profile])

  const loadPotentialMatches = async () => {
    try {
      setLoading(true)
      const data = await MatchService.getPotentialMatches(user.id, profile.role)
      setPotentialMatches(data)
      setCurrentMatchIndex(0)
    } catch (error) {
      console.error('Error loading potential matches:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los matches disponibles.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMatches = async () => {
    try {
      const data = await MatchService.getMatches(user.id)
      setMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
    }
  }

  const handleSwipe = async (isLike) => {
    if (currentMatchIndex >= potentialMatches.length) return

    const currentMatch = potentialMatches[currentMatchIndex]
    
    try {
      setSwipeDirection(isLike ? 'right' : 'left')
      
      const result = await MatchService.createMatch(user.id, currentMatch.id, isLike)
      
      if (result.isMutual) {
        toast({
          title: "¡Match! 💕",
          description: `¡Tienes un nuevo match con ${currentMatch.nombre}!`,
        })
        loadMatches() // Recargar matches
      }

      // Avanzar al siguiente match después de un delay
      setTimeout(() => {
        setCurrentMatchIndex(prev => prev + 1)
        setSwipeDirection(null)
      }, 300)

    } catch (error) {
      console.error('Error creating match:', error)
      toast({
        title: "Error",
        description: "No se pudo procesar el swipe. Intenta de nuevo.",
        variant: "destructive"
      })
    }
  }

  const handleWhatsAppContact = (match) => {
    const otherUser = match.user1_id === user.id ? match.user2 : match.user1
    const message = generateWhatsAppMessage(profile, otherUser, {
      fecha_hora: new Date(),
      tratamiento: 'Consulta general'
    })
    const whatsappUrl = generateWhatsAppURL(otherUser.telefono, message)
    window.open(whatsappUrl, '_blank')
  }

  const currentMatch = potentialMatches[currentMatchIndex]

  const getSwipeCardClass = () => {
    if (!swipeDirection) return 'translate-x-0 rotate-0'
    return swipeDirection === 'right' 
      ? 'translate-x-full rotate-12 opacity-0' 
      : '-translate-x-full -rotate-12 opacity-0'
  }

  const renderDiscoverTab = () => (
    <div className="max-w-md mx-auto">
      {loading ? (
        <LoadingSpinner message="Buscando matches..." />
      ) : currentMatchIndex >= potentialMatches.length ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            ¡No hay más matches por ahora!
          </h3>
          <p className="text-gray-500 mb-6">
            Revisa más tarde o actualiza tu perfil para encontrar más conexiones.
          </p>
          <Button onClick={loadPotentialMatches} className="btn-primary">
            <RotateCcw className="w-4 h-4 mr-2" />
            Buscar de Nuevo
          </Button>
        </motion.div>
      ) : (
        <div className="relative h-[600px]">
          {/* Card Stack */}
          {potentialMatches.slice(currentMatchIndex, currentMatchIndex + 3).map((match, index) => (
            <motion.div
              key={match.id}
              initial={index === 0 ? { scale: 1, zIndex: 10 } : { scale: 0.95, zIndex: 10 - index }}
              animate={index === 0 && swipeDirection ? {
                x: swipeDirection === 'right' ? 300 : -300,
                rotate: swipeDirection === 'right' ? 12 : -12,
                opacity: 0
              } : {}}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 bg-white rounded-2xl shadow-xl overflow-hidden ${
                index === 0 ? getSwipeCardClass() : ''
              }`}
              style={{
                transform: index > 0 ? `scale(${1 - index * 0.05}) translateY(${index * 10}px)` : undefined,
                zIndex: 10 - index
              }}
            >
              <div className="h-2/3 bg-gradient-to-br from-[#1A237E] to-[#00C853] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    {match.role === 'estudiante' ? (
                      <GraduationCap className="w-16 h-16 text-white" />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                </div>
                
                {/* Match Score */}
                <div className="absolute top-4 right-4 bg-white/20 rounded-full px-3 py-1">
                  <span className="text-white font-bold">
                    {calculateMatchScore(profile, match)}% match
                  </span>
                </div>
              </div>

              <div className="h-1/3 p-6">
                <h3 className="text-2xl font-bold text-[#1A237E] mb-2">
                  {match.nombre} {match.apellido}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-[#00C853]" />
                    <span className="capitalize">{match.role}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-[#00C853]" />
                    <span>{match.comuna}</span>
                  </div>
                  
                  {match.universidad && (
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2 text-[#00C853]" />
                      <span>{match.universidad}</span>
                    </div>
                  )}
                  
                  {match.edad && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-[#00C853]" />
                      <span>{match.edad} años</span>
                    </div>
                  )}
                </div>

                {match.descripcion && (
                  <p className="text-gray-700 text-sm mt-3 line-clamp-2">
                    {match.descripcion}
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          {/* Action Buttons */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-6 z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe(false)}
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <X className="w-8 h-8 text-white" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe(true)}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Heart className="w-8 h-8 text-white" fill="currentColor" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )

  const renderMatchesTab = () => (
    <div className="max-w-4xl mx-auto">
      {matches.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            Aún no tienes matches
          </h3>
          <p className="text-gray-500">
            Continúa deslizando para encontrar tus primeras conexiones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => {
            const otherUser = match.user1_id === user.id ? match.user2 : match.user1
            
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-[#1A237E] to-[#00C853] relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      {otherUser.role === 'estudiante' ? (
                        <GraduationCap className="w-8 h-8 text-white" />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#1A237E] mb-2">
                    {otherUser.nombre} {otherUser.apellido}
                  </h3>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-2" />
                      <span>{otherUser.comuna}</span>
                    </div>
                    
                    {otherUser.universidad && (
                      <div className="flex items-center">
                        <GraduationCap className="w-3 h-3 mr-2" />
                        <span>{otherUser.universidad}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleWhatsAppContact(match)}
                      className="flex-1 btn-secondary text-sm"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="flex-1 text-sm"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <>
      <Helmet>
        <title>Matches - DentaMeet PacienteFácil</title>
        <meta name="description" content="Encuentra y conecta con estudiantes de odontología o pacientes en DentaMeet." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#1A237E] mb-2">
            Descubre Conexiones
          </h1>
          <p className="text-gray-600">
            {profile?.role === 'paciente' 
              ? 'Encuentra estudiantes para tus tratamientos dentales'
              : profile?.role === 'estudiante'
              ? 'Conecta con pacientes para tus horas clínicas'
              : 'Conecta con toda la comunidad DentaMeet'
            }
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'bg-[#00C853] text-white'
                  : 'text-gray-600 hover:text-[#00C853]'
              }`}
            >
              Descubrir
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'matches'
                  ? 'bg-[#00C853] text-white'
                  : 'text-gray-600 hover:text-[#00C853]'
              }`}
            >
              Mis Matches ({matches.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {activeTab === 'discover' ? renderDiscoverTab() : renderMatchesTab()}
        </div>
      </div>
    </>
  )
}

export default Matches
