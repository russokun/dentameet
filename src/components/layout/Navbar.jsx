
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Heart, LogOut, User, LayoutDashboard, Users, Calendar, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  // Navegación para usuarios no autenticados
  const publicNavItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Nosotros', path: '/about' },
    { name: 'Contacto', path: '/contact' },
  ];

  // Navegación para usuarios autenticados
  const privateNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Matches', path: '/matches', icon: Users },
    { name: 'Citas', path: '/appointments', icon: Calendar },
    { name: 'Feedback', path: '/feedback', icon: Star },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="relative">
              <Heart className="h-8 w-8 text-[#00C853]" fill="currentColor" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#1A237E] rounded-full"></div>
            </div>
            <div>
              <span className="text-xl font-bold text-[#1A237E]">DentaMeet</span>
              <span className="text-sm text-[#00C853] block leading-none">PacienteFácil</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {user ? (
              // Navegación para usuarios autenticados
              <>
                {privateNavItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive(item.path)
                          ? 'text-[#1A237E] bg-[#00C853]/10'
                          : 'text-gray-700 hover:text-[#1A237E] hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* User Menu */}
                <div className="flex items-center space-x-4 border-l border-gray-200 pl-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-[#1A237E] transition-colors px-3 py-2 rounded-md"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium md:hidden lg:inline">Mi Perfil</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-md"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Cerrar sesión</span>
                  </button>
                </div>
              </>
            ) : (
              // Navegación para usuarios no autenticados
              <>
                {publicNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? 'text-[#1A237E] bg-[#00C853]/10'
                        : 'text-gray-700 hover:text-[#1A237E] hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  to="/auth"
                  className="btn-primary text-sm px-6 py-2"
                >
                  Únete Ahora
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-[#1A237E] focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation mejorada */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white border-t"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {user ? (
                // Navegación móvil para usuarios autenticados
                <>
                  {privateNavItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 ${
                          isActive(item.path)
                            ? 'text-[#1A237E] bg-[#00C853]/10 shadow-md'
                            : 'text-gray-700 hover:text-[#1A237E] hover:bg-gray-100'
                        }`}
                        style={{ minHeight: 56 }}
                      >
                        <IconComponent className="h-6 w-6" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col gap-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-4 rounded-lg text-lg font-semibold text-gray-700 hover:text-[#1A237E] hover:bg-gray-100"
                      style={{ minHeight: 56 }}
                    >
                      <User className="h-6 w-6" />
                      <span>{profile?.nombre ? `${profile.nombre} - Mi Perfil` : 'Mi Perfil'}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full text-left px-4 py-4 rounded-lg text-lg font-semibold text-gray-600 hover:text-red-600 hover:bg-gray-100"
                      style={{ minHeight: 56 }}
                    >
                      <LogOut className="h-6 w-6" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </>
              ) : (
                // Navegación móvil para usuarios no autenticados
                <>
                  {publicNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 ${
                        isActive(item.path)
                          ? 'text-[#1A237E] bg-[#00C853]/10 shadow-md'
                          : 'text-gray-700 hover:text-[#1A237E] hover:bg-gray-100'
                      }`}
                      style={{ minHeight: 56 }}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center btn-primary mt-6 py-4 rounded-lg text-lg font-semibold"
                    style={{ minHeight: 56 }}
                  >
                    Únete Ahora
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
