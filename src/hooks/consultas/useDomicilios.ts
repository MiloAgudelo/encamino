import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { claves } from '@/hooks/consultas/claves';
import type { Domicilio } from '@/modelos/domicilio';
import type { ErrorDeApi } from '@/servicios/api';
import { fechaLocal, iniciarRecorrido, listarDomiciliosDelDia, obtenerDomicilio } from '@/servicios/domicilios';
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
 * Inicia el recorrido de un domicilio (RF-11). Solo cuando el backend
 * confirma, se actualiza el detalle y se recargan las listas: sin conexión,
 * nada cambia y el error queda en `error` para mostrarlo.
 */
export function useIniciarRecorrido(id: number) {
  const clienteConsultas = useQueryClient();
  return useMutation<Domicilio, ErrorDeApi>({
    mutationFn: () => iniciarRecorrido(id),
    onSuccess: (domicilio) => {
      // El POST no trae productos ni posición: se conservan los del detalle.
      clienteConsultas.setQueryData<Domicilio>(claves.domicilio(id), (anterior) =>
        anterior ? { ...domicilio, productos: anterior.productos, ultimaPosicion: anterior.ultimaPosicion } : domicilio,
      );
      void clienteConsultas.invalidateQueries({ queryKey: claves.domicilios });
    },
  });
}
