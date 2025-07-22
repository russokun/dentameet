import { supabase } from '@/lib/supabaseClient'

// Servicio premium para el sistema de matches
export class MatchService {
  // Obtener perfiles compatibles con sistema de scoring avanzado
  static async getPotentialMatches(userId, userRole, limit = 10) {
    try {
      // Obtener IDs de usuarios ya interactuados
      const { data: interactions } = await supabase
        .from('matches')
        .select('target_user_id')
        .eq('user_id', userId)

      const excludedIds = interactions?.map(i => i.target_user_id) || []
      excludedIds.push(userId) // Excluir al usuario actual

      // Determinar roles compatibles
      let targetRoles = []
      if (userRole === 'paciente') {
        targetRoles = ['estudiante', 'dentameeter']
      } else if (userRole === 'estudiante') {
        targetRoles = ['paciente', 'dentameeter']
      } else if (userRole === 'dentameeter') {
        targetRoles = ['paciente', 'estudiante']
      }

      // Query mejorado con exclusiones
      let query = supabase
        .from('person')
        .select(`
          id,
          nombre,
          apellido,
          role,
          edad,
          region,
          comuna,
          universidad,
          etapa_formacion,
          especialidades,
          tratamientos_interes,
          descripcion
        `)
        .in('role', targetRoles)
        .limit(limit)

      // Excluir usuarios ya interactuados
      if (excludedIds.length > 0) {
        query = query.not('id', 'in', `(${excludedIds.join(',')})`)
      }

      // Excluir el usuario actual y usuarios ya matcheados
      query = query
        .neq('id', userId)
        .not('id', 'in', `(
          SELECT CASE 
            WHEN user1_id = '${userId}' THEN user2_id 
            ELSE user1_id 
          END 
          FROM matches 
          WHERE user1_id = '${userId}' OR user2_id = '${userId}'
        )`)

      const { data, error } = await query.limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching potential matches:', error)
      throw error
    }
  }

  static async createMatch(user1Id, user2Id, isLike = true) {
    try {
      // Verificar si ya existe un swipe previo del otro usuario
      const { data: existingMatch, error: checkError } = await supabase
        .from('matches')
        .select('*')
        .eq('user1_id', user2Id)
        .eq('user2_id', user1Id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') throw checkError

      // Crear el nuevo swipe
      const { data: newSwipe, error: swipeError } = await supabase
        .from('matches')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
          user1_liked: isLike,
          is_mutual: existingMatch && existingMatch.user1_liked && isLike,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (swipeError) throw swipeError

      // Si existe match previo y ambos se gustaron, actualizar como mutual
      if (existingMatch && existingMatch.user1_liked && isLike) {
        await supabase
          .from('matches')
          .update({ is_mutual: true })
          .eq('id', existingMatch.id)
      }

      return {
        match: newSwipe,
        isMutual: existingMatch && existingMatch.user1_liked && isLike
      }
    } catch (error) {
      console.error('Error creating match:', error)
      throw error
    }
  }

  static async getMatches(userId) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          user1:person!matches_user1_id_fkey(*),
          user2:person!matches_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_mutual', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching matches:', error)
      throw error
    }
  }

  static async unmatch(userId, matchId) {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing match:', error)
      throw error
    }
  }
}
