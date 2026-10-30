import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";
import Login from "./Login";
import Register from "./Register";
import { Link } from "react-router-dom";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { SOCIAL_LINKS } from "@/lib/contact";

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

      <div className="max-w-6xl w-full mx-auto px-4 relative z-10 pt-28 pb-12 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Panel: Value Proposition (Desktop Only) */}
          <div className="hidden lg:block space-y-12 pr-12">
            <div className="space-y-8">
              <h1 className="text-6xl font-black text-white leading-none tracking-tight">
                El futuro de la <br />
                <span className="text-gradient">salud dental.</span>
              </h1>
              <p className="text-xl text-slate-300 font-medium leading-relaxed">
                Conecta con estudiantes de odontología que atienden con supervisión docente, o encuentra pacientes para tus ramos clínicos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[
                { icon: ShieldCheck, title: "Contacto protegido", desc: "Tu teléfono solo se comparte cuando ambos hacen match." },
                { icon: Zap, title: "Matches por cercanía", desc: "Priorizamos personas de tu comuna y tu región." },
                { icon: Sparkles, title: "Gratis para pacientes", desc: "Crear tu perfil y hacer match no cuesta nada." }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 mt-1">
                    <feature.icon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{feature.title}</h4>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Auth Form Card */}
          <div className="w-full max-w-xl mx-auto lg:mx-0">
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl">
              
              {/* Tabs Container */}
              <div className={`${isSupabaseConfigured ? "flex" : "hidden"} bg-slate-100 p-1.5 rounded-2xl mb-10`}>
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
                {!isSupabaseConfigured ? (
                  <div key="vitrina" className="text-center py-4">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                      <Sparkles className="h-7 w-7 text-emerald-700" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Estamos preparando DentaMeet 2.0</h2>
                    <p className="mt-3 text-slate-700 leading-relaxed">
                      Las cuentas están pausadas mientras migramos la plataforma. Síguenos para enterarte cuando reabramos el registro.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="btn-premium-accent px-6 py-3">
                        Seguir en Instagram
                      </a>
                      <Link to="/contact" className="btn-secondary">
                        Escribirnos
                      </Link>
                    </div>
                  </div>
                ) : isLogin ? (
                  <Login key="login" onSwitchToRegister={() => setIsLogin(false)} />
                ) : (
                  <Register key="register" onSwitchToLogin={() => setIsLogin(true)} />
                )}
              </AnimatePresence>

              {/* Legal Footer */}
              {isSupabaseConfigured && (
                <p className="text-center mt-8 pt-6 border-t border-slate-100 text-slate-600 text-xs leading-relaxed">
                  Usamos tus datos solo para conectarte con tu match. Tu teléfono no es público.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
