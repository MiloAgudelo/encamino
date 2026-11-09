/** Roles que pueden usar la app. El resto del equipo de Karamba usa el panel web. */
export type RolEquipo = 'administrador' | 'domiciliario';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  email: string;
  rol: RolEquipo;
}
