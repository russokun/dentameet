import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Instagram,
  Linkedin,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z" />
  </svg>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 },
    );

    document
      .querySelectorAll(".reveal-on-scroll")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent(`Consulta Web DentaMeet - ${formData.nombre}`);
    const body = encodeURIComponent(
      `Hola equipo de DentaMeet,\n\n` +
      `He enviado una consulta a través del sitio web:\n\n` +
      `👤 Nombre: ${formData.nombre}\n` +
      `📧 Email: ${formData.email}\n` +
      `💬 Mensaje: ${formData.mensaje}\n\n` +
      `Quedo atento a su respuesta.`
    );

    window.location.href = `mailto:contacto@dentameet.net?subject=${subject}&body=${body}`;

    toast({
      title: "Redirigiendo...",
      description: "Se abrirá tu cliente de correo para enviar el mensaje.",
    });

    setFormData({ nombre: "", email: "", mensaje: "" });
  };

  return (
    <div className="bg-white selection:bg-emerald-100">
      <Helmet>
        <title>Contacto | DentaMeet-PacienteFácil: Estamos para Ayudarte</title>
        <meta
          name="description"
          content="¿Tienes dudas sobre cómo unirte a DentaMeet-PacienteFácil o necesitas soporte técnico? Contáctanos y nuestro equipo de atención dental te responderá a la brevedad."
        />
      </Helmet>

      {/* Header - Simple & Clean */}
      <section className="relative pt-32 pb-20 bg-slate-950 mesh-gradient overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-8"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Canales de Atención Abiertos
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
            Hablemos de tu <br />
            <span className="text-gradient">próximo match.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            ¿Tienes Preguntas sobre DentaMeet? Estamos aquí para resolver tus
            dudas sobre la plataforma, alianzas o soporte técnico.
          </p>
        </div>
      </section>

      <section className="py-24 relative -mt-10 lg:-mt-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Info Column */}
            <div className="lg:col-span-5 space-y-8">
              <a
                href="mailto:contacto@dentameet.net?subject=Contacto%20desde%20la%20Web%20-%20DentaMeet&body=Hola%20equipo%20de%20DentaMeet%20%F0%9F%A6%B7%2C%0A%0AEstoy%20interesado%20en%20comunicarme%20con%20ustedes.%20Mis%20datos%20son%20los%20siguientes%3A%0A%F0%9F%91%A4%20Nombre%3A%0A%F0%9F%93%A7%20Correo%3A%0A%F0%9F%92%AC%20Motivo%20de%20consulta%3A%0A%0AQuedo%20atento%20a%20su%20respuesta.%0ASaludos."
                className="premium-card group reveal-on-scroll block cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 group-hover:scale-110 transition-transform">
                    <Mail className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">
                      Correo Electrónico
                    </h3>
                    <p className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      contacto@dentameet.net
                    </p>
                  </div>
                </div>
              </a>

              <a
                href="https://wa.me/56957384302?text=Hola%20DentaMeet%20%F0%9F%A6%B7%2C%20estoy%20interesado%20en%20comunicarme%20con%20ustedes.%20%F0%9F%93%A9%20Mis%20datos%20son%3A%0A%0A%F0%9F%91%A4%20Nombre%3A%0A%F0%9F%93%A7%20Correo%3A%0A%F0%9F%92%AC%20Motivo%20de%20consulta%3A"
                target="_blank"
                rel="noopener noreferrer"
                className="premium-card group reveal-on-scroll block cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-blue-500/10 group-hover:scale-110 transition-transform">
                    <Phone className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">
                      WhatsApp Soporte
                    </h3>
                    <p className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      +56 9 5738 4302
                    </p>
                  </div>
                </div>
              </a>

              <div className="premium-card group reveal-on-scroll">
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-rose-500/10">
                    <MapPin className="h-8 w-8 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">
                      Ubicación Central
                    </h3>
                    <p className="text-2xl font-bold text-slate-900">
                      Viña del Mar, Chile
                    </p>
                  </div>
                </div>
              </div>

              <div className="premium-card bg-slate-950 border-none reveal-on-scroll">
                <h3 className="text-xl font-bold text-white mb-6">
                  Nuestras Redes
                </h3>
                <div className="flex gap-4">
                  {[
                    {
                      icon: Instagram,
                      url: "https://instagram.com/pacientefacil",
                    },
                    { icon: TikTokIcon, url: "https://tiktok.com/@dentameet" },
                    {
                      icon: Linkedin,
                      url: "https://www.linkedin.com/company/pacientef%C3%A1cil/",
                    },
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      <social.icon className="h-6 w-6" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="premium-card bg-white shadow-2xl reveal-on-scroll">
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Envíanos un mensaje
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Te responderemos en menos de 24 horas hábiles.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                        placeholder="Ej. Valentina Rojas"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                      Tu Mensaje
                    </label>
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 resize-none"
                      placeholder="¿En qué podemos ayudarte?"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-premium-accent w-full py-5 text-xl group"
                  >
                    <Send className="mr-3 h-6 w-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    Enviar Consulta
                  </button>
                </form>

                <div className="mt-10 pt-10 border-t border-slate-100 flex items-center gap-4 text-slate-400">
                  <Clock className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-bold uppercase tracking-widest">
                    Respuesta Promedio: 12 Horas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Grid - Minimalist */}
      <section id="faq" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-16 reveal-on-scroll">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              <HelpCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <h2 className="text-4xl font-black text-slate-900">
              Preguntas Rápidas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { q: "¿Cómo funciona la plataforma?", a: "Conectamos estudiantes de odontología con pacientes según comuna, tratamiento necesario y disponibilidad de ambas partes." },
              { q: "¿Los tratamientos son seguros?", a: "Sí, todos los tratamientos son realizados por estudiantes bajo supervisión de profesionales calificados en clínicas universitarias." },
              { q: "¿Cuánto cuestan los tratamientos?", a: "Los precios varían desde tratamientos gratuitos hasta precios muy reducidos, dependiendo del tipo de tratamiento y la universidad." },
              { q: "¿Cómo me registro?", a: "Simplemente ve a la sección de registro, selecciona si eres paciente o estudiante, y completa el formulario correspondiente." },
              { q: "¿Cómo se gestionan los pagos?", a: "DentaMeet facilita el contacto; el acuerdo económico se realiza directamente en la clínica universitaria según el arancel vigente." },
              { q: "¿Quién supervisa los tratamientos?", a: "Absolutamente todos los procedimientos son guiados y validados por docentes odontólogos especialistas." },
              { q: "¿En qué regiones operan?", a: "Nuestra base central está en Viña del Mar (Región de Valparaíso), pero nuestra red abarca gran parte de la zona central y Santiago." },
              { q: "¿Cómo garantizan la seguridad?", a: "Verificamos la identidad de todos los usuarios y mantenemos un sistema de reputación bidireccional para asegurar la mejor experiencia." }
            ].map((faq, idx) => (
              <div key={idx} className="reveal-on-scroll">
                <h3 className="text-xl font-black text-slate-900 mb-3">
                  {faq.q}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
