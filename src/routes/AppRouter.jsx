import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
  
  console.log('🔐 ProtectedRoute check:', { 
    path: window.location.pathname, 
    user: user?.id, 
    hasProfile: !!profile, 
    loading 
  })
  
  if (loading) return <LoadingSpinner />
  
  // No hay usuario -> redirect a auth
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  
  // Hay usuario pero no perfil -> redirect a profile setup
  if (!profile) {
    return <Navigate to="/profile/setup" replace />
  }
  
  // Todo OK -> mostrar contenido
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
  
  if (loading) return <LoadingSpinner />
  
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

function AppRouter() {
  return (
    <AuthProvider>
      <Router>
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
