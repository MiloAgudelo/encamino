import { mapearUsuario } from '@/mapeadores/sesion';
import { aErrorDeApi, api, ErrorDeApi } from '@/servicios/api';
import { useSesion } from '@/store/sesion';
import type { LoginApi } from '@/tipos/api';

/**
 * Ingresa con el correo y la contraseña de Karamba (RF-02) y guarda la sesión.
 * Una cuenta de otro rol (cocina, decoración, etc.) no entra.
 */
export async function ingresar(email: string, contrasena: string): Promise<void> {
  let datos: LoginApi;
  try {
    ({ data: datos } = await api.post<LoginApi>('/auth/login/', { email, password: contrasena }));
  } catch (error) {
    const e = aErrorDeApi(error);
    // El mensaje no revela si falló el correo o la contraseña.
    if (e.tipo === 'no_autorizado') throw new ErrorDeApi('no_autorizado', 'Correo o contraseña incorrectos.');
    throw e;
  }

  const usuario = mapearUsuario(datos.usuario);
  if (!usuario) {
    throw new ErrorDeApi('no_autorizado', 'Esta app es para domiciliarios y administradores.');
  }
  useSesion.getState().iniciar({ access: datos.access, refresh: datos.refresh, usuario });
}

/** Cierra la sesión: revoca el token en el backend si se puede y borra los tokens del teléfono. */
export async function cerrarSesion(): Promise<void> {
  const { refresh, cerrar } = useSesion.getState();
  try {
    if (refresh) await api.post('/auth/logout/', { refresh });
  } catch {
    // Sin conexión o token ya vencido: igual se borra la sesión local.
  } finally {
    cerrar();
  }
}
