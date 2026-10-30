import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Sin backend configurado la app corre en "modo vitrina": páginas públicas sí, cuentas no.
// createClient lanza con una URL inválida y dejaba la página en blanco.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(supabaseUrl || 'https://backend-no-configurado.invalid', supabaseAnonKey || 'sin-clave', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper para el perfil del usuario
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('person')
    .select('*')
    .eq('id', userId)
    .maybeSingle() // Cambiar a maybeSingle() para permitir 0 o 1 registros
  
  if (error) throw error
  return data // Retorna null si no existe, en lugar de fallar
}
