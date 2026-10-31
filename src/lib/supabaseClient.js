import { createClient } from '@supabase/supabase-js'
import { createDemoClient } from '@/lib/demoSupabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Modo demo: solo en `npm run dev` con VITE_DEMO_MODE=true. En build de producción
// import.meta.env.DEV es false y el cliente simulado queda fuera del bundle.
export const isDemoMode = import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true'

// Sin backend configurado la app corre en "modo vitrina": páginas públicas sí, cuentas no.
// createClient lanza con una URL inválida y dejaba la página en blanco.
export const isSupabaseConfigured = isDemoMode || Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isDemoMode
  ? createDemoClient()
  : createClient(supabaseUrl || 'https://backend-no-configurado.invalid', supabaseAnonKey || 'sin-clave', {
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
