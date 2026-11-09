/** Estado de un domicilio en la app (RN-01). Un estado nunca retrocede. */
export type EstadoDomicilio = 'pendiente' | 'en_camino' | 'entregado' | 'entrega_parcial' | 'no_entregado';

/** Lo que muestra una tarjeta de domicilio. El mapper del backend arma este modelo. */
export interface ResumenDomicilio {
  id: number;
  numeroPedido: string;
  barrio: string;
  ciudad: string;
  /** Franja de entrega, por ejemplo "8:00 – 9:00". */
  franja: string;
  estado: EstadoDomicilio;
  /** Solo lo ve el administrador. */
  domiciliario?: string;
}

export const ETIQUETA_ESTADO: Record<EstadoDomicilio, string> = {
  pendiente: 'Pendiente',
  en_camino: 'En camino',
  entregado: 'Entregado',
  entrega_parcial: 'Entrega parcial',
  no_entregado: 'No entregado',
};
