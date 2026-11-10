import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

/**
 * sin_preguntar: aún no se pidió. concedido. denegado: se puede volver a pedir.
 * bloqueado: el teléfono ya no deja preguntar; solo desde los ajustes.
 */
export type EstadoPermiso = 'cargando' | 'sin_preguntar' | 'concedido' | 'denegado' | 'bloqueado';

export interface PermisoUbicacion {
  permiso: EstadoPermiso;
  /** El GPS del teléfono está encendido; null mientras se revisa. */
  gpsEncendido: boolean | null;
  /** Pide el permiso de ubicación en primer plano. Devuelve si quedó concedido. */
  pedir: () => Promise<boolean>;
  abrirAjustes: () => void;
  revisar: () => Promise<void>;
}

function aEstado(respuesta: Location.LocationPermissionResponse): EstadoPermiso {
  if (respuesta.granted) return 'concedido';
  if (respuesta.status === Location.PermissionStatus.UNDETERMINED) return 'sin_preguntar';
  return respuesta.canAskAgain ? 'denegado' : 'bloqueado';
}

/**
 * Permiso de ubicación en primer plano y estado del GPS (RF-20). Se vuelve a
 * revisar cada vez que la app regresa al frente, así que al conceder el
 * permiso o encender el GPS desde los ajustes funciona sin reiniciar la app.
 */
export function usePermisoUbicacion(): PermisoUbicacion {
  const [permiso, setPermiso] = useState<EstadoPermiso>('cargando');
  const [gpsEncendido, setGpsEncendido] = useState<boolean | null>(null);

  const revisar = useCallback(async () => {
    const [respuesta, gps] = await Promise.all([
      Location.getForegroundPermissionsAsync(),
      Location.hasServicesEnabledAsync().catch(() => true),
    ]);
    setPermiso(aEstado(respuesta));
    setGpsEncendido(gps);
  }, []);

  useEffect(() => {
    void revisar();
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') void revisar();
    });
    return () => suscripcion.remove();
  }, [revisar]);

  const pedir = useCallback(async () => {
    const respuesta = await Location.requestForegroundPermissionsAsync();
    setPermiso(aEstado(respuesta));
    setGpsEncendido(await Location.hasServicesEnabledAsync().catch(() => true));
    return respuesta.granted;
  }, []);

  const abrirAjustes = useCallback(() => void Linking.openSettings(), []);

  return { permiso, gpsEncendido, pedir, abrirAjustes, revisar };
}
