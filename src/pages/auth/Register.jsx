import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, Phone, MapPin, Loader } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { toast } from '../../components/ui/use-toast'

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    telefono: '',
    role: 'paciente'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.nombre) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      })
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      })
      return false
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    try {
      console.log('📝 Attempting registration with:', formData.email)
      await signUp(formData.email, formData.password, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        role: formData.role
      })
      
    } catch (error) {
      console.error('❌ Registration error:', error)
      // El error ya se maneja en signUp
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header con iconos de rol */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          {formData.role === 'paciente' ? (
            <div className="p-4 bg-green-100 rounded-full">
              <User className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="p-4 bg-blue-100 rounded-full">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          )}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Crear Cuenta
        </h2>
        <p className="text-gray-600">
          Únete a la comunidad DentaMeet como {formData.role}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Selector de Rol */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">¿Quién eres? *</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'paciente' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.role === 'paciente'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
              }`}
              disabled={loading}
            >
              <User className="h-5 w-5 mx-auto mb-2" />
              <span className="text-sm font-medium">Paciente</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'estudiante' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.role === 'estudiante'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
              }`}
              disabled={loading}
            >
              <GraduationCap className="h-5 w-5 mx-auto mb-2" />
              <span className="text-sm font-medium">Estudiante</span>
            </button>
          </div>
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre" className="flex items-center text-sm font-medium text-gray-700">
            <User className="h-4 w-4 mr-2" />
            Nombre *
          </Label>
          <Input
            id="nombre"
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Tu nombre"
            disabled={loading}
            required
            className="transition-all focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Apellido */}
        <div className="space-y-2">
          <Label htmlFor="apellido" className="flex items-center text-sm font-medium text-gray-700">
            <User className="h-4 w-4 mr-2" />
            Apellido
          </Label>
          <Input
            id="apellido"
            name="apellido"
            type="text"
            value={formData.apellido}
            onChange={handleInputChange}
            placeholder="Tu apellido (opcional)"
            disabled={loading}
            className="transition-all focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
            <Mail className="h-4 w-4 mr-2" />
            Email *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu@email.com"
            disabled={loading}
            required
            className="transition-all focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono" className="flex items-center text-sm font-medium text-gray-700">
            <Phone className="h-4 w-4 mr-2" />
            Teléfono
          </Label>
          <Input
            id="telefono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleInputChange}
            placeholder="+56 9 1234 5678"
            disabled={loading}
            className="transition-all focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700">
            <Lock className="h-4 w-4 mr-2" />
            Contraseña *
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              className="pr-10 transition-all focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="flex items-center text-sm font-medium text-gray-700">
            <Lock className="h-4 w-4 mr-2" />
            Confirmar Contraseña *
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="pr-10 transition-all focus:ring-2 focus:ring-blue-500"
              placeholder="Repite tu contraseña"
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className={`w-full py-3 text-lg font-semibold transition-all ${
            formData.role === 'paciente' 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Crear Cuenta'
          )}
        </Button>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              disabled={loading}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  )
}

export default Register
