import { supabase } from '@/lib/supabaseClient'
import { calculateDistance } from '@/utils/matchUtils'

// Servicio premium para el sistema de matches
export class MatchService {
  // Obtener datos de usuario por ID (tratamientos_interes, horarios_disponibles, etc)
  static async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('person')
        .select(`id, nombre, apellido, role, tratamientos_interes, horarios_disponibles, especialidades, region, comuna, telefono, descripcion, universidad`)
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }
  // Mazo armado y ordenado en el servidor (RPC match_deck): filtros, puntaje 0–100 y razones.
  // Ver docs/05-algoritmo-de-match.md §3.6.
  static async getPotentialMatches(userId, userRole, limit = 20) {
    const { data, error } = await supabase.rpc('match_deck', { p_limit: limit })
    if (error) throw error
    return (data || []).map((p) => ({ ...p, compatibilityScore: p.score, matchReasons: p.reasons || [] }))
  }

  // Bloquear: sale del mazo, se deshace el match y se cancelan citas futuras
  static async blockUser(targetId) {
    const { error } = await supabase.rpc('block_user', { p_target: targetId })
    if (error) throw error
  }

  // Reportar: queda registrado para revisión y además bloquea
  static async reportUser(targetId, reason, details = '') {
    const { error } = await supabase.rpc('report_user', { p_target: targetId, p_reason: reason, p_details: details })
    if (error) throw error
  }

  static async createMatch(user1Id, user2Id, isLike = true) {
    try {
      // Preferimos la ruta RPC: la función en la DB debe encargarse de la lógica atómica
      // create_or_update_match_rpc(p_target uuid, p_is_like boolean) -> jsonb { match, isMutual }
      // Nota: pasamos p_is_like primero para coincidir con cómo PostgREST mapea parámetros
      const { data, error } = await supabase.rpc('create_or_update_match_rpc', {
        p_is_like: isLike,
        p_target: user2Id
      })

      if (error) throw error

      // supabase.rpc puede devolver un valor simple o un array; normalizamos
      const result = Array.isArray(data) ? data[0] : data

      // Intentamos extraer match e isMutual
      const match = result?.match || result
      const isMutual = !!(result?.isMutual)

      return { match, isMutual }
    } catch (error) {
      // Mejor logging para depuración en cliente
      try { console.error('Error creating match (RPC):', JSON.stringify(error, null, 2)) } catch (e) { console.error('Error creating match (RPC) (raw):', error) }
      // Detectar error de Row Level Security y dar mensaje más útil
      if (error && error.code === '42501') {
        const rlsError = new Error('No se pudo crear el match: la política de seguridad de filas (RLS) impide insertar o ejecutar la operación. Asegúrate de crear la función RPC `create_or_update_match_rpc` y conceder EXECUTE a `authenticated`, o ajustar las policies.');
        rlsError.code = error.code
        rlsError.original = error
        throw rlsError
      }
      // Detectar función RPC ausente o endpoint 404
  const msg = String(error?.message || '')
  // Distinguimos "function does not exist" de otros "does not exist"
  // (por ejemplo, "column ... does not exist"). Solo tratar como RPC
  // faltante cuando el mensaje menciona explicitamente una function.
  const functionDoesNotExist = /function/i.test(msg) && /does not exist/i.test(msg)
  if (error && (error.code === '42883' || functionDoesNotExist || error?.status === 404 || /not found/i.test(msg) || /404/i.test(msg))) {
        const rpcMissing = new Error('La función RPC `create_or_update_match_rpc` no existe o no es accesible. Crea la función en Postgres (PL/pgSQL) y concede EXECUTE a `authenticated` (o revisa el schema).');
        rpcMissing.code = error.code || 'RPC_MISSING'
        rpcMissing.original = error
        // Si estamos en ambiente de desarrollo, intentar fallback directo (solo para dev)
        let isDev = false
        try {
          if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
            isDev = process.env.NODE_ENV !== 'production'
          }
        } catch (_) {
          isDev = false
        }
        if (isDev) {
          try {
            // Dev mode: do NOT perform any persistent writes here.
            // To avoid creating unilateral match rows in development (so behavior
            // matches production RPC), we return a non-persistent result.
            console.warn('RPC missing - dev mode: skipping any DB insert to avoid unilateral matches (no-op).')
            return { match: null, isMutual: false }
          } catch (devErr) {
            console.warn('Dev fallback threw:', devErr)
          }
        }

        throw rpcMissing
      }

      throw error
    }
  }

  // Método para registrar acciones (like/pass) - compatible con Matches.jsx
  static async recordAction(userId, targetUserId, action) {
    try {
      const isLike = action === 'liked'
      const result = await this.createMatch(userId, targetUserId, isLike)

      // Normalizar la respuesta para el frontend
      return {
        isMatch: !!result.isMutual,
        match: result.match || null
      }
    } catch (error) {
      console.error('Error recording action:', error)
      // Propagar con mensaje más amigable si es RLS
      if (error && error.code === '42501') {
        const rlsError = new Error('Acción bloqueada por políticas de seguridad (RLS). Asegúrate de que la tabla "matches" permite inserts/updates para el role usado por el cliente o implementa una RPC segura en Supabase.');
        rlsError.code = error.code
        rlsError.original = error
        throw rlsError
      }
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

    // Score por distancia si ambos tienen lat/lon (si la BD tiene campos latitud/longitud)
    try {
      const lat1 = user1.latitud || user1.latitude || user1.lat
      const lon1 = user1.longitud || user1.longitude || user1.lon
      const lat2 = user2.latitud || user2.latitude || user2.lat
      const lon2 = user2.longitud || user2.longitude || user2.lon

      if (lat1 && lon1 && lat2 && lon2) {
        const km = calculateDistance(Number(lat1), Number(lon1), Number(lat2), Number(lon2))
        // Puntos según proximidad
        if (km <= 5) score += 20
        else if (km <= 20) score += 10
        else if (km <= 50) score += 5
      }
    } catch (e) {
      // No detener el scoring si faltan campos
    }

    return Math.min(score, 100)
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
