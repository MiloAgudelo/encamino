import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { usePermisoUbicacion, type PermisoUbicacion } from '@/hooks/usePermisoUbicacion';
import { debeEnviar } from '@/logica/envioPosicion';
import { ErrorDeApi } from '@/servicios/api';
import { enviarPosicion } from '@/servicios/posiciones';
import { useEnvioPosicion, type ModoSeguimiento } from '@/store/seguimiento';

export interface SeguimientoGps {
  modo: ModoSeguimiento;
  domicilioId: number | null;
  /** Hay una suscripción al GPS abierta en este momento. */
  escuchando: boolean;
  ultimoEnvio: number | null;
  error: string | null;
  permiso: PermisoUbicacion;
  /** Pide el permiso si falta y empieza a enviar la posición de este domicilio. */
  activar: (domicilioId: number) => Promise<void>;
  pausar: () => void;
  reanudar: () => void;
}

/**
 * Seguimiento GPS del domiciliario (RF-12, RF-20, RN-03).
 *
 * - Solo escucha el GPS mientras la pantalla que lo usa tiene el foco y la app
 *   está al frente (las pestañas siguen montadas al cambiar de pestaña, por eso
 *   `useFocusEffect` y no un `useEffect`). Al salir, pausar o reportar, la
 *   suscripción se libera.
 * - El GPS entrega posiciones a su ritmo; se envía una cada 15 segundos.
 * - Si el backend dice que el domicilio ya no va en camino, se detiene.
 */
export function useSeguimientoGps(): SeguimientoGps {
  const permiso = usePermisoUbicacion();
  const estado = useEnvioPosicion();
  const [enFoco, setEnFoco] = useState(false);
  const [alFrente, setAlFrente] = useState(AppState.currentState === 'active');
  const [escuchando, setEscuchando] = useState(false);
  const enviando = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setEnFoco(true);
      return () => setEnFoco(false);
    }, []),
  );

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (s: AppStateStatus) => setAlFrente(s === 'active'));
    return () => suscripcion.remove();
  }, []);

  const puedeEscuchar =
    enFoco &&
    alFrente &&
    estado.modo === 'activo' &&
    estado.domicilioId != null &&
    permiso.permiso === 'concedido' &&
    permiso.gpsEncendido !== false;
  const domicilioId = estado.domicilioId;

  useEffect(() => {
    if (!puedeEscuchar || domicilioId == null) return;
    let cancelado = false;
    let suscripcion: Location.LocationSubscription | null = null;

    void Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5_000, distanceInterval: 0 },
      (lectura) => {
        if (cancelado) return;
        const { latitude, longitude, accuracy } = lectura.coords;
        const coordenadas = { latitud: latitude, longitud: longitude };
        const tienda = useEnvioPosicion.getState();
        tienda.registrarLectura(coordenadas);
        if (!debeEnviar(tienda.ultimoEnvio, Date.now(), enviando.current)) return;

        enviando.current = true;
        enviarPosicion(domicilioId, { coordenadas, precisionMetros: accuracy ?? null, tomadaEn: lectura.timestamp })
          .then(() => useEnvioPosicion.getState().registrarEnvio(Date.now()))
          .catch((error: unknown) => {
            const e = error instanceof ErrorDeApi ? error : null;
            if (e?.tipo === 'datos_invalidos' || e?.tipo === 'no_encontrado') {
              // El domicilio se reportó o dejó de ser suyo: no tiene sentido seguir enviando.
              useEnvioPosicion.getState().detener('Se dejó de enviar: el domicilio ya no va en camino.');
            } else {
              useEnvioPosicion
                .getState()
                .registrarError(
                  e?.tipo === 'sin_conexion'
                    ? 'Sin conexión: la posición no se envió. Se reintenta sola en el próximo envío.'
                    : 'No se pudo enviar la posición. Se reintenta sola en el próximo envío.',
                );
            }
          })
          .finally(() => {
            enviando.current = false;
          });
      },
    )
      .then((s) => {
        if (cancelado) s.remove();
        else {
          suscripcion = s;
          setEscuchando(true);
        }
      })
      .catch(() => {
        if (!cancelado) useEnvioPosicion.getState().registrarError('No se pudo leer el GPS. Revisa que la ubicación esté activa.');
      });

    return () => {
      cancelado = true;
      suscripcion?.remove();
      setEscuchando(false);
    };
  }, [puedeEscuchar, domicilioId]);

  const { pedir } = permiso;
  const activar = useCallback(
    async (id: number) => {
      if (permiso.permiso !== 'concedido') {
        const concedido = await pedir();
        if (!concedido) return;
      }
      useEnvioPosicion.getState().activar(id);
    },
    [permiso.permiso, pedir],
  );

  return {
    modo: estado.modo,
    domicilioId: estado.domicilioId,
    escuchando,
    ultimoEnvio: estado.ultimoEnvio,
    error: estado.error,
    permiso,
    activar,
    pausar: estado.pausar,
    reanudar: estado.reanudar,
  };
}
