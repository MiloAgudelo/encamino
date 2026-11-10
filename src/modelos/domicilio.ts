/**
 * Estado de un domicilio en la app (RN-01). Un estado nunca retrocede. No hay
 * entrega parcial: el domiciliario siempre entrega el pedido completo.
 */
export type EstadoDomicilio = 'pendiente' | 'en_camino' | 'entregado' | 'no_entregado';

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

/** Última posición conocida del domiciliario. Lo arma `mapearPosicion`. */
export interface Posicion {
  coordenadas: Coordenadas;
  /** Radio de error del GPS en metros; null si el teléfono no lo informó. */
  precisionMetros: number | null;
  /** Cuándo la recibió el backend. */
  recibidaEn: Date;
}

/** Un producto que lleva el domiciliario. */
export interface ProductoDomicilio {
  /** Id de la línea del pedido: la entrega por unidades se reporta por línea. */
  idLinea: number;
  nombre: string;
  cantidad: number;
  /** URL de la imagen; null si el producto no tiene. */
  imagen: string | null;
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
  /** Teléfono de quien hizo el pedido, para el protocolo de no entrega (RN-07). */
  telefonoCliente: string | null;
  domiciliario: string | null;
  observaciones: string;
  entregadoEn: string | null;
  entregadoA: string | null;
  motivoNoEntrega: string | null;
  /** URL de la foto de no entrega; null si no hay o si fue simulada en el entorno local. */
  fotoNoEntrega: string | null;
  /**
   * Dónde queda el destino en el mapa; null si no se conoce. Es exacto cuando
   * viene de una entrega anterior a la misma dirección, y aproximado cuando es
   * el centro del barrio.
   */
  destino: { coordenadas: Coordenadas; aproximado: boolean } | null;
  /** Cuándo inició el recorrido; null si no ha salido. */
  salidaEn: Date | null;
  /** Productos del pedido. Solo llegan en el detalle; en las listas va vacío. */
  productos: ProductoDomicilio[];
  /** Última posición del domiciliario. Solo llega en el detalle. */
  ultimaPosicion: Posicion | null;
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
  no_entregado: 'No entregado',
};

/** Título corto de un domicilio: "Pedido #13" o "Domicilio manual". */
export function tituloDomicilio(d: Pick<Domicilio, 'numeroPedido'>): string {
  return d.numeroPedido ? `Pedido #${d.numeroPedido}` : 'Domicilio manual';
}
