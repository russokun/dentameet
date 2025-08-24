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
      
  if (error) {
        console.error('❌ Error cargando perfil:', error)
        console.error('❌ Error details:', { 
          message: error.message, 
          details: error.details, 
          hint: error.hint,
          code: error.code 
        })
        return null
      }
      
      if (!data) {
        console.log('ℹ️ No se encontró perfil para usuario:', userId)
        return null
      }
      
      console.log('✅ Perfil cargado:', data?.nombre)
  return data
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
            console.log('📋 Resultado del perfil:', profileData ? 'ENCONTRADO' : 'NO ENCONTRADO')
            if (profileData) {
              console.log('👤 Datos del perfil:', { 
                nombre: profileData.nombre, 
                role: profileData.role, 
                completado: !!profileData.nombre 
              })
            }
            setProfile(profileData)
          }
        } else {
          console.log('ℹ️ No hay sesión activa')
          // Asegurarnos de definir explícitamente que no hay perfil.
          // Dejar `profile` como `undefined` causa que los guards muestren
          // un loading infinito porque comprueban `typeof profile === 'undefined'`.
          if (mounted) {
            setUser(null)
            setProfile(null)
          }
        }
        
        if (mounted) {
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

    // 3. Listener para cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Cambio de estado auth:', event)
        
        if (!mounted) return
        
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('✅ Usuario logueado:', session.user.id)
            setUser(session.user)
            console.log('🔍 Cargando perfil después del login...')
            const profileData = await loadUserProfile(session.user.id)
            console.log('📋 Perfil después del login:', profileData ? 'ENCONTRADO' : 'NO ENCONTRADO')
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

  // Timeout de seguridad - nunca más de 8 segundos loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Timeout de seguridad - terminando loading')
        setLoading(false)
      }
    }, 8000)

    return () => clearTimeout(timeout)
  }, [loading])

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
