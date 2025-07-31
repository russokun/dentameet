
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Linkedin } from 'lucide-react';

// TikTok icon component (custom SVG since Lucide doesn't have TikTok)
const TikTokIcon = ({ className }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z"/>
  </svg>
);
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    // Guardar mensaje en localStorage
    const mensajes = JSON.parse(localStorage.getItem('dentameet_mensajes') || '[]');
    const nuevoMensaje = {
      ...formData,
      fecha: new Date().toISOString(),
      id: Date.now()
    };
    
    mensajes.push(nuevoMensaje);
    localStorage.setItem('dentameet_mensajes', JSON.stringify(mensajes));

    toast({
      title: "¡Mensaje Enviado!",
      description: "Gracias por contactarnos. Te responderemos pronto.",
    });

    // Limpiar formulario
    setFormData({
      nombre: '',
      email: '',
      mensaje: ''
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Correo Electrónico',
      content: 'dentameet.devs@gmail.com',
      description: 'Escríbenos para cualquier consulta'
    },
    {
      icon: Phone,
      title: 'Teléfono',
      content: '+56 9 57384302',
      description: 'Lunes a Viernes, 9:00 - 18:00'
    },
    {
      icon: MapPin,
      title: 'Ubicación',
      content: 'Santiago, Chile',
      description: 'Región Metropolitana'
    }
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', url: '#' },
    { icon: Instagram, name: 'Instagram', url: '#' },
    { icon: TikTokIcon, name: 'TikTok', url: '#' },
    { icon: Linkedin, name: 'LinkedIn', url: '#' }
  ];

  return (
    <>
      <Helmet>
        <title>Contacto - DentaMeet PacienteFácil | Ponte en contacto con nosotros</title>
        <meta name="description" content="Contáctanos para resolver tus dudas sobre DentaMeet. Estamos aquí para ayudarte a conectar con estudiantes de odontología o encontrar pacientes." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-[#1A237E] mb-4">
              Contáctanos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ¿Tienes preguntas sobre DentaMeet? Estamos aquí para ayudarte. 
              Ponte en contacto con nosotros y te responderemos lo antes posible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Información de contacto */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-[#1A237E] mb-6">
                  Información de Contacto
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="bg-[#00C853] p-3 rounded-lg">
                        <info.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1A237E] mb-1">{info.title}</h3>
                        <p className="text-lg text-gray-800 mb-1">{info.content}</p>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Redes sociales */}
              <div>
                <h3 className="text-xl font-bold text-[#1A237E] mb-4">
                  Síguenos en Redes Sociales
                </h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 card-hover"
                      onClick={(e) => {
                        e.preventDefault();
                        toast({
                          title: "🚧 Esta función no está implementada aún",
                          description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo mensaje! 🚀"
                        });
                      }}
                    >
                      <social.icon className="h-6 w-6 text-[#1A237E]" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Imagen */}
              <div className="hidden lg:block">
                <img  
                  className="rounded-2xl shadow-lg w-full" 
                  alt="Equipo de DentaMeet trabajando"
                 src="https://images.unsplash.com/photo-1674775372047-27fb6492c9a2" />
              </div>
            </motion.div>

            {/* Formulario de contacto */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-[#1A237E] mb-6">
                Envíanos un Mensaje
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent transition-all duration-300"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent transition-all duration-300"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Escribe tu mensaje aquí..."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full btn-secondary py-4 text-lg font-semibold flex items-center justify-center"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Enviar Mensaje
                </Button>
              </form>

              {/* Información adicional */}
              <div className="mt-8 p-6 bg-gradient-to-br from-[#1A237E]/5 to-[#00C853]/5 rounded-lg">
                <h3 className="font-semibold text-[#1A237E] mb-2">
                  Tiempo de Respuesta
                </h3>
                <p className="text-sm text-gray-600">
                  Normalmente respondemos en menos de 24 horas durante días hábiles. 
                  Para consultas urgentes, puedes llamarnos directamente.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Mapa o información adicional */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-16 bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-[#1A237E] mb-6 text-center">
              Preguntas Frecuentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-[#1A237E] mb-2">
                  ¿Cómo funciona la plataforma?
                </h3>
                <p className="text-gray-600 text-sm">
                  Conectamos estudiantes de odontología con pacientes según comuna, 
                  tratamiento necesario y disponibilidad de ambas partes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#1A237E] mb-2">
                  ¿Los tratamientos son seguros?
                </h3>
                <p className="text-gray-600 text-sm">
                  Sí, todos los tratamientos son realizados por estudiantes bajo 
                  supervisión de profesionales calificados en clínicas universitarias.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#1A237E] mb-2">
                  ¿Cuánto cuestan los tratamientos?
                </h3>
                <p className="text-gray-600 text-sm">
                  Los precios varían desde tratamientos gratuitos hasta precios 
                  muy reducidos, dependiendo del tipo de tratamiento y la universidad.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#1A237E] mb-2">
                  ¿Cómo me registro?
                </h3>
                <p className="text-gray-600 text-sm">
                  Simplemente ve a la sección de registro, selecciona si eres 
                  paciente o estudiante, y completa el formulario correspondiente.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Contact;
