
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Users, Heart, Star, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';

const Home = () => {
  const stats = [
    { number: '14,000+', label: 'Estudiantes de Odontología', icon: Users },
    { number: '40%', label: 'Reducción de Ausentismo', icon: TrendingUp },
    { number: '$0 CLP', label: 'Tratamientos Desde', icon: Heart },
  ];

  const testimonials = [
    {
      name: 'María González',
      role: 'Paciente',
      content: 'Gracias a DentaMeet pude acceder a un tratamiento de calidad a un precio que podía pagar. Los estudiantes son muy profesionales.',
      rating: 5,
    },
    {
      name: 'Carlos Mendoza',
      role: 'Estudiante de Odontología',
      content: 'La plataforma me ha ayudado a completar mis horas clínicas de manera eficiente. Es fácil de usar y muy útil.',
      rating: 5,
    },
    {
      name: 'Ana Rodríguez',
      role: 'Paciente',
      content: 'Excelente servicio. Pude encontrar rápidamente un estudiante en mi comuna para mi tratamiento de ortodoncia.',
      rating: 5,
    },
  ];

  const features = [
    {
      title: 'Conexión Inteligente',
      description: 'Algoritmo que conecta pacientes y estudiantes según comuna, tratamiento y disponibilidad.',
      icon: Heart,
    },
    {
      title: 'Tratamientos Accesibles',
      description: 'Acceso a tratamientos dentales de calidad a precios reducidos o gratuitos.',
      icon: CheckCircle,
    },
    {
      title: 'Formación Clínica',
      description: 'Apoyo a estudiantes de odontología para completar sus horas clínicas requeridas.',
      icon: Users,
    },
  ];

  return (
    <>
      <Helmet>
        <title>DentaMeet - PacienteFácil | Conectamos estudiantes y pacientes por una salud bucal accesible</title>
        <meta name="description" content="Plataforma digital que conecta estudiantes de odontología con pacientes que necesitan tratamientos dentales a bajo costo. Más de 14,000 estudiantes disponibles." />
      </Helmet>

      {/* Hero Section */}
      <section className="gradient-bg min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Conectamos estudiantes y pacientes por una 
                <span className="text-[#00C853]"> salud bucal accesible</span>
              </h1>
              <p className="text-xl mb-8 text-gray-200">
                Plataforma digital que facilita el acceso a tratamientos dentales de calidad 
                a bajo costo, mientras apoya la formación clínica de futuros odontólogos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth" className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center">
                  Registrarse Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/nosotros" className="glass-effect text-white border border-white/30 px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 text-center">
                  Conocer Más
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="floating-animation">
                <img  
                  className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto" 
                  alt="Estudiante de odontología atendiendo paciente"
                 src="https://images.unsplash.com/photo-1629909613638-0e4a1fad8f81" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center card-hover bg-gradient-to-br from-[#1A237E]/5 to-[#00C853]/5 p-8 rounded-2xl"
              >
                <stat.icon className="h-12 w-12 text-[#00C853] mx-auto mb-4" />
                <div className="text-4xl font-bold text-[#1A237E] mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1A237E] mb-4">
              ¿Cómo Funciona DentaMeet?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestra plataforma utiliza tecnología avanzada para crear conexiones perfectas 
              entre estudiantes y pacientes, garantizando acceso a salud bucal de calidad.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-lg card-hover"
              >
                <feature.icon className="h-12 w-12 text-[#00C853] mb-6" />
                <h3 className="text-xl font-bold text-[#1A237E] mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#1A237E] mb-4">
              Lo Que Dicen Nuestros Usuarios
            </h2>
            <p className="text-xl text-gray-600">
              Testimonios reales de pacientes y estudiantes que han usado nuestra plataforma
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#1A237E]/5 to-[#00C853]/5 p-8 rounded-2xl card-hover"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-[#1A237E]">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h2 className="text-4xl font-bold mb-6">
              ¿Listo para Comenzar?
            </h2>
            <p className="text-xl mb-8 text-gray-200">
              Únete a nuestra comunidad y forma parte del cambio hacia una salud bucal más accesible
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center">
                Registrarse Como Paciente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/auth" className="glass-effect text-white border border-white/30 px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300">
                Registrarse Como Estudiante
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
