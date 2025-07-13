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

  const signUp = async (email, password, role = 'paciente') => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role
          }
        }
      })

      if (error) throw error

      toast({
        title: "¡Registro exitoso!",
        description: "Por favor verifica tu email para continuar."
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

      console.log('Updating profile for user:', user.id)
      console.log('Profile data:', profileData)

      // Primero verificar si el perfil ya existe
      const { data: existingProfile, error: checkError } = await supabase
        .from('person')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing profile:', checkError)
        throw checkError
      }

      console.log('Existing profile:', existingProfile)

      let data, error

      if (existingProfile) {
        console.log('Updating existing profile...')
        // Si existe, actualizar
        const result = await supabase
          .from('person')
          .update(profileData)
          .eq('id', user.id)
          .select()
          .single()
        data = result.data
        error = result.error
      } else {
        console.log('Creating new profile...')
        // Si no existe, insertar
        const result = await supabase
          .from('person')
          .insert({
            id: user.id,
            email: user.email,
            ...profileData
          })
          .select()
          .single()
        data = result.data
        error = result.error
      }

      if (error) {
        console.error('Database operation error:', error)
        throw error
      }

      console.log('Profile operation successful:', data)
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
    refreshProfile: () => user && loadUserProfile(user.id)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
