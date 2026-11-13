import { useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { EstadoDatos } from '@/components/EstadoDatos';
import { COLOR_MARCADOR, type MapaProps } from '@/components/mapa/tipos';
import { PUNTO_DESPACHO } from '@/constantes/despacho';

/**
 * Si el mapa no avisa que está listo en este tiempo, se ofrece reintentar
 * (RF-19). Solo cuenta con la pantalla visible y la app al frente: Google
 * Maps no avisa mientras está oculto (otra pestaña, el diálogo de permiso).
 */
const ESPERA_MAPA_MS = 15_000;

const REGION_INICIAL = {
  latitude: PUNTO_DESPACHO.coordenadas.latitud,
  longitude: PUNTO_DESPACHO.coordenadas.longitud,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

/**
 * Google Maps con los marcadores del punto de despacho, el destino y los
 * domiciliarios (ADR 0002). La versión web está en `Mapa.web.tsx`.
 */
export function Mapa({ marcadores, enfoque, alto }: MapaProps) {
  const mapa = useRef<MapView>(null);
  const [intento, setIntento] = useState(0);
  const [listo, setListo] = useState(false);
  const [noCargo, setNoCargo] = useState(false);
  const yaAjusto = useRef(false);
  const enFoco = useIsFocused();
  const [alFrente, setAlFrente] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estado) => setAlFrente(estado === 'active'));
    return () => suscripcion.remove();
  }, []);

  // Sin respuesta del mapa en un tiempo prudente: mensaje con "Reintentar".
  useEffect(() => {
    if (listo || !enFoco || !alFrente) return;
    const temporizador = setTimeout(() => setNoCargo(true), ESPERA_MAPA_MS);
    return () => clearTimeout(temporizador);
  }, [listo, intento, enFoco, alFrente]);

  // La primera vez que hay marcadores, el mapa se ajusta para mostrarlos todos.
  useEffect(() => {
    if (!listo || yaAjusto.current || marcadores.length === 0) return;
    yaAjusto.current = true;
    mapa.current?.fitToCoordinates(
      marcadores.map((m) => ({ latitude: m.coordenadas.latitud, longitude: m.coordenadas.longitud })),
      { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: false },
    );
  }, [listo, marcadores]);

  useEffect(() => {
    if (!listo || !enfoque) return;
    mapa.current?.animateToRegion(
      { latitude: enfoque.coordenadas.latitud, longitude: enfoque.coordenadas.longitud, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      400,
    );
    // Solo cuando se pide centrar de nuevo (cambia la clave), no con cada posición.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listo, enfoque?.clave]);

  // El mapa queda montado debajo del aviso: si responde tarde, el aviso se quita solo.
  return (
    <View style={alto ? { height: alto, width: '100%' } : { flex: 1 }}>
      <MapView
        key={intento}
        ref={mapa}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={REGION_INICIAL}
        onMapReady={() => setListo(true)}
        toolbarEnabled={false}
      >
        {marcadores.map((m) => (
          <Marker
            key={m.id}
            identifier={m.id}
            coordinate={{ latitude: m.coordenadas.latitud, longitude: m.coordenadas.longitud }}
            title={m.titulo}
            description={m.descripcion}
            pinColor={COLOR_MARCADOR[m.tipo]}
            opacity={m.atenuado ? 0.5 : 1}
            onCalloutPress={m.alPresionar}
          />
        ))}
      </MapView>
      {noCargo && !listo ? (
        <View style={StyleSheet.absoluteFill} className="bg-background">
          <EstadoDatos
            tipo="error"
            mensaje="El mapa no cargó. Revisa tu conexión; lo demás de la app sigue funcionando."
            alReintentar={() => {
              setNoCargo(false);
              yaAjusto.current = false;
              setIntento((n) => n + 1);
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
