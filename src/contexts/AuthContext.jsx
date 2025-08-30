import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ProfileService } from '@/services/profileService'
import { toast } from '@/components/ui/use-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  // undefined = not loaded yet, null = no profile, object = profile
  const [profile, setProfile] = useState(undefined)
  const [loading, setLoading] = useState(true)

  // Cargar perfil real desde Supabase
  const loadUserProfile = async (userId) => {
    if (!userId) return null
    try {
      console.log('🔄 Cargando perfil para usuario:', userId)
      const { data, error } = await supabase
        .from('person')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      console.log('🔄 Resultado raw de perfil:', { data, error })

      if (error) {
        console.error('❌ Error cargando perfil:', error)
        return null
      }

      // Si el perfil existe y tiene al menos un campo relevante (nombre, email, role), lo consideramos válido
      if (data && (data.nombre || data.email || data.role)) {
        console.log('✅ Perfil cargado:', data)
        return data
      } else if (data) {
        // Si existe el objeto pero no tiene los campos esperados, mostrarlo igual para debug
        console.warn('⚠️ Perfil encontrado pero incompleto:', data)
        return data
      } else {
        console.log('ℹ️ Perfil no válido o incompleto para usuario:', userId)
        return null
      }
    } catch (error) {
      console.error('❌ Error en loadUserProfile:', error)
      return null
    }
  }

  // Función para refrescar perfil (útil después de editar)
  const refreshProfile = async () => {
    if (!user?.id) return
    
    const profileData = await loadUserProfile(user.id)
    setProfile(profileData)
    return profileData
  }

  // Función para crear/actualizar perfil usando ProfileService
  const updateProfile = async (profileData) => {
    if (!user?.id) throw new Error('No hay usuario autenticado')
    try {
      const updated = await ProfileService.updateProfile(user.id, profileData)
      setProfile(updated)
      return updated
    } catch (error) {
      console.error('Error actualizando/creando perfil:', error)
      throw error
    }
  }

  // Función para hacer login
  const signIn = async (email, password) => {
    try {
      console.log('🔑 Intentando login con:', email)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('❌ Error en login:', error)
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive"
        })
        throw error
      }
      
      console.log('✅ Login exitoso:', data.user?.id)
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
        variant: "default"
      })
      
      return data
    } catch (error) {
      console.error('❌ Error en signIn:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Función para hacer registro
  const signUp = async (email, password, userData = {}) => {
    try {
      console.log('📝 Intentando registro con:', email)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) {
        console.error('❌ Error en registro:', error)
        toast({
          title: "Error al registrarse",
          description: error.message,
          variant: "destructive"
        })
        throw error
      }
      
      // Crear perfil básico si hay datos adicionales
      if (data.user && userData.nombre) {
        try {
          const { error: profileError } = await supabase
            .from('person')
            .insert({
              id: data.user.id,
              email: data.user.email,
              nombre: userData.nombre,
              apellido: userData.apellido || '',
              telefono: userData.telefono || '',
              role: userData.role || 'paciente',
              created_at: new Date().toISOString()
            })
          
          if (profileError) {
            console.error('❌ Error creando perfil:', profileError)
          } else {
            console.log('✅ Perfil básico creado')
          }
        } catch (profileError) {
          console.error('❌ Error en creación de perfil:', profileError)
        }
      }

        // Intentar refrescar perfil en contexto
        if (data.user) {
          try {
            const profileData = await loadUserProfile(data.user.id)
            setProfile(profileData)
          } catch (e) {
            console.warn('No se pudo refrescar perfil tras signUp:', e)
          }
        }
      
      console.log('✅ Registro exitoso:', data.user?.id)
      toast({
        title: "¡Registro exitoso!",
        description: "Cuenta creada correctamente. Completa tu perfil para continuar.",
        variant: "default"
      })
      
      return data
    } catch (error) {
      console.error('❌ Error en signUp:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout efectivo y limpio
  const signOut = async () => {
    try {
      console.log('🔄 Iniciando logout...')
      
      // 1. Logout de Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Error en Supabase logout:', error)
      }
      
      // 2. Limpiar estado local SIEMPRE
      setUser(null)
      setProfile(null)
      setLoading(false)
      
      console.log('✅ Logout completado, redirigiendo...')
      
      // 3. Redirección forzada
      window.location.href = '/auth'
      
    } catch (error) {
      console.error('❌ Error crítico en logout:', error)
      // FORZAR LIMPIEZA AUNQUE HAYA ERROR
      setUser(null)
      setProfile(null)
      setLoading(false)
      window.location.href = '/auth'
    }
  }

  // Inicialización robusta
    console.log('✅ Logout completado')

    // No forzar redirect para no romper SPA; dejar que la app maneje rutas
  useEffect(() => {
    let mounted = true
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Inicializando autenticación...')
        // 1. Obtener sesión actual
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('🔄 Estado inicial:', { session, error })
        if (error) {
          console.error('❌ Error obteniendo sesión:', error)
          if (mounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        if (session?.user && mounted) {
          console.log('✅ Sesión encontrada:', session.user.id)
          setUser(session.user)
          // 2. Cargar perfil
          console.log('🔍 Buscando perfil en tabla person para usuario:', session.user.id)
          const profileData = await loadUserProfile(session.user.id)
          if (mounted) {
            console.log('📋 Resultado del perfil:', profileData ? 'ENCONTRADO' : 'NO ENCONTRADO', profileData)
            setProfile(profileData)
          }
        } else {
          console.log('ℹ️ No hay sesión activa')
          if (mounted) {
            setUser(null)
            setProfile(null)
          }
        }
        if (mounted) {
          console.log('🔄 Estado después de inicialización:', { user, profile, loading })
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Error en inicialización:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    // 3. Listener para cambios de auth (incluye refresco de token y actualización de usuario)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Cambio de estado auth:', event, { session })
        if (!mounted) return
        try {
          const validEvents = [
            'SIGNED_IN',
            'TOKEN_REFRESHED',
            'USER_UPDATED'
          ]
          if (validEvents.includes(event) && session?.user) {
            console.log('✅ Usuario activo (evento:', event, '):', session.user.id)
            setUser(session.user)
            const profileData = await loadUserProfile(session.user.id)
            console.log('📋 Perfil después de evento auth:', profileData ? 'ENCONTRADO' : 'NO ENCONTRADO', profileData)
            setProfile(profileData)
          } else if (event === 'SIGNED_OUT') {
            console.log('ℹ️ Usuario deslogueado')
            setUser(null)
            setProfile(null)
          }
        } catch (error) {
          console.error('❌ Error en auth state change:', error)
        } finally {
          if (mounted) {
            console.log('🔄 Estado después de cambio de auth:', { user, profile, loading })
            setLoading(false)
          }
        }
      }
    )

    // Inicializar
    initializeAuth()

    // Cleanup
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Eliminado timeout de seguridad: loading solo termina cuando usuario y perfil estén listos

  const value = {
  user,
  profile,
  loading,
  signIn,
  signUp,
  signOut,
  refreshProfile,
  updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
