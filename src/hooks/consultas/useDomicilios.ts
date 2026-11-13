import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { claves } from '@/hooks/consultas/claves';
import type { Domicilio } from '@/modelos/domicilio';
import type { ErrorDeApi } from '@/servicios/api';
import {
  confirmarEntrega,
  fechaLocal,
  iniciarRecorrido,
  listarDomiciliosDelDia,
  obtenerDomicilio,
  reportarNoEntrega,
} from '@/servicios/domicilios';
import { subirFotoNoEntrega } from '@/servicios/fotos';
import { useSesion } from '@/store/sesion';

/** Domicilios de hoy del usuario en sesión (RF-09 y RF-15). */
export function useDomiciliosDeHoy() {
  const usuarioId = useSesion((s) => s.usuario?.id);
  const fecha = fechaLocal();
  return useQuery<Awaited<ReturnType<typeof listarDomiciliosDelDia>>, ErrorDeApi>({
    queryKey: claves.domiciliosDelDia(usuarioId ?? 0, fecha),
    queryFn: () => listarDomiciliosDelDia(fecha),
    enabled: usuarioId != null,
    staleTime: 30_000,
  });
}

/** Detalle de un domicilio por id (RF-10). Un 404 no se reintenta. */
export function useDomicilio(id: number) {
  return useQuery<Awaited<ReturnType<typeof obtenerDomicilio>>, ErrorDeApi>({
    queryKey: claves.domicilio(id),
    queryFn: () => obtenerDomicilio(id),
    enabled: Number.isInteger(id) && id > 0,
    staleTime: 30_000,
  });
}

/**
 * Después de un cambio confirmado por el backend: actualiza el detalle y las
 * listas del día en memoria, y luego las recarga. Las respuestas de las
 * acciones no traen productos ni posición, así que se conservan los que ya
 * había. Las listas se actualizan antes de recargar porque el mapa deja de
 * enviar la posición si el domicilio seguido no aparece "en camino" en ellas.
 */
function aplicarCambio(clienteConsultas: QueryClient, id: number, domicilio: Domicilio) {
  const conservar = (anterior: Domicilio): Domicilio => ({
    ...domicilio,
    productos: anterior.productos,
    ultimaPosicion: anterior.ultimaPosicion,
  });
  clienteConsultas.setQueryData<Domicilio>(claves.domicilio(id), (anterior) => (anterior ? conservar(anterior) : domicilio));
  clienteConsultas.setQueriesData<Domicilio[]>({ queryKey: claves.domiciliosDelDiaTodos }, (lista) =>
    lista?.map((d) => (d.id === id ? conservar(d) : d)),
  );
  void clienteConsultas.invalidateQueries({ queryKey: claves.domicilios });
}

/**
 * Las acciones del domiciliario solo cambian algo cuando el backend confirma:
 * sin conexión, nada cambia y el error queda en `error` para mostrarlo (RNF-05).
 */

/** Inicia el recorrido de un domicilio (RF-11). */
export function useIniciarRecorrido(id: number) {
  const clienteConsultas = useQueryClient();
  return useMutation<Domicilio, ErrorDeApi>({
    mutationFn: () => iniciarRecorrido(id),
    onSuccess: (domicilio) => aplicarCambio(clienteConsultas, id, domicilio),
  });
}

/** Confirma la entrega del pedido completo (RF-13). */
export function useConfirmarEntrega(id: number) {
  const clienteConsultas = useQueryClient();
  return useMutation<Domicilio, ErrorDeApi, { quienRecibio: string }>({
    mutationFn: ({ quienRecibio }) => confirmarEntrega(id, quienRecibio),
    onSuccess: (domicilio) => aplicarCambio(clienteConsultas, id, domicilio),
  });
}

/** Sube la foto y reporta la no entrega (RF-14). */
export function useReportarNoEntrega(id: number) {
  const clienteConsultas = useQueryClient();
  return useMutation<Domicilio, ErrorDeApi, { motivo: string; uriFoto: string }>({
    mutationFn: async ({ motivo, uriFoto }) => reportarNoEntrega(id, motivo, await subirFotoNoEntrega(id, uriFoto)),
    onSuccess: (domicilio) => aplicarCambio(clienteConsultas, id, domicilio),
  });
}
