import { supabase } from '@/lib/supabaseClient'

// Servicio para perfiles de usuario
export class ProfileService {
  static async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('person')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Cambiar a maybeSingle() para manejar cuando no existe perfil

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  static async updateProfile(userId, profileData) {
    try {
      // Primero verificar si el perfil ya existe
      const { data: existingProfile } = await supabase
        .from('person')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      let data, error

      if (existingProfile) {
        // Si existe, actualizar
        const result = await supabase
          .from('person')
          .update(profileData)
          .eq('id', userId)
          .select()
          .single()
        data = result.data
        error = result.error
      } else {
        // Si no existe, insertar
        const result = await supabase
          .from('person')
          .insert({
            id: userId,
            ...profileData
          })
          .select()
          .single()
        data = result.data
        error = result.error
      }

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  static async createProfile(userId, email, profileData) {
    try {
      const { data, error } = await supabase
        .from('person')
        .insert({
          id: userId,
          email,
          ...profileData,
          // No incluir created_at ya que Supabase lo maneja automáticamente
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating profile:', error)
      throw error
    }
  }

  static async deleteProfile(userId) {
    try {
      const { error } = await supabase
        .from('person')
        .delete()
        .eq('id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting profile:', error)
      throw error
    }
  }

  static async getProfilesForMatching(userRole, userId, userRegion = null) {
    try {
      let query = supabase
        .from('person')
        .select('*')
        .eq('onboarding_completed', true)
        .neq('id', userId)

      // Lógica de matching según rol
      if (userRole === 'paciente') {
        // Pacientes ven estudiantes y dentameeter
        query = query.in('role', ['estudiante', 'dentameeter'])
      } else if (userRole === 'estudiante') {
        // Estudiantes ven pacientes y dentameeter
        query = query.in('role', ['paciente', 'dentameeter'])
      } else if (userRole === 'dentameeter') {
        // Dentameeter ve todos (pacientes y estudiantes)
        query = query.in('role', ['paciente', 'estudiante'])
      }

      // Filtrar por región si se proporciona
      if (userRegion) {
        query = query.eq('region', userRegion)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting profiles for matching:', error)
      throw error
    }
  }
}
