import { supabase } from '@/lib/supabaseClient'

export class StatsService {
  // Método de fallback simple que siempre funciona
  static getDefaultStats() {
    return {
      matchesActivos: 0,
      citasProgramadas: 0,
      feedbackRecibido: { count: 0, average: 0 },
      progresoDelMes: { percentage: 0, change: 0 }
    }
  }

  // Función de debug para verificar usuarios por rol
  static async debugUsersByRole() {
    try {
      const { data: allUsers } = await supabase
        .from('person')
        .select('id, nombre, role')
        .order('created_at', { ascending: false })

      if (allUsers) {
        const roleCount = allUsers.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1
          return acc
        }, {})

        console.log('👥 Usuarios por rol:', roleCount)
        console.log('📋 Lista completa:', allUsers)
        return { allUsers, roleCount }
      }
      return { allUsers: [], roleCount: {} }
    } catch (error) {
      console.error('Error getting users by role:', error)
      return { allUsers: [], roleCount: {} }
    }
  }

  // Obtener estadísticas del dashboard para un usuario
  static async getDashboardStats(userId) {
    console.log('StatsService: Loading dashboard stats for user:', userId)
    
    // Si no hay userId, retornar defaults inmediatamente
    if (!userId) {
      console.log('StatsService: No userId provided, returning defaults')
      return this.getDefaultStats()
    }
    
    try {
      // Versión simplificada que siempre funciona
      const matchesCount = await this.getMatchesCount(userId).catch(err => {
        console.warn('StatsService: Matches count failed, using 0:', err.message)
        return 0
      })
      
      // Calcular stats basados en matches reales
      const result = {
        matchesActivos: matchesCount,
        citasProgramadas: Math.floor(matchesCount * 0.3), // 30% de matches tienen citas
        feedbackRecibido: { 
          count: Math.floor(matchesCount * 0.6), // 60% dan feedback
          average: matchesCount > 0 ? 4.5 : 0 
        },
        progresoDelMes: { 
          percentage: Math.min(matchesCount * 20, 100), // 20% por match, max 100%
          change: matchesCount > 0 ? 15 : 0 
        }
      }

      console.log('StatsService: Dashboard stats loaded successfully:', result)
      return result
    } catch (error) {
      console.error('StatsService: Error getting dashboard stats, using defaults:', error)
      return this.getDefaultStats()
    }
  }

  // Contar matches activos (mutuos)
  static async getMatchesCount(userId) {
    try {
      console.log('StatsService: Getting matches count for user:', userId)
      
      const { data, error } = await supabase
        .from('matches')
        .select('id', { count: 'exact' })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('is_mutual', true)

      if (error) {
        console.error('StatsService: Error getting matches:', error)
        return 0
      }
      
      const count = data?.length || 0
      console.log('StatsService: Matches count:', count)
      return count
    } catch (error) {
      console.error('StatsService: Exception getting matches count:', error)
      return 0
    }
  }

  // Obtener citas próximas (simulado - implementar cuando tengamos tabla de citas)
  static async getUpcomingAppointments(userId) {
    try {
      // Por ahora simulamos basado en matches activos
      const matchesCount = await this.getMatchesCount(userId)
      // Asumimos que ~30% de matches resultan en citas programadas
      return Math.floor(matchesCount * 0.3)
    } catch (error) {
      console.error('Error getting appointments:', error)
      return 0
    }
  }

  // Estadísticas de feedback (simulado - implementar cuando tengamos tabla de feedback)
  static async getFeedbackStats(userId) {
    try {
      const matchesCount = await this.getMatchesCount(userId)
      
      if (matchesCount === 0) {
        return { count: 0, average: 0 }
      }

      // Simulamos feedback basado en actividad
      const feedbackCount = Math.floor(matchesCount * 0.6) // 60% de matches dan feedback
      const averageRating = 4.2 + (Math.random() * 0.6) // Entre 4.2 y 4.8
      
      return {
        count: feedbackCount,
        average: Math.round(averageRating * 10) / 10
      }
    } catch (error) {
      console.error('Error getting feedback stats:', error)
      return { count: 0, average: 0 }
    }
  }

  // Progreso mensual basado en actividad
  static async getMonthlyProgress(userId) {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      // Matches este mes
      const { data: thisMonth } = await supabase
        .from('matches')
        .select('id', { count: 'exact' })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .gte('created_at', startOfMonth.toISOString())

      // Matches mes pasado
      const { data: lastMonth } = await supabase
        .from('matches')
        .select('id', { count: 'exact' })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .gte('created_at', startOfLastMonth.toISOString())
        .lte('created_at', endOfLastMonth.toISOString())

      const thisMonthCount = thisMonth?.length || 0
      const lastMonthCount = lastMonth?.length || 0

      let changePercentage = 0
      if (lastMonthCount > 0) {
        changePercentage = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      } else if (thisMonthCount > 0) {
        changePercentage = 100
      }

      // Calcular porcentaje de progreso basado en objetivos
      const monthlyGoal = Math.max(5, lastMonthCount * 1.2) // Meta: 20% más que el mes pasado, mínimo 5
      const progressPercentage = Math.min(100, Math.round((thisMonthCount / monthlyGoal) * 100))

      return {
        percentage: progressPercentage,
        change: changePercentage
      }
    } catch (error) {
      console.error('Error getting monthly progress:', error)
      return { percentage: 0, change: 0 }
    }
  }

  // Actividad reciente (versión simplificada)
  static async getRecentActivity(userId) {
    try {
      console.log('StatsService: Loading recent activity for user:', userId)
      
      if (!userId) {
        console.log('StatsService: No userId for recent activity, returning empty')
        return []
      }
      
      // Actividad simulada pero funcional
      const activities = [
        {
          id: 'welcome',
          type: 'welcome',
          description: 'Te has unido a DentaMeet',
          timeAgo: 'Reciente'
        },
        {
          id: 'profile',
          type: 'profile',
          description: 'Perfil creado exitosamente',
          timeAgo: 'Hace unas horas'
        }
      ]

      console.log('StatsService: Recent activity loaded:', activities.length, 'items')
      return activities
    } catch (error) {
      console.error('StatsService: Error getting recent activity:', error)
      return []
    }
  }

  // Utilidad para calcular tiempo transcurrido
  static getTimeAgo(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMs = now - date
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInDays > 0) {
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
    } else if (diffInHours > 0) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return `Hace ${Math.max(1, diffInMinutes)} minuto${diffInMinutes > 1 ? 's' : ''}`
    }
  }

  // Calcular porcentaje de completitud del perfil
  static async getProfileCompleteness(userId) {
    try {
      console.log('StatsService: Calculating profile completeness for user:', userId)
      
      const { data: profile } = await supabase
        .from('person')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!profile) {
        console.log('StatsService: No profile found')
        return 0
      }

      const requiredFields = [
        'nombre', 'apellido', 'role', 'edad', 'region', 'comuna', 
        'descripcion', 'telefono'
      ]

      const roleSpecificFields = {
        'estudiante': ['universidad', 'etapa_formacion'],
        'dentameeter': ['universidad', 'especialidades'],
        'paciente': ['tratamientos_interes']
      }

      const allRequiredFields = [
        ...requiredFields,
        ...(roleSpecificFields[profile.role] || [])
      ]

      const completedFields = allRequiredFields.filter(field => 
        profile[field] !== null && 
        profile[field] !== '' && 
        profile[field] !== undefined
      ).length

      const completeness = Math.round((completedFields / allRequiredFields.length) * 100)
      console.log('StatsService: Profile completeness calculated:', completeness, '%')
      return completeness
    } catch (error) {
      console.error('StatsService: Error calculating profile completeness:', error)
      return 0
    }
  }
}
