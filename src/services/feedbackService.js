import { supabase } from '@/lib/supabaseClient'

// Servicio para el sistema de feedback
export class FeedbackService {
  static async createFeedback(feedbackData) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          ...feedbackData,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          evaluador:person!feedback_evaluador_id_fkey(*),
          evaluado:person!feedback_evaluado_id_fkey(*),
          appointment:appointments(*)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating feedback:', error)
      throw error
    }
  }

  static async getFeedback(userId, type = 'received') {
    try {
      let query = supabase
        .from('feedback')
        .select(`
          *,
          evaluador:person!feedback_evaluador_id_fkey(*),
          evaluado:person!feedback_evaluado_id_fkey(*),
          appointment:appointments(*)
        `)

      if (type === 'received') {
        query = query.eq('evaluado_id', userId)
      } else {
        query = query.eq('evaluador_id', userId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching feedback:', error)
      throw error
    }
  }

  static async getFeedbackStats(userId) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('rating, recomendaria')
        .eq('evaluado_id', userId)

      if (error) throw error

      if (!data || data.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          recommendationRate: 0
        }
      }

      const totalReviews = data.length
      const averageRating = data.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      const recommendations = data.filter(review => review.recomendaria).length
      const recommendationRate = (recommendations / totalReviews) * 100

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        recommendationRate: Math.round(recommendationRate)
      }
    } catch (error) {
      console.error('Error fetching feedback stats:', error)
      throw error
    }
  }

  static async canLeaveFeedback(evaluadorId, evaluadoId, appointmentId) {
    try {
      // Verificar que la cita existe y está completada
      const { data: appointment, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .eq('status', 'completada')
        .or(`paciente_id.eq.${evaluadorId},estudiante_id.eq.${evaluadorId}`)
        .single()

      if (aptError || !appointment) return false

      // Verificar que no se ha dejado feedback previamente
      const { data: existingFeedback, error: fbError } = await supabase
        .from('feedback')
        .select('id')
        .eq('evaluador_id', evaluadorId)
        .eq('evaluado_id', evaluadoId)
        .eq('appointment_id', appointmentId)
        .single()

      if (fbError && fbError.code !== 'PGRST116') throw fbError

      return !existingFeedback
    } catch (error) {
      console.error('Error checking feedback eligibility:', error)
      return false
    }
  }
}
