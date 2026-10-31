import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, LogOut, User, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { APP_TABS } from "./AppTabBar";

export const PUBLIC_PATHS = ["/", "/about", "/contact", "/auth"];

const Brand = ({ to, dark }) => (
  <Link to={to} className="flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30">
    <img src="/logonb.png" alt="" className="h-11 w-11 object-contain" />
    <span className="flex flex-col">
      <span className={`text-2xl font-black leading-none tracking-tighter transition-colors duration-500 ${dark ? "text-slate-900" : "text-white"}`}>
        DentaMeet
      </span>
      <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${dark ? "text-emerald-700" : "text-emerald-400"}`}>PacienteFácil</span>
    </span>
  </Link>
);

// Barra de la app (rutas privadas): azul noche como el lado estudiante del hero; la píldora
// esmeralda marca la sección actual y se desliza entre ellas. En móvil la navegación vive abajo.
const AppNavbar = ({ onSignOut }) => {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  return (
    <header className="fixed top-0 inset-x-0 z-[100] bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Brand to="/dashboard" />

        <nav aria-label="Principal" className="hidden lg:flex items-center gap-1">
          {APP_TABS.filter((t) => t.path !== "/profile").map((item) => {
            const active = pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={`relative px-4 py-2 rounded-full text-sm font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40 ${
                  active ? "text-slate-950" : "text-white/70 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="app-nav-pill"
                    className="absolute inset-0 rounded-full bg-emerald-400"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }}
                    aria-hidden="true"
                  />
                )}
                <span className="relative">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <NavLink
            to="/profile"
            aria-label="Mi perfil"
            className={({ isActive }) =>
              `hidden lg:inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40 ${
                isActive ? "bg-emerald-400 text-slate-950" : "text-white/70 hover:text-white hover:bg-white/10"
              }`
            }
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </NavLink>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-rose-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-400/40"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location.pathname]);

  const isPublicPage = PUBLIC_PATHS.includes(location.pathname);
  if (user && !isPublicPage) return <AppNavbar onSignOut={() => signOut()} />;

  // En el home el hero es partido (verde | azul noche): la barra va sólida desde el inicio
  const solid = scrolled || ["/", "/auth", "/about"].includes(location.pathname);
  const useDarkText = solid;

  const navItems = user
    ? [{ name: "Ir a la app", path: "/dashboard" }]
    : [
        { name: "Inicio", path: "/" },
        { name: "Nosotros", path: "/about" },
        { name: "Contacto", path: "/contact" },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav aria-label="Principal" className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`transition-all duration-500 rounded-[2rem] border ${
            solid
              ? "bg-white/90 backdrop-blur-2xl border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] py-2 px-4 sm:px-6"
              : "bg-transparent border-transparent py-2 px-2 sm:px-4"
          } flex justify-between items-center`}
        >
          <Brand to="/" dark={useDarkText} />

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 ${
                    active
                      ? solid ? "text-emerald-700" : "text-emerald-400"
                      : useDarkText
                        ? "text-slate-600 hover:text-slate-900"
                        : "text-white/75 hover:text-white"
                  }`}
                >
                  {item.name}
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className={`absolute inset-0 rounded-full -z-10 ${solid ? "bg-emerald-50" : "bg-white/10"}`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}

            {!user && (
              <Link to="/auth" className="btn-premium-accent px-8 py-3 text-sm ml-4">
                Unirse
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="menu-movil"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            className={`lg:hidden h-12 w-12 inline-flex items-center justify-center rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 ${
              useDarkText ? "bg-slate-100 text-slate-900" : "bg-white/10 text-white"
            }`}
          >
            {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="menu-movil"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden absolute top-full left-0 right-0 px-4 pt-2"
          >
            <div className="bg-white rounded-[2rem] p-4 shadow-2xl border border-slate-100 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  aria-current={isActive(item.path) ? "page" : undefined}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl text-lg font-black transition-colors ${
                    isActive(item.path) ? "bg-emerald-50 text-emerald-700" : "text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {item.name}
                  <ArrowRight className={`h-5 w-5 ${isActive(item.path) ? "opacity-100" : "opacity-30"}`} aria-hidden="true" />
                </Link>
              ))}
              {!user && (
                <Link to="/auth" className="btn-premium-accent w-full py-4 text-lg text-center mt-2">
                  Unirse
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
