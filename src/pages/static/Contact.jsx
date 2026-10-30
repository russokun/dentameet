import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import {
  Phone,
  MapPin,
  Send,
  Instagram,
  Linkedin,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { SOCIAL_LINKS, WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/contact";

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z" />
  </svg>
);

const PERFILES = [
  { value: "paciente", label: "Paciente" },
  { value: "estudiante", label: "Estudiante de odontología" },
  { value: "institucion", label: "Universidad o clínica" },
  { value: "otro", label: "Otro" },
];

const FAQS = [
  { q: "¿Cómo funciona la plataforma?", a: "Conectamos estudiantes de odontología con pacientes según comuna, tratamiento necesario y disponibilidad de ambas partes." },
  { q: "¿Los tratamientos son seguros?", a: "La atención se realiza en clínicas universitarias, donde los procedimientos de los estudiantes son supervisados por docentes." },
  { q: "¿Cuánto cuestan los tratamientos?", a: "Usar DentaMeet es gratis. El tratamiento se paga en la clínica universitaria según su arancel, que suele ser mucho menor que una consulta privada; algunos son gratuitos." },
  { q: "¿Cómo me registro?", a: "Ve a la sección de registro, elige si eres paciente o estudiante y completa tu perfil." },
  { q: "¿Cómo se gestionan los pagos?", a: "DentaMeet facilita el contacto; el pago se hace directamente en la clínica universitaria, según el arancel vigente." },
  { q: "¿Quién supervisa los tratamientos?", a: "Los docentes de la facultad de cada estudiante, en la clínica universitaria." },
  { q: "¿En qué regiones operan?", a: "Puedes registrarte desde cualquier región de Chile; el match prioriza a personas de tu misma comuna y región." },
  { q: "¿Cómo cuidan mi información?", a: "Tu teléfono solo se comparte con la otra persona después de un match mutuo, y pacientes y estudiantes se evalúan tras cada cita." },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    perfil: "paciente",
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
    if (!formData.nombre.trim() || !formData.mensaje.trim()) {
      toast({
        title: "Faltan datos",
        description: "Escribe tu nombre y tu mensaje para poder abrir WhatsApp.",
        variant: "destructive",
      });
      return;
    }

    const perfil = PERFILES.find((p) => p.value === formData.perfil)?.label ?? formData.perfil;
    const text =
      `Hola DentaMeet, soy ${formData.nombre.trim()} (${perfil.toLowerCase()}).\n\n` +
      formData.mensaje.trim();

    window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");
    setFormData({ nombre: "", perfil: formData.perfil, mensaje: "" });
  };

  return (
    <div className="bg-white selection:bg-emerald-100">
      <Helmet>
        <title>Contacto | DentaMeet-PacienteFácil</title>
        <meta
          name="description"
          content="¿Dudas sobre DentaMeet-PacienteFácil? Escríbenos por WhatsApp: pacientes, estudiantes de odontología y universidades."
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
            <MessageSquare className="h-4 w-4 mr-2" aria-hidden="true" />
            Te respondemos por WhatsApp
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight text-balance">
            Hablemos de tu <br />
            <span className="text-gradient">próximo match.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            ¿Tienes preguntas sobre DentaMeet? Escríbenos por WhatsApp: dudas
            sobre la plataforma, alianzas con universidades o soporte.
          </p>
        </div>
      </section>

      <section className="py-24 relative -mt-10 lg:-mt-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Info Column */}
            <div className="lg:col-span-5 space-y-8">
              <a
                href={whatsappUrl("Hola DentaMeet, tengo una consulta:")}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-card group reveal-on-scroll block cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
              >
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 group-hover:scale-110 transition-transform">
                    <Phone className="h-8 w-8 text-emerald-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 mb-1">
                      WhatsApp
                    </h3>
                    <p className="text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {WHATSAPP_DISPLAY}
                    </p>
                  </div>
                </div>
              </a>

              <div className="premium-card group reveal-on-scroll">
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-rose-500/10">
                    <MapPin className="h-8 w-8 text-rose-500" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 mb-1">
                      Base del equipo
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
                    { icon: Instagram, url: SOCIAL_LINKS.instagram, label: "Instagram" },
                    { icon: TikTokIcon, url: SOCIAL_LINKS.tiktok, label: "TikTok" },
                    { icon: Linkedin, url: SOCIAL_LINKS.linkedin, label: "LinkedIn" },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`DentaMeet en ${social.label}`}
                      className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-emerald-500 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40"
                    >
                      <social.icon className="h-6 w-6" aria-hidden="true" />
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
                  <p className="text-slate-600 font-medium">
                    Lo abrimos en WhatsApp con tu mensaje listo para enviar.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label htmlFor="contact-nombre" className="text-sm font-bold text-slate-700 ml-1">
                        Tu nombre
                      </label>
                      <input
                        id="contact-nombre"
                        type="text"
                        name="nombre"
                        autoComplete="name"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-500"
                        placeholder="Ej. Valentina Rojas"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contact-perfil" className="text-sm font-bold text-slate-700 ml-1">
                        Escribes como
                      </label>
                      <select
                        id="contact-perfil"
                        name="perfil"
                        value={formData.perfil}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                      >
                        {PERFILES.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contact-mensaje" className="text-sm font-bold text-slate-700 ml-1">
                      Tu mensaje
                    </label>
                    <textarea
                      id="contact-mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-500 resize-none"
                      placeholder="¿En qué podemos ayudarte?"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-premium-accent w-full py-5 text-lg group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/40"
                  >
                    <Send className="mr-3 h-5 w-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                    Continuar en WhatsApp
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Grid - Minimalist */}
      <section id="faq" className="py-24 lg:py-32 bg-slate-50 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-16 reveal-on-scroll">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
              <HelpCircle className="h-6 w-6 text-emerald-600" aria-hidden="true" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {FAQS.map((faq, idx) => (
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
