// Convierte un string de rango horario en array de horas válidas
export function getHorasPorRango(rango) {
  if (!rango) return [];
  const norm = String(rango).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  if (norm.includes('manana')) return ['08:00', '09:00', '10:00', '11:00', '12:00'];
  if (norm.includes('tarde')) return ['14:00', '15:00', '16:00', '17:00', '18:00'];
  if (norm.includes('noche')) return ['19:00', '20:00', '21:00'];
  // Si el rango es una hora específica, intenta devolverla
  if (/^\d{2}:\d{2}$/.test(norm)) return [norm];
  return [];
}
// Utilidades para citas (appointments)

export function isAppointmentConfirmed(appointment) {
  return appointment.confirmado_por_user1 && appointment.confirmado_por_user2;
}

export function getTratamientosCompatibles(tratamientosPaciente, especialidadesEstudiante) {
  // Solo filtrar por tratamientos de interés comunes entre ambos usuarios
  if (!Array.isArray(tratamientosPaciente)) return [];
  if (!Array.isArray(especialidadesEstudiante)) return tratamientosPaciente;
  const normalize = arr => arr.map(t => String(t).toLowerCase().trim());
  const pacienteNorm = normalize(tratamientosPaciente);
  const estudianteNorm = normalize(especialidadesEstudiante);
  // Mostrar solo tratamientos que estén en ambos tratamientos_interes
  return pacienteNorm.filter(t => estudianteNorm.includes(t));
}
