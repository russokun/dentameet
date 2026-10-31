import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

// Components
import Navbar, { PUBLIC_PATHS } from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import AppTabBar, { tabIndex } from '../components/layout/AppTabBar'
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
  <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Cargando">
    <div className="animate-spin motion-reduce:animate-none rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600"></div>
  </div>
)

// Contenedor de las pantallas de la app: deja espacio a la barra superior y, en móvil, a la inferior
const AppShell = ({ children }) => (
  <main className="min-h-screen bg-slate-50 pt-16 pb-24 lg:pb-12">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">{children}</div>
  </main>
)

// Transición entre pantallas de la app: deslizamiento corto en la dirección de las pestañas
// (patrón "page side-by-side" de transitions-dev: 250 ms, 8–16 px, desenfoque leve).
const pageVariants = {
  enter: ({ dir, reduce }) => (reduce ? { opacity: 0 } : { opacity: 0, x: dir * 16, filter: 'blur(3px)' }),
  // Al terminar se quitan filter y transform: un ancestro con filtro rompe position: fixed
  center: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }, transitionEnd: { filter: 'none', transform: 'none' } },
  exit: ({ dir, reduce }) =>
    reduce ? { opacity: 0, transition: { duration: 0.1 } } : { opacity: 0, x: dir * -16, filter: 'blur(3px)', transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } },
}

// Layout de las rutas privadas: protege, enmarca y anima el cambio de pantalla
const AppLayout = () => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  const outlet = useOutlet()
  const reduce = useReducedMotion()
  const prev = React.useRef(tabIndex(location.pathname))
  const current = tabIndex(location.pathname)
  const dir = current >= prev.current ? 1 : -1

  React.useEffect(() => {
    prev.current = current
  }, [current])

  // Esperar si está cargando o el perfil sigue indefinido
  if (loading || typeof profile === 'undefined') return <LoadingSpinner />
  // Si no hay usuario, redirigir a /auth
  if (!user) return <Navigate to="/auth" replace />
  // Si el perfil es null, redirigir a /profile/setup
  if (!profile) return <Navigate to="/profile/setup" replace />

  return (
    <AppShell>
      <AnimatePresence mode="wait" initial={false} custom={{ dir, reduce }}>
        <motion.div
          key={location.pathname}
          custom={{ dir, reduce }}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}

// Redirect authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { user, profile, loading } = useAuth()

  if (loading || typeof profile === 'undefined') return <LoadingSpinner />

  // Si hay usuario logueado, redirigir según tenga perfil o no
  if (user) return <Navigate to={profile ? '/dashboard' : '/profile/setup'} replace />

  return children
}

// Simple auth check for profile setup
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  return user ? <AppShell>{children}</AppShell> : <Navigate to="/auth" replace />
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

// Footer de marketing solo en páginas públicas; en la app, navegación inferior en móvil
const Chrome = () => {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const isPublic = PUBLIC_PATHS.includes(pathname)
  if (isPublic) return pathname === '/auth' ? null : <Footer />
  return user ? <AppTabBar /> : null
}

function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToHash />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-slate-900 focus:shadow-lg"
        >
          Saltar al contenido
        </a>
        <div className="min-h-screen bg-white">
          <Navbar />
          <div id="contenido">
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
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/my-matches" element={<MyMatches />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Chrome />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default AppRouter
