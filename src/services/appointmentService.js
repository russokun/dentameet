import { supabase } from '@/lib/supabaseClient'

// Servicio para el sistema de citas
export class AppointmentService {
  static async createAppointment(appointmentData) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          status: 'pendiente',
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          paciente:person!appointments_paciente_id_fkey(*),
          estudiante:person!appointments_estudiante_id_fkey(*)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating appointment:', error)
      throw error
    }
  }

  static async getAppointments(userId, role = null) {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          paciente:person!appointments_paciente_id_fkey(*),
          estudiante:person!appointments_estudiante_id_fkey(*)
        `)

      // Filtrar según el rol del usuario
      if (role === 'paciente') {
        query = query.eq('paciente_id', userId)
      } else if (role === 'estudiante') {
        query = query.eq('estudiante_id', userId)
      } else {
        // Para dentameeter o admin, ver todas donde participe
        query = query.or(`paciente_id.eq.${userId},estudiante_id.eq.${userId}`)
      }

      const { data, error } = await query.order('fecha_hora', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching appointments:', error)
      throw error
    }
  }

  static async updateAppointmentStatus(appointmentId, status, userId) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .or(`paciente_id.eq.${userId},estudiante_id.eq.${userId}`)
        .select(`
          *,
          paciente:person!appointments_paciente_id_fkey(*),
          estudiante:person!appointments_estudiante_id_fkey(*)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating appointment status:', error)
      throw error
    }
  }

  static async cancelAppointment(appointmentId, userId, reason = null) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelada',
          notas_cancelacion: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .or(`paciente_id.eq.${userId},estudiante_id.eq.${userId}`)
        .select(`
          *,
          paciente:person!appointments_paciente_id_fkey(*),
          estudiante:person!appointments_estudiante_id_fkey(*)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error canceling appointment:', error)
      throw error
    }
  }

  static async getAvailableSlots(estudianteId, fecha) {
    try {
      // Obtener citas existentes para esa fecha
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('fecha_hora')
        .eq('estudiante_id', estudianteId)
        .gte('fecha_hora', `${fecha} 00:00:00`)
        .lt('fecha_hora', `${fecha} 23:59:59`)
        .neq('status', 'cancelada')

      if (error) throw error

      // Horarios disponibles (esto debería venir del perfil del estudiante)
      const allSlots = [
        '09:00', '10:00', '11:00', '12:00', 
        '14:00', '15:00', '16:00', '17:00', '18:00'
      ]

      const bookedTimes = existingAppointments.map(apt => {
        const time = new Date(apt.fecha_hora).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        })
        return time
      })

      return allSlots.filter(slot => !bookedTimes.includes(slot))
    } catch (error) {
      console.error('Error fetching available slots:', error)
      throw error
    }
  }
}
