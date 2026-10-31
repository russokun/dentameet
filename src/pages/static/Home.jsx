import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Heart,
  Star,
  ArrowRight,
  ShieldCheck,
  MapPin,
  MessageCircle,
  GraduationCap,
  Lock,
  Building2,
  Stethoscope,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import MatchDeck from "../../components/home/MatchDeck";

// Solo afirmaciones verificables: sin cifras de impacto hasta tener datos del piloto
const facts = [
  { term: "Gratis para pacientes", detail: "Crear tu perfil y hacer match no cuesta nada.", icon: Heart },
  { term: "Supervisión docente", detail: "Los estudiantes atienden bajo supervisión de su facultad.", icon: ShieldCheck },
  { term: "Cerca de ti", detail: "Matches según tu región y comuna, en las 16 regiones.", icon: MapPin },
  { term: "Contacto directo", detail: "Tras el match coordinan por WhatsApp.", icon: MessageCircle },
];

const paths = [
  {
    title: "Si buscas tratamiento",
    icon: Heart,
    surface: "bg-white border border-slate-200",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    titleColor: "text-slate-900",
    bodyColor: "text-slate-600",
    stepBadge: "bg-emerald-50 text-emerald-700",
    steps: [
      { title: "Crea tu perfil", detail: "Cuéntanos qué tratamiento necesitas, tu comuna y tus horarios." },
      { title: "Haz match", detail: "Te mostramos estudiantes de odontología de tu zona que trabajan ese tratamiento." },
      { title: "Agenda tu hora", detail: "Coordinan por WhatsApp y te atiendes en la clínica de su universidad." },
    ],
  },
  {
    title: "Si estudias odontología",
    icon: GraduationCap,
    surface: "bg-slate-900",
    iconBg: "bg-white/10",
    iconColor: "text-emerald-400",
    titleColor: "text-white",
    bodyColor: "text-slate-300",
    stepBadge: "bg-white/10 text-emerald-300",
    steps: [
      { title: "Arma tu perfil clínico", detail: "Universidad, año de formación, especialidades y horarios disponibles." },
      { title: "Encuentra pacientes", detail: "Personas que necesitan justo los tratamientos que te faltan para tus ramos." },
      { title: "Atiende con respaldo", detail: "La atención ocurre en tu clínica universitaria, con supervisión docente." },
    ],
  },
];

const safeguards = [
  { title: "Tu teléfono no es público", detail: "Solo se comparte con la otra persona cuando ambos hacen match.", icon: Lock },
  { title: "Atención en clínicas universitarias", detail: "El tratamiento se hace en la clínica de la facultad, no en un lugar particular.", icon: Building2 },
  { title: "Supervisión de un docente", detail: "Cada estudiante atiende bajo la supervisión de su universidad.", icon: ShieldCheck },
  { title: "Opiniones después de cada cita", detail: "Pacientes y estudiantes se evalúan para cuidar a la comunidad.", icon: Star },
];

const heroStagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const Home = () => {
  const reduce = useReducedMotion();

  useEffect(() => {
    // Con movimiento reducido, las secciones aparecen de inmediato
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal-on-scroll").forEach((el) => el.classList.add("visible"));
      return;
    }

    // Intersection Observer para revelado premium
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white selection:bg-emerald-100 selection:text-emerald-900">
      <Helmet>
        <title>DentaMeet-PacienteFácil | Tratamientos dentales accesibles con estudiantes de odontología</title>
        <meta
          name="description"
          content="Encuentra tu match dental en DentaMeet-PacienteFácil. Conectamos a pacientes que buscan tratamientos accesibles con estudiantes de odontología que atienden con supervisión docente en Chile."
        />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "DentaMeet-PacienteFácil",
              "alternateName": "DentaMeet",
              "url": "https://dentameet-cl.vercel.app",
              "logo": "https://dentameet-cl.vercel.app/logonb.png",
              "description": "Plataforma chilena que conecta pacientes que buscan tratamientos dentales accesibles con estudiantes de odontología.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Viña del Mar",
                "addressRegion": "Valparaíso",
                "addressCountry": "CL"
              },
              "sameAs": [
                "https://www.instagram.com/pacientefacil/",
                "https://www.tiktok.com/@dentameet_pacientefacil",
                "https://www.linkedin.com/company/pacientef%C3%A1cil/"
              ]
            }
          `}
        </script>
      </Helmet>

      {/* Hero partido: cada mitad es un lado del match; el mazo de casos vive en la costura */}
      <section aria-label="Presentación" className="relative overflow-hidden bg-slate-950">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[100svh]">
          {/* Pacientes */}
          <div className="relative bg-emerald-400 text-slate-950 px-4 sm:px-8 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-[13.5rem] pt-32 pb-14 lg:pt-36 lg:pb-20 flex flex-col justify-center">
            <motion.div variants={heroStagger} initial={reduce ? false : "hidden"} animate="show" className="max-w-xl">
              <motion.h1 variants={heroItem} className="text-[2.75rem] sm:text-6xl xl:text-7xl font-black leading-[0.95] tracking-[-0.035em] text-balance">
                Tratamiento dental accesible.
              </motion.h1>
              <motion.p variants={heroItem} className="mt-6 text-lg sm:text-xl leading-relaxed font-medium max-w-md">
                Estudiantes de odontología te atienden en la clínica de su universidad, con supervisión docente. Crear tu perfil es gratis.
              </motion.p>
              <motion.div variants={heroItem} className="mt-9">
                <Link
                  to="/auth?rol=paciente"
                  className="group inline-flex items-center gap-2 min-h-[56px] px-7 rounded-full bg-slate-950 text-white text-lg font-bold hover:bg-slate-800 active:scale-[0.98] transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-950/30"
                >
                  Busco tratamiento
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Estudiantes */}
          <div className="relative text-white px-4 sm:px-8 lg:pr-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pl-[13.5rem] pt-12 pb-16 lg:pt-36 lg:pb-20 flex flex-col justify-center">
            {/* En móvil el mazo abre la mitad oscura; en escritorio se monta sobre la costura */}
            <div className="lg:hidden mb-14">
              <MatchDeck />
            </div>
            <motion.div variants={heroStagger} initial={reduce ? false : "hidden"} animate="show" className="max-w-xl lg:ml-auto">
              <motion.h2 variants={heroItem} className="text-[2.75rem] sm:text-6xl xl:text-7xl font-black leading-[0.95] tracking-[-0.035em] text-balance">
                Pacientes para tus ramos.
              </motion.h2>
              <motion.p variants={heroItem} className="mt-6 text-lg sm:text-xl leading-relaxed font-medium text-slate-300 max-w-md">
                Encuentra personas que necesitan justo los tratamientos que te faltan, cerca de tu clínica.
              </motion.p>
              <motion.div variants={heroItem} className="mt-9">
                <Link
                  to="/auth?rol=estudiante"
                  className="group inline-flex items-center gap-2 min-h-[56px] px-7 rounded-full bg-emerald-400 text-slate-950 text-lg font-bold hover:bg-emerald-300 active:scale-[0.98] transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/50"
                >
                  Soy estudiante
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Mazo sobre la costura (escritorio) */}
        <div className="hidden lg:flex absolute inset-y-0 left-1/2 -translate-x-1/2 w-[340px] items-center pt-16 z-10">
          <motion.div
            className="w-full"
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <MatchDeck />
          </motion.div>
        </div>
      </section>

      {/* Facts strip: only verifiable claims */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
            {facts.map((fact) => (
              <div key={fact.term} className="flex items-start gap-3">
                <fact.icon className="h-5 w-5 mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                <div>
                  <dt className="text-base font-bold text-slate-900">{fact.term}</dt>
                  <dd className="text-sm text-slate-600 leading-snug">{fact.detail}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works: one path per side of the match */}
      <section id="como-funciona" className="py-24 lg:py-32 bg-slate-50 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14 reveal-on-scroll">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight text-balance">
              Dos necesidades, un mismo match.
            </h2>
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
              Hay personas que necesitan tratamiento y no pueden pagar una consulta privada, y estudiantes que necesitan pacientes para aprobar sus ramos clínicos. DentaMeet los junta.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {paths.map((path) => (
              <article key={path.title} className={`rounded-[2rem] p-7 md:p-10 reveal-on-scroll ${path.surface}`}>
                <div className="flex items-center gap-3 mb-8">
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${path.iconBg}`}>
                    <path.icon className={`h-6 w-6 ${path.iconColor}`} aria-hidden="true" />
                  </span>
                  <h3 className={`text-2xl font-black tracking-tight ${path.titleColor}`}>{path.title}</h3>
                </div>
                <ol className="space-y-6">
                  {path.steps.map((step, i) => (
                    <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black tabular-nums ${path.stepBadge}`}>
                        {i + 1}
                      </span>
                      <div>
                        <p className={`font-bold ${path.titleColor}`}>{step.title}</p>
                        <p className={`mt-1 leading-relaxed ${path.bodyColor}`}>{step.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust: how safety works, stated plainly */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950 rounded-[2.5rem] lg:rounded-[3.5rem] p-8 md:p-14 lg:p-20 relative overflow-hidden reveal-on-scroll">
            <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[100px]" aria-hidden="true"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-5">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight text-balance">
                  Tu confianza va primero.
                </h2>
                <p className="mt-6 text-lg text-slate-300 leading-relaxed">
                  Que te atienda un estudiante genera preguntas. Así funciona la seguridad en DentaMeet.
                </p>
              </div>
              <ul className="lg:col-span-7 divide-y divide-white/10">
                {safeguards.map((item) => (
                  <li key={item.title} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                    <item.icon className="h-6 w-6 mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-white">{item.title}</p>
                      <p className="mt-1 text-slate-300 leading-relaxed">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 lg:py-32 relative">
        <div className="max-w-4xl mx-auto px-4 text-center reveal-on-scroll">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">
            ¡Listo para comenzar?
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 font-medium">
            Crea tu perfil gratis, como paciente o como estudiante.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth" className="btn-premium-accent text-xl px-12 py-5">
              Crear mi Cuenta Gratis
            </Link>
            <Link to="/auth?mode=login" className="btn-premium-primary text-xl px-12 py-5">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
