import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Helmet } from "react-helmet";
import {
  Users,
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  MapPin,
  Calendar,
  MessageCircle,
  Activity,
} from "lucide-react";
import { animate, createTimeline } from "animejs";

const StatNumber = ({ value }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && ref.current) {
      const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
      const obj = { n: 0 };
      
      animate(obj, {
        n: numericValue,
        duration: 1500,
        ease: "outExpo",
        onUpdate: () => {
          if (ref.current) {
            ref.current.innerText = Math.round(obj.n).toLocaleString('es-CL');
          }
        }
      });
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      0
    </span>
  );
};

const Home = () => {
  useEffect(() => {
    // Orquestación inicial con Anime.js v4
    const tl = createTimeline({
      defaults: { 
        ease: "outExpo", 
        duration: 1200 
      }
    });

    tl.add(".hero-content > *", {
      translateY: [40, 0],
      opacity: [0, 1],
      delay: (el, i) => i * 150,
    })
    .add(".hero-visual", {
      scale: [0.9, 1],
      opacity: [0, 1],
    }, "-=1000")
    .add(".hero-badge", {
      translateY: [-20, 0],
      opacity: [0, 1],
    }, "-=1200");

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

  const stats = [
    {
      number: "14000",
      suffix: "+",
      label: "Pacientes Impactados",
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      number: "40",
      suffix: "%",
      label: "Optimización de Agenda",
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      number: "0",
      label: "Costo de Adhesión",
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="bg-white selection:bg-emerald-100 selection:text-emerald-900">
      <Helmet>
        <title>DentaMeet-PacienteFácil | La Red Dental más Grande de Chile</title>
        <meta
          name="description"
          content="Encuentra tu match dental en DentaMeet-PacienteFácil. Conectamos a los mejores profesionales con pacientes para tratamientos accesibles, humanos y de alta calidad en todo Chile."
        />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "DentaMeet-PacienteFácil",
              "alternateName": "DentaMeet",
              "url": "https://dentameet.net",
              "logo": "https://dentameet.net/logonb.png",
              "description": "La red dental más grande de Chile que conecta pacientes y profesionales para una salud bucal accesible.",
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

      {/* Hero Section - Spatial Design */}
      <section className="relative min-h-screen flex items-center pt-20 bg-slate-950 overflow-hidden mesh-gradient">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
          
          {/* Spatial Grid */}
          <div 
            className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 hero-content">
              <div className="hero-badge inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-8 opacity-0">
                <Sparkles className="h-4 w-4 mr-2" />
                Impacto Social & Tecnología Dental
              </div>

              <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[1.1] tracking-tight opacity-0">
                Matches que <br />
                <span className="text-gradient">transforman vidas.</span>
              </h1>

              <p className="text-xl text-slate-400 mb-12 max-w-xl leading-relaxed opacity-0">
                DentaMeet es el puente entre el talento odontológico emergente y una comunidad que merece atención de alta calidad, accesible y humana.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 opacity-0">
                <Link to="/auth" className="btn-premium-accent group">
                  Unirse a la Red
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/about" className="btn-premium-glass">
                  Conocer el Modelo
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 hero-visual opacity-0 hidden lg:block perspective-1000">
              <div className="relative rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="glass-card p-4 float-slow">
                  <img
                    src="https://images.unsplash.com/photo-1629909613638-0e4a1fad8f81?auto=format&fit=crop&q=80&w=1000"
                    alt="Odontología de Vanguardia"
                    className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                  />
                  
                  {/* Floating Action Card */}
                  <div className="absolute -bottom-10 -left-10 glass-card-light p-6 w-64 reveal-on-scroll visible">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="text-emerald-600 h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-slate-900 font-bold">Match Exitoso</div>
                        <div className="text-slate-500 text-xs">Hace 2 minutos</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 font-medium italic">
                      "Excelente atención, calidad profesional increíble."
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Data visualization */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="premium-card group reveal-on-scroll">
                <div className={`p-4 rounded-2xl ${stat.bg} w-fit mb-8 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-10 w-10 ${stat.color}`} />
                </div>
                <div className="text-5xl font-black text-slate-900 mb-3 tracking-tighter">
                  <StatNumber value={stat.number} />
                  {stat.suffix}
                </div>
                <p className="text-lg text-slate-500 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features - The Ecosystem */}
      <section className="py-32 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24 reveal-on-scroll">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
              ¿Cómo Funciona DentaMeet?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
              Nuestra plataforma utiliza tecnología avanzada para crear conexiones perfectas entre estudiantes y pacientes, garantizando acceso a salud bucal de calidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pilares de Funcionamiento */}
            <div className="premium-card group reveal-on-scroll">
              <Sparkles className="h-12 w-12 mb-8 text-emerald-500" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Conexión Inteligente</h3>
              <p className="text-slate-600 leading-relaxed">
                Algoritmo que conecta pacientes y estudiantes según comuna, tratamiento y disponibilidad.
              </p>
            </div>

            <div className="premium-card group reveal-on-scroll">
              <Heart className="h-12 w-12 mb-8 text-blue-500" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Tratamientos Accesibles</h3>
              <p className="text-slate-600 leading-relaxed">
                Acceso a tratamientos dentales de calidad a precios reducidos o gratuitos.
              </p>
            </div>

            <div className="premium-card group reveal-on-scroll">
              <CheckCircle className="h-12 w-12 mb-8 text-emerald-500" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Formación Clínica</h3>
              <p className="text-slate-600 leading-relaxed">
                Apoyo a estudiantes de odontología para completar sus horas clínicas requeridas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Trust Layer */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950 rounded-[4rem] p-12 lg:p-24 relative overflow-hidden reveal-on-scroll">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div>
                <h2 className="text-5xl font-black text-white mb-8 tracking-tight">
                  Construyendo el Futuro de la Odontología Social
                </h2>
                <p className="text-slate-400 text-xl mb-12 leading-relaxed font-medium">
                  Miles de estudiantes y pacientes ya están redefiniendo el cuidado dental. No es solo atención médica, es empoderamiento profesional.
                </p>
                
                <div className="flex flex-col items-center gap-8">
                  <div className="flex -space-x-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-16 h-16 rounded-full border-4 border-slate-950 bg-slate-800 overflow-hidden ring-2 ring-emerald-500/20">
                        <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <div className="text-white text-4xl font-black">+5.000</div>
                    <div className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-2">Vidas Impactadas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 relative">
        <div className="max-w-4xl mx-auto px-4 text-center reveal-on-scroll">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-10 rotate-12">
            <Sparkles className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-6xl font-black text-slate-900 mb-8 tracking-tight">
            ¡Listo para comenzar?
          </h2>
          <p className="text-2xl text-slate-500 mb-12 font-medium">
            Únete hoy a la red que está humanizando la odontología profesional.
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
