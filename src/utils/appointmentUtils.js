// Utilidades para citas (appointments)

export function isAppointmentConfirmed(appointment) {
  return appointment.confirmado_por_user1 && appointment.confirmado_por_user2;
}

export function getTratamientosCompatibles(tratamientosPaciente, especialidadesEstudiante) {
  if (!Array.isArray(tratamientosPaciente) || !Array.isArray(especialidadesEstudiante)) return [];
  const normalize = arr => arr.map(t => String(t).toLowerCase().trim());
  const pacienteNorm = normalize(tratamientosPaciente);
  const estudianteNorm = normalize(especialidadesEstudiante);
  return pacienteNorm.filter(t => estudianteNorm.includes(t));
}
