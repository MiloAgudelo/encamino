/**
 * Respuestas del backend de Karamba tal como llegan por HTTP. Ningún
 * componente las usa directamente: los mappers de `src/mapeadores/` las
 * convierten en los modelos de `src/modelos/`.
 */

export type RolApi = 'ADMIN' | 'COCINA' | 'DECORADOR' | 'TARJETAS' | 'CAMEO' | 'DOMICILIARIO';

export interface UsuarioApi {
  id: number;
  email: string;
  nombre: string;
  rol: RolApi;
}

/** POST /auth/login/ */
export interface LoginApi {
  access: string;
  refresh: string;
  usuario: UsuarioApi;
}

/** POST /auth/refresh/ */
export interface RefreshApi {
  access: string;
}

/** Posición del domiciliario (B-04). Las horas vienen en ISO 8601 con zona. */
export interface PosicionApi {
  lat: number;
  lng: number;
  /** Radio de error del GPS en metros. */
  precision: number | null;
  registrada_en: string | null;
  recibida_en: string;
}

/** Estado del domicilio (B-03): "en camino" es un domicilio pendiente con salida. */
export type EstadoDomicilioApi = 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'NO_ENTREGADO';

/** Una línea del pedido en el detalle del domicilio (B-02). `id` es el de la línea. */
export interface LineaPedidoApi {
  id: number;
  producto_id: number;
  nombre: string;
  cantidad: number;
  imagen: string | null;
}

/** GET /domicilios/domicilios/ y /domicilios/domicilios/<id>/ */
export interface DomicilioApi {
  id: number;
  pedido_id: number | null;
  pedido_token_seguimiento: string | null;
  pedido_cliente: string | null;
  pedido_cliente_telefono: string | null;
  pedido_fecha_entrega: string | null;
  /** "08:00 — 09:00" */
  pedido_horario: string | null;
  pedido_heredada_lat: number | null;
  pedido_heredada_lng: number | null;
  pedido_quien_recibe: string | null;
  pedido_quien_recibe_telefono: string | null;
  domiciliario_id: number;
  domiciliario_nombre: string | null;
  resultado: 'PENDIENTE' | 'ENTREGADO' | 'NO_ENTREGADO';
  estado: EstadoDomicilioApi;
  /** Hora de salida en ISO 8601; null si no ha iniciado el recorrido. */
  salida_en: string | null;
  /** "09/11/2026 13:15" */
  entregado_en: string | null;
  entregado_a: string;
  foto_no_entrega: string;
  motivo_no_entrega: string;
  reportado_en: string | null;
  observaciones: string;
  barrio_efectivo: string | null;
  direccion_efectiva: string | null;
  vigente: boolean;
  /** Solo en el detalle. */
  productos?: LineaPedidoApi[];
  /** Solo en el detalle. */
  ultima_posicion?: PosicionApi | null;
}

export type EstadoPedidoApi =
  | 'REGISTRADO'
  | 'ORDENES_GENERADAS'
  | 'EN_PRODUCCION'
  | 'EN_ALISTAMIENTO'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'ENCUESTA_ENVIADA'
  | 'FINALIZADO';

/** GET /pedidos/pedidos/seguimiento/<token>/ (público, sin sesión) */
export interface SeguimientoApi {
  id: number;
  estado: EstadoPedidoApi;
  estado_display: string;
  fecha_entrega: string;
  /** "08:00:00 — 09:00:00" */
  horario: string;
  ciudad: string | null;
  en_preparacion: boolean;
  /** True solo cuando el domiciliario ya inició el recorrido. */
  en_camino: boolean;
  /** True cuando el pedido ya tiene domiciliario, haya salido o no. */
  domiciliario_asignado: boolean;
  /** Domicilio vigente; null si el pedido no tiene uno registrado. */
  domicilio: {
    estado: EstadoDomicilioApi;
    salida_en: string | null;
    /** Solo mientras va en camino (RN-04). */
    ultima_posicion: PosicionApi | null;
  } | null;
  entregado: boolean;
  entregado_en: string | null;
  domiciliario_nombre: string | null;
  intentos_no_entrega: { fecha: string | null; motivo: string; foto: string }[];
  productos: { id: number; nombre: string; cantidad: number; imagen: string | null }[];
}

/**
 * POST /domicilios/domicilios/<id>/firma-foto/ (B-06). En el entorno local sin
 * Cloudinary, el backend responde `{ simulado: true }` y la foto no se sube.
 */
export type FirmaFotoApi =
  | { simulado: true }
  | { timestamp: number; signature: string; api_key: string; cloud_name: string; folder: string };

/** Respuesta de Cloudinary al subir una imagen. */
export interface SubidaCloudinaryApi {
  secure_url: string;
}

/** Cuerpo de error que devuelven las vistas del backend. */
export interface ErrorApi {
  error?: string;
  detail?: string;
}
