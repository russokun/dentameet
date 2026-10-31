import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Heart, Users, Target, Award, Shield, MapPin, Rocket } from "lucide-react";

const VALUES = [
  { icon: Heart, title: "Salud como derecho", description: "Una sonrisa sana no debería ser un privilegio de pocos." },
  { icon: Users, title: "Academia y comunidad", description: "Unimos a las facultades con las personas que necesitan atención, y ganan los dos lados." },
  { icon: Shield, title: "Atención supervisada", description: "Los estudiantes atienden en su clínica universitaria, con supervisión docente." },
  { icon: Rocket, title: "Tecnología con propósito", description: "Diseñada para acercar la atención, no para distanciarla." },
];

const About = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal-on-scroll").forEach((el) => el.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white">
      <Helmet>
        <title>Nosotros | DentaMeet-PacienteFácil</title>
        <meta name="description" content="Conoce la misión de DentaMeet-PacienteFácil: conectar a pacientes que buscan tratamientos accesibles con estudiantes de odontología en Chile." />
      </Helmet>

      {/* Campo esmeralda: la idea en una frase */}
      <section className="bg-emerald-400 text-slate-950 pt-36 pb-16 lg:pt-44 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <h1 className="lg:col-span-7 text-5xl md:text-7xl font-black leading-[0.95] tracking-[-0.035em] text-balance">
            Odontología accesible, formación real.
          </h1>
          <p className="lg:col-span-5 text-lg md:text-xl font-medium leading-relaxed">
            Creemos que la salud bucal es un derecho. Por eso conectamos a quienes no pueden pagar una consulta privada con estudiantes que necesitan pacientes para completar su formación clínica.
          </p>
        </div>
      </section>

      {/* Misión y visión */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative reveal-on-scroll">
            <img
              src="https://images.unsplash.com/photo-1629909613638-0e4a1fad8f81?auto=format&fit=crop&q=80&w=1000"
              alt="Sillón dental en una clínica"
              className="w-full h-[360px] sm:h-[480px] lg:h-[560px] object-cover rounded-[2rem] outline outline-1 -outline-offset-1 outline-black/10"
              loading="lazy"
            />
            <div className="absolute -bottom-8 right-4 lg:-right-8 rounded-3xl bg-slate-950 text-white p-6 w-64" style={{ boxShadow: "0 24px 48px -20px rgb(2 6 23 / 0.6)" }}>
              <MapPin className="h-7 w-7 text-emerald-300 mb-3" aria-hidden="true" />
              <p className="text-xl font-black">Hecho en Chile</p>
              <p className="text-white/75 mt-1">Pensado para pacientes y facultades de odontología chilenas.</p>
            </div>
          </div>

          <div className="space-y-14 reveal-on-scroll">
            {[
              { icon: Target, title: "Nuestra misión", text: "Facilitar el acceso a tratamientos dentales de calidad a precios accesibles, mientras apoyamos la formación práctica de estudiantes de odontología." },
              { icon: Award, title: "Nuestra visión", text: "Ser la plataforma de Chile que conecte a estudiantes de odontología con pacientes, haciendo más simple la formación clínica y el acceso a la salud bucal." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <div className="flex items-center gap-4 mb-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{title}</h2>
                </div>
                <p className="text-lg md:text-xl text-slate-700 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valores: una lista sobre azul noche, no cuatro tarjetas iguales */}
      <section className="bg-slate-950 text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-balance">Lo que nos define.</h2>
            <p className="mt-5 text-lg text-white/75 leading-relaxed">Los principios que guían cada decisión de producto y cada match.</p>
          </div>
          <ul className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="reveal-on-scroll">
                <Icon className="h-7 w-7 text-emerald-300" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <p className="mt-2 text-white/75 leading-relaxed">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Cierre en el campo esmeralda */}
      <section className="bg-emerald-400 text-slate-950 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] text-balance">¿Serás parte del cambio?</h2>
            <p className="mt-5 text-lg md:text-xl font-medium">Súmate como paciente o como estudiante. Crear tu perfil es gratis.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/auth?mode=register" className="btn-premium-primary">Crear mi cuenta</Link>
            <Link to="/contact" className="btn-premium-accent bg-white hover:bg-white/80">Hablar con el equipo</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
