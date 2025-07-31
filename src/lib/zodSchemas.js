import { z } from 'zod'

// Datos completos de regiones y comunas de Chile
export const REGIONES_COMUNAS = {
  "Región de Arica y Parinacota": [
    "Arica", "Camarones", "General Lagos", "Putre"
  ],
  "Región de Tarapacá": [
    "Alto Hospicio", "Camiña", "Colchane", "Huara", "Iquique", "Pica", "Pozo Almonte"
  ],
  "Región de Antofagasta": [
    "Antofagasta", "Calama", "María Elena", "Mejillones", "Ollagüe", "San Pedro de Atacama", "Sierra Gorda", "Taltal", "Tocopilla"
  ],
  "Región de Atacama": [
    "Alto del Carmen", "Caldera", "Chañaral", "Copiapó", "Diego de Almagro", "Freirina", "Huasco", "Tierra Amarilla", "Vallenar"
  ],
  "Región de Coquimbo": [
    "Andacollo", "Canela", "Combarbalá", "Coquimbo", "Illapel", "La Higuera", "La Serena", "Los Vilos", "Monte Patria", "Ovalle", "Paiguano", "Punitaqui", "Río Hurtado", "Salamanca", "Vicuña"
  ],
  "Región de Valparaíso": [
    "Algarrobo", "Cabildo", "Calera", "Calle Larga", "Cartagena", "Casablanca", "Catemu", "Concón", "El Quisco", "El Tabo", "Hijuelas", "Isla de Pascua", "Juan Fernández", "La Cruz", "La Ligua", "Limache", "Llaillay", "Los Andes", "Nogales", "Olmué", "Panquehue", "Papudo", "Petorca", "Puchuncaví", "Quillota", "Quilpué", "Quintero", "Rinconada", "San Antonio", "San Esteban", "San Felipe", "Santa María", "Santo Domingo", "Valparaíso", "Villa Alemana", "Viña del Mar", "Zapallar"
  ],
  "Región Metropolitana": [
    "Alhué", "Buin", "Calera de Tango", "Cerrillos", "Cerro Navia", "Colina", "Conchalí", "Curacaví", "El Bosque", "El Monte", "Estación Central", "Huechuraba", "Independencia", "Isla de Maipo", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Lampa", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "María Pinto", "Melipilla", "Ñuñoa", "Padre Hurtado", "Paine", "Pedro Aguirre Cerda", "Peñaflor", "Peñalolén", "Pirque", "Providencia", "Pudahuel", "Puente Alto", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Bernardo", "San Joaquín", "San José de Maipo", "San Miguel", "San Pedro", "San Ramón", "Santiago", "Talagante", "Tiltil", "Vitacura"
  ],
  "Región del Libertador General Bernardo O'Higgins": [
    "Chépica", "Chimbarongo", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "La Estrella", "Las Cabras", "Litueche", "Lolol", "Machalí", "Malloa", "Marchihue", "Mostazal", "Nancagua", "Navidad", "Olivar", "Palmilla", "Paredones", "Peralillo", "Peumo", "Pichidegua", "Pichilemu", "Placilla", "Pumanque", "Quinta de Tilcoco", "Rancagua", "Rengo", "Requínoa", "San Fernando", "San Vicente", "Santa Cruz"
  ],
  "Región del Maule": [
    "Cauquenes", "Chanco", "Colbún", "Constitución", "Curepto", "Curicó", "Empedrado", "Hualañé", "Licantén", "Linares", "Longaví", "Maule", "Molina", "Parral", "Pelarco", "Pelluhue", "Pencahue", "Rauco", "Retiro", "Río Claro", "Romeral", "Sagrada Familia", "San Clemente", "San Javier", "San Rafael", "Talca", "Teno", "Vichuquén", "Villa Alegre", "Yerbas Buenas"
  ],
  "Región de Ñuble": [
    "Bulnes", "Chillán", "Chillán Viejo", "Cobquecura", "Coelemu", "Coihueco", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Trehuaco", "Yungay"
  ],
  "Región del Biobío": [
    "Alto Biobío", "Antuco", "Arauco", "Cabrero", "Cañete", "Chiguayante", "Concepción", "Contulmo", "Coronel", "Curanilahue", "Florida", "Hualqui", "Laja", "Lebu", "Los Álamos", "Los Ángeles", "Lota", "Mulchén", "Nacimiento", "Negrete", "Penco", "Quilaco", "Quilleco", "San Pedro de la Paz", "San Rosendo", "Santa Bárbara", "Santa Juana", "Talcahuano", "Tirúa", "Tomé", "Tucapel", "Yumbel"
  ],
  "Región de La Araucanía": [
    "Angol", "Carahue", "Cholchol", "Collipulli", "Cunco", "Curacautín", "Curarrehue", "Ercilla", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Lonquimay", "Los Sauces", "Lumaco", "Melipeuco", "Nueva Imperial", "Padre las Casas", "Perquenco", "Pitrufquén", "Pucón", "Purén", "Renaico", "Saavedra", "Temuco", "Teodoro Schmidt", "Toltén", "Traiguén", "Victoria", "Vilcún", "Villarrica"
  ],
  "Región de Los Ríos": [
    "Corral", "Futrono", "La Unión", "Lago Ranco", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "Río Bueno", "Valdivia"
  ],
  "Región de Los Lagos": [
    "Ancud", "Calbuco", "Castro", "Chaitén", "Chonchi", "Cochamó", "Curaco de Vélez", "Dalcahue", "Fresia", "Frutillar", "Futaleufú", "Hualaihué", "Llanquihue", "Los Muermos", "Maullín", "Osorno", "Palena", "Puerto Montt", "Puerto Octay", "Puerto Varas", "Puqueldón", "Purranque", "Puyehue", "Queilén", "Quellón", "Quemchi", "Quinchao", "Río Negro", "San Juan de la Costa", "San Pablo"
  ],
  "Región Aysén del General Carlos Ibáñez del Campo": [
    "Aysén", "Chile Chico", "Cisnes", "Cochrane", "Coyhaique", "Guaitecas", "Lago Verde", "O'Higgins", "Río Ibáñez", "Tortel"
  ],
  "Región de Magallanes y de la Antártica Chilena": [
    "Antártica", "Cabo de Hornos", "Laguna Blanca", "Natales", "Porvenir", "Primavera", "Punta Arenas", "Río Verde", "San Gregorio", "Timaukel", "Torres del Paine"
  ]
}

// Extraer listas para los esquemas
export const REGIONES_CHILE = Object.keys(REGIONES_COMUNAS)
export const TODAS_LAS_COMUNAS = Object.values(REGIONES_COMUNAS).flat()

// Función helper para obtener comunas por región
export const getComunasByRegion = (region) => {
  return REGIONES_COMUNAS[region] || []
}

// Tratamientos dentales
export const TRATAMIENTOS = [
  'Limpieza dental', 'Blanqueamiento', 'Ortodoncia', 'Endodoncia',
  'Implantes', 'Prótesis', 'Cirugía oral', 'Periodoncia', 'Estética dental',
  'Odontopediatría', 'Urgencias dentales', 'Radiografías', 'Extracción',
  'Coronas', 'Carillas', 'Puentes', 'Rehabilitación oral'
]

// Especialidades odontológicas
export const ESPECIALIDADES = [
  'Odontología general', 'Ortodoncista', 'Endodoncista', 'Periodoncista',
  'Cirujano oral', 'Protesista', 'Odontopediatra', 'Patólogo oral',
  'Radiología oral', 'Estética dental', 'Implantología', 'Ortopedia maxilar',
  'Medicina oral', 'Gerodoncia', 'Odontología forense'
]

// Universidades con odontología en Chile
export const UNIVERSIDADES = [
  'Universidad de Chile', 'Universidad de Concepción', 'Universidad de Valparaíso',
  'Universidad Mayor', 'Universidad San Sebastián', 'Universidad del Desarrollo',
  'Universidad de Los Andes', 'Universidad Finis Terrae', 'Universidad Andrés Bello',
  'Universidad Central', 'Universidad Diego Portales', 'Universidad de Talca',
  'Universidad Austral', 'Pontificia Universidad Católica de Chile', 'Universidad La Frontera',
  'Universidad Pedro de Valdivia', 'Universidad Bernardo O\'Higgins', 'Universidad de las Américas',
  'Universidad Católica del Norte', 'Universidad de La Serena'
]

// Etapas de formación
export const ETAPAS_FORMACION = [
  '1er año', '2do año', '3er año', '4to año', '5to año', '6to año',
  'Interno', 'Egresado', 'Especialización', 'Postgrado', 'Residente'
]

// Horarios disponibles
export const HORARIOS = [
  'Mañana (8:00-12:00)', 'Tarde (14:00-18:00)', 'Noche (18:00-21:00)',
  'Fines de semana', 'Solo días de semana', 'Flexible', 'Urgencias 24/7'
]

// Esquema para registro de usuario
export const userRegistrationSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

// Esquema para perfil de paciente (actualizado para coincidir con Supabase)
export const patientProfileSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  telefono: z.string().min(9, 'Teléfono inválido'),
  region: z.enum(REGIONES_CHILE, {
    errorMap: () => ({ message: 'Selecciona una región válida' })
  }),
  comuna: z.string().min(1, 'Selecciona una comuna'),
  edad: z.number().min(18, 'Debes ser mayor de 18 años').max(100, 'Edad no válida'),
  tratamientos_interes: z.array(z.string()).optional(),
  descripcion: z.string().optional()
})

// Esquema para perfil de estudiante (actualizado para coincidir con Supabase)
export const studentProfileSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  telefono: z.string().min(9, 'Teléfono inválido'),
  region: z.enum(REGIONES_CHILE, {
    errorMap: () => ({ message: 'Selecciona una región válida' })
  }),
  comuna: z.string().min(1, 'Selecciona una comuna'),
  edad: z.number().min(18, 'Debes ser mayor de 18 años').max(100, 'Edad no válida'),
  universidad: z.string().min(1, 'Selecciona una universidad'),
  etapa_formacion: z.string().min(1, 'Selecciona tu etapa de formación'),
  especialidades: z.array(z.string()).optional(),
  descripcion: z.string().optional(),
  horarios_disponibles: z.array(z.string()).optional()
})

// Esquema para perfil de dentameeter (actualizado para coincidir con Supabase)
export const dentameeterProfileSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  telefono: z.string().min(9, 'Teléfono inválido'),
  region: z.enum(REGIONES_CHILE, {
    errorMap: () => ({ message: 'Selecciona una región válida' })
  }),
  comuna: z.string().min(1, 'Selecciona una comuna'),
  edad: z.number().min(18, 'Debes ser mayor de 18 años').max(100, 'Edad no válida'),
  universidad: z.string().min(1, 'Selecciona una universidad'),
  etapa_formacion: z.string().min(1, 'Selecciona tu etapa de formación'),
  tratamientos_interes: z.array(z.string()).optional(),
  especialidades: z.array(z.string()).optional(),
  descripcion: z.string().optional(),
  horarios_disponibles: z.array(z.string()).optional()
})

// Esquema para agendar cita
export const appointmentSchema = z.object({
  fecha: z.string().min(1, 'Selecciona una fecha'),
  hora: z.string().min(1, 'Selecciona una hora'),
  tratamiento: z.string().min(1, 'Especifica el tratamiento'),
  notas: z.string().optional()
})

// Esquema para feedback
export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comentario: z.string().min(10, 'El comentario debe tener al menos 10 caracteres'),
  recomendaria: z.boolean()
})
