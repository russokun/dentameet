import React from 'react'
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
  Star
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const Dashboard = () => {
  const { profile } = useAuth()

  const stats = [
    {
      name: 'Matches Activos',
      value: '8',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+2 esta semana'
    },
    {
      name: 'Citas Programadas',
      value: '3',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: 'Próxima: Mañana'
    },
    {
      name: 'Feedback Recibido',
      value: '12',
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '4.8/5 promedio'
    },
    {
      name: 'Progreso del Mes',
      value: '75%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+15% vs mes anterior'
    }
  ]

  const recentActivity = [
    {
      type: 'match',
      message: 'Nuevo match con María González',
      time: 'Hace 2 horas',
      icon: Heart,
      color: 'text-red-500'
    },
    {
      type: 'appointment',
      message: 'Cita confirmada para mañana 10:00 AM',
      time: 'Hace 4 horas',
      icon: Calendar,
      color: 'text-green-500'
    },
    {
      type: 'feedback',
      message: 'Recibiste una calificación de 5 estrellas',
      time: 'Hace 1 día',
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      type: 'system',
      message: 'Tu perfil fue verificado exitosamente',
      time: 'Hace 2 días',
      icon: Award,
      color: 'text-blue-500'
    }
  ]

  const quickActions = [
    {
      title: 'Buscar Matches',
      description: 'Encuentra nuevas conexiones',
      href: '/matches',
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Ver Citas',
      description: 'Gestiona tus citas programadas',
      href: '/appointments',
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
          title: `¡Bienvenido/a ${profile.nombre}! 🎓`,
          subtitle: 'Conecta con pacientes para completar tus horas clínicas',
          tip: 'Actualiza tus especialidades y horarios disponibles para atraer más pacientes.'
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
        <title>Dashboard - DentaMeet PacienteFácil</title>
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
            <div>
              <h1 className="text-3xl font-bold mb-2">{welcome.title}</h1>
              <p className="text-lg opacity-90 mb-4">{welcome.subtitle}</p>
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-sm">{welcome.tip}</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-16 h-16 text-white" fill="currentColor" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.a
                  key={action.title}
                  href={action.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${action.color} rounded-lg p-4 text-white block transition-transform`}
                >
                  <action.icon className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Actividad Reciente</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Profile Completion */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Completar Perfil</h2>
              <span className="text-sm text-gray-500">85% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-[#1A237E] to-[#00C853] h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {profile.descripcion ? '✅ Descripción' : '⏳ Agrega una descripción personal'}
              </span>
              <a href="/profile" className="text-[#1A237E] hover:text-[#00C853] font-medium">
                Completar →
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}

export default Dashboard
