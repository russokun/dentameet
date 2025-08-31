import { supabase } from '@/lib/supabaseClient'

// Servicio para el sistema de citas
export class AppointmentService {
  static async createAppointment(appointmentData) {
    try {
      // Obtener usuario autenticado y token
      const { data: { session } } = await supabase.auth.getSession();
      const authUser = session?.user;
      console.log('🔍 [AppointmentService] Usuario autenticado:', authUser);
      console.log('🔍 [AppointmentService] JWT:', session?.access_token);
      console.log('🔍 [AppointmentService] Datos enviados a appointments:', {
        ...appointmentData,
        status: 'pendiente',
        created_at: new Date().toISOString()
      });
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          status: 'pendiente',
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          user1:person!appointments_user1_id_fkey(*),
          user2:person!appointments_user2_id_fkey(*)
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
          user1:person!appointments_user1_id_fkey(*),
          user2:person!appointments_user2_id_fkey(*)
        `)

      // Filtrar según el usuario
      if (role === 'user1') {
        query = query.eq('user1_id', userId)
      } else if (role === 'user2') {
        query = query.eq('user2_id', userId)
      } else {
        // Para cualquier rol, ver todas donde participe
        query = query.or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
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
      // Determinar si el usuario es user1 o user2
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('user1_id, user2_id, confirmado_por_user1, confirmado_por_user2')
        .eq('id', appointmentId)
        .single();

      if (fetchError) throw fetchError;
      let updateFields = { updated_at: new Date().toISOString() };

      if (status) updateFields.status = status;
      if (appointment.user1_id === userId) {
        updateFields.confirmado_por_user1 = true;
      } else if (appointment.user2_id === userId) {
        updateFields.confirmado_por_user2 = true;
      }

      const { data, error } = await supabase
        .from('appointments')
        .update(updateFields)
        .eq('id', appointmentId)
        .select(`*, user1:person!appointments_user1_id_fkey(*), user2:person!appointments_user2_id_fkey(*)`)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
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
  .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .select(`
          *,
          user1:person!appointments_user1_id_fkey(*),
          user2:person!appointments_user2_id_fkey(*)
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
  .eq('user2_id', estudianteId)
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
