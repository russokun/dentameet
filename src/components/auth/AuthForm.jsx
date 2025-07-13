import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { userRegistrationSchema } from '@/lib/zodSchemas'

const AuthForm = ({ mode = 'login', onModeChange, selectedRole = 'paciente' }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signIn, signUp, loading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: mode === 'register' ? zodResolver(userRegistrationSchema) : undefined
  })

  const onSubmit = async (data) => {
    try {
      if (mode === 'login') {
        await signIn(data.email, data.password)
      } else {
        await signUp(data.email, data.password, selectedRole)
      }
      reset()
    } catch (error) {
      console.error('Auth error:', error)
    }
  }

  const toggleMode = () => {
    reset()
    onModeChange(mode === 'login' ? 'register' : 'login')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {selectedRole === 'paciente' ? (
              <User className="h-12 w-12 text-[#00C853]" />
            ) : (
              <GraduationCap className="h-12 w-12 text-[#1A237E]" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-[#1A237E] mb-2">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Ingresa a tu cuenta de DentaMeet' 
              : `Regístrate como ${selectedRole}`
            }
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="h-4 w-4 inline mr-2" />
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="h-4 w-4 inline mr-2" />
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-lg font-semibold ${
              selectedRole === 'paciente' ? 'btn-secondary' : 'btn-primary'
            }`}
          >
            {loading ? 'Procesando...' : (mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              onClick={toggleMode}
              className="ml-2 text-[#1A237E] hover:text-[#00C853] font-semibold transition-colors"
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default AuthForm
