/**
 * Cada cuánto se envía la posición al backend (RN-03: de 10 a 15 segundos,
 * por confirmar con Karamba; se usa el máximo para gastar menos batería y datos).
 */
export const INTERVALO_ENVIO_MS = 15_000;

/**
 * El GPS entrega posiciones a su ritmo (en iOS no se puede fijar el intervalo),
 * así que la app decide cuándo enviar: la primera de inmediato y después una
 * cada `INTERVALO_ENVIO_MS`. Si hay un envío en curso, se espera.
 */
export function debeEnviar(ultimoEnvio: number | null, ahora: number, enviando: boolean): boolean {
  if (enviando) return false;
  if (ultimoEnvio == null) return true;
  return ahora - ultimoEnvio >= INTERVALO_ENVIO_MS;
}
