import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

// Components
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Toaster } from '../components/ui/toaster'

// Pages
import Home from '../pages/static/Home'
import About from '../pages/static/About'
import Contact from '../pages/static/Contact'
import AuthPage from '../pages/auth/AuthPage'
import ProfileSetup from '../pages/profile/ProfileSetup'
import Dashboard from '../pages/Dashboard'
import Matches from '../pages/Matches'
import MyMatches from '../pages/MyMatches'
import Appointments from '../pages/Appointments'
import Feedback from '../pages/Feedback'
import Profile from '../pages/Profile'

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
)

// Route protection component
const ProtectedRoute = ({ children }) => {
  const { user, profile, loading } = useAuth()
  console.log('🔒 ProtectedRoute check:', {
    path: window.location.pathname,
    user,
    profile,
    loading,
    profileType: typeof profile
  })

  // Esperar si está cargando o el perfil sigue indefinido
  if (loading || typeof profile === 'undefined') {
    console.log('🔒 ProtectedRoute: loading o perfil indefinido, mostrando spinner')
    return <LoadingSpinner />
  }

  // Si no hay usuario, redirigir a /auth
  if (!user) {
    console.log('🔒 ProtectedRoute: no user, redirigiendo a /auth')
    return <Navigate to="/auth" replace />
  }

  // Si el perfil es null, redirigir a /profile/setup
  if (!profile) {
    console.log('🔒 ProtectedRoute: perfil nulo, redirigiendo a /profile/setup')
    return <Navigate to="/profile/setup" replace />
  }

  // Si todo está bien, mostrar el contenido protegido
  console.log('🔒 ProtectedRoute: acceso permitido')
  return children
}

// Redirect authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { user, profile, loading } = useAuth()
  
  console.log('🌐 PublicRoute check:', { 
    path: window.location.pathname, 
    user: user?.id, 
    hasProfile: !!profile, 
    loading 
  })
  
  if (loading || typeof profile === 'undefined') return <LoadingSpinner />
  
  // Si hay usuario logueado, redirigir según tenga perfil o no
  if (user) {
    if (profile) {
      // Usuario completo -> dashboard
      console.log('🚀 Usuario completo, redirigiendo a dashboard')
      return <Navigate to="/dashboard" replace />
    } else {
      // Usuario sin perfil -> profile setup
      console.log('📝 Usuario sin perfil, redirigiendo a profile setup')
      return <Navigate to="/profile/setup" replace />
    }
  }
  
  // No hay usuario -> mostrar contenido público
  return children
}

// Simple auth check for profile setup
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  
  return user ? children : <Navigate to="/auth" replace />
}

// Scroll to top/hash on route change
const ScrollToHash = () => {
  const { pathname, hash } = useLocation();

  React.useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname, hash]);

  return null;
};

function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToHash />
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* AUTH ROUTES */}
            <Route path="/auth" element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            } />
            
            {/* PROFILE SETUP - Semi-protected */}
            <Route path="/profile/setup" element={
              <RequireAuth>
                <ProfileSetup />
              </RequireAuth>
            } />
            
            {/* PROTECTED ROUTES */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <main className="container mx-auto px-4 py-6">
                  <Dashboard />
                </main>
              </ProtectedRoute>
            } />
            
            <Route path="/matches" element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            } />

            <Route path="/my-matches" element={
              <ProtectedRoute>
                <MyMatches />
              </ProtectedRoute>
            } />
            
            <Route path="/appointments" element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            } />
            
            <Route path="/feedback" element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default AppRouter
