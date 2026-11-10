import type { Posicion } from '@/modelos/domicilio';

/** Pasos de la línea de tiempo que ve el cliente. */
export type PasoSeguimiento = 'registrado' | 'en_preparacion' | 'asignado' | 'en_camino' | 'entregado';

export const PASOS_SEGUIMIENTO: { paso: PasoSeguimiento; etiqueta: string }[] = [
  { paso: 'registrado', etiqueta: 'Pedido registrado' },
  { paso: 'en_preparacion', etiqueta: 'En preparación' },
  { paso: 'asignado', etiqueta: 'Domiciliario asignado' },
  { paso: 'en_camino', etiqueta: 'En camino' },
  { paso: 'entregado', etiqueta: 'Entregado' },
];

export interface ProductoSeguimiento {
  id: number;
  nombre: string;
  cantidad: number;
  /** URL de la imagen; null si el producto no tiene. */
  imagen: string | null;
}

export interface IntentoNoEntrega {
  fecha: string | null;
  motivo: string;
}

/** El pedido como lo ve el cliente con su código de seguimiento. */
export interface Seguimiento {
  numeroPedido: string;
  pasoActual: PasoSeguimiento;
  fechaEntrega: string;
  franja: string;
  ciudad: string | null;
  domiciliario: string | null;
  entregadoEn: string | null;
  /** Solo mientras va en camino (RN-04). */
  ultimaPosicion: Posicion | null;
  productos: ProductoSeguimiento[];
  intentosNoEntrega: IntentoNoEntrega[];
}
