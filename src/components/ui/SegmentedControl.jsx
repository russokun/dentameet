import React, { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// Control segmentado con píldora que se desliza a la opción activa (patrón "tabs sliding").
// options: [{ value, label, count? }]
const SegmentedControl = ({ options, value, onChange, label, className = '', tone = 'light' }) => {
  const reduce = useReducedMotion()
  const id = useId()
  const dark = tone === 'dark'

  return (
    <div
      role="tablist"
      aria-label={label}
      className={`inline-grid gap-1 rounded-full p-1 ${dark ? 'bg-white/10' : 'bg-slate-200/70'} ${className}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`relative min-h-[40px] rounded-full px-4 text-sm font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              active ? 'text-slate-950' : dark ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`segmented-${id}`}
                className={`absolute inset-0 rounded-full ${dark ? 'bg-emerald-400' : 'bg-white'}`}
                style={dark ? undefined : { boxShadow: '0 1px 2px rgb(15 23 42 / 0.08), 0 2px 8px -2px rgb(15 23 42 / 0.12)' }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 40 }}
                aria-hidden="true"
              />
            )}
            <span className="relative inline-flex items-center gap-1.5 whitespace-nowrap">
              {option.label}
              {typeof option.count === 'number' && (
                <span className={`tabular-nums ${active ? 'text-slate-500' : 'opacity-70'}`}>{option.count}</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl
