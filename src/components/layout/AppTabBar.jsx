import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Heart, Users, Calendar, User } from 'lucide-react'

// Navegación inferior de la app en móvil: a una mano, con el pulgar.
export const APP_TABS = [
  { name: 'Panel', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Descubrir', path: '/matches', icon: Heart },
  { name: 'Matches', path: '/my-matches', icon: Users },
  { name: 'Citas', path: '/appointments', icon: Calendar },
  { name: 'Perfil', path: '/profile', icon: User },
]

const AppTabBar = () => (
  <nav
    aria-label="Navegación de la app"
    className="lg:hidden fixed bottom-0 inset-x-0 z-[90] bg-white/95 backdrop-blur-xl border-t border-slate-200 pb-[env(safe-area-inset-bottom)]"
  >
    <ul className="grid grid-cols-5">
      {APP_TABS.map(({ name, path, icon: Icon }) => (
        <li key={path}>
          <NavLink
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-h-[60px] text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:bg-emerald-50 ${
                isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-emerald-50' : ''}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={isActive ? 2.4 : 2} />
                </span>
                {name}
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
)

export default AppTabBar
