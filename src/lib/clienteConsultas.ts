import { QueryClient } from '@tanstack/react-query';

import { ErrorDeApi } from '@/servicios/api';

/** Errores que no se arreglan reintentando: se muestran de una vez. */
function valeLaPenaReintentar(intentos: number, error: unknown): boolean {
  if (error instanceof ErrorDeApi && ['no_encontrado', 'no_autorizado', 'datos_invalidos'].includes(error.tipo)) {
    return false;
  }
  return intentos < 2;
}

export function crearClienteConsultas(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: valeLaPenaReintentar, gcTime: 5 * 60_000 },
      // Las escrituras nunca se reintentan solas: sin conexión se informa y no se confirma nada (RNF-05).
      mutations: { retry: false },
    },
  });
}
