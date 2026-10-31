import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { LayoutDashboard, Heart, Users, Calendar, User } from 'lucide-react'

// Navegación de la app. El orden también define la dirección de la transición entre pantallas.
export const APP_TABS = [
  { name: 'Panel', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Descubrir', path: '/matches', icon: Heart },
  { name: 'Matches', path: '/my-matches', icon: Users },
  { name: 'Citas', path: '/appointments', icon: Calendar },
  { name: 'Perfil', path: '/profile', icon: User },
]

export const tabIndex = (pathname) => APP_TABS.findIndex((t) => pathname.startsWith(t.path))

// Barra inferior en móvil, a una mano: azul noche como el lado estudiante del hero,
// con una píldora esmeralda que se desliza a la pestaña activa.
const AppTabBar = () => {
  const { pathname } = useLocation()
  const reduce = useReducedMotion()

  return (
    <nav
      aria-label="Navegación de la app"
      className="lg:hidden fixed bottom-0 inset-x-0 z-[90] bg-slate-950 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5 px-1">
        {APP_TABS.map(({ name, path, icon: Icon }) => {
          const active = pathname.startsWith(path)
          return (
            <li key={path}>
              <NavLink
                to={path}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 min-h-[62px] text-[11px] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:text-emerald-300 ${
                  active ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <span className="relative flex h-8 w-14 items-center justify-center">
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-full bg-emerald-400"
                      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 38 }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    className={`relative h-5 w-5 ${active ? 'text-slate-950' : ''}`}
                    aria-hidden="true"
                    strokeWidth={active ? 2.4 : 2}
                  />
                </span>
                {name}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default AppTabBar
