/**
 * "hace un momento", "hace 3 min" o "hace 2 h" respecto de `ahora`.
 * RF-07: una posición de más de 2 minutos se muestra como "hace N min".
 */
export function hace(fecha: Date, ahora: Date = new Date()): string {
  const minutos = Math.floor((ahora.getTime() - fecha.getTime()) / 60_000);
  if (minutos < 2) return 'hace un momento';
  if (minutos < 60) return `hace ${minutos} min`;
  return `hace ${Math.floor(minutos / 60)} h`;
}

/** Hora local "h:mm a. m." de una fecha. */
export function horaCorta(fecha: Date): string {
  return fecha.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
}
