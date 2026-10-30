import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import {
  Heart,
  Users,
  Target,
  Award,
  Shield,
  MapPin,
  Globe,
  Rocket
} from "lucide-react";
import { Link } from "react-router-dom";

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
      description: "Los estudiantes atienden en su clínica universitaria, con supervisión docente.",
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
        <title>Nosotros | DentaMeet-PacienteFácil</title>
        <meta name="description" content="Conoce la misión de DentaMeet-PacienteFácil: conectar a pacientes que buscan tratamientos accesibles con estudiantes de odontología en Chile." />
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
              Nuestro Propósito en Chile
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-tight">
              Reimaginando la <br />
              <span className="text-gradient">Odontología Social.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-medium">
              En DentaMeet creemos que la salud bucal es un derecho fundamental. Trabajamos para eliminar las barreras económicas que impiden el acceso a tratamientos dentales de calidad.
              Al mismo tiempo, apoyamos la formación de futuros odontólogos, proporcionándoles las herramientas y oportunidades necesarias para completar su educación clínica de manera efectiva.
            </p>
          </div>
        </div>
      </section>

      {/* Misión y Visión - Interactive Layout */}
      <section className="py-24 lg:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative reveal-on-scroll">
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 rotate-2">
                <img 
                  src="https://images.unsplash.com/photo-1629909613638-0e4a1fad8f81?auto=format&fit=crop&q=80&w=1000" 
                  alt="Sillón dental en una clínica" 
                  className="w-full h-[360px] sm:h-[480px] lg:h-[600px] object-cover"
                />
              </div>
              {/* Floating Decorative Card */}
              <div className="absolute -bottom-10 right-4 lg:-right-10 glass-card-light p-8 w-64 lg:w-72 shadow-2xl reveal-on-scroll">
                <MapPin className="h-9 w-9 text-emerald-600 mb-4" aria-hidden="true" />
                <div className="text-slate-900 font-black text-2xl mb-1">Hecho en Chile</div>
                <div className="text-slate-600 font-medium">Pensado para pacientes y facultades de odontología chilenas.</div>
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
                  Facilitar el acceso a tratamientos dentales de calidad a precios accesibles, mientras apoyamos la formación práctica de estudiantes de odontología, creando un impacto positivo en la salud bucal de la comunidad.
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
                  Ser la plataforma líder en Chile que conecte estudiantes de odontología con pacientes, transformando la educación clínica y democratizando el acceso a la salud bucal para todos los chilenos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores - Bento Cards */}
      <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 reveal-on-scroll">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Lo que nos define</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
              Los principios que guían cada decisión de producto y cada match.
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

      {/* Historias de Éxito - Premium Testimonials (Oculto temporalmente) */}
      {/* 
      <section className="py-32 bg-white overflow-hidden">
        ...
      </section> 
      */}

      {/* CTA Final */}
      <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[100px] -rotate-12 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 reveal-on-scroll">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight text-balance">¿Serás parte del cambio?</h2>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 font-medium">Estamos construyendo una forma más simple de acceder a la odontología. Súmate como paciente o como estudiante.</p>
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