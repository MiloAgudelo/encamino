import type { Coordenadas } from '@/modelos/domicilio';

/** Qué representa un marcador. Cada tipo tiene un color distinto (RF-12). */
export type TipoMarcador = 'despacho' | 'destino' | 'domiciliario';

export interface MarcadorMapa {
  id: string;
  tipo: TipoMarcador;
  coordenadas: Coordenadas;
  titulo: string;
  descripcion?: string;
  /** Posición vieja (más de 2 minutos): se muestra atenuada. */
  atenuado?: boolean;
  alPresionar?: () => void;
}

export interface MapaProps {
  marcadores: MarcadorMapa[];
  /** Cuando cambia `clave`, el mapa se centra en `coordenadas`. */
  enfoque?: { coordenadas: Coordenadas; clave: number } | null;
  /** Alto del mapa; por defecto ocupa el espacio disponible. */
  alto?: number;
}

export const COLOR_MARCADOR: Record<TipoMarcador, string> = {
  despacho: 'violet',
  destino: 'red',
  domiciliario: 'blue',
};

/** Mismo color en CSS, para la lista de marcadores de la versión web. */
export const COLOR_MARCADOR_CSS: Record<TipoMarcador, string> = {
  despacho: '#8b5cf6',
  destino: '#dc2626',
  domiciliario: '#2563eb',
};

export const NOMBRE_TIPO_MARCADOR: Record<TipoMarcador, string> = {
  despacho: 'Punto de despacho',
  destino: 'Destino',
  domiciliario: 'Domiciliario',
};
