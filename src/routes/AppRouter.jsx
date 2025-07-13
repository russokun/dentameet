import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Layout components
import PublicLayout from '@/components/layout/PublicLayout'
import PrivateLayout from '@/components/layout/PrivateLayout'

// Public pages
import Home from '@/pages/Home'
import About from '@/pages/static/About'
import Contact from '@/pages/static/Contact'
import AuthPage from '@/pages/auth/AuthPage'

// Protected pages
import Dashboard from '@/pages/Dashboard'
import ProfileSetup from '@/pages/profile/ProfileSetup'
import Profile from '@/pages/profile/Profile'
import Matches from '@/pages/Matches'
import Appointments from '@/pages/Appointments'
import Feedback from '@/pages/Feedback'

// Route protection component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  
  return user ? children : <Navigate to="/auth" replace />
}

// Redirect authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  
  return !user ? children : <Navigate to="/dashboard" replace />
}

// Check if user needs to complete profile setup
const ProfileCheck = ({ children }) => {
  const { profile, user, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  
  // If user exists but no profile, redirect to setup
  if (user && !profile) {
    return <Navigate to="/profile/setup" replace />
  }
  
  return children
}

const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        <PublicLayout>
          <Home />
        </PublicLayout>
      } />
      
      <Route path="/nosotros" element={
        <PublicLayout>
          <About />
        </PublicLayout>
      } />
      
      <Route path="/contacto" element={
        <PublicLayout>
          <Contact />
        </PublicLayout>
      } />
      
      {/* Auth routes (only for non-authenticated users) */}
      <Route path="/auth" element={
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      } />
      
      <Route path="/registro" element={
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      } />
      
      {/* Protected routes */}
      <Route path="/profile/setup" element={
        <ProtectedRoute>
          <PrivateLayout>
            <ProfileSetup />
          </PrivateLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <ProfileCheck>
            <PrivateLayout>
              <Dashboard />
            </PrivateLayout>
          </ProfileCheck>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfileCheck>
            <PrivateLayout>
              <Profile />
            </PrivateLayout>
          </ProfileCheck>
        </ProtectedRoute>
      } />
      
      <Route path="/matches" element={
        <ProtectedRoute>
          <ProfileCheck>
            <PrivateLayout>
              <Matches />
            </PrivateLayout>
          </ProfileCheck>
        </ProtectedRoute>
      } />
      
      <Route path="/appointments" element={
        <ProtectedRoute>
          <ProfileCheck>
            <PrivateLayout>
              <Appointments />
            </PrivateLayout>
          </ProfileCheck>
        </ProtectedRoute>
      } />
      
      <Route path="/feedback" element={
        <ProtectedRoute>
          <ProfileCheck>
            <PrivateLayout>
              <Feedback />
            </PrivateLayout>
          </ProfileCheck>
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
