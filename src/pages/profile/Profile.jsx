import React from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  GraduationCap,
  FileText,
  Save,
  Camera
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { 
  patientProfileSchema, 
  studentProfileSchema, 
  dentameeterProfileSchema,
  REGIONES_COMUNAS,
  getComunasByRegion,
  UNIVERSIDADES,
  ETAPAS_FORMACION,
  TRATAMIENTOS,
  ESPECIALIDADES,
  HORARIOS
} from '@/lib/zodSchemas'
import { RegionComunaSelector } from '@/components/ui/RegionComunaSelector'

const Profile = () => {
  const { profile, updateProfile, loading } = useAuth()

  const getSchemaByRole = (role) => {
    switch (role) {
      case 'paciente': return patientProfileSchema
      case 'estudiante': return studentProfileSchema
      case 'dentameeter': return dentameeterProfileSchema
      default: return patientProfileSchema
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(getSchemaByRole(profile?.role)),
    defaultValues: {
      nombre: profile?.nombre || '',
      apellido: profile?.apellido || '',
      telefono: profile?.telefono || '',
      region: profile?.region || '',
      comuna: profile?.comuna || '',
      edad: profile?.edad || '',
      universidad: profile?.universidad || '',
      etapa_formacion: profile?.etapa_formacion || '',
      descripcion: profile?.descripcion || '',
      tratamientos_interes: profile?.tratamientos_interes || [],
      especialidades: profile?.especialidades || [],
      horarios_disponibles: profile?.horarios_disponibles || []
    }
  })

  const watchedValues = watch()

  const onSubmit = async (data) => {
    try {
      await updateProfile(data)
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios han sido guardados correctamente."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Intenta de nuevo.",
        variant: "destructive"
      })
    }
  }

  const handleArrayChange = (field, value) => {
    const currentValues = watchedValues[field] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value]
    setValue(field, newValues)
  }

  const getRoleIcon = () => {
    switch (profile?.role) {
      case 'paciente': return <User className="w-6 h-6 text-[#00C853]" />
      case 'estudiante': return <GraduationCap className="w-6 h-6 text-[#1A237E]" />
      case 'dentameeter': return <User className="w-6 h-6 text-purple-600" />
      default: return <User className="w-6 h-6 text-gray-600" />
    }
  }

  const getRoleColor = () => {
    switch (profile?.role) {
      case 'paciente': return 'from-[#00C853] to-green-600'
      case 'estudiante': return 'from-[#1A237E] to-blue-600'
      case 'dentameeter': return 'from-purple-600 to-purple-700'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  if (typeof profile === 'undefined') {
    return <div>Cargando perfil...</div>
  }

  if (profile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Perfil no encontrado</h2>
          <p className="text-gray-500 mt-2">Parece que aún no has completado tu perfil.</p>
        </div>
      </div>
    )
  }

  // HABILITAR FORMULARIO DE EDICIÓN
  return (
    <>
      <Helmet>
        <title>Mi Perfil - DentaMeet PacienteFácil</title>
        <meta name="description" content="Edita y actualiza tu perfil en DentaMeet." />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header del perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${getRoleColor()} rounded-2xl p-8 text-white`}
        >
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-white/80" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.nombre} {profile.apellido}</h1>
              <div className="flex items-center space-x-2 mt-2">
                {getRoleIcon()}
                <span className="text-lg capitalize">{profile.role}</span>
              </div>
              {profile.universidad && (
                <p className="text-white/80 mt-1">{profile.universidad}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Formulario de edición */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-[#1A237E] mb-6">
            Editar Información Personal
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <RegionComunaSelector
                  regionValue={watch('region')}
                  comunaValue={watch('comuna')}
                  onRegionChange={(region) => setValue('region', region)}
                  onComunaChange={(comuna) => setValue('comuna', comuna)}
                  regionError={errors.region?.message}
                  comunaError={errors.comuna?.message}
                />
              </div>
            </div>

            {/* Campos específicos por rol */}
            {(profile.role === 'paciente' || profile.role === 'dentameeter') && (
              <div>
                <Label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Edad
                </Label>
                <Input
                  id="edad"
                  type="number"
                  {...register('edad', { valueAsNumber: true })}
                  className={errors.edad ? 'border-red-500' : ''}
                />
                {errors.edad && (
                  <p className="text-red-500 text-sm mt-1">{errors.edad.message}</p>
                )}
              </div>
            )}

            {(profile.role === 'estudiante' || profile.role === 'dentameeter') && (
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
            )}

            {/* Tratamientos de interés */}
            {(profile.role === 'paciente' || profile.role === 'dentameeter') && (
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
            )}

            {/* Especialidades */}
            {(profile.role === 'estudiante' || profile.role === 'dentameeter') && (
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
            )}

            {/* Horarios disponibles */}
            {(profile.role === 'estudiante' || profile.role === 'dentameeter') && (
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-4">
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
            )}

            {/* Descripción */}
            <div>
              <Label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-2" />
                Descripción Personal
              </Label>
              <textarea
                id="descripcion"
                rows={4}
                {...register('descripcion')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent resize-none"
                placeholder="Cuéntanos un poco sobre ti..."
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>
              )}
            </div>

            {/* Botón de guardado */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#1A237E] to-[#00C853] text-white px-8 py-3 text-lg font-semibold"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
                <Save className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  )
}

export default Profile
