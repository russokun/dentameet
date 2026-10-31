import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Link, useSearchParams } from "react-router-dom";
import { ShieldCheck, MapPin, Heart, Sparkles } from "lucide-react";
import Login from "./Login";
import Register from "./Register";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { SOCIAL_LINKS } from "@/lib/contact";

const FACTS = [
  { icon: ShieldCheck, title: "Contacto protegido", desc: "Tu teléfono solo se comparte cuando ambos hacen match." },
  { icon: MapPin, title: "Cerca de ti", desc: "Priorizamos personas de tu comuna y tu región." },
  { icon: Heart, title: "Gratis para pacientes", desc: "Crear tu perfil y hacer match no cuesta nada." },
];

// Acceso con el lenguaje del hero partido: campo esmeralda con la promesa, formulario sobre azul noche
const AuthPage = () => {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") === "login" ? "login" : params.get("rol") ? "register" : "login");
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-950">
      <Helmet>
        <title>{mode === "login" ? "Entrar" : "Crear cuenta"} | DentaMeet</title>
        <meta name="description" content="Entra o crea tu cuenta en DentaMeet para conectar con estudiantes de odontología o con pacientes." />
      </Helmet>

      {/* Campo esmeralda: la promesa */}
      <section className="bg-emerald-400 text-slate-950 px-4 sm:px-8 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-16 pt-28 pb-10 lg:py-0 flex flex-col justify-center">
        <div className="max-w-lg">
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[0.95] tracking-[-0.035em] text-balance">
            El match que cuida tu sonrisa.
          </h1>
          <p className="mt-5 text-lg font-medium leading-relaxed max-w-md">
            Pacientes y estudiantes de odontología, atendiendo en la clínica de la universidad con supervisión docente.
          </p>
          <ul className="mt-8 hidden sm:grid gap-4">
            {FACTS.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-emerald-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-black">{title}</span>
                  <span className="block text-slate-800">{desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Azul noche: el formulario */}
      <section className="px-4 sm:px-8 lg:pr-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pl-16 py-10 lg:pt-28 lg:pb-12 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
          <div className="app-card p-6 sm:p-8">
            {!isSupabaseConfigured ? (
              <div className="text-center py-4">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                  <Sparkles className="h-7 w-7 text-emerald-700" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Estamos preparando DentaMeet 2.0</h2>
                <p className="mt-3 text-slate-700 leading-relaxed">
                  Las cuentas están pausadas mientras migramos la plataforma. Síguenos para enterarte cuando reabramos el registro.
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    Seguir en Instagram
                  </a>
                  <Link to="/contact" className="btn-secondary">Escribirnos</Link>
                </div>
              </div>
            ) : (
              <>
                <SegmentedControl
                  label="Acceso"
                  className="w-full mb-7"
                  value={mode}
                  onChange={setMode}
                  options={[{ value: "login", label: "Entrar" }, { value: "register", label: "Crear cuenta" }]}
                />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: mode === "login" ? -12 : 12, filter: "blur(3px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }, transitionEnd: { filter: "none" } }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  >
                    {mode === "login" ? (
                      <Login onSwitchToRegister={() => setMode("register")} />
                    ) : (
                      <Register onSwitchToLogin={() => setMode("login")} />
                    )}
                  </motion.div>
                </AnimatePresence>
                <p className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600 leading-relaxed">
                  Usamos tus datos solo para conectarte con tu match. Tu teléfono no es público.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
