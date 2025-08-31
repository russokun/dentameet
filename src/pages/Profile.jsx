import React from 'react'
import { Helmet } from 'react-helmet'
import { User, Edit, Shield, Calendar, GraduationCap, FileText } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TRATAMIENTOS, ESPECIALIDADES, HORARIOS } from '@/lib/zodSchemas'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/components/ui/use-toast'

const Profile = () => {
  const { profile, updateProfile, loading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: profile || {}
  })

  const watchedValues = watch()

  const handleArrayChange = (field, value) => {
    const currentValues = watchedValues[field] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value]
    setValue(field, newValues)
  }

  const onSubmit = async (data) => {
    try {
      await updateProfile(data)
      toast({
        title: 'Perfil actualizado',
        description: 'Tus cambios han sido guardados correctamente.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil. Intenta de nuevo.',
        variant: 'destructive'
      })
    }
  }

  if (!profile) {
    return <div className="text-center py-12">Cargando perfil...</div>
  }

  return (
    <>
      <Helmet>
        <title>Mi Perfil - DentaMeet</title>
        <meta name="description" content="Gestiona tu perfil en DentaMeet" />
      </Helmet>
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-[#1A237E] to-[#00C853] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Mi Perfil</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" {...register('nombre')} />
              </div>
              <div>
                <Label htmlFor="apellido">Apellido *</Label>
                <Input id="apellido" {...register('apellido')} />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input id="telefono" {...register('telefono')} />
              </div>
              <div>
                <Label htmlFor="edad">Edad</Label>
                <Input id="edad" type="number" {...register('edad', { valueAsNumber: true })} />
              </div>
            </div>
            {/* Tratamientos de interés */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-4">Tratamientos de Interés</Label>
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
            {/* Especialidades */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-4">Especialidades</Label>
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
            {/* Horarios disponibles */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-4">Horarios Disponibles</Label>
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
            {/* Descripción */}
            <div>
              <Label htmlFor="descripcion">Descripción Personal</Label>
              <textarea id="descripcion" rows={3} {...register('descripcion')} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent resize-none" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="btn-primary" disabled={loading}>Guardar Cambios</Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

export default Profile
