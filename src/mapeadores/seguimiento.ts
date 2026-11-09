import { formatearFranja } from '@/mapeadores/domicilio';
import type { PasoSeguimiento, Seguimiento } from '@/modelos/seguimiento';
import type { SeguimientoApi } from '@/tipos/api';

function pasoActual(api: SeguimientoApi): PasoSeguimiento {
  if (api.entregado || ['ENTREGADO', 'ENCUESTA_ENVIADA', 'FINALIZADO'].includes(api.estado)) return 'entregado';
  if (api.en_camino || api.estado === 'EN_CAMINO') return 'en_camino';
  if (api.en_preparacion || ['ORDENES_GENERADAS', 'EN_PRODUCCION', 'EN_ALISTAMIENTO'].includes(api.estado)) {
    return 'en_preparacion';
  }
  return 'registrado';
}

/** Convierte el seguimiento público del backend en el modelo de la app. */
export function mapearSeguimiento(api: SeguimientoApi): Seguimiento {
  const paso = pasoActual(api);
  return {
    numeroPedido: String(api.id),
    pasoActual: paso,
    fechaEntrega: api.fecha_entrega,
    // "08:00:00 — 09:00:00" → "8:00 – 9:00"
    franja: formatearFranja(api.horario),
    ciudad: api.ciudad,
    // RN-04: después del reporte, el cliente no ve los datos del domiciliario.
    domiciliario: paso === 'en_camino' ? api.domiciliario_nombre : null,
    entregadoEn: api.entregado_en,
    productos: api.productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      cantidad: p.cantidad,
      imagen: p.imagen || null,
    })),
    intentosNoEntrega: api.intentos_no_entrega.map((i) => ({ fecha: i.fecha, motivo: i.motivo })),
  };
}
