import { mapearDomicilio } from '@/mapeadores/domicilio';
import type { Domicilio } from '@/modelos/domicilio';
import { aErrorDeApi, api } from '@/servicios/api';
import type { DomicilioApi } from '@/tipos/api';

/** Fecha local en formato YYYY-MM-DD. */
export function fechaLocal(fecha = new Date()): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/**
 * Domicilios con entrega en la fecha dada (B-02). El backend ya filtra por rol:
 * el domiciliario recibe solo los suyos y el administrador recibe todos.
 */
export async function listarDomiciliosDelDia(fecha: string): Promise<Domicilio[]> {
  try {
    const { data } = await api.get<DomicilioApi[]>('/domicilios/domicilios/', {
      params: { fecha_ini: fecha, fecha_fin: fecha },
    });
    return data.map(mapearDomicilio);
  } catch (error) {
    throw aErrorDeApi(error);
  }
}

/** Detalle de un domicilio. Si no existe o es de otro domiciliario, el backend responde 404. */
export async function obtenerDomicilio(id: number): Promise<Domicilio> {
  try {
    const { data } = await api.get<DomicilioApi>(`/domicilios/domicilios/${id}/`);
    return mapearDomicilio(data);
  } catch (error) {
    throw aErrorDeApi(error);
  }
}
