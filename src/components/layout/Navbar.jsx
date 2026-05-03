import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart, LogOut, User, LayoutDashboard, Users, Calendar, Star, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDarkHeaderPage = ["/", "/about", "/auth", "/contact"].includes(location.pathname);
  const useDarkText = scrolled || !isDarkHeaderPage;

  const publicNavItems = [
    { name: "Inicio", path: "/" },
    { name: "Nosotros", path: "/about" },
    { name: "Contacto", path: "/contact" },
  ];

  const privateNavItems = [
    { name: "Panel", path: "/dashboard", icon: LayoutDashboard },
    { name: "Matches", path: "/matches", icon: Users },
    { name: "Citas", path: "/appointments", icon: Calendar },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? "py-3" : "py-6"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`transition-all duration-500 rounded-[2rem] border ${
            scrolled 
              ? "bg-white/80 backdrop-blur-2xl border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] py-2 px-6" 
              : "bg-transparent border-transparent py-2 px-4"
          } flex justify-between items-center`}
        >
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 flex items-center justify-center transition-all duration-500">
                <img src="/logonb.png" alt="DentaMeet Logo" className="h-12 w-12 object-contain" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-black leading-none tracking-tighter transition-colors duration-500 ${
                useDarkText ? "text-slate-900" : "text-white"
              }`}>DentaMeet</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold">PacienteFácil</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-2">
            {(user ? privateNavItems : publicNavItems).map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                    active
                      ? scrolled ? "text-emerald-600" : "text-emerald-400"
                      : useDarkText 
                        ? "text-slate-500 hover:text-slate-900" 
                        : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.name}
                  {active && (
                    <motion.div 
                      layoutId="nav-pill"
                      className={`absolute inset-0 rounded-full -z-10 ${scrolled ? "bg-emerald-50" : "bg-white/10"}`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}

            <div className="w-6"></div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className={`p-2 rounded-xl transition-all ${useDarkText ? "hover:bg-slate-100 text-slate-600" : "hover:bg-white/10 text-white"}`}>
                  <User className="h-5 w-5" />
                </Link>
                <button onClick={() => signOut()} className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn-premium-accent px-8 py-3 text-sm">
                Unirse
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-3 rounded-2xl transition-all ${
              useDarkText ? "bg-slate-100 text-slate-900" : "bg-white/10 text-white"
            }`}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="lg:hidden absolute top-full left-0 right-0 px-4 pt-4"
          >
            <div className="bg-white/95 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 flex flex-col gap-4">
              {(user ? privateNavItems : publicNavItems).map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-6 py-5 rounded-2xl text-xl font-black transition-all ${
                    isActive(item.path) ? "bg-emerald-50 text-emerald-600" : "text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {item.name}
                  <ArrowRight className={`h-5 w-5 ${isActive(item.path) ? "opacity-100" : "opacity-20"}`} />
                </Link>
              ))}
              {!user && (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="btn-premium-accent w-full py-5 text-xl text-center mt-4"
                >
                  Unirse Ahora
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
