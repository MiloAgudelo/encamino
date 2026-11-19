import { mapearDomicilio } from '@/mapeadores/domicilio';
import type { Domicilio } from '@/modelos/domicilio';
import { aErrorDeApi, api } from '@/servicios/api';
import type { FotoReportada } from '@/servicios/fotos';
import type { DomicilioApi, UsuarioListaApi } from '@/tipos/api';

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

/**
 * Inicia el recorrido (RF-11, B-03): el domicilio pasa de pendiente a en
 * camino. Solo lo puede hacer el domiciliario asignado. Sin conexión lanza un
 * ErrorDeApi `sin_conexion` y el estado no cambia.
 */
export async function iniciarRecorrido(id: number): Promise<Domicilio> {
  try {
    const { data } = await api.post<DomicilioApi>(`/domicilios/domicilios/${id}/iniciar/`);
    return mapearDomicilio(data);
  } catch (error) {
    throw aErrorDeApi(error);
  }
}

/** Confirma la entrega del pedido completo (RF-13, B-05). */
export async function confirmarEntrega(id: number, quienRecibio: string): Promise<Domicilio> {
  try {
    const { data } = await api.post<DomicilioApi>(`/domicilios/domicilios/${id}/entregar/`, {
      quien_recibio: quienRecibio,
    });
    return mapearDomicilio(data);
  } catch (error) {
    throw aErrorDeApi(error);
  }
}

/** Reporta que no se pudo entregar, con motivo y foto (RF-14, B-06). */
export async function reportarNoEntrega(id: number, motivo: string, foto: FotoReportada): Promise<Domicilio> {
  try {
    const { data } = await api.post<DomicilioApi>(`/domicilios/domicilios/${id}/no-entregar/`, {
      motivo_no_entrega: motivo,
      ...(foto.tipo === 'subida' ? { foto_no_entrega: foto.url } : { foto_simulada: true }),
    });
    return mapearDomicilio(data);
  } catch (error) {
    throw aErrorDeApi(error);
  }
}

/** Domiciliario activo al que se puede asignar un domicilio. */
export interface Domiciliario {
  id: number;
  nombre: string;
}

/** Domiciliarios activos, para reprogramar (RF-17). Solo el administrador puede pedirlos. */
export async function listarDomiciliarios(): Promise<Domiciliario[]> {
  try {
    const { data } = await api.get<UsuarioListaApi[]>('/usuarios/');
    return data
      .filter((u) => u.rol === 'DOMICILIARIO' && u.is_active)
      .map((u) => ({ id: u.id, nombre: u.nombre.trim() || u.email }));
  } catch (error) {
    throw aErrorDeApi(error);
  }
}

/**
 * Reprograma un domicilio no entregado (RF-17): el backend cierra el intento
 * actual, que queda en el historial, y crea uno nuevo para el domiciliario
 * elegido, con la nota del cobro calculado.
 */
export async function reprogramarDomicilio(id: number, domiciliarioId: number, nota: string): Promise<Domicilio> {
  try {
    const { data } = await api.post<DomicilioApi>(`/domicilios/domicilios/${id}/reasignar/`, {
      domiciliario_id: domiciliarioId,
      observaciones: nota,
    });
    return mapearDomicilio(data);
  } catch (error) {
    throw aErrorDeApi(error);
  }
}

/** Domicilios terminados entre dos fechas (RF-18). El backend ya filtra por rol. */
export async function listarHistorial(desde: string, hasta: string): Promise<Domicilio[]> {
  try {
    const { data } = await api.get<DomicilioApi[]>('/domicilios/domicilios/', {
      params: { fecha_ini: desde, fecha_fin: hasta },
    });
    return data.map(mapearDomicilio).filter((d) => d.estado === 'entregado' || d.estado === 'no_entregado');
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
