/** Estado de un domicilio en la app (RN-01). Un estado nunca retrocede. */
export type EstadoDomicilio = 'pendiente' | 'en_camino' | 'entregado' | 'entrega_parcial' | 'no_entregado';

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

/** Un domicilio como lo usa la app. Lo arma `mapearDomicilio` a partir de la API. */
export interface Domicilio {
  id: number;
  /** Número del pedido de Karamba; null si el domicilio se creó a mano, sin pedido. */
  numeroPedido: string | null;
  codigoSeguimiento: string | null;
  barrio: string;
  direccion: string;
  /** Fecha de entrega en formato YYYY-MM-DD. */
  fechaEntrega: string | null;
  /** Franja de entrega, por ejemplo "8:00 – 9:00". */
  franja: string;
  estado: EstadoDomicilio;
  cliente: string | null;
  quienRecibe: string | null;
  telefonoQuienRecibe: string | null;
  domiciliario: string | null;
  observaciones: string;
  entregadoEn: string | null;
  entregadoA: string | null;
  motivoNoEntrega: string | null;
  /** Ubicación conocida del destino (de una entrega anterior); null si no hay. */
  destino: Coordenadas | null;
}

/** Lo que muestra una tarjeta de domicilio en las listas. */
export type ResumenDomicilio = Pick<
  Domicilio,
  'id' | 'numeroPedido' | 'barrio' | 'direccion' | 'franja' | 'estado' | 'domiciliario'
>;

export const ETIQUETA_ESTADO: Record<EstadoDomicilio, string> = {
  pendiente: 'Pendiente',
  en_camino: 'En camino',
  entregado: 'Entregado',
  entrega_parcial: 'Entrega parcial',
  no_entregado: 'No entregado',
};

/** Título corto de un domicilio: "Pedido #13" o "Domicilio manual". */
export function tituloDomicilio(d: Pick<Domicilio, 'numeroPedido'>): string {
  return d.numeroPedido ? `Pedido #${d.numeroPedido}` : 'Domicilio manual';
}
