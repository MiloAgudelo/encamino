import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { EstadoDatos } from '@/components/EstadoDatos';
import type { RolEquipo } from '@/modelos/sesion';
import { useSesion } from '@/store/sesion';

interface RequiereSesionProps {
  children: ReactNode;
  /** Si se indica, solo ese rol ve el contenido; el resto vuelve a la lista. */
  rol?: RolEquipo;
}

/**
 * Muestra el contenido solo con sesión del equipo. Sin sesión (o si se cerró
 * porque el token ya no se pudo renovar), lleva al ingreso.
 */
export function RequiereSesion({ children, rol }: RequiereSesionProps) {
  const hidratada = useSesion((s) => s.hidratada);
  const usuario = useSesion((s) => s.usuario);

  if (!hidratada) return <EstadoDatos tipo="cargando" mensaje="Abriendo tu sesión…" />;
  if (!usuario) return <Redirect href="/ingresar" />;
  if (rol && usuario.rol !== rol) return <Redirect href="/(equipo)/(tabs)" />;
  return children;
}
