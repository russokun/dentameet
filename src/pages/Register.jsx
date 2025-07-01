
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { User, GraduationCap, Mail, Phone, MapPin, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Register = () => {
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    comuna: '',
    edad: '',
    tratamientos: [],
    universidad: '',
    ramo: '',
    etapa: '',
  });

  const comunas = [
    'Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'La Reina', 'Vitacura',
    'Maipú', 'Puente Alto', 'La Florida', 'San Bernardo', 'Peñalolén', 'Quilicura'
  ];

  const tratamientos = [
    'Limpieza Dental', 'Empastes', 'Ortodoncia', 'Endodoncia', 'Extracción',
    'Blanqueamiento', 'Prótesis', 'Implantes', 'Periodoncia', 'Cirugía Oral'
  ];

  const universidades = [
    'Universidad de Chile', 'Universidad Católica', 'Universidad Mayor',
    'Universidad del Desarrollo', 'Universidad San Sebastián', 'Universidad de los Andes'
  ];

  const etapas = [
    '3er Año', '4to Año', '5to Año', '6to Año', 'Internado'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTratamientoChange = (tratamiento) => {
    setFormData(prev => ({
      ...prev,
      tratamientos: prev.tratamientos.includes(tratamiento)
        ? prev.tratamientos.filter(t => t !== tratamiento)
        : [...prev.tratamientos, tratamiento]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.comuna) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Guardar en localStorage
    const registros = JSON.parse(localStorage.getItem('dentameet_registros') || '[]');
    const nuevoRegistro = {
      ...formData,
      tipo: userType,
      fecha: new Date().toISOString(),
      id: Date.now()
    };
    
    registros.push(nuevoRegistro);
    localStorage.setItem('dentameet_registros', JSON.stringify(registros));

    toast({
      title: "¡Registro Exitoso!",
      description: `Te has registrado como ${userType}. Pronto nos pondremos en contacto contigo.`,
    });

    // Limpiar formulario
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      comuna: '',
      edad: '',
      tratamientos: [],
      universidad: '',
      ramo: '',
      etapa: '',
    });
    setUserType('');
  };

  return (
    <>
      <Helmet>
        <title>Registro - DentaMeet PacienteFácil | Únete a nuestra comunidad</title>
        <meta name="description" content="Regístrate como paciente o estudiante de odontología en DentaMeet. Accede a tratamientos dentales accesibles o completa tus horas clínicas." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-[#1A237E] mb-4">
              Únete a DentaMeet
            </h1>
            <p className="text-xl text-gray-600">
              Selecciona tu perfil y completa el registro para comenzar
            </p>
          </motion.div>

          {!userType ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Paciente Card */}
              <div
                onClick={() => setUserType('paciente')}
                className="bg-white p-8 rounded-2xl shadow-lg cursor-pointer card-hover border-2 border-transparent hover:border-[#00C853] transition-all duration-300"
              >
                <User className="h-16 w-16 text-[#00C853] mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-[#1A237E] text-center mb-4">
                  Soy Paciente
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Busco tratamientos dentales de calidad a precios accesibles
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#00C853] rounded-full mr-3"></div>
                    Tratamientos desde $0 CLP
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#00C853] rounded-full mr-3"></div>
                    Atención por estudiantes supervisados
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#00C853] rounded-full mr-3"></div>
                    Conexión según tu comuna
                  </li>
                </ul>
              </div>

              {/* Estudiante Card */}
              <div
                onClick={() => setUserType('estudiante')}
                className="bg-white p-8 rounded-2xl shadow-lg cursor-pointer card-hover border-2 border-transparent hover:border-[#1A237E] transition-all duration-300"
              >
                <GraduationCap className="h-16 w-16 text-[#1A237E] mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-[#1A237E] text-center mb-4">
                  Soy Estudiante
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Necesito completar mis horas clínicas de odontología
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#1A237E] rounded-full mr-3"></div>
                    Completa tus horas clínicas
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#1A237E] rounded-full mr-3"></div>
                    Pacientes según tu especialidad
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#1A237E] rounded-full mr-3"></div>
                    Reduce el ausentismo clínico
                  </li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center mb-8">
                {userType === 'paciente' ? (
                  <User className="h-8 w-8 text-[#00C853] mr-3" />
                ) : (
                  <GraduationCap className="h-8 w-8 text-[#1A237E] mr-3" />
                )}
                <h2 className="text-2xl font-bold text-[#1A237E]">
                  Registro como {userType === 'paciente' ? 'Paciente' : 'Estudiante'}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setUserType('')}
                  className="ml-auto"
                >
                  Cambiar
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campos comunes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent"
                      placeholder="+56 9 1234 5678"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Comuna *
                    </label>
                    <select
                      name="comuna"
                      value={formData.comuna}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent"
                      required
                    >
                      <option value="">Selecciona tu comuna</option>
                      {comunas.map(comuna => (
                        <option key={comuna} value={comuna}>{comuna}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Campos específicos para pacientes */}
                {userType === 'paciente' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Edad
                      </label>
                      <input
                        type="number"
                        name="edad"
                        value={formData.edad}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C853] focus:border-transparent"
                        placeholder="Tu edad"
                        min="1"
                        max="120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Tratamientos de Interés
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {tratamientos.map(tratamiento => (
                          <label key={tratamiento} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.tratamientos.includes(tratamiento)}
                              onChange={() => handleTratamientoChange(tratamiento)}
                              className="rounded border-gray-300 text-[#00C853] focus:ring-[#00C853]"
                            />
                            <span className="text-sm text-gray-700">{tratamiento}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Campos específicos para estudiantes */}
                {userType === 'estudiante' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <GraduationCap className="h-4 w-4 inline mr-2" />
                        Universidad *
                      </label>
                      <select
                        name="universidad"
                        value={formData.universidad}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                        required
                      >
                        <option value="">Selecciona tu universidad</option>
                        {universidades.map(uni => (
                          <option key={uni} value={uni}>{uni}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <BookOpen className="h-4 w-4 inline mr-2" />
                        Ramo Clínico
                      </label>
                      <input
                        type="text"
                        name="ramo"
                        value={formData.ramo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                        placeholder="Ej: Clínica Integral"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Etapa de Formación *
                      </label>
                      <select
                        name="etapa"
                        value={formData.etapa}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
                        required
                      >
                        <option value="">Selecciona tu etapa</option>
                        {etapas.map(etapa => (
                          <option key={etapa} value={etapa}>{etapa}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="pt-6">
                  <Button
                    type="submit"
                    className={`w-full py-4 text-lg font-semibold ${
                      userType === 'paciente' ? 'btn-secondary' : 'btn-primary'
                    }`}
                  >
                    Completar Registro
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Register;
