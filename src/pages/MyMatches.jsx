import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { Heart, MessageCircle, Calendar, ArrowLeft, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { MatchService } from '@/services/MatchService'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

const MyMatches = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  // Protección: si no hay usuario, redirigir a /auth
  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const loadMatches = async () => {
      if (!user?.id) {
        console.log('MyMatches: No user ID available')
        setLoading(false)
        return
      }
      
      try {
        console.log('MyMatches: Loading matches for user:', user.id)
        setLoading(true)
        const userMatches = await MatchService.getMatches(user.id)
        console.log('MyMatches: Loaded matches:', userMatches?.length || 0)
        setMatches(userMatches)
      } catch (error) {
        console.error('MyMatches: Error loading matches:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar tus matches",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
  }, [user?.id])

  const handleSendMessage = (match) => {
    const otherUser = match.user1_id === user.id ? match.user2 : match.user1
    const message = `¡Hola ${otherUser.nombre}! Somos match en DentaMeet 🦷✨ Me gustaría coordinar contigo.`
    const phoneNumber = otherUser.telefono?.replace(/[^\d]/g, '') || ''
    
    if (phoneNumber) {
      window.open(`https://wa.me/56${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
    } else {
      toast({
        title: "Información de contacto no disponible",
        description: "Este usuario no ha proporcionado su número de WhatsApp",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-16 h-16 bg-[#00C853] rounded-full mx-auto mb-4 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Heart className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-700">Cargando tus matches...</h2>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Mis Matches - DentaMeet</title>
        <meta name="description" content="Revisa y gestiona todos tus matches en DentaMeet" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver</span>
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Mis Matches</h1>
                  <p className="text-sm text-gray-600">
                    {matches.length} {matches.length === 1 ? 'match activo' : 'matches activos'}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => navigate('/matches')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Buscar más</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4">
          {matches.length === 0 ? (
            /* Estado vacío */
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-[#1A237E]/10 to-[#00C853]/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Aún no tienes matches
              </h2>
              
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                ¡Empieza a explorar perfiles para encontrar tu primer match!
              </p>

              <Button
                onClick={() => navigate('/matches')}
                className="bg-gradient-to-r from-[#00C853] to-[#4CAF50] hover:from-[#00B04F] hover:to-[#45A049] text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
              >
                <Users className="mr-2 h-4 w-4" />
                Buscar matches
              </Button>
            </motion.div>
          ) : (
            /* Lista de matches */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match, index) => {
                const otherUser = match.user1_id === user.id ? match.user2 : match.user1
                
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-[#1A237E] to-[#00C853] p-4 text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Heart className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{otherUser.nombre} {otherUser.apellido}</h3>
                          <p className="text-white/80 text-sm capitalize">{otherUser.role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">Edad:</span>
                          <span className="ml-2">{otherUser.edad} años</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">Ubicación:</span>
                          <span className="ml-2">{otherUser.comuna}, {otherUser.region}</span>
                        </div>
                        {otherUser.universidad && (
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium">Universidad:</span>
                            <span className="ml-2">{otherUser.universidad}</span>
                          </div>
                        )}
                      </div>

                      {otherUser.descripcion && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {otherUser.descripcion}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleSendMessage(match)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Agendar
                        </Button>
                      </div>
                    </div>

                    {/* Match Date */}
                    <div className="px-4 pb-4">
                      <p className="text-xs text-gray-500">
                        Match desde {new Date(match.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MyMatches
