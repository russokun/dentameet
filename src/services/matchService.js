import { supabase } from '@/lib/supabaseClient'

// Servicio premium para el sistema de matches
export class MatchService {
  // Obtener perfiles compatibles con sistema de scoring avanzado
  static async getPotentialMatches(userId, userRole, limit = 10) {
    try {
      // Obtener todos los matches existentes donde el usuario participa
      const { data: existingMatches } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

      // Crear lista de IDs excluidos
      const excludedIds = new Set([userId])
      if (existingMatches) {
        existingMatches.forEach(match => {
          if (match.user1_id === userId) {
            excludedIds.add(match.user2_id)
          } else {
            excludedIds.add(match.user1_id)
          }
        })
      }

      // Determinar roles compatibles - TODOS los roles pueden ver a TODOS
      let targetRoles = []
      if (userRole === 'paciente') {
        targetRoles = ['estudiante', 'dentameeter']
      } else if (userRole === 'estudiante') {
        targetRoles = ['paciente', 'dentameeter']
      } else if (userRole === 'dentameeter') {
        targetRoles = ['paciente', 'estudiante']
      }

      console.log(`Usuario ${userRole} puede ver roles:`, targetRoles)

      // Query simplificado y más robusto
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
          descripcion,
          telefono
        `)
        .in('role', targetRoles)
        .limit(limit)

      // Excluir usuarios ya interactuados
      if (excludedIds.size > 0) {
        const excludedArray = Array.from(excludedIds)
        console.log('Excluyendo IDs:', excludedArray)
        query = query.not('id', 'in', `(${excludedArray.map(id => `'${id}'`).join(',')})`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error en consulta:', error)
        throw error
      }

      console.log(`Encontrados ${data?.length || 0} perfiles compatibles para ${userRole}`)
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
          user2_liked: false, // Se actualizará si hay reciprocidad
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
          .update({ is_mutual: true, user2_liked: true })
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

  // Método para registrar acciones (like/pass) - compatible con Matches.jsx
  static async recordAction(userId, targetUserId, action) {
    try {
      const isLike = action === 'liked'
      const result = await this.createMatch(userId, targetUserId, isLike)
      
      return {
        isMatch: result.isMutual,
        match: result.match
      }
    } catch (error) {
      console.error('Error recording action:', error)
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
