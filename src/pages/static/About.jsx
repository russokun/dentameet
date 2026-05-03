import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Helmet } from "react-helmet";
import { 
  Heart, 
  Users, 
  Target, 
  Award, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  Quote, 
  Sparkles,
  ArrowRight,
  Globe,
  Rocket
} from "lucide-react";
import { Link } from "react-router-dom";
import { animate } from "animejs";

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

  return <span ref={ref} className="tabular-nums">0</span>;
};

const About = () => {
  useEffect(() => {
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

  const values = [
    {
      icon: Heart,
      title: "Salud como Derecho",
      description: "Nacimos con la convicción de que una sonrisa sana no debe ser un privilegio de pocos.",
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      icon: Users,
      title: "Colaboración Radical",
      description: "Unimos la academia y la comunidad en un ecosistema donde todos ganan.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: Shield,
      title: "Excelencia Clínica",
      description: "Garantizamos estándares superiores bajo supervisión profesional rigurosa.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      icon: Rocket,
      title: "Innovación con Propósito",
      description: "Tecnología diseñada para humanizar la atención, no para distanciarla.",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <div className="bg-white">
      <Helmet>
        <title>Sobre Nosotros | DentaMeet: Democratizando la Salud Bucal</title>
        <meta name="description" content="Conoce la historia, misión y los valores de la plataforma que está transformando la odontología social en Chile." />
      </Helmet>

      {/* Hero Section - Deep Vision */}
      <section className="relative pt-32 pb-24 bg-slate-950 overflow-hidden mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-8"
            >
              <Globe className="h-4 w-4 mr-2" />
              Nuestra Misión en Chile
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
              Reimaginando la <br />
              <span className="text-gradient">Odontología Social.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-medium">
              DentaMeet no es solo una plataforma; es un movimiento que busca eliminar las barreras entre el talento profesional y quienes más necesitan atención.
            </p>
          </div>
        </div>
      </section>

      {/* Misión y Visión - Interactive Layout */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative reveal-on-scroll">
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 rotate-2">
                <img 
                  src="https://images.unsplash.com/photo-1629909613638-0e4a1fad8f81?auto=format&fit=crop&q=80&w=1000" 
                  alt="Equipo DentaMeet" 
                  className="w-full h-[600px] object-cover"
                />
              </div>
              {/* Floating Decorative Card */}
              <div className="absolute -bottom-10 -right-10 glass-card-light p-10 w-72 shadow-2xl reveal-on-scroll">
                <Sparkles className="h-10 w-10 text-emerald-500 mb-4" />
                <div className="text-slate-900 font-black text-2xl mb-1">Impacto Real</div>
                <div className="text-slate-500 font-medium">Cambiando el paradigma de la salud dental.</div>
              </div>
            </div>

            <div className="space-y-16 reveal-on-scroll">
              <div>
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-2xl bg-emerald-100 mr-4">
                    <Target className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900">Nuestra Misión</h2>
                </div>
                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                  Democratizar el acceso a la salud bucal de alta calidad, conectando de forma inteligente a estudiantes de odontología con pacientes, reduciendo costos y optimizando la formación clínica.
                </p>
              </div>

              <div>
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-2xl bg-blue-100 mr-4">
                    <Award className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900">Nuestra Visión</h2>
                </div>
                <p className="text-xl text-slate-600 leading-relaxed font-medium">
                  Convertirnos en la infraestructura digital líder en Latinoamérica para la salud dental social, donde cada match represente un paso hacia una sociedad más sana y equitativa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores - Bento Cards */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 reveal-on-scroll">
            <h2 className="text-5xl font-black text-slate-900 mb-6">Lo que nos define</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              Principios innegociables que guían cada línea de código y cada match que realizamos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="premium-card group reveal-on-scroll">
                <div className={`p-4 rounded-2xl ${value.bg} w-fit mb-8 group-hover:scale-110 transition-transform`}>
                  <value.icon className={`h-10 w-10 ${value.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impacto - Visual Data */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950 rounded-[4rem] p-12 lg:p-24 relative overflow-hidden reveal-on-scroll">
            <div className="absolute top-0 left-0 w-full h-full mesh-gradient opacity-20"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
              {[
                { number: "14000", suffix: "+", label: "Matches Realizados" },
                { number: "40", suffix: "%", label: "Más Eficiencia Clínica" },
                { number: "95", suffix: "%", label: "Satisfacción Neta" },
                { number: "50", suffix: "+", label: "Aliados Académicos" }
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-6xl font-black text-white mb-4 tracking-tighter">
                    <StatNumber value={stat.number} />{stat.suffix}
                  </div>
                  <div className="text-emerald-500 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Historias de Éxito - Premium Testimonials */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8 reveal-on-scroll">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Voces de Cambio</h2>
              <p className="text-xl text-slate-600 font-medium">Historias reales de personas reales que han transformado su salud y su carrera a través de DentaMeet.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                name: "Laura Vega",
                role: "Paciente de Endodoncia",
                text: "Encontrar atención de calidad era un reto financiero. DentaMeet me conectó con una profesional increíble que no solo salvó mi pieza dental, sino mi confianza.",
                img: "https://i.pravatar.cc/150?u=laura"
              },
              {
                name: "Javier Rojas",
                role: "Estudiante de 5to Año",
                text: "La plataforma eliminó el estrés de buscar pacientes. Pude concentrarme en perfeccionar mi técnica y ayudar a personas que realmente lo valoran.",
                img: "https://i.pravatar.cc/150?u=javier"
              },
              {
                name: "Familia Torres",
                role: "Comunidad DentaMeet",
                text: "Como padres, los costos dentales son abrumadores. Aquí encontramos un aliado para el cuidado preventivo de nuestros hijos. Recomendado 100%.",
                img: "https://i.pravatar.cc/150?u=torres"
              }
            ].map((story, idx) => (
              <div key={idx} className="premium-card flex flex-col reveal-on-scroll">
                <Quote className="h-12 w-12 text-emerald-500/20 mb-8" />
                <p className="text-lg text-slate-700 italic mb-10 flex-grow font-medium">"{story.text}"</p>
                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                  <img src={story.img} alt={story.name} className="w-14 h-14 rounded-full border-4 border-slate-50" />
                  <div>
                    <h4 className="font-black text-slate-900">{story.name}</h4>
                    <p className="text-sm text-slate-500 font-bold">{story.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-40 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[100px] -rotate-12 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 reveal-on-scroll">
          <h2 className="text-6xl font-black text-slate-900 mb-8 tracking-tight">¿Serás parte del cambio?</h2>
          <p className="text-2xl text-slate-600 mb-12 font-medium">Estamos construyendo la red dental más humana del mundo. Solo faltas tú.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth" className="btn-premium-accent text-xl px-12 py-5 shadow-2xl">
              Unirse Ahora
            </Link>
            <Link to="/contact" className="btn-premium-primary text-xl px-12 py-5">
              Hablar con el Equipo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;