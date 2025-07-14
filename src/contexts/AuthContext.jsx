import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser, getUserProfile } from '@/lib/supabaseClient'
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
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const userProfile = await getUserProfile(userId)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Si no existe perfil, es normal para usuarios nuevos
      setProfile(null)
    }
  }

  // Función utilitaria para crear perfil manualmente
  const createProfileIfNeeded = async (userId, email, role = 'paciente') => {
    try {
      console.log('Checking if profile exists for user:', userId)
      
      const { data: existingProfile } = await supabase
        .from('person')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (!existingProfile) {
        console.log('Creating missing profile...')
        const { data, error } = await supabase
          .from('person')
          .insert({
            id: userId,
            email: email,
            role: role
          })
          .select()
          .maybeSingle()

        if (error) {
          console.error('Error creating profile:', error)
          throw error
        }
        
        console.log('Profile created:', data)
        setProfile(data)
        return data
      } else {
        console.log('Profile already exists')
        return existingProfile
      }
    } catch (error) {
      console.error('Error in createProfileIfNeeded:', error)
      throw error
    }
  }

  const signUp = async (email, password, role = 'paciente') => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error

      // Crear el perfil manualmente tras registro exitoso
      if (data.user && !error) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const { data: profileData, error: profileError } = await supabase
            .from('person')
            .insert({
              id: data.user.id,
              email: data.user.email,
              role: role
            })
            .select()
            .maybeSingle()
            
          if (profileError) {
            console.log('Profile creation note:', profileError.message)
          }
        } catch (profileError) {
          console.log('Profile creation handled:', profileError.message)
        }
      }

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada correctamente."
      })

      return { data, error: null }
    } catch (error) {
      console.error('Error during sign up:', error)
      
      toast({
        title: "Error de registro",
        description: error.message,
        variant: "destructive"
      })
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente."
      })

      return { data, error: null }
    } catch (error) {
      console.error('Error during sign in:', error)
      toast({
        title: "Error de inicio de sesión",
        description: error.message,
        variant: "destructive"
      })
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setProfile(null)

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente."
      })

      return { error: null }
    } catch (error) {
      console.error('Error during sign out:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      setLoading(true)
      
      if (!user) throw new Error('No user logged in')

      // Verificar si el perfil ya existe
      const { data: existingProfile } = await supabase
        .from('person')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      let data, error

      if (existingProfile) {
        // Actualizar perfil existente
        const result = await supabase
          .from('person')
          .update(profileData)
          .eq('id', user.id)
          .select()
          .maybeSingle()
        data = result.data
        error = result.error
      } else {
        // Crear nuevo perfil
        const result = await supabase
          .from('person')
          .insert({
            id: user.id,
            email: user.email || user.user_metadata?.email,
            role: user.user_metadata?.role || 'paciente',
            ...profileData
          })
          .select()
          .maybeSingle()
        data = result.data
        error = result.error
      }

      if (error) throw error

      setProfile(data)
      
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil se ha actualizado correctamente."
      })

      return { data, error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    createProfileIfNeeded,
    refreshProfile: () => user && loadUserProfile(user.id)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
