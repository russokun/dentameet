import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { User, GraduationCap, Heart } from 'lucide-react'
import AuthForm from '@/components/auth/AuthForm'

const AuthPage = () => {
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [selectedRole, setSelectedRole] = useState('paciente')

  const roles = [
    {
      id: 'paciente',
      title: 'Soy Paciente',
      description: 'Busco tratamientos dentales de calidad a precios accesibles',
      icon: User,
      color: 'text-[#00C853]',
      bgColor: 'hover:border-[#00C853]',
      features: [
        'Tratamientos desde $0 CLP',
        'Atención por estudiantes supervisados',
        'Conexión según tu comuna',
        'Sistema de feedback y calificaciones'
      ]
    },
    {
      id: 'estudiante',
      title: 'Soy Estudiante',
      description: 'Necesito completar mis horas clínicas de odontología',
      icon: GraduationCap,
      color: 'text-[#1A237E]',
      bgColor: 'hover:border-[#1A237E]',
      features: [
        'Completa tus horas clínicas',
        'Pacientes según tu especialidad',
        'Reduce el ausentismo clínico',
        'Construye tu portafolio profesional'
      ]
    },
    {
      id: 'dentameeter',
      title: 'Soy DentaMeeter',
      description: 'Estudiante que también necesita tratamientos como paciente',
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'hover:border-purple-600',
      features: [
        'Doble funcionalidad: dar y recibir',
        'Networking con colegas',
        'Experiencia completa del ecosistema',
        'Conexión con toda la comunidad'
      ]
    }
  ]

  const selectedRoleData = roles.find(role => role.id === selectedRole)

  return (
    <>
      <Helmet>
        <title>
          {authMode === 'login' ? 'Iniciar Sesión' : 'Registro'} - DentaMeet PacienteFácil
        </title>
        <meta name="description" content={
          authMode === 'login' 
            ? 'Inicia sesión en DentaMeet para conectar con estudiantes de odontología o encontrar pacientes.'
            : 'Regístrate en DentaMeet como paciente, estudiante o dentameeter. Únete a nuestra comunidad dental.'
        } />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#1A237E]/5 via-white to-[#00C853]/5">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center mb-4">
                <Heart className="h-12 w-12 text-[#00C853]" fill="currentColor" />
                <div className="ml-3">
                  <span className="text-3xl font-bold text-[#1A237E]">DentaMeet</span>
                  <span className="text-lg text-[#00C853] block leading-none">PacienteFácil</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1A237E] mb-2">
                {authMode === 'login' ? 'Bienvenido de Vuelta' : 'Únete a DentaMeet'}
              </h1>
              <p className="text-xl text-gray-600">
                {authMode === 'login' 
                  ? 'Accede a tu cuenta para continuar conectando' 
                  : 'Conectamos estudiantes y pacientes por una salud bucal accesible'
                }
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Role Selection (only for register mode) */}
              {authMode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A237E] mb-4">
                      Selecciona tu Perfil
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Elige el tipo de usuario que mejor te represente para personalizar tu experiencia
                    </p>
                  </div>

                  <div className="space-y-4">
                    {roles.map((role) => (
                      <motion.div
                        key={role.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedRole(role.id)}
                        className={`
                          p-6 bg-white rounded-xl shadow-lg cursor-pointer border-2 transition-all duration-300
                          ${selectedRole === role.id 
                            ? `border-current ${role.color}` 
                            : `border-gray-200 ${role.bgColor}`
                          }
                        `}
                      >
                        <div className="flex items-start space-x-4">
                          <role.icon className={`h-8 w-8 ${role.color} flex-shrink-0`} />
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-[#1A237E] mb-2">
                              {role.title}
                            </h3>
                            <p className="text-gray-600 mb-3">
                              {role.description}
                            </p>
                            <ul className="space-y-1">
                              {role.features.map((feature, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-600">
                                  <div className={`w-2 h-2 rounded-full ${role.color.replace('text-', 'bg-')} mr-2`}></div>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Login mode info */}
              {authMode === 'login' && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-xl p-8"
                >
                  <h2 className="text-2xl font-bold text-[#1A237E] mb-6">
                    ¿Por qué elegir DentaMeet?
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#00C853]/10 rounded-lg flex items-center justify-center">
                        <User className="h-6 w-6 text-[#00C853]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1A237E] mb-2">Para Pacientes</h3>
                        <p className="text-gray-600 text-sm">
                          Accede a tratamientos dentales de calidad a precios accesibles,
                          atendido por estudiantes bajo supervisión profesional.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#1A237E]/10 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-[#1A237E]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1A237E] mb-2">Para Estudiantes</h3>
                        <p className="text-gray-600 text-sm">
                          Completa tus horas clínicas de manera eficiente conectando
                          con pacientes que necesitan exactamente tu especialidad.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Heart className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1A237E] mb-2">Para DentaMeeters</h3>
                        <p className="text-gray-600 text-sm">
                          Experimenta ambos lados del ecosistema: proporciona servicios
                          como estudiante y recibe tratamientos como paciente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-gradient-to-r from-[#1A237E]/5 to-[#00C853]/5 rounded-lg">
                    <h4 className="font-bold text-[#1A237E] mb-2">Estadísticas Destacadas</h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-[#00C853]">14,000+</div>
                        <div className="text-xs text-gray-600">Estudiantes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#1A237E]">95%</div>
                        <div className="text-xs text-gray-600">Satisfacción</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Auth Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <AuthForm 
                  mode={authMode}
                  onModeChange={setAuthMode}
                  selectedRole={selectedRole}
                />
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthPage
