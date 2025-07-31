import React from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

const LoadingSpinner = ({ size = 'default', message = 'Cargando...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 1, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="mb-4"
      >
        <Heart 
          className={`${sizeClasses[size]} text-[#00C853]`} 
          fill="currentColor" 
        />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 font-medium"
      >
        {message}
      </motion.p>
    </div>
  )
}

export default LoadingSpinner
