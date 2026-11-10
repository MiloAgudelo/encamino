import { useQuery } from '@tanstack/react-query';

import { claves } from '@/hooks/consultas/claves';
import type { Seguimiento } from '@/modelos/seguimiento';
import type { ErrorDeApi } from '@/servicios/api';
import { obtenerSeguimiento } from '@/servicios/seguimiento';

const PASOS_QUE_SE_ACTUALIZAN = new Set(['asignado', 'en_camino']);

/**
 * Seguimiento del pedido por código (RF-06, RF-07). Con domiciliario asignado
 * y mientras va en camino se actualiza solo cada 15 segundos, para mostrar la
 * salida y la posición sin recargar; cuando termina, deja de consultar.
 */
export function useSeguimiento(codigo: string) {
  return useQuery<Seguimiento, ErrorDeApi>({
    queryKey: claves.seguimiento(codigo),
    queryFn: () => obtenerSeguimiento(codigo),
    staleTime: 10_000,
    refetchInterval: (consulta) =>
      consulta.state.data && PASOS_QUE_SE_ACTUALIZAN.has(consulta.state.data.pasoActual) ? 15_000 : false,
  });
}
