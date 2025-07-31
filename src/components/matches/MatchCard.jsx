import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, Star, MapPin, GraduationCap, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const MatchCard = ({ profile, onLike, onPass, isTopCard = false }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [exitDirection, setExitDirection] = useState(null)

  const getRoleIcon = (role) => {
    switch (role) {
      case 'estudiante':
        return <GraduationCap className="h-4 w-4" />
      case 'paciente':
        return <User className="h-4 w-4" />
      case 'dentameeter':
        return <Sparkles className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'estudiante':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paciente':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'dentameeter':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCompatibilityColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const handleLike = () => {
    setExitDirection('right')
    setTimeout(() => onLike(profile), 300)
  }

  const handlePass = () => {
    setExitDirection('left')
    setTimeout(() => onPass(profile), 300)
  }

  const cardVariants = {
    initial: { 
      scale: 0.95, 
      opacity: 0,
      y: 50
    },
    animate: { 
      scale: isTopCard ? 1 : 0.95,
      opacity: isTopCard ? 1 : 0.8,
      y: isTopCard ? 0 : 10,
      zIndex: isTopCard ? 20 : 10
    },
    exit: {
      x: exitDirection === 'right' ? 300 : exitDirection === 'left' ? -300 : 0,
      opacity: 0,
      rotate: exitDirection === 'right' ? 30 : exitDirection === 'left' ? -30 : 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      drag={isTopCard ? "x" : false}
      dragConstraints={{ left: -200, right: 200 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false)
        if (Math.abs(info.offset.x) > 100) {
          if (info.offset.x > 0) {
            handleLike()
          } else {
            handlePass()
          }
        }
      }}
      whileDrag={{ scale: 1.05, rotate: 5 }}
    >
      <div className={`
        bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full
        transform transition-all duration-300
        ${isDragging ? 'shadow-2xl' : 'hover:shadow-lg'}
        ${!isTopCard ? 'pointer-events-none' : ''}
      `}>
        {/* Header con foto y score */}
        <div className="relative h-2/3 bg-gradient-to-br from-blue-50 to-green-50">
          {/* Avatar placeholder con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A237E]/10 to-[#00C853]/10 flex items-center justify-center">
            <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center">
              <User className="h-16 w-16 text-gray-400" />
            </div>
          </div>

          {/* Compatibility Score */}
          <div className="absolute top-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
              <Star className={`h-4 w-4 ${getCompatibilityColor(profile.compatibilityScore)}`} />
              <span className={`text-sm font-bold ${getCompatibilityColor(profile.compatibilityScore)}`}>
                {profile.compatibilityScore}%
              </span>
            </div>
          </div>

          {/* Role Badge */}
          <div className="absolute top-4 left-4">
            <Badge className={`${getRoleColor(profile.role)} flex items-center space-x-1`}>
              {getRoleIcon(profile.role)}
              <span className="capitalize">{profile.role}</span>
            </Badge>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-6 h-1/3 flex flex-col justify-between">
          {/* Nombre y edad */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {profile.nombre} {profile.apellido}
            </h3>
            <div className="flex items-center space-x-4 text-gray-600 mb-3">
              {profile.edad && (
                <span className="text-sm">{profile.edad} años</span>
              )}
              {profile.comuna && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span className="text-sm">{profile.comuna}</span>
                </div>
              )}
            </div>

            {/* Universidad para estudiantes */}
            {profile.universidad && (
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">📚 {profile.universidad}</span>
                {profile.etapa_formacion && (
                  <span className="text-gray-500"> • {profile.etapa_formacion}</span>
                )}
              </p>
            )}

            {/* Especialidades o tratamientos */}
            <div className="flex flex-wrap gap-1">
              {(profile.especialidades || profile.tratamientos_interes)?.slice(0, 3).map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
              {(profile.especialidades?.length > 3 || profile.tratamientos_interes?.length > 3) && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{((profile.especialidades || []).length + (profile.tratamientos_interes || []).length) - 3} más
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-4">
            <Button
              onClick={handlePass}
              size="lg"
              variant="outline"
              className="w-16 h-16 rounded-full border-2 border-red-200 hover:border-red-300 hover:bg-red-50 group"
            >
              <X className="h-6 w-6 text-red-500 group-hover:text-red-600 transition-colors" />
            </Button>
            
            <Button
              onClick={handleLike}
              size="lg"
              className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00C853] to-[#4CAF50] hover:from-[#00B04F] hover:to-[#45A049] shadow-lg group"
            >
              <Heart className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MatchCard
