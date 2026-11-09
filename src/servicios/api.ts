import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

import { useSesion } from '@/store/sesion';
import type { ErrorApi, RefreshApi } from '@/tipos/api';

const URL_BASE = process.env.EXPO_PUBLIC_API_URL;

if (!URL_BASE) {
  throw new Error('Falta EXPO_PUBLIC_API_URL en .env (ver .env.template).');
}

/** Única instancia HTTP de la app (RNF-03). Agrega el token y lo renueva cuando vence. */
export const api = axios.create({ baseURL: URL_BASE, timeout: 15000 });

// Instancia sin interceptores, para renovar el token sin entrar en bucle.
const apiSinSesion = axios.create({ baseURL: URL_BASE, timeout: 15000 });

api.interceptors.request.use((config) => {
  const { access } = useSesion.getState();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let renovacionEnCurso: Promise<string | null> | null = null;

/** Pide un token de acceso nuevo; si varias peticiones vencen a la vez, comparten la misma renovación. */
function renovarAcceso(): Promise<string | null> {
  renovacionEnCurso ??= (async () => {
    const { refresh, renovarAcceso: guardar, cerrar } = useSesion.getState();
    if (!refresh) return null;
    try {
      const { data } = await apiSinSesion.post<RefreshApi>('/auth/refresh/', { refresh });
      guardar(data.access);
      return data.access;
    } catch {
      // La renovación venció o se revocó: se vuelve al ingreso (RF-03).
      cerrar();
      return null;
    } finally {
      renovacionEnCurso = null;
    }
  })();
  return renovacionEnCurso;
}

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (AxiosRequestConfig & { _reintento?: boolean }) | undefined;
  if (error.response?.status === 401 && original && !original._reintento && useSesion.getState().refresh) {
    original._reintento = true;
    const access = await renovarAcceso();
    if (access) {
      original.headers = { ...original.headers, Authorization: `Bearer ${access}` };
      return api(original);
    }
  }
  return Promise.reject(error);
});

/** Tipo de falla, para que cada pantalla decida qué mostrar. */
export type TipoError = 'sin_conexion' | 'no_encontrado' | 'no_autorizado' | 'datos_invalidos' | 'servidor';

export class ErrorDeApi extends Error {
  constructor(
    public readonly tipo: TipoError,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'ErrorDeApi';
  }
}

/** Convierte cualquier error de una petición en un ErrorDeApi con un mensaje para mostrar. */
export function aErrorDeApi(error: unknown): ErrorDeApi {
  if (error instanceof ErrorDeApi) return error;
  if (axios.isAxiosError<ErrorApi>(error)) {
    if (!error.response) {
      return new ErrorDeApi('sin_conexion', 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.');
    }
    const { status, data } = error.response;
    const detalle = data?.error ?? data?.detail;
    if (status === 404) return new ErrorDeApi('no_encontrado', detalle ?? 'No encontrado.');
    if (status === 401 || status === 403) return new ErrorDeApi('no_autorizado', detalle ?? 'No tienes permiso para ver esto.');
    if (status >= 400 && status < 500) return new ErrorDeApi('datos_invalidos', detalle ?? 'Revisa los datos e inténtalo de nuevo.');
  }
  return new ErrorDeApi('servidor', 'Algo falló en el servidor. Inténtalo de nuevo en un momento.');
}
