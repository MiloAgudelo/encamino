import type { Coordenadas } from '@/modelos/domicilio';

/**
 * Punto de despacho de Karamba (RF-19). Dirección y coordenadas confirmadas con
 * Karamba el 2026-11-10; horario y contacto, los publicados (`docs/negocio.md`).
 */
export const PUNTO_DESPACHO = {
  nombre: 'Karamba by marCe',
  direccion: 'Carrera 9 # 17-38, Cartago, Valle del Cauca',
  coordenadas: { latitud: 4.745682, longitud: -75.920676 } satisfies Coordenadas,
  horario: [
    { dias: 'Lunes a sábado', horas: '6:30 a. m. – 7:00 p. m.' },
    { dias: 'Domingo', horas: '8:00 a. m. – 12:00 m.' },
  ],
  whatsapp: '573116108002',
  telefonoVisible: '311 610 8002',
  correo: 'karambatienda@gmail.com',
} as const;

/** Enlace de Google Maps para buscar un lugar (abre la app de mapas o el navegador). */
export function enlaceGoogleMaps(destino: Coordenadas | string): string {
  const consulta =
    typeof destino === 'string' ? destino : `${destino.latitud},${destino.longitud}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}
