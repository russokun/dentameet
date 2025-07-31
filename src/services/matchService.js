import { supabase } from '@/lib/supabaseClient'

// Servicio premium para el sistema de matches
export class MatchService {
  // Obtener perfiles compatibles con sistema de scoring avanzado
  static async getPotentialMatches(userId, userRole, limit = 10) {
    try {
      // Obtener el perfil del usuario actual para filtros geográficos
      const { data: currentUser } = await supabase
        .from('person')
        .select('region, comuna')
        .eq('id', userId)
        .single()

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
      console.log('Usuario actual ubicación:', currentUser)

      // Debug: vamos a ver qué perfiles hay en total ANTES de filtros
      console.log('=== DEBUG MATCHES ===')
      const { data: allProfilesDebug } = await supabase
        .from('person')
        .select('id, nombre, apellido, role, region, comuna, especialidades, tratamientos_interes')
        
      console.log('TODOS los perfiles en la BD:')
      allProfilesDebug?.forEach(profile => {
        console.log(`- ${profile.nombre} ${profile.apellido} (${profile.role}) - Comuna: "${profile.comuna}", Región: "${profile.region}"`)
        console.log(`  Especialidades: ${profile.especialidades || 'Sin especialidades'}`)
        console.log(`  Tratamientos de interés: ${profile.tratamientos_interes || 'Sin tratamientos'}`)
      })
      
      console.log(`Usuario actual: ${currentUser?.region} / ${currentUser?.comuna}`)
      console.log(`Buscando roles: ${targetRoles.join(', ')}`)
      console.log(`IDs excluidos: ${Array.from(excludedIds).join(', ')}`)

      // Obtener el perfil completo del usuario actual para matching inteligente
      const { data: currentUserProfile } = await supabase
        .from('person')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('Perfil usuario actual completo:', currentUserProfile)

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

      // PRIMERO: intentar con comuna exacta (case-insensitive)
      let queryWithLocation = query
      if (currentUser?.comuna) {
        console.log(`Intentando filtrar por comuna (ilike): "${currentUser.comuna}"`)
        queryWithLocation = query.ilike('comuna', currentUser.comuna)
      }

      // Excluir usuarios ya interactuados
      if (excludedIds.size > 0) {
        const excludedArray = Array.from(excludedIds)
        console.log('Excluyendo IDs:', excludedArray)
        
        // Usar múltiples .neq() para cada ID excluido
        excludedArray.forEach(id => {
          queryWithLocation = queryWithLocation.neq('id', id)
        })
      }

      let { data, error } = await queryWithLocation

      // Si no encuentra resultados en la misma comuna, intentar con toda la región
      if ((!data || data.length === 0) && currentUser?.region) {
        console.log(`Sin resultados en comuna "${currentUser.comuna}", intentando región "${currentUser.region}"`)
        
        let regionQuery = supabase
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
          .ilike('region', currentUser.region)
          .limit(limit)

        // Excluir usuarios ya interactuados
        if (excludedIds.size > 0) {
          const excludedArray = Array.from(excludedIds)
          excludedArray.forEach(id => {
            regionQuery = regionQuery.neq('id', id)
          })
        }

        const regionResult = await regionQuery
        data = regionResult.data
        error = regionResult.error
        console.log(`Resultados con filtro de región: ${data?.length || 0}`)
      }

      // Si AÚN no hay resultados, buscar SIN restricciones geográficas
      if ((!data || data.length === 0)) {
        console.log('Sin resultados con filtros geográficos, buscando SIN restricciones de ubicación')
        
        let generalQuery = supabase
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
          excludedArray.forEach(id => {
            generalQuery = generalQuery.neq('id', id)
          })
        }

        const generalResult = await generalQuery
        data = generalResult.data
        error = generalResult.error
        console.log(`Resultados SIN filtros geográficos: ${data?.length || 0}`)
      }

      if (error) {
        console.error('Error en consulta:', error)
        throw error
      }

      console.log(`Encontrados ${data?.length || 0} perfiles compatibles para ${userRole}`)
      
      // Log detallado de los perfiles encontrados
      if (data && data.length > 0) {
        console.log('Perfiles encontrados ANTES del scoring:')
        data.forEach(profile => {
          console.log(`- ${profile.nombre} ${profile.apellido} (${profile.role}) - ${profile.comuna}, ${profile.region}`)
          console.log(`  Especialidades: ${profile.especialidades || 'Sin especialidades'}`)
          console.log(`  Tratamientos: ${profile.tratamientos_interes || 'Sin tratamientos'}`)
        })

        // Aplicar scoring inteligente para priorizar matches compatibles
        const scoredProfiles = data.map(profile => {
          const score = this.calculateCompatibilityScore(currentUserProfile, profile)
          return { ...profile, compatibilityScore: score }
        })

        // Ordenar por score (mayor a menor) y mantener solo los mejores
        const sortedProfiles = scoredProfiles
          .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
          .slice(0, limit)

        console.log('Perfiles DESPUÉS del scoring:')
        sortedProfiles.forEach(profile => {
          console.log(`- ${profile.nombre} ${profile.apellido} (${profile.role}) - Score: ${profile.compatibilityScore}`)
          console.log(`  Razón del score: ${this.getScoreExplanation(currentUserProfile, profile)}`)
        })

        return sortedProfiles
      } else {
        console.log('No se encontraron perfiles compatibles')
        
        // Debug: vamos a ver qué perfiles hay en total
        const { data: allProfiles } = await supabase
          .from('person')
          .select('id, nombre, apellido, role, region, comuna')
          .in('role', targetRoles)
          
        console.log('Todos los perfiles de roles compatibles en la BD:')
        allProfiles?.forEach(profile => {
          const isExcluded = excludedIds.has(profile.id)
          console.log(`- ${profile.nombre} ${profile.apellido} (${profile.role}) - ${profile.comuna}, ${profile.region} ${isExcluded ? '[EXCLUIDO]' : '[DISPONIBLE]'}`)
        })
      }
      
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

  // Función para calcular score de compatibilidad entre dos perfiles
  static calculateCompatibilityScore(user1, user2) {
    let score = 0

    // Base score por ubicación
    if (user1.comuna === user2.comuna) {
      score += 50 // Misma comuna = alta prioridad
    } else if (user1.region === user2.region) {
      score += 25 // Misma región = media prioridad
    }

    // Score por compatibilidad de especialidades/tratamientos
    if (user1.role === 'paciente' && (user2.role === 'estudiante' || user2.role === 'dentameeter')) {
      score += this.calculateTreatmentMatch(user1.tratamientos_interes, user2.especialidades)
    } else if ((user1.role === 'estudiante' || user1.role === 'dentameeter') && user2.role === 'paciente') {
      score += this.calculateTreatmentMatch(user2.tratamientos_interes, user1.especialidades)
    } else if (user1.role === 'dentameeter' && user2.role === 'estudiante') {
      // DentaMeeter como paciente con estudiante
      score += this.calculateTreatmentMatch(user1.tratamientos_interes, user2.especialidades)
    } else if (user1.role === 'estudiante' && user2.role === 'dentameeter') {
      // Estudiante con DentaMeeter como paciente
      score += this.calculateTreatmentMatch(user2.tratamientos_interes, user1.especialidades)
    }

    // Score por completeness del perfil
    if (user2.telefono) score += 5
    if (user2.descripcion) score += 5
    if (user2.universidad) score += 5

    return score
  }

  // Función auxiliar para calcular match de tratamientos/especialidades
  static calculateTreatmentMatch(tratamientos, especialidades) {
    if (!tratamientos || !especialidades) return 0

    const tratamientosArray = Array.isArray(tratamientos) ? tratamientos : 
                             typeof tratamientos === 'string' ? tratamientos.split(',').map(t => t.trim().toLowerCase()) : []
    const especialidadesArray = Array.isArray(especialidades) ? especialidades : 
                               typeof especialidades === 'string' ? especialidades.split(',').map(e => e.trim().toLowerCase()) : []

    let matchCount = 0
    tratamientosArray.forEach(tratamiento => {
      if (especialidadesArray.some(esp => esp.includes(tratamiento) || tratamiento.includes(esp))) {
        matchCount++
      }
    })

    return matchCount * 30 // 30 puntos por cada match de tratamiento
  }

  // Función para explicar el score (para debug)
  static getScoreExplanation(user1, user2) {
    let explanation = []

    // Ubicación
    if (user1.comuna === user2.comuna) {
      explanation.push('Misma comuna (+50)')
    } else if (user1.region === user2.region) {
      explanation.push('Misma región (+25)')
    }

    // Tratamientos/especialidades
    if (user1.role === 'paciente' && (user2.role === 'estudiante' || user2.role === 'dentameeter')) {
      const matchScore = this.calculateTreatmentMatch(user1.tratamientos_interes, user2.especialidades)
      if (matchScore > 0) {
        explanation.push(`Match tratamiento/especialidad (+${matchScore})`)
      }
    }

    return explanation.join(', ') || 'Score base'
  }
}
