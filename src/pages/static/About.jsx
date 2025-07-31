import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Heart, Users, Target, Award, TrendingUp, Shield, CheckCircle, Quote } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: 'Accesibilidad',
      description: 'Creemos que la salud bucal debe ser accesible para todos, sin importar su situación económica.'
    },
    {
      icon: Users,
      title: 'Comunidad',
      description: 'Fomentamos una comunidad colaborativa entre estudiantes, pacientes y profesionales.'
    },
    {
      icon: Shield,
      title: 'Calidad',
      description: 'Garantizamos tratamientos de calidad bajo supervisión profesional constante.'
    },
    {
      icon: TrendingUp,
      title: 'Innovación',
      description: 'Utilizamos tecnología para optimizar la conexión entre estudiantes y pacientes.'
    }
  ];

  const stats = [
    { number: '14,000+', label: 'Estudiantes Registrados' },
    { number: '40%', label: 'Reducción de Ausentismo' },
    { number: '95%', label: 'Satisfacción de Pacientes' },
    { number: '50+', label: 'Universidades Aliadas' }
  ];

  const successStories = [
    {
      name: 'Laura Vega',
      role: 'Paciente',
      story: 'Tenía un dolor de muelas terrible y no podía costear un dentista particular. Gracias a DentaMeet, encontré a una estudiante maravillosa que me hizo un tratamiento de endodoncia. ¡Me salvó! Estoy muy agradecida.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956'
    },
    {
      name: 'Javier Rojas',
      role: 'Estudiante de Odontología, U. de Chile',
      story: 'Estaba estresado por no encontrar suficientes pacientes para mi clínica. DentaMeet fue la solución. Pude completar mis horas, practicar mis habilidades y, lo más importante, ayudar a personas que realmente lo necesitaban.',
      image: 'https://images.unsplash.com/photo-1615109398623-88346a601842'
    },
    {
      name: 'Familia Torres',
      role: 'Pacientes',
      story: 'Como familia, los costos dentales se acumulaban. En DentaMeet encontramos una solución para los controles de nuestros hijos. La atención fue profesional y los estudiantes, muy dedicados. ¡Totalmente recomendado!',
      image: 'https://images.unsplash.com/photo-1555952494-035df0749e32'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Nosotros - DentaMeet PacienteFácil | Nuestra misión y visión</title>
        <meta name="description" content="Conoce más sobre DentaMeet, nuestra misión de facilitar el acceso a la salud bucal y apoyar la formación clínica de estudiantes de odontología." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="gradient-bg py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center text-white"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Sobre DentaMeet
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto">
                Transformamos la forma en que estudiantes y pacientes se conectan, 
                creando un ecosistema de salud bucal accesible y educación práctica de calidad.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Misión y Visión */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <img 
                  className="rounded-2xl shadow-lg w-full" 
                  alt="Estudiantes de odontología en clínica universitaria" src="https://images.unsplash.com/photo-1674775372047-27fb6492c9a2" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <div className="flex items-center mb-4">
                    <Target className="h-8 w-8 text-[#00C853] mr-3" />
                    <h2 className="text-3xl font-bold text-[#1A237E]">Nuestra Misión</h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Facilitar el acceso a tratamientos dentales de calidad a precios accesibles, 
                    mientras apoyamos la formación práctica de estudiantes de odontología, 
                    creando un impacto positivo en la salud bucal de la comunidad.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-4">
                    <Award className="h-8 w-8 text-[#1A237E] mr-3" />
                    <h2 className="text-3xl font-bold text-[#1A237E]">Nuestra Visión</h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Ser la plataforma líder en Chile que conecte estudiantes de odontología 
                    con pacientes, transformando la educación clínica y democratizando 
                    el acceso a la salud bucal para todos los chilenos.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-[#1A237E] mb-4">
                Nuestros Valores
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Los principios que guían cada decisión y acción en DentaMeet
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-lg card-hover text-center"
                >
                  <value.icon className="h-12 w-12 text-[#00C853] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#1A237E] mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Estadísticas */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-[#1A237E] mb-4">
                Nuestro Impacto
              </h2>
              <p className="text-xl text-gray-600">
                Números que reflejan nuestro compromiso con la comunidad
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-5xl font-bold text-[#00C853] mb-2">{stat.number}</div>
                  <div className="text-lg text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Historias de Éxito */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-[#1A237E] mb-4">
                Historias de Éxito
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Descubre cómo DentaMeet está cambiando la vida de estudiantes y pacientes en todo Chile.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {successStories.map((story, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white p-8 rounded-2xl shadow-lg card-hover flex flex-col"
                >
                  <Quote className="h-10 w-10 text-[#00C853] mb-4" />
                  <p className="text-gray-600 italic mb-6 flex-grow">"{story.story}"</p>
                  <div className="flex items-center mt-auto">
                    <img 
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                      alt={story.name} src="https://images.unsplash.com/photo-1626447857058-2ba6a8868cb5" />
                    <div>
                      <h3 className="font-bold text-[#1A237E]">{story.name}</h3>
                      <p className="text-sm text-gray-500">{story.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Propósito Social */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <h2 className="text-4xl font-bold text-[#1A237E]">
                  Nuestro Propósito Social
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  En DentaMeet creemos que la salud bucal es un derecho fundamental. 
                  Trabajamos para eliminar las barreras económicas que impiden el acceso 
                  a tratamientos dentales de calidad.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Al mismo tiempo, apoyamos la formación de futuros odontólogos, 
                  proporcionándoles las herramientas y oportunidades necesarias para 
                  completar su educación clínica de manera efectiva.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-[#00C853] mr-3" />
                    <span className="text-gray-700">Reducción del 40% en ausentismo clínico</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-[#00C853] mr-3" />
                    <span className="text-gray-700">Tratamientos accesibles desde $0 CLP</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-[#00C853] mr-3" />
                    <span className="text-gray-700">Conexión inteligente por comuna y especialidad</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <img 
                  className="rounded-2xl shadow-lg w-full" 
                  alt="Pacientes sonriendo después de tratamiento dental" src="https://images.unsplash.com/photo-1563902244988-42d466e79b25" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="gradient-bg py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h2 className="text-4xl font-bold mb-6">
                Únete a Nuestra Misión
              </h2>
              <p className="text-xl mb-8 text-gray-200">
                Sé parte del cambio hacia una salud bucal más accesible para todos los chilenos
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/registro" className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center">
                  Registrarse Ahora
                </a>
                <a href="/contacto" className="glass-effect text-white border border-white/30 px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300">
                  Contáctanos
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;