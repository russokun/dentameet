import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Heart, MessageCircle, X, GraduationCap, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const initials = (p) =>
  `${(p?.nombre || '').trim().charAt(0)}${(p?.apellido || '').trim().charAt(0)}`.toUpperCase() || '?'

// El momento del match, en el lenguaje del hero: azul noche, las dos iniciales que se juntan
// y la acción esmeralda. Sin confeti: el gesto ya es la celebración.
const MatchModal = ({ isVisible, matchedProfile, onClose, onSendMessage }) => {
  const { profile } = useAuth()
  const reduce = useReducedMotion()
  const primaryRef = useRef(null)

  // Escape cierra; el foco va a la acción principal al abrir
  useEffect(() => {
    if (!isVisible) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => primaryRef.current?.focus(), 50)
    return () => { window.removeEventListener('keydown', onKey); clearTimeout(t) }
  }, [isVisible, onClose])

  if (!matchedProfile) return null

  const spring = reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 26 }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-slate-950/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="match-title"
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-slate-950 text-white"
            style={{ boxShadow: '0 30px 70px -20px rgb(2 6 23 / 0.7)' }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: reduce ? { duration: 0.15 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, scale: 0.98, y: 8, transition: { duration: 0.15 } }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-400/25 blur-3xl" aria-hidden="true" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3 right-3 z-10 h-11 w-11 inline-flex items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="relative px-6 pt-10 pb-7 text-center">
              {/* Las dos iniciales se acercan y quedan unidas por el corazón */}
              <div className="flex items-center justify-center">
                <motion.span
                  initial={reduce ? false : { x: -36, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ ...spring, delay: 0.05 }}
                  className="h-20 w-20 rounded-full bg-white text-slate-950 flex items-center justify-center text-2xl font-black"
                >
                  {initials(profile)}
                </motion.span>
                <motion.span
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...spring, delay: 0.25 }}
                  className="z-10 -mx-3 h-12 w-12 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center ring-4 ring-slate-950"
                >
                  <Heart className="h-5 w-5" fill="currentColor" aria-hidden="true" />
                </motion.span>
                <motion.span
                  initial={reduce ? false : { x: 36, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ ...spring, delay: 0.05 }}
                  className="h-20 w-20 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center text-2xl font-black"
                >
                  {initials(matchedProfile)}
                </motion.span>
              </div>

              <h2 id="match-title" className="mt-6 text-4xl font-black tracking-tight">¡Es un Match!</h2>
              <p className="mt-2 text-white/75 text-balance">
                Tú y {matchedProfile.nombre} se dieron like. Escríbele para coordinar una hora en la clínica.
              </p>

              {(matchedProfile.universidad || matchedProfile.comuna) && (
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
                  {matchedProfile.universidad && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-semibold">
                      <GraduationCap className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                      {matchedProfile.universidad}
                    </span>
                  )}
                  {matchedProfile.comuna && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-semibold">
                      <MapPin className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                      {matchedProfile.comuna}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-7 grid gap-2">
                <button ref={primaryRef} type="button" onClick={() => onSendMessage(matchedProfile)} className="btn-primary w-full min-h-[52px] text-base">
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Escribir por WhatsApp
                </button>
                <button type="button" onClick={onClose} className="inline-flex min-h-[48px] items-center justify-center rounded-full font-bold text-white/80 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30">
                  Seguir descubriendo
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MatchModal
