import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Heart,
  Award,
  Clock,
  Star,
  Shield,
  Loader
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

const Dashboard = () => {
  const { profile, user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar estadísticas reales desde Supabase
  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Obtener datos de usuarios para stats generales
        const { data: usersData, error: usersError } = await supabase
          .from('person')
          .select('*')
        
        if (usersError) throw usersError

        // Calcular estadísticas reales - solo estudiantes y pacientes
        const totalUsers = usersData?.length || 0
        const estudiantes = usersData?.filter(p => p.role === 'estudiante').length || 0
        const pacientes = usersData?.filter(p => p.role === 'paciente').length || 0
        const dentameaters = usersData?.filter(p => p.role === 'dentameeter').length || 0
        
        // Calcular completeness del perfil actual
        const profileFields = ['nombre', 'apellido', 'telefono', 'ciudad', 'bio', 'especialidad', 'universidad']
        const completedFields = profileFields.filter(field => profile?.[field]).length
        const profileCompleteness = Math.round((completedFields / profileFields.length) * 100)

        setStats({
          totalUsers,
          estudiantes,
          pacientes,
          dentameaters,
          matchesActivos: 0, // Por ahora 0 hasta implementar matches
          citasProgramadas: 0, // Por ahora 0 hasta implementar citas
          profileCompleteness,
          feedbackRecibido: { count: 0, average: 0 }, // Por ahora 0
          progresoDelMes: { percentage: profileCompleteness, change: 5 }
        })
        
      } catch (error) {
        console.error('❌ Error loading dashboard stats:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardStats()
  }, [user, profile])

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader className="h-8 w-8 text-[#00C853] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar el dashboard: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Stats por defecto si no hay datos
  const displayStats = stats || {
    totalUsers: 0,
    estudiantes: 0,
    pacientes: 0,
    dentameaters: 0,
    matchesActivos: 0,
    citasProgramadas: 0,
    profileCompleteness: 0,
    feedbackRecibido: { count: 0, average: 0 },
    progresoDelMes: { percentage: 0, change: 0 }
  }

  const recentActivity = []

  const statsData = [
    {
      name: 'Usuarios Totales',
      value: displayStats.totalUsers.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: `${displayStats.estudiantes} estudiantes, ${displayStats.pacientes} pacientes`
    },
    {
      name: 'Completitud del Perfil',
      value: `${displayStats.profileCompleteness}%`,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: displayStats.profileCompleteness === 100 ? 'Perfil completo!' : 'Completa tu perfil para más matches'
    },
    {
      name: 'Matches Activos',
      value: displayStats.matchesActivos.toString(),
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: displayStats.matchesActivos > 0 ? '+2 esta semana' : 'Busca tu primer match'
    },
    {
      name: 'Citas Programadas',
      value: displayStats.citasProgramadas.toString(),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: displayStats.citasProgramadas > 0 ? 'Próxima: Pronto' : 'No hay citas programadas'
    }
  ]

  // Función para obtener icono de actividad
  const getActivityIcon = (type) => {
    switch (type) {
      case 'match': return Heart
      case 'appointment': return Calendar
      case 'feedback': return Star
      case 'verification': return Shield
      default: return Clock
    }
  }

  // Función para obtener color de actividad
  const getActivityColor = (type) => {
    switch (type) {
      case 'match': return 'text-red-500'
      case 'appointment': return 'text-green-500'
      case 'feedback': return 'text-yellow-500'
      case 'verification': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const quickActions = [
    {
      title: 'Buscar Matches',
      description: 'Encuentra nuevas conexiones',
      href: '/matches',
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Ver Matches',
      description: 'Revisa tus matches actuales',
      href: '/my-matches',
      icon: Calendar,
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Dar Feedback',
      description: 'Comparte tu experiencia',
      href: '/feedback',
      icon: MessageSquare,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      title: 'Editar Perfil',
      description: 'Actualiza tu información',
      href: '/profile',
      icon: Award,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600'
    }
  ]

  const getRoleSpecificWelcome = () => {
    switch (profile?.role) {
      case 'paciente':
        return {
          title: `¡Hola ${profile.nombre}! 👋`,
          subtitle: 'Encuentra estudiantes para tus tratamientos dentales',
          tip: 'Mantén tu perfil actualizado con los tratamientos que necesitas para mejores matches.'
        }
      case 'estudiante':
        return {
          title: `¡Hola ${profile.nombre}! 🦷`,
          subtitle: 'Conecta con pacientes y practica tus habilidades',
          tip: 'Especifica tu universidad y etapa de formación para conectar con casos apropiados.'
        }
      case 'dentameeter':
        return {
          title: `¡Hola DentaMeeter ${profile.nombre}! 💜`,
          subtitle: 'Conecta como paciente y estudiante en el ecosistema',
          tip: 'Como DentaMeeter, puedes conectar con toda la comunidad. ¡Aprovecha al máximo!'
        }
      default:
        return {
          title: '¡Bienvenido/a a DentaMeet!',
          subtitle: 'Tu plataforma de conexión dental',
          tip: 'Completa tu perfil para comenzar a conectar.'
        }
    }
  }

  const welcome = getRoleSpecificWelcome()

  return (
    <>
      <Helmet>
        <title>Dashboard - DentaMeet</title>
        <meta name="description" content="Dashboard principal de DentaMeet con tus estadísticas, matches y citas." />
      </Helmet>

      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1A237E] to-[#00C853] rounded-2xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{welcome.title}</h1>
              <p className="text-white/90 text-lg mb-4">{welcome.subtitle}</p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm">{welcome.tip}</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.a
                  key={action.title}
                  href={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="block p-6 rounded-xl text-white hover:scale-105 transition-transform"
                  style={{ background: action.color }}
                >
                  <action.icon className="w-8 h-8 mb-3" />
                  <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                  <p className="text-white/90 text-sm">{action.description}</p>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Activity & Profile */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Actividad Reciente</h2>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => {
                    const IconComponent = getActivityIcon(activity.type)
                    const iconColor = getActivityColor(activity.type)
                    
                    return (
                      <div key={activity.id || index} className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <IconComponent className={`w-4 h-4 ${iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No hay actividad reciente</p>
                    <p className="text-xs text-gray-400">¡Empieza a hacer matches!</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Profile Completion */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Completar Perfil</h2>
                <span className="text-sm text-gray-500">{displayStats.profileCompleteness}% completado</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#1A237E] to-[#00C853] h-2 rounded-full" style={{ width: `${displayStats.profileCompleteness}%` }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                {displayStats.profileCompleteness >= 85 
                  ? '¡Perfil excelente! Seguí así.' 
                  : 'Completa tu perfil para más matches.'}
              </p>
              {displayStats.profileCompleteness < 85 && (
                <motion.a
                  href="/profile"
                  className="inline-block mt-3 text-sm text-[#00C853] hover:text-[#00B04F] font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  Completar perfil →
                </motion.a>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
