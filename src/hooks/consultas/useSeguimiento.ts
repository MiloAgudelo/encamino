import { useQuery } from '@tanstack/react-query';

import { claves } from '@/hooks/consultas/claves';
import type { Seguimiento } from '@/modelos/seguimiento';
import type { ErrorDeApi } from '@/servicios/api';
import { obtenerSeguimiento } from '@/servicios/seguimiento';

/**
 * Seguimiento del pedido por código (RF-06). Mientras va en camino se
 * actualiza solo cada 15 segundos; cuando termina, deja de consultar.
 */
export function useSeguimiento(codigo: string) {
  return useQuery<Seguimiento, ErrorDeApi>({
    queryKey: claves.seguimiento(codigo),
    queryFn: () => obtenerSeguimiento(codigo),
    staleTime: 10_000,
    refetchInterval: (consulta) => (consulta.state.data?.pasoActual === 'en_camino' ? 15_000 : false),
  });
}
