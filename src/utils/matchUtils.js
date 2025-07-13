// Utilidades para el sistema de matching
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distancia en km
}

// Algoritmo de matching por compatibilidad
export const calculateMatchScore = (user1, user2) => {
  let score = 0
  
  // Puntos por misma comuna (peso alto)
  if (user1.comuna === user2.comuna) {
    score += 40
  }
  
  // Puntos por tratamientos compatibles
  if (user1.role === 'paciente' && (user2.role === 'estudiante' || user2.role === 'dentameeter')) {
    const tratamientosComunes = user1.tratamientos_interes?.filter(t => 
      user2.especialidades?.includes(t)
    ).length || 0
    score += tratamientosComunes * 10
  }
  
  // Puntos por edad compatible (para dentameeter)
  if (user1.role === 'dentameeter' || user2.role === 'dentameeter') {
    const ageDiff = Math.abs((user1.edad || 25) - (user2.edad || 25))
    if (ageDiff <= 5) score += 15
    else if (ageDiff <= 10) score += 10
    else if (ageDiff <= 15) score += 5
  }
  
  // Puntos por disponibilidad horaria
  const horariosComunes = user1.horarios_disponibles?.filter(h => 
    user2.horarios_disponibles?.includes(h)
  ).length || 0
  score += horariosComunes * 5
  
  return Math.min(score, 100) // Máximo 100 puntos
}

// Filtrar matches por criterios
export const filterMatches = (matches, filters) => {
  return matches.filter(match => {
    if (filters.comuna && match.comuna !== filters.comuna) return false
    if (filters.tratamiento && !match.especialidades?.includes(filters.tratamiento)) return false
    if (filters.universidad && match.universidad !== filters.universidad) return false
    if (filters.etapa && match.etapa_formacion !== filters.etapa) return false
    return true
  })
}

// Ordenar matches por score de compatibilidad
export const sortMatchesByCompatibility = (matches, currentUser) => {
  return matches
    .map(match => ({
      ...match,
      matchScore: calculateMatchScore(currentUser, match)
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
}

// Generar mensaje estructurado para WhatsApp
export const generateWhatsAppMessage = (sender, receiver, appointment) => {
  const message = `¡Hola ${receiver.nombre}! 

Soy ${sender.nombre}, nos conectamos a través de DentaMeet.

📋 *Detalles de la cita:*
• Fecha: ${new Date(appointment.fecha_hora).toLocaleDateString()}
• Hora: ${new Date(appointment.fecha_hora).toLocaleTimeString()}
• Tratamiento: ${appointment.tratamiento}
• Universidad: ${receiver.universidad || 'N/A'}

¿Podemos confirmar los detalles y coordinar el encuentro?

¡Gracias! 😊

_Mensaje enviado a través de DentaMeet - PacienteFácil_`

  return encodeURIComponent(message)
}

// Generar URL de WhatsApp
export const generateWhatsAppURL = (phoneNumber, message) => {
  // Limpiar número de teléfono (remover espacios, guiones, etc.)
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  
  // Agregar código de país si no lo tiene (Chile +56)
  const formattedPhone = cleanPhone.startsWith('56') ? cleanPhone : `56${cleanPhone}`
  
  return `https://wa.me/${formattedPhone}?text=${message}`
}

// Validar compatibilidad entre usuarios
export const areUsersCompatible = (user1, user2) => {
  // No pueden matchearse usuarios del mismo tipo (excepto dentameeter)
  if (user1.role === user2.role && user1.role !== 'dentameeter') {
    return false
  }
  
  // Verificar que estén en la misma región (por ahora solo Santiago)
  const santiagoComunas = [
    'Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'La Reina', 'Vitacura',
    'Maipú', 'Puente Alto', 'La Florida', 'San Bernardo', 'Peñalolén', 'Quilicura'
  ]
  
  const user1InSantiago = santiagoComunas.includes(user1.comuna)
  const user2InSantiago = santiagoComunas.includes(user2.comuna)
  
  return user1InSantiago === user2InSantiago
}

// Formatear fecha para mostrar
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Formatear hora para mostrar
export const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Calcular edad a partir de fecha de nacimiento
export const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Validar número de teléfono chileno
export const validateChileanPhone = (phone) => {
  // Formatos válidos: +56912345678, 56912345678, 912345678, 12345678
  const phoneRegex = /^(\+?56)?([2-9]\d{7}|9\d{8})$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}
