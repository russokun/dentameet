import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Star, 
  MessageSquare, 
  User, 
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Send,
  Filter,
  TrendingUp,
  Award
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { FeedbackService } from '@/services/feedbackService'
import { AppointmentService } from '@/services/appointmentService'
import { feedbackSchema } from '@/lib/zodSchemas'
import { formatDate } from '@/utils/matchUtils'
import { toast } from '@/components/ui/use-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const Feedback = () => {
  const { user, profile } = useAuth()
  const [feedbacks, setFeedbacks] = useState([])
  const [completedAppointments, setCompletedAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [filter, setFilter] = useState('all')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(feedbackSchema)
  })

  const rating = watch('rating')

  useEffect(() => {
    if (user && profile) {
      loadData()
    }
  }, [user, profile])

  const loadData = async () => {
    try {
      setLoading(true)
      const [feedbackData, appointmentsData] = await Promise.all([
        FeedbackService.getFeedbacks(user.id, profile.role),
        AppointmentService.getCompletedAppointments(user.id, profile.role)
      ])
      
      setFeedbacks(feedbackData)
      
      // Filter appointments that don't have feedback yet
      const appointmentsWithoutFeedback = appointmentsData.filter(apt => 
        !feedbackData.some(fb => fb.cita_id === apt.id)
      )
      setCompletedAppointments(appointmentsWithoutFeedback)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async (data) => {
    try {
      const feedbackData = {
        cita_id: selectedAppointment.id,
        calificador_id: user.id,
        calificado_id: selectedAppointment.paciente_id === user.id 
          ? selectedAppointment.estudiante_id 
          : selectedAppointment.paciente_id,
        rating: parseInt(data.rating),
        comentario: data.comentario,
        tipo_calificador: profile.role
      }

      await FeedbackService.createFeedback(feedbackData)
      
      toast({
        title: "Feedback enviado",
        description: "Tu calificación ha sido registrada exitosamente."
      })
      
      reset()
      setShowFeedbackForm(false)
      setSelectedAppointment(null)
      loadData()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: "Error",
        description: "No se pudo enviar el feedback.",
        variant: "destructive"
      })
    }
  }

  const StarRating = ({ value, onChange, readonly = false }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange?.(star)}
            className={`${
              star <= value 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${readonly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-300'} transition-colors`}
            disabled={readonly}
          >
            <Star className="w-6 h-6" />
          </button>
        ))}
      </div>
    )
  }

  const getFilteredFeedbacks = () => {
    switch (filter) {
      case 'received':
        return feedbacks.filter(fb => fb.calificado_id === user.id)
      case 'given':
        return feedbacks.filter(fb => fb.calificador_id === user.id)
      default:
        return feedbacks
    }
  }

  const getAverageRating = () => {
    const receivedFeedbacks = feedbacks.filter(fb => fb.calificado_id === user.id)
    if (receivedFeedbacks.length === 0) return 0
    
    const sum = receivedFeedbacks.reduce((acc, fb) => acc + fb.rating, 0)
    return (sum / receivedFeedbacks.length).toFixed(1)
  }

  const getTotalFeedbacks = () => {
    return feedbacks.filter(fb => fb.calificado_id === user.id).length
  }

  const getPositiveFeedbacks = () => {
    const receivedFeedbacks = feedbacks.filter(fb => fb.calificado_id === user.id)
    return receivedFeedbacks.filter(fb => fb.rating >= 4).length
  }

  if (loading) {
    return <LoadingSpinner message="Cargando feedback..." />
  }

  return (
    <>
      <Helmet>
        <title>Feedback - DentaMeet PacienteFácil</title>
        <meta name="description" content="Gestiona y visualiza el feedback de tus citas dentales." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1A237E]">Feedback</h1>
            <p className="text-gray-600">Calificaciones y comentarios de tus citas</p>
          </div>
          
          {completedAppointments.length > 0 && (
            <Button
              onClick={() => setShowFeedbackForm(true)}
              className="btn-primary"
            >
              <Star className="w-4 h-4 mr-2" />
              Calificar Cita
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
                <p className="text-2xl font-bold text-yellow-600">{getAverageRating()}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recibidas</p>
                <p className="text-2xl font-bold text-blue-600">{getTotalFeedbacks()}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Positivas</p>
                <p className="text-2xl font-bold text-green-600">{getPositiveFeedbacks()}</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dadas</p>
                <p className="text-2xl font-bold text-[#1A237E]">
                  {feedbacks.filter(fb => fb.calificador_id === user.id).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#1A237E]" />
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        {showFeedbackForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-[#1A237E] mb-4">Calificar Cita</h2>
            
            {!selectedAppointment ? (
              <div className="space-y-4">
                <p className="text-gray-600">Selecciona una cita para calificar:</p>
                <div className="grid gap-3">
                  {completedAppointments.map((appointment) => {
                    const otherUser = appointment.paciente_id === user.id 
                      ? appointment.estudiante 
                      : appointment.paciente
                    
                    return (
                      <div
                        key={appointment.id}
                        onClick={() => setSelectedAppointment(appointment)}
                        className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{appointment.tratamiento}</h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(appointment.fecha_hora)} • {otherUser.nombre} {otherUser.apellido}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Seleccionar
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFeedbackForm(false)}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleSubmitFeedback)} className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold">{selectedAppointment.tratamiento}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedAppointment.fecha_hora)} • {
                      selectedAppointment.paciente_id === user.id 
                        ? selectedAppointment.estudiante.nombre + ' ' + selectedAppointment.estudiante.apellido
                        : selectedAppointment.paciente.nombre + ' ' + selectedAppointment.paciente.apellido
                    }
                  </p>
                </div>
                
                <div>
                  <Label>Calificación *</Label>
                  <div className="mt-2">
                    <StarRating 
                      value={rating || 0} 
                      onChange={(value) => setValue('rating', value)}
                    />
                  </div>
                  {errors.rating && (
                    <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="comentario">Comentario</Label>
                  <textarea
                    id="comentario"
                    rows={4}
                    placeholder="Comparte tu experiencia..."
                    {...register('comentario')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent resize-none"
                  />
                  {errors.comentario && (
                    <p className="text-red-500 text-sm mt-1">{errors.comentario.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowFeedbackForm(false)
                      setSelectedAppointment(null)
                      reset()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="btn-primary">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Feedback
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* Filter Buttons */}
        <div className="flex space-x-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Todos
          </Button>
          <Button
            variant={filter === 'received' ? 'default' : 'outline'}
            onClick={() => setFilter('received')}
            size="sm"
          >
            Recibidos
          </Button>
          <Button
            variant={filter === 'given' ? 'default' : 'outline'}
            onClick={() => setFilter('given')}
            size="sm"
          >
            Enviados
          </Button>
        </div>

        {/* Feedbacks List */}
        {getFilteredFeedbacks().length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              {filter === 'all' 
                ? 'No hay feedback disponible' 
                : filter === 'received'
                ? 'No has recibido feedback aún'
                : 'No has enviado feedback aún'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'received' 
                ? 'Completa más citas para recibir calificaciones.'
                : 'Califica tus citas completadas para ayudar a otros usuarios.'
              }
            </p>
            {completedAppointments.length > 0 && filter !== 'received' && (
              <Button onClick={() => setShowFeedbackForm(true)} className="btn-primary">
                <Star className="w-4 h-4 mr-2" />
                Calificar Cita
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredFeedbacks().map((feedback) => {
              const isReceived = feedback.calificado_id === user.id
              const otherUser = isReceived ? feedback.calificador : feedback.calificado
              
              return (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-[#1A237E] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1A237E]">
                            {otherUser.nombre} {otherUser.apellido}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {isReceived ? 'Te calificó' : 'Calificaste a'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <StarRating value={feedback.rating} readonly />
                        <span className="text-sm text-gray-500">
                          {formatDate(feedback.created_at)}
                        </span>
                      </div>
                      
                      {feedback.comentario && (
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          "{feedback.comentario}"
                        </p>
                      )}
                      
                      {feedback.cita && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center text-sm text-blue-700">
                            <Calendar className="w-4 h-4 mr-2" />
                            Cita: {feedback.cita.tratamiento} • {formatDate(feedback.cita.fecha_hora)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {feedback.rating >= 4 ? (
                        <div className="flex items-center text-green-600">
                          <ThumbsUp className="w-5 h-5" />
                        </div>
                      ) : feedback.rating <= 2 ? (
                        <div className="flex items-center text-red-600">
                          <ThumbsDown className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="flex items-center text-yellow-600">
                          <Star className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default Feedback
