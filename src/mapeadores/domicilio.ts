import { mapearPosicion } from '@/mapeadores/posicion';
import type { Domicilio, EstadoDomicilio } from '@/modelos/domicilio';
import type { DomicilioApi, EstadoDomicilioApi } from '@/tipos/api';

const ESTADO_DE_API: Record<EstadoDomicilioApi, EstadoDomicilio> = {
  PENDIENTE: 'pendiente',
  EN_CAMINO: 'en_camino',
  ENTREGADO: 'entregado',
  NO_ENTREGADO: 'no_entregado',
};

/** "08:00 — 09:00" → "8:00 – 9:00". */
export function formatearFranja(horario: string | null): string {
  if (!horario) return 'Sin franja';
  const horas = horario.split('—').map((h) => h.trim().slice(0, 5).replace(/^0(\d)/, '$1'));
  return horas.length === 2 ? `${horas[0]} – ${horas[1]}` : horario;
}

function textoONulo(valor: string | null | undefined): string | null {
  const limpio = valor?.trim();
  return limpio ? limpio : null;
}

/**
 * Convierte un domicilio del backend en el modelo de la app. Si llegara un
 * backend sin el campo `estado` (B-03), se usa `resultado`.
 */
export function mapearDomicilio(api: DomicilioApi): Domicilio {
  const destino =
    api.pedido_heredada_lat != null && api.pedido_heredada_lng != null
      ? { coordenadas: { latitud: api.pedido_heredada_lat, longitud: api.pedido_heredada_lng }, aproximado: false }
      : api.pedido_barrio_lat != null && api.pedido_barrio_lng != null
        ? { coordenadas: { latitud: api.pedido_barrio_lat, longitud: api.pedido_barrio_lng }, aproximado: true }
        : null;

  return {
    id: api.id,
    numeroPedido: api.pedido_id != null ? String(api.pedido_id) : null,
    codigoSeguimiento: api.pedido_token_seguimiento,
    barrio: textoONulo(api.barrio_efectivo) ?? 'Barrio sin registrar',
    direccion: textoONulo(api.direccion_efectiva) ?? 'Dirección sin registrar',
    fechaEntrega: api.pedido_fecha_entrega,
    franja: formatearFranja(api.pedido_horario),
    estado: ESTADO_DE_API[api.estado ?? api.resultado] ?? 'pendiente',
    cliente: textoONulo(api.pedido_cliente),
    quienRecibe: textoONulo(api.pedido_quien_recibe),
    telefonoQuienRecibe: textoONulo(api.pedido_quien_recibe_telefono),
    telefonoCliente: textoONulo(api.pedido_cliente_telefono),
    domiciliario: textoONulo(api.domiciliario_nombre),
    observaciones: api.observaciones?.trim() ?? '',
    entregadoEn: api.entregado_en,
    entregadoA: textoONulo(api.entregado_a),
    motivoNoEntrega: textoONulo(api.motivo_no_entrega),
    fotoNoEntrega: textoONulo(api.foto_no_entrega),
    destino,
    salidaEn: api.salida_en ? new Date(api.salida_en) : null,
    productos: (api.productos ?? []).map((p) => ({
      idLinea: p.id,
      nombre: p.nombre,
      cantidad: p.cantidad,
      imagen: p.imagen || null,
    })),
    ultimaPosicion: mapearPosicion(api.ultima_posicion),
  };
}
