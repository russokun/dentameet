import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Loader, LogIn, Heart } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

const Login = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      return
    }

    setLoading(true)
    
    try {
      console.log('🔑 Attempting login with:', formData.email)
      await signIn(formData.email, formData.password)
      
    } catch (error) {
      console.error('❌ Login error:', error)
      // El error ya se maneja en signIn
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header con gradiente */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
          Bienvenido de Vuelta
        </h2>
        <p className="text-gray-600 text-lg">
          Inicia sesión en tu cuenta DentaMeet
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div className="space-y-3">
          <Label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700">
            <div className="p-1 bg-blue-100 rounded mr-2">
              <Mail className="h-3 w-3 text-blue-600" />
            </div>
            Correo Electrónico
          </Label>
          <div className="relative group">
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-4 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-all duration-200 rounded-xl"
              placeholder="tu@email.com"
              disabled={loading}
              required
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-3">
          <Label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-700">
            <div className="p-1 bg-blue-100 rounded mr-2">
              <Lock className="h-3 w-3 text-blue-600" />
            </div>
            Contraseña
          </Label>
          <div className="relative group">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              className="pl-4 pr-12 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-all duration-200 rounded-xl"
              placeholder="Tu contraseña"
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-blue-600/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            disabled={loading}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="mr-3 h-5 w-5 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            <>
              <LogIn className="mr-3 h-5 w-5" />
              Iniciar Sesión
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">O continúa con</span>
          </div>
        </div>

       
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>
        <div className="mt-2 text-xs text-center text-gray-500">
          <span>
            <strong>Nota:</strong> El registro e inicio de sesión con redes sociales (Google y Facebook) aún no está disponible. Próximamente estará activo.
          </span>
        </div>
        {/* Switch to Register */}
        <div className="text-center pt-4">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              disabled={loading}
            >
              Regístrate gratis
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  )
}

export default Login
