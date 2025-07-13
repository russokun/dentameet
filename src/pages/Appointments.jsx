import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { AppointmentService } from '@/services/appointmentService'
import { appointmentSchema } from '@/lib/zodSchemas'
import { generateWhatsAppURL, generateWhatsAppMessage, formatDate, formatTime } from '@/utils/matchUtils'
import { toast } from '@/components/ui/use-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const Appointments = () => {
  const { user, profile } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(appointmentSchema)
  })

  useEffect(() => {
    if (user && profile) {
      loadAppointments()
    }
  }, [user, profile])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const data = await AppointmentService.getAppointments(user.id, profile.role)
      setAppointments(data)
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAppointment = async (data) => {
    try {
      // Por ahora simulamos crear una cita - en producción necesitarías seleccionar el otro usuario
      const appointmentData = {
        paciente_id: profile.role === 'paciente' ? user.id : 'otro-usuario-id',
        estudiante_id: profile.role === 'estudiante' ? user.id : 'otro-usuario-id',
        fecha_hora: `${data.fecha} ${data.hora}:00`,
        tratamiento: data.tratamiento,
        notas: data.notas
      }

      await AppointmentService.createAppointment(appointmentData)
      
      toast({
        title: "Cita creada",
        description: "La cita ha sido programada exitosamente."
      })
      
      reset()
      setShowCreateForm(false)
      loadAppointments()
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast({
        title: "Error",
        description: "No se pudo crear la cita.",
        variant: "destructive"
      })
    }
  }

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await AppointmentService.updateAppointmentStatus(appointmentId, newStatus, user.id)
      
      toast({
        title: "Estado actualizado",
        description: `La cita ha sido ${newStatus}.`
      })
      
      loadAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la cita.",
        variant: "destructive"
      })
    }
  }

  const handleWhatsAppContact = (appointment) => {
    const otherUser = appointment.paciente_id === user.id ? appointment.estudiante : appointment.paciente
    const message = generateWhatsAppMessage(profile, otherUser, appointment)
    const whatsappUrl = generateWhatsAppURL(otherUser.telefono, message)
    window.open(whatsappUrl, '_blank')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmada':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'completada':
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'cancelada':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-800'
      case 'completada': return 'bg-blue-100 text-blue-800'
      case 'cancelada': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const groupAppointmentsByStatus = () => {
    const grouped = {
      proximas: appointments.filter(apt => 
        ['pendiente', 'confirmada'].includes(apt.status) && 
        new Date(apt.fecha_hora) >= new Date()
      ),
      pasadas: appointments.filter(apt => 
        apt.status === 'completada' || 
        (new Date(apt.fecha_hora) < new Date() && apt.status !== 'cancelada')
      ),
      canceladas: appointments.filter(apt => apt.status === 'cancelada')
    }
    return grouped
  }

  const groupedAppointments = groupAppointmentsByStatus()

  if (loading) {
    return <LoadingSpinner message="Cargando citas..." />
  }

  return (
    <>
      <Helmet>
        <title>Mis Citas - DentaMeet PacienteFácil</title>
        <meta name="description" content="Gestiona tus citas dentales en DentaMeet." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1A237E]">Mis Citas</h1>
            <p className="text-gray-600">Gestiona tus citas dentales programadas</p>
          </div>
          
          <Button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próximas</p>
                <p className="text-2xl font-bold text-green-600">{groupedAppointments.proximas.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-blue-600">{groupedAppointments.pasadas.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Canceladas</p>
                <p className="text-2xl font-bold text-red-600">{groupedAppointments.canceladas.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-[#1A237E]">{appointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#1A237E]" />
            </div>
          </div>
        </div>

        {/* Create Appointment Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-[#1A237E] mb-4">Programar Nueva Cita</h2>
            
            <form onSubmit={handleSubmit(handleCreateAppointment)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('fecha')}
                    className={errors.fecha ? 'border-red-500' : ''}
                  />
                  {errors.fecha && (
                    <p className="text-red-500 text-sm mt-1">{errors.fecha.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="hora">Hora *</Label>
                  <select
                    id="hora"
                    {...register('hora')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent ${
                      errors.hora ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona una hora</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                  </select>
                  {errors.hora && (
                    <p className="text-red-500 text-sm mt-1">{errors.hora.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="tratamiento">Tratamiento *</Label>
                <Input
                  id="tratamiento"
                  placeholder="Ej: Limpieza dental, Empaste, etc."
                  {...register('tratamiento')}
                  className={errors.tratamiento ? 'border-red-500' : ''}
                />
                {errors.tratamiento && (
                  <p className="text-red-500 text-sm mt-1">{errors.tratamiento.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="notas">Notas adicionales</Label>
                <textarea
                  id="notas"
                  rows={3}
                  placeholder="Información adicional sobre la cita..."
                  {...register('notas')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    reset()
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  Programar Cita
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Appointments Sections */}
        {appointments.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              No tienes citas programadas
            </h3>
            <p className="text-gray-500 mb-6">
              Programa tu primera cita para comenzar tu tratamiento.
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Programar Primera Cita
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Próximas Citas */}
            {groupedAppointments.proximas.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#1A237E] mb-4">Próximas Citas</h2>
                <div className="grid gap-4">
                  {groupedAppointments.proximas.map((appointment) => {
                    const otherUser = appointment.paciente_id === user.id ? appointment.estudiante : appointment.paciente
                    
                    return (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-lg shadow-md p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getStatusIcon(appointment.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-[#1A237E] mb-1">
                              {appointment.tratamiento}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  {formatDate(appointment.fecha_hora)}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  {formatTime(appointment.fecha_hora)}
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <User className="w-4 h-4 mr-2" />
                                  {otherUser.nombre} {otherUser.apellido}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  {otherUser.comuna}
                                </div>
                              </div>
                            </div>
                            
                            {appointment.notas && (
                              <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                                {appointment.notas}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              onClick={() => handleWhatsAppContact(appointment)}
                              className="btn-secondary text-sm"
                              size="sm"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              WhatsApp
                            </Button>
                            
                            {appointment.status === 'pendiente' && (
                              <Button
                                onClick={() => handleUpdateStatus(appointment.id, 'confirmada')}
                                variant="outline"
                                size="sm"
                              >
                                Confirmar
                              </Button>
                            )}
                            
                            {appointment.status === 'confirmada' && (
                              <Button
                                onClick={() => handleUpdateStatus(appointment.id, 'completada')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                              >
                                Completar
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Citas Pasadas */}
            {groupedAppointments.pasadas.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#1A237E] mb-4">Historial de Citas</h2>
                <div className="grid gap-4">
                  {groupedAppointments.pasadas.slice(0, 5).map((appointment) => {
                    const otherUser = appointment.paciente_id === user.id ? appointment.estudiante : appointment.paciente
                    
                    return (
                      <div key={appointment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800">{appointment.tratamiento}</h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(appointment.fecha_hora)} • {otherUser.nombre} {otherUser.apellido}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            Completada
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Appointments
