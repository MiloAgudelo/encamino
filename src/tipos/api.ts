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
  en_camino: boolean;
  entregado: boolean;
  entregado_en: string | null;
  domiciliario_nombre: string | null;
  intentos_no_entrega: { fecha: string | null; motivo: string; foto: string }[];
  productos: { id: number; nombre: string; cantidad: number; imagen: string | null }[];
}

/** Cuerpo de error que devuelven las vistas del backend. */
export interface ErrorApi {
  error?: string;
  detail?: string;
}
