import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  GraduationCap, 
  Heart, 
  ArrowRight, 
  MapPin, 
  Phone,
  Calendar,
  BookOpen,
  Clock,
  FileText
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { 
  patientProfileSchema, 
  studentProfileSchema, 
  dentameeterProfileSchema,
  REGIONES_CHILE,
  getComunasByRegion,
  UNIVERSIDADES,
  ETAPAS_FORMACION,
  TRATAMIENTOS,
  ESPECIALIDADES,
  HORARIOS
} from '@/lib/zodSchemas'

const ProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [availableComunas, setAvailableComunas] = useState([])
  const { user, updateProfile, loading } = useAuth()
  const navigate = useNavigate()

  const roles = [
    {
      id: 'paciente',
      title: 'Paciente',
      description: 'Busco tratamientos dentales a precios accesibles',
      icon: User,
      color: 'text-[#00C853]',
      bgColor: 'bg-[#00C853]',
      schema: patientProfileSchema
    },
    {
      id: 'estudiante',
      title: 'Estudiante',
      description: 'Necesito completar mis horas clínicas',
      icon: GraduationCap,
      color: 'text-[#1A237E]',
      bgColor: 'bg-[#1A237E]',
      schema: studentProfileSchema
    },
    {
      id: 'dentameeter',
      title: 'DentaMeeter',
      description: 'Estudiante que también necesita tratamientos',
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600',
      schema: dentameeterProfileSchema
    }
  ]

  const selectedRoleData = roles.find(role => role.id === selectedRole)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: selectedRoleData ? zodResolver(selectedRoleData.schema) : undefined
  })

  const watchedValues = watch()
  const watchedRegion = watch('region')

  // Actualizar comunas cuando cambie la región
  React.useEffect(() => {
    if (watchedRegion) {
      const comunas = getComunasByRegion(watchedRegion)
      setAvailableComunas(comunas)
      setSelectedRegion(watchedRegion)
      // Limpiar comuna seleccionada cuando cambie la región
      setValue('comuna', '')
    } else {
      setAvailableComunas([])
    }
  }, [watchedRegion, setValue])

  const handleRoleSelection = (role) => {
    setSelectedRole(role)
    setCurrentStep(2)
  }

  const onSubmit = async (data) => {
    try {
      await updateProfile({
        ...data,
        role: selectedRole,
        email: user.email,
        onboarding_completed: true
      })
      
      navigate('/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleArrayChange = (field, value) => {
    const currentValues = watchedValues[field] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value]
    setValue(field, newValues)
  }

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#1A237E] mb-4">
              ¿Cuál es tu rol en DentaMeet?
            </h2>
            <p className="text-gray-600 text-lg">
              Selecciona tu perfil para personalizar tu experiencia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <motion.div
                key={role.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelection(role.id)}
                className="bg-white p-8 rounded-2xl shadow-lg cursor-pointer border-2 border-gray-200 hover:border-current transition-all duration-300"
              >
                <div className="text-center">
                  <div className={`w-20 h-20 ${role.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <role.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A237E] mb-2">
                    {role.title}
                  </h3>
                  <p className="text-gray-600">
                    {role.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )
    }

    if (currentStep === 2 && selectedRoleData) {
      return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <div className={`w-16 h-16 ${selectedRoleData.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <selectedRoleData.icon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#1A237E] mb-2">
              Configurar Perfil de {selectedRoleData.title}
            </h2>
            <p className="text-gray-600">
              Completa tu información para comenzar a conectar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Nombre *
                </Label>
                <Input
                  id="nombre"
                  placeholder="Tu nombre"
                  {...register('nombre')}
                  className={errors.nombre ? 'border-red-500' : ''}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </Label>
                <Input
                  id="apellido"
                  placeholder="Tu apellido"
                  {...register('apellido')}
                  className={errors.apellido ? 'border-red-500' : ''}
                />
                {errors.apellido && (
                  <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Teléfono *
                </Label>
                <Input
                  id="telefono"
                  placeholder="+56 9 1234 5678"
                  {...register('telefono')}
                  className={errors.telefono ? 'border-red-500' : ''}
                />
                {errors.telefono && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Edad *
                </Label>
                <Input
                  id="edad"
                  type="number"
                  placeholder="25"
                  min="18"
                  max="100"
                  {...register('edad', { valueAsNumber: true })}
                  className={errors.edad ? 'border-red-500' : ''}
                />
                {errors.edad && (
                  <p className="text-red-500 text-sm mt-1">{errors.edad.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Región *
                </Label>
                <select
                  id="region"
                  {...register('region')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent ${
                    errors.region ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona tu región</option>
                  {REGIONES_CHILE.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                {errors.region && (
                  <p className="text-red-500 text-sm mt-1">{errors.region.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="comuna" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Comuna *
                </Label>
                <select
                  id="comuna"
                  {...register('comuna')}
                  disabled={!selectedRegion}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent ${
                    errors.comuna ? 'border-red-500' : 'border-gray-300'
                  } ${!selectedRegion ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {selectedRegion ? 'Selecciona tu comuna' : 'Primero selecciona una región'}
                  </option>
                  {availableComunas.map(comuna => (
                    <option key={comuna} value={comuna}>{comuna}</option>
                  ))}
                </select>
                {errors.comuna && (
                  <p className="text-red-500 text-sm mt-1">{errors.comuna.message}</p>
                )}
                {!selectedRegion && (
                  <p className="text-gray-500 text-sm mt-1">
                    Selecciona una región para ver las comunas disponibles
                  </p>
                )}
              </div>
            </div>

            {/* Campos específicos para pacientes */}
            {(selectedRole === 'paciente' || selectedRole === 'dentameeter') && (
              <>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-4">
                    Tratamientos de Interés
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TRATAMIENTOS.map(tratamiento => (
                      <label key={tratamiento} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={watchedValues.tratamientos_interes?.includes(tratamiento) || false}
                          onChange={() => handleArrayChange('tratamientos_interes', tratamiento)}
                          className="rounded border-gray-300 text-[#00C853] focus:ring-[#00C853]"
                        />
                        <span className="text-sm text-gray-700">{tratamiento}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Campos específicos para estudiantes */}
            {(selectedRole === 'estudiante' || selectedRole === 'dentameeter') && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="universidad" className="block text-sm font-medium text-gray-700 mb-2">
                      <GraduationCap className="h-4 w-4 inline mr-2" />
                      Universidad *
                    </Label>
                    <select
                      id="universidad"
                      {...register('universidad')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent ${
                        errors.universidad ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecciona tu universidad</option>
                      {UNIVERSIDADES.map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                    {errors.universidad && (
                      <p className="text-red-500 text-sm mt-1">{errors.universidad.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="etapa_formacion" className="block text-sm font-medium text-gray-700 mb-2">
                      <BookOpen className="h-4 w-4 inline mr-2" />
                      Etapa de Formación *
                    </Label>
                    <select
                      id="etapa_formacion"
                      {...register('etapa_formacion')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent ${
                        errors.etapa_formacion ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecciona tu etapa</option>
                      {ETAPAS_FORMACION.map(etapa => (
                        <option key={etapa} value={etapa}>{etapa}</option>
                      ))}
                    </select>
                    {errors.etapa_formacion && (
                      <p className="text-red-500 text-sm mt-1">{errors.etapa_formacion.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-4">
                    Especialidades
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ESPECIALIDADES.map(especialidad => (
                      <label key={especialidad} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={watchedValues.especialidades?.includes(especialidad) || false}
                          onChange={() => handleArrayChange('especialidades', especialidad)}
                          className="rounded border-gray-300 text-[#1A237E] focus:ring-[#1A237E]"
                        />
                        <span className="text-sm text-gray-700">{especialidad}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-4">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Horarios Disponibles
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {HORARIOS.map(horario => (
                      <label key={horario} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={watchedValues.horarios_disponibles?.includes(horario) || false}
                          onChange={() => handleArrayChange('horarios_disponibles', horario)}
                          className="rounded border-gray-300 text-[#1A237E] focus:ring-[#1A237E]"
                        />
                        <span className="text-sm text-gray-700">{horario}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Descripción personal */}
            <div>
              <Label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-2" />
                Descripción Personal (Opcional)
              </Label>
              <textarea
                id="descripcion"
                rows={4}
                placeholder="Cuéntanos un poco sobre ti..."
                {...register('descripcion')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent resize-none"
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>
              )}
            </div>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                Volver
              </Button>
              
              <Button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 text-lg font-semibold ${selectedRoleData.bgColor} text-white hover:opacity-90`}
              >
                {loading ? 'Guardando...' : 'Completar Perfil'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </motion.div>
      )
    }
  }

  return (
    <>
      <Helmet>
        <title>Configurar Perfil - DentaMeet PacienteFácil</title>
        <meta name="description" content="Completa tu perfil en DentaMeet para comenzar a conectar con la comunidad dental." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-[#00C853] text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-[#00C853]' : 'bg-gray-300'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-[#00C853] text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2 max-w-xs mx-auto">
              <span className="text-sm text-gray-600">Seleccionar Rol</span>
              <span className="text-sm text-gray-600">Completar Datos</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileSetup
