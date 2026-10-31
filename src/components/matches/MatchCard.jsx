import React, { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, X, MapPin, GraduationCap, User, Sparkles, Check } from 'lucide-react'

const ROLE = {
  estudiante: { label: 'Estudiante', icon: GraduationCap },
  paciente: { label: 'Paciente', icon: User },
  dentameeter: { label: 'DentaMeeter', icon: Sparkles },
}

const initials = (p) =>
  `${(p.nombre || '').trim().charAt(0)}${(p.apellido || '').trim().charAt(0)}`.toUpperCase() || '?'

const MatchCard = forwardRef(({ profile, onLike, onPass, isTopCard = false }, ref) => {
  const [isDragging, setIsDragging] = useState(false)
  const [exitDirection, setExitDirection] = useState(null)

  const role = ROLE[profile.role] || ROLE.paciente
  const RoleIcon = role.icon
  const tags = (profile.role === 'paciente' ? profile.tratamientos_interes : profile.especialidades) || []
  const shownTags = tags.slice(0, 3)
  const hiddenTags = tags.length - shownTags.length
  const score = Number.isFinite(profile.compatibilityScore) && profile.compatibilityScore >= 30 ? profile.compatibilityScore : null

  const handleLike = () => {
    setExitDirection('right')
    setTimeout(() => onLike(profile), 250)
  }

  const handlePass = () => {
    setExitDirection('left')
    setTimeout(() => onPass(profile), 250)
  }

  const cardVariants = {
    initial: { scale: 0.96, opacity: 0, y: 24 },
    animate: {
      scale: isTopCard ? 1 : 0.96,
      opacity: isTopCard ? 1 : 0.7,
      y: isTopCard ? 0 : 12,
      zIndex: isTopCard ? 20 : 10,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      x: exitDirection === 'right' ? 320 : exitDirection === 'left' ? -320 : 0,
      opacity: 0,
      rotate: exitDirection === 'right' ? 18 : exitDirection === 'left' ? -18 : 0,
      transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={`absolute inset-0 ${isTopCard ? 'cursor-grab active:cursor-grabbing touch-pan-y' : ''}`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      drag={isTopCard ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false)
        if (Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 600) {
          if (info.offset.x > 0) handleLike()
          else handlePass()
        }
      }}
      whileDrag={{ rotate: 4 }}
      aria-hidden={!isTopCard}
    >
      <article
        aria-label={`${profile.nombre || 'Perfil'}, ${role.label.toLowerCase()}`}
        className={`h-full flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden transition-shadow duration-200 ${
          isDragging ? 'shadow-2xl' : 'shadow-[0_20px_40px_-20px_rgba(15,23,42,0.25)]'
        } ${!isTopCard ? 'pointer-events-none' : ''}`}
      >
        {/* Identidad: sin fotos en 1.x, las iniciales sobre la superficie de marca */}
        <div className="relative h-44 sm:h-64 shrink-0 bg-slate-950 flex items-center justify-center overflow-hidden">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative h-28 w-28 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-4xl font-black tracking-tight text-white">{initials(profile)}</span>
          </div>

          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-900">
            <RoleIcon className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            {role.label}
          </span>

          {score !== null && (
            <span className="absolute top-4 right-4 rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950 tabular-nums">
              {score}% compatible
            </span>
          )}
        </div>

        {/* Información */}
        <div className="flex-1 min-h-0 overflow-hidden p-5 sm:p-6 flex flex-col">
          <h3 className="shrink-0 text-2xl font-black tracking-tight text-slate-900 truncate">
            {profile.nombre} {profile.apellido}
          </h3>
          <p className="shrink-0 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
            {profile.edad && <span>{profile.edad} años</span>}
            {profile.comuna && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {profile.comuna}
              </span>
            )}
          </p>

          {profile.universidad && (
            <p className="shrink-0 mt-3 flex items-start gap-2 text-sm text-slate-700">
              <GraduationCap className="h-4 w-4 mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
              <span>
                <span className="font-semibold">{profile.universidad}</span>
                {profile.etapa_formacion && <span className="text-slate-600"> · {profile.etapa_formacion}</span>}
              </span>
            </p>
          )}

          {profile.descripcion && (
            <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-2">{profile.descripcion}</p>
          )}

          {profile.matchReasons?.length > 0 && (
            <ul className="shrink-0 mt-3 space-y-1" aria-label="Por qué aparece">
              {profile.matchReasons.slice(0, 3).map((reason) => (
                <li key={reason} className="flex items-start gap-1.5 text-sm font-semibold text-emerald-800">
                  <Check className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                  {reason}
                </li>
              ))}
            </ul>
          )}

          {shownTags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={profile.role === 'paciente' ? 'Tratamientos que busca' : 'Especialidades'}>
              {shownTags.map((item) => (
                <li key={item} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {item}
                </li>
              ))}
              {hiddenTags > 0 && (
                <li className="rounded-full px-2 py-1 text-xs font-semibold text-slate-600">+{hiddenTags} más</li>
              )}
            </ul>
          )}

          {/* Acciones */}
          <div className="shrink-0 mt-auto pt-4 flex justify-center gap-6">
            <button
              type="button"
              onClick={handlePass}
              aria-label={`Pasar a ${profile.nombre || 'este perfil'}`}
              className="h-16 w-16 rounded-full bg-white text-slate-500 flex items-center justify-center shadow-[inset_0_0_0_2px_rgb(15_23_42/0.12)] hover:text-rose-600 hover:bg-rose-50 active:scale-[0.96] transition-[background-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/30"
            >
              <X className="h-7 w-7" aria-hidden="true" />
            </button>
            <motion.button
              type="button"
              onClick={handleLike}
              aria-label={`Dar like a ${profile.nombre || 'este perfil'}`}
              whileTap={{ scale: 0.96 }}
              className="h-16 w-16 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-[0_10px_24px_-8px_rgba(16,185,129,0.65)] hover:bg-emerald-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40"
            >
              <motion.span
                animate={exitDirection === 'right' ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                transition={{ duration: 0.3, ease: [0.34, 1.36, 0.64, 1] }}
                className="inline-flex"
              >
                <Heart className="h-7 w-7" fill="currentColor" aria-hidden="true" />
              </motion.span>
            </motion.button>
          </div>
        </div>
      </article>
    </motion.div>
  )
})

MatchCard.displayName = 'MatchCard'

export default MatchCard
