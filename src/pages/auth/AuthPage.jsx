import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { Sparkles, Heart, ShieldCheck, Zap } from "lucide-react";
import Login from "./Login";
import Register from "./Register";
import { Link } from "react-router-dom";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden selection:bg-emerald-500/30">
      <Helmet>
        <title>{isLogin ? "Iniciar Sesión" : "Registrarse"} | DentaMeet</title>
        <meta name="description" content={isLogin ? "Accede a tu cuenta DentaMeet" : "Únete a la red dental más grande de Chile"} />
      </Helmet>

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 mesh-gradient opacity-40"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-6xl w-full mx-auto px-4 relative z-10 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Panel: Value Proposition (Desktop Only) */}
          <div className="hidden lg:block space-y-12 pr-12">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img src="/logonb.png" alt="DentaMeet Logo" className="h-14 w-14 object-contain" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white tracking-tighter">DentaMeet</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 font-black">PacienteFácil</span>
              </div>
            </Link>

            <div className="space-y-8">
              <h2 className="text-6xl font-black text-white leading-none tracking-tight">
                El futuro de la <br />
                <span className="text-gradient">salud dental.</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium leading-relaxed">
                Únete a miles de pacientes y profesionales que ya están transformando la odontología en Chile.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[
                { icon: ShieldCheck, title: "Seguridad Garantizada", desc: "Validación rigurosa de perfiles y supervisión clínica." },
                { icon: Zap, title: "Matches Inteligentes", desc: "Algoritmos que optimizan tiempo y cercanía." },
                { icon: Sparkles, title: "Impacto Social", desc: "Haciendo la salud accesible para toda la comunidad." }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 mt-1">
                    <feature.icon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{feature.title}</h4>
                    <p className="text-sm text-slate-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Auth Form Card */}
          <div className="w-full max-w-xl mx-auto lg:mx-0">
            <div className="glass-card-light bg-white/95 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 shadow-2xl border-white/20">
              
              {/* Mobile Logo */}
              <div className="flex lg:hidden justify-center mb-10">
                 <Link to="/" className="flex items-center space-x-3 group">
                    <div className="relative">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <img src="/logonb.png" alt="DentaMeet Logo" className="h-12 w-12 object-contain" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-900 tracking-tighter">DentaMeet</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold leading-none">PacienteFácil</span>
                    </div>
                 </Link>
              </div>

              {/* Tabs Container */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                    isLogin
                      ? "bg-white text-emerald-600 shadow-md"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 px-6 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                    !isLogin
                      ? "bg-white text-emerald-600 shadow-md"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Unirse
                </button>
              </div>

              {/* Forms with Animation */}
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <Login key="login" onSwitchToRegister={() => setIsLogin(false)} />
                ) : (
                  <Register key="register" onSwitchToLogin={() => setIsLogin(true)} />
                )}
              </AnimatePresence>

              {/* Legal Footer */}
              <div className="text-center mt-12 pt-8 border-t border-slate-100">
                <p className="text-slate-400 text-xs font-bold leading-relaxed">
                  Al continuar, declaras aceptar nuestros <br />
                  <Link to="/terms" className="text-slate-900 hover:text-emerald-600 underline">Términos de Servicio</Link> y <Link to="/privacy" className="text-slate-900 hover:text-emerald-600 underline">Política de Privacidad</Link>.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
