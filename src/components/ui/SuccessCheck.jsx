import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// Check de éxito (patrón "success check" de transitions-dev): el círculo aparece con un leve
// rebote y el trazo del check se dibuja. Con movimiento reducido, aparece sin animación.
const SuccessCheck = ({ className = 'h-7 w-7' }) => {
  const reduce = useReducedMotion()
  return (
    <motion.svg
      viewBox="0 0 28 28"
      className={className}
      aria-hidden="true"
      initial={reduce ? false : { scale: 0.6, opacity: 0, rotate: -12, filter: 'blur(4px)' }}
      animate={{ scale: 1, opacity: 1, rotate: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, ease: [0.34, 1.36, 0.64, 1] }}
    >
      <circle cx="14" cy="14" r="14" fill="#34d399" />
      <motion.path
        d="M8.5 14.5l3.6 3.6 7.4-8"
        fill="none"
        stroke="#020617"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.15, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.svg>
  )
}

export default SuccessCheck
