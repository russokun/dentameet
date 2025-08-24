import { supabase } from '@/lib/supabaseClient'
import { calculateDistance } from '@/utils/matchUtils'

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
        .from('person_public')
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

      // DEBUG: comprobar que la búsqueda por rol simple devuelve resultados
      try {
        const { data: roleOnly, error: roleOnlyErr } = await supabase
          .from('person_public')
          .select('id, nombre, role, region, comuna')
          .in('role', targetRoles)
          .limit(limit)

        console.log('DEBUG roleOnly count:', roleOnly?.length || 0)
        if (roleOnlyErr) console.warn('DEBUG roleOnly error:', roleOnlyErr)
        else console.log('DEBUG roleOnly sample:', roleOnly?.slice(0,5))
      } catch (e) {
        console.warn('DEBUG roleOnly failed:', e)
      }

      // Obtener el perfil completo del usuario actual para matching inteligente
      const { data: currentUserProfile } = await supabase
        .from('person')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('Perfil usuario actual completo:', currentUserProfile)

      // --- FILTRADO EN CLIENTE (PRIMARIO) ---
      // Intentar obtener todos los perfiles y filtrar en JS para tener
      // máxima flexibilidad y tolerancia a diferencias en DB (acentos, mayúsculas, etc.)
      try {
        const { data: allPeople, error: allPeopleErr } = await supabase
          .from('person_public')
          .select('*')
          .limit(1000)

        if (allPeopleErr) {
          console.warn('No se pudo obtener allPeople para filtro cliente:', allPeopleErr)
        } else if (allPeople && allPeople.length > 0) {
          console.log('Obtenidos perfiles para filtrado cliente:', allPeople.length)

          const strip = (s) => {
            if (!s) return ''
            return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
          }

          const currCom = strip(currentUserProfile?.comuna)
          const currReg = strip(currentUserProfile?.region)

          // preparar candidatos excluyendo IDs/interacciones previas
          let candidates = (allPeople || []).filter(p => p && p.id && p.id !== userId && !excludedIds.has(p.id))

          console.log('Candidatos iniciales (sin excluir):', candidates.length)

          // Filtrar por rol objetivo según quien solicita
          if (userRole === 'paciente') {
            candidates = candidates.filter(p => {
              const r = strip(p.role || '')
              return r === 'estudiante' || r.includes('estud') || r === 'dentameeter'
            })
          } else if (userRole === 'estudiante') {
            candidates = candidates.filter(p => {
              const r = strip(p.role || '')
              return r === 'paciente' || r === 'dentameeter'
            })
          } else if (userRole === 'dentameeter') {
            candidates = candidates.filter(p => {
              const r = strip(p.role || '')
              return r === 'paciente' || r === 'estudiante' || r.includes('estud')
            })
          }

          console.log('Candidatos tras filtrar por rol:', candidates.length)

          // Priorizar por comuna -> región -> tratamiento/especialidad match
          const tratamientosUser = Array.isArray(currentUserProfile?.tratamientos_interes)
            ? currentUserProfile.tratamientos_interes.map(t => strip(t))
            : (currentUserProfile?.tratamientos_interes || '').toString().split(',').map(t => strip(t)).filter(Boolean)

          // Añadir score temporal y filtrar por tratamientos/especialidades si corresponde
          const scored = candidates.map(p => {
            const pEspecial = Array.isArray(p.especialidades) ? p.especialidades.map(x => strip(x)) : (p.especialidades || '').toString().split(',').map(x => strip(x)).filter(Boolean)
            const treatmentMatch = tratamientosUser.reduce((acc, t) => acc + (pEspecial.some(e => e.includes(t) || t.includes(e)) ? 1 : 0), 0)
            // base score por ubicación
            let score = 0
            if (currCom && strip(p.comuna || '').includes(currCom)) score += 50
            else if (currReg && strip(p.region || '').includes(currReg)) score += 25
            // tratamiento
            score += treatmentMatch * 30
            // completeness
            if (p.telefono) score += 5
            if (p.descripcion) score += 5
            if (p.universidad) score += 5
            return { ...p, compatibilityScore: Math.min(score, 100) }
          })

          const final = scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore).slice(0, limit)
          if (final && final.length > 0) {
            console.log('Resultados devueltos por filtro cliente:', final.length)
            return final
          }
        }
      } catch (e) {
        console.warn('Error en filtrado cliente primario:', e)
      }


      // Query simplificado y más robusto
      let query = supabase
        .from('person_public')
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

      // PRIMERO: intentar con comuna (ilike con comodines) para mayor tolerancia
      let queryWithLocation = query
      if (currentUser?.comuna) {
        const comunaPattern = `%${currentUser.comuna.replace(/%/g, '')}%`
        console.log(`Intentando filtrar por comuna (ilike pattern): "${comunaPattern}"`)
        queryWithLocation = query.ilike('comuna', comunaPattern)
      }

      // Excluir usuarios ya interactuados - usar not in para mayor eficiencia
      let data, error
      if (excludedIds.size > 0) {
        const excludedArray = Array.from(excludedIds)
        console.log('Excluyendo IDs:', excludedArray)
        try {
            ({ data, error } = await queryWithLocation.not('id', 'in', `(${excludedArray.join(',')})`))
        } catch (e) {
          console.warn('not in no soportado o fallo, cayendo a .neq chain:', e)
          // fallback: aplicar .neq en cadena
          const excludedArray2 = excludedArray
          excludedArray2.forEach(id => {
            queryWithLocation = queryWithLocation.neq('id', id)
          })
          ;({ data, error } = await queryWithLocation)
        }
      } else {
        ;({ data, error } = await queryWithLocation)
      }

      // Si no encuentra resultados en la misma comuna, intentar con toda la región
      if ((!data || data.length === 0) && currentUser?.region) {
        console.log(`Sin resultados en comuna "${currentUser.comuna}", intentando región "${currentUser.region}"`)
        
        const regionPattern = `%${currentUser.region.replace(/%/g, '')}%`
        let regionQuery = supabase
          .from('person_public')
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
          .ilike('region', regionPattern)
          .limit(limit)

        if (excludedIds.size > 0) {
          const excludedArray = Array.from(excludedIds)
          try {
            const excludedStr = `(${excludedArray.join(',')})`
            const regionResult = await regionQuery.not('id', 'in', excludedStr)
            data = regionResult.data
            error = regionResult.error
          } catch (e) {
            excludedArray.forEach(id => {
              regionQuery = regionQuery.neq('id', id)
            })
            const regionResult = await regionQuery
            data = regionResult.data
            error = regionResult.error
          }
        } else {
          const regionResult = await regionQuery
          data = regionResult.data
          error = regionResult.error
        }
        console.log(`Resultados con filtro de región: ${data?.length || 0}`)
      }

      // Si AÚN no hay resultados, buscar SIN restricciones geográficas
      if ((!data || data.length === 0)) {
        console.log('Sin resultados con filtros geográficos, buscando SIN restricciones de ubicación')
        
        let generalQuery = supabase
          .from('person_public')
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

        if (excludedIds.size > 0) {
          const excludedArray = Array.from(excludedIds)
          try {
            const excludedStr = `(${excludedArray.join(',')})`
            const generalResult = await generalQuery.not('id', 'in', excludedStr)
            data = generalResult.data
            error = generalResult.error
          } catch (e) {
            excludedArray.forEach(id => {
              generalQuery = generalQuery.neq('id', id)
            })
            const generalResult = await generalQuery
            data = generalResult.data
            error = generalResult.error
          }
        } else {
          const generalResult = await generalQuery
          data = generalResult.data
          error = generalResult.error
        }
        console.log(`Resultados SIN filtros geográficos: ${data?.length || 0}`)
      }

      // FALLBACK: si aún no hay resultados, intentar encontrar estudiantes con role ilike '%estud%'
      if ((!data || data.length === 0) && userRole === 'paciente') {
        try {
          console.log('Intentando fallback: buscar roles similares a "estud" (ilike) para pacientes')
          let estudQuery = supabase
            .from('person_public')
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
            .ilike('role', '%estud%')
            .limit(limit)

          if (excludedIds.size > 0) {
            const excludedArray = Array.from(excludedIds)
            excludedArray.forEach(id => {
              estudQuery = estudQuery.neq('id', id)
            })
          }

          const estudResult = await estudQuery
          if (estudResult?.data && estudResult.data.length > 0) {
            data = estudResult.data
            error = estudResult.error
            console.log(`Fallback ilike 'estud' - encontrados: ${data.length}`)
          } else {
            console.log('Fallback ilike "estud" no arrojó resultados')
          }
        } catch (e) {
          console.warn('Fallback ilike failed:', e)
        }
      }

      // ULTIMO RECURSO: si sigue vacío, devolver cualquier perfil (excepto el propio y excluidos)
      if ((!data || data.length === 0)) {
        try {
          console.log('Ultimo recurso: buscar cualquier perfil distinto al usuario (sin filtro de role)')
          let anyQuery = supabase
            .from('person_public')
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
            .limit(limit)

          if (excludedIds.size > 0) {
            const excludedArray = Array.from(excludedIds)
            excludedArray.forEach(id => {
              anyQuery = anyQuery.neq('id', id)
            })
          }

          const anyResult = await anyQuery
          data = anyResult.data
          error = anyResult.error
          console.log(`Fallback general - encontrados: ${data?.length || 0}`)
        } catch (e) {
          console.warn('Fallback general failed:', e)
        }
      }

      if (error) {
        console.error('Error en consulta:', error)
        throw error
      }
      // Si aún no hay resultados tras intentos con SQL, aplicar un fallback
      // del lado del cliente que normaliza strings (quita tildes, lowercases)
      // y prioriza por comuna -> región -> estudiantes -> cualquier candidato.
      if ((!data || data.length === 0)) {
        try {
          console.log('Aplicando fallback cliente usando allProfilesDebug (evita nuevas llamadas)')
          const candidates = allProfilesDebug || []

          const stripAccents = (s) => {
            if (!s) return ''
            return String(s)
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .trim()
          }

          const currCom = stripAccents(currentUser?.comuna || '')
          const currReg = stripAccents(currentUser?.region || '')

          console.log(`allProfilesDebug length: ${candidates.length}`)

          // Diagnóstico detallado
          console.log('Sample de allProfilesDebug (primeros 20):')
          ;(candidates.slice(0,20) || []).forEach((p, i) => {
            console.log(`#${i} -> id:`, p.id, ' typeof id:', typeof p.id, ' role:', p.role, ' region:', p.region, ' comuna:', p.comuna)
          })

          console.log('Contenido de excludedIds (array):', Array.from(excludedIds))

          const candidatesFiltered = candidates.filter(p => !excludedIds.has(p.id))
          console.log(`candidatesFiltered after exclusions: ${candidatesFiltered.length}`)
          console.log('Sample de candidatesFiltered (primeros 20):')
          ;(candidatesFiltered.slice(0,20) || []).forEach((p, i) => {
            console.log(`#${i} -> id:`, p.id, ' typeof id:', typeof p.id, ' role:', p.role, ' region:', p.region, ' comuna:', p.comuna)
          })

          const sameComuna = candidatesFiltered.filter(p => {
            const pc = stripAccents(p.comuna || '')
            return pc && currCom && pc.includes(currCom)
          })

          const sameRegion = candidatesFiltered.filter(p => {
            const pr = stripAccents(p.region || '')
            return pr && currReg && pr.includes(currReg)
          })

          const students = candidatesFiltered.filter(p => {
            const pr = stripAccents(p.role || '')
            return pr.includes('estud') || pr === 'estudiante'
          })

          console.log(`sameComuna: ${sameComuna.length}, sameRegion: ${sameRegion.length}, students: ${students.length}`)

          // Prioridad: misma comuna + targetRoles, luego misma region + targetRoles,
          // luego estudiantes, luego cualquier candidato disponible.
          let chosen = sameComuna.filter(p => targetRoles.includes(p.role))
          if (!chosen || chosen.length === 0) chosen = sameComuna
          if (!chosen || chosen.length === 0) chosen = sameRegion.filter(p => targetRoles.includes(p.role))
          if (!chosen || chosen.length === 0) chosen = sameRegion
          if (!chosen || chosen.length === 0) chosen = students
          if (!chosen || chosen.length === 0) chosen = candidatesFiltered

          data = (chosen || []).slice(0, limit)
          console.log(`Fallback cliente - candidatos después de filtrar: ${data.length}`)
        } catch (e) {
          console.warn('Error en fallback cliente:', e)
        }
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
          .from('person_public')
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
      // 1) Si ya existe un swipe en la MISMA direccion (usuario ya swipeó antes), actualizarlo
      const { data: sameDirection, error: sameErr } = await supabase
        .from('matches')
        .select('*')
        .eq('user1_id', user1Id)
        .eq('user2_id', user2Id)
        .maybeSingle()

      if (sameErr) throw sameErr

      if (sameDirection) {
        // Actualizar el swipe existente en la misma dirección
        const { data: updated, error: updErr } = await supabase
          .from('matches')
          .update({
            user1_liked: isLike,
            updated_at: new Date().toISOString()
          })
          .eq('id', sameDirection.id)
          .select()
          .single()

        if (updErr) throw updErr
        return { match: updated, isMutual: !!updated.is_mutual }
      }

      // 2) Revisar si existe un swipe inverso (user2 -> user1). Si existe, actualizarlo y marcar mutual si aplica
      const { data: inverse, error: invErr } = await supabase
        .from('matches')
        .select('*')
        .eq('user1_id', user2Id)
        .eq('user2_id', user1Id)
        .maybeSingle()

      if (invErr) throw invErr

      if (inverse) {
        // El swipe inverso existe; actualizar user2_liked (en ese registro) y marcar is_mutual si ambos gustaron
        const willBeMutual = !!inverse.user1_liked && isLike
        const { data: updatedInverse, error: updInvErr } = await supabase
          .from('matches')
          .update({
            user2_liked: isLike,
            is_mutual: willBeMutual,
            updated_at: new Date().toISOString()
          })
          .eq('id', inverse.id)
          .select()
          .single()

        if (updInvErr) throw updInvErr
        return { match: updatedInverse, isMutual: willBeMutual }
      }

      // 3) Si no existe ningún swipe previo, insertar uno nuevo (user1 -> user2)
      const { data: newSwipe, error: swipeError } = await supabase
        .from('matches')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
          user1_liked: isLike,
          user2_liked: false,
          is_mutual: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (swipeError) throw swipeError

      return { match: newSwipe, isMutual: false }
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

      // Normalizar la respuesta para el frontend
      return {
        isMatch: !!result.isMutual,
        match: result.match || null
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
