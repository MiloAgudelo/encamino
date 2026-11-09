import { mapearSeguimiento } from '@/mapeadores/seguimiento';
import type { Seguimiento } from '@/modelos/seguimiento';
import { aErrorDeApi, api, ErrorDeApi } from '@/servicios/api';
import type { SeguimientoApi } from '@/tipos/api';

const FORMATO_CODIGO = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Saca el código de lo que pegó el cliente: el código solo o el enlace
 * completo del mensaje de WhatsApp (…/pedidos/seguimiento/<código>).
 */
export function extraerCodigo(texto: string): string {
  const limpio = texto.trim();
  const coincidencia = limpio.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return (coincidencia?.[0] ?? limpio).toLowerCase();
}

/** Seguimiento público del pedido, sin sesión (RF-05, RF-06). */
export async function obtenerSeguimiento(codigo: string): Promise<Seguimiento> {
  if (!FORMATO_CODIGO.test(codigo)) {
    // Un código mal formado no se envía: se trata igual que uno inexistente.
    throw new ErrorDeApi('no_encontrado', 'No encontramos este pedido.');
  }
  try {
    const { data } = await api.get<SeguimientoApi>(`/pedidos/pedidos/seguimiento/${codigo}/`);
    return mapearSeguimiento(data);
  } catch (error) {
    throw aErrorDeApi(error);
  }
}
