import type { RolEquipo, UsuarioSesion } from '@/modelos/sesion';
import type { RolApi, UsuarioApi } from '@/tipos/api';

const ROL_EQUIPO: Partial<Record<RolApi, RolEquipo>> = {
  ADMIN: 'administrador',
  DOMICILIARIO: 'domiciliario',
};

/** Convierte el usuario del backend; devuelve null si su rol no usa la app (RF-02). */
export function mapearUsuario(api: UsuarioApi): UsuarioSesion | null {
  const rol = ROL_EQUIPO[api.rol];
  if (!rol) return null;
  return { id: api.id, nombre: api.nombre, email: api.email, rol };
}
