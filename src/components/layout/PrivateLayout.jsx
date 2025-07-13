import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  User,
  LogOut,
  Bell
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

const PrivateLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Matches', href: '/matches', icon: Users },
    { name: 'Citas', href: '/appointments', icon: Calendar },
    { name: 'Feedback', href: '/feedback', icon: MessageSquare },
    { name: 'Perfil', href: '/profile', icon: User },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-25" onClick={() => setSidebarOpen(false)} />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed top-0 left-0 bottom-0 flex flex-col w-64 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-[#00C853]" fill="currentColor" />
                <span className="text-xl font-bold text-[#1A237E]">DentaMeet</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#00C853] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="p-4 border-t">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center px-6 py-4 border-b">
            <Heart className="h-8 w-8 text-[#00C853]" fill="currentColor" />
            <div className="ml-2">
              <span className="text-xl font-bold text-[#1A237E]">DentaMeet</span>
              <span className="text-sm text-[#00C853] block leading-none">Dashboard</span>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#00C853] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.nombre || user?.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile?.role || 'Usuario'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex-1 lg:flex-none lg:w-0">
              <h1 className="text-lg font-semibold text-gray-900 ml-2 lg:ml-0">
                {navigation.find(nav => nav.href === location.pathname)?.name || 'DentaMeet'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>
              
              <div className="w-8 h-8 bg-[#00C853] rounded-full flex items-center justify-center lg:hidden">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default PrivateLayout
