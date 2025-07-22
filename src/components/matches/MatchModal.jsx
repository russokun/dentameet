import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MatchModal = ({ isVisible, matchedProfile, onClose, onSendMessage }) => {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true)
      // Auto-hide confetti after animation
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  // Confetti component
  const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: 0,
            scale: 0
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: 360,
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        >
          {i % 4 === 0 ? (
            <Heart className="h-4 w-4 text-red-400" fill="currentColor" />
          ) : i % 4 === 1 ? (
            <Sparkles className="h-4 w-4 text-yellow-400" fill="currentColor" />
          ) : i % 4 === 2 ? (
            <div className="w-2 h-2 bg-[#00C853] rounded-full" />
          ) : (
            <div className="w-2 h-2 bg-[#1A237E] rounded-full" />
          )}
        </motion.div>
      ))}
    </div>
  )

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  }

  const heartVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: [0, 1.2, 1],
      rotate: 0,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 200,
        delay: 0.2
      }
    }
  }

  if (!matchedProfile) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Confetti */}
            {showConfetti && <Confetti />}

            {/* Modal */}
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#1A237E] to-[#00C853] p-8 text-center text-white">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Match icon */}
                <motion.div
                  className="flex justify-center mb-4"
                  variants={heartVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="bg-white/20 p-6 rounded-full">
                    <Heart className="h-12 w-12 text-white" fill="currentColor" />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="text-3xl font-bold mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  ¡Es un Match!
                </motion.h2>
                
                <motion.p
                  className="text-white/90"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  A ti y a {matchedProfile.nombre} se han gustado mutuamente
                </motion.p>
              </div>

              {/* Profile info */}
              <motion.div
                className="p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-center mb-6">
                  {/* Avatar placeholder */}
                  <div className="w-20 h-20 bg-gradient-to-br from-[#1A237E]/10 to-[#00C853]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Heart className="h-10 w-10 text-[#00C853]" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {matchedProfile.nombre} {matchedProfile.apellido}
                  </h3>
                  
                  <p className="text-gray-600 capitalize">
                    {matchedProfile.role}
                    {matchedProfile.universidad && ` • ${matchedProfile.universidad}`}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => onSendMessage(matchedProfile)}
                    className="w-full bg-gradient-to-r from-[#00C853] to-[#4CAF50] hover:from-[#00B04F] hover:to-[#45A049] text-white py-3 text-lg font-semibold rounded-xl shadow-lg"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Contactar por WhatsApp
                  </Button>
                  
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full py-3 text-gray-600 border-gray-200 hover:bg-gray-50 rounded-xl"
                  >
                    Continuar explorando
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MatchModal
