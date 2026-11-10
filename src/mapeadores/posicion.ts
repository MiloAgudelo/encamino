import type { Posicion } from '@/modelos/domicilio';
import type { PosicionApi } from '@/tipos/api';

/** Convierte una posición del backend en el modelo de la app; null si no hay. */
export function mapearPosicion(api: PosicionApi | null | undefined): Posicion | null {
  if (!api) return null;
  return {
    coordenadas: { latitud: api.lat, longitud: api.lng },
    precisionMetros: api.precision,
    recibidaEn: new Date(api.recibida_en),
  };
}
