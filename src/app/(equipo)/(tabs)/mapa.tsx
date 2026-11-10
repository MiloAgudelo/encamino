import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';

import { EstadoDatos } from '@/components/EstadoDatos';
import { Mapa } from '@/components/mapa/Mapa';
import { PanelPermiso } from '@/components/mapa/PanelPermiso';
import type { MarcadorMapa } from '@/components/mapa/tipos';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { enlaceGoogleMaps, PUNTO_DESPACHO } from '@/constantes/despacho';
import { claves } from '@/hooks/consultas/claves';
import { useDomiciliosDeHoy } from '@/hooks/consultas/useDomicilios';
import { useSeguimientoGps } from '@/hooks/useSeguimientoGps';
import { THEME } from '@/lib/theme';
import { hace, horaCorta } from '@/lib/tiempo';
import { cn } from '@/lib/utils';
import { tituloDomicilio, type Domicilio } from '@/modelos/domicilio';
import type { ErrorDeApi } from '@/servicios/api';
import { listarEnCamino } from '@/servicios/posiciones';
import { useSesion } from '@/store/sesion';
import { useEnvioPosicion } from '@/store/seguimiento';

/** Una posición de más de 2 minutos se atenúa y dice "hace N min" (RF-16, RF-22). */
const POSICION_VIEJA_MS = 2 * 60_000;

const MARCADOR_DESPACHO: MarcadorMapa = {
  id: 'despacho',
  tipo: 'despacho',
  coordenadas: PUNTO_DESPACHO.coordenadas,
  titulo: PUNTO_DESPACHO.nombre,
  descripcion: PUNTO_DESPACHO.direccion,
};

export default function PantallaMapa() {
  const esAdministrador = useSesion((s) => s.usuario?.rol === 'administrador');
  return esAdministrador ? <MapaSupervision /> : <MapaDomiciliario />;
}

function irAlDetalle(id: number) {
  router.push({ pathname: '/domicilio/[id]', params: { id: String(id) } });
}

// ── Domiciliario (RF-12) ────────────────────────────────────────────────────

function MapaDomiciliario() {
  const consulta = useDomiciliosDeHoy();
  const gps = useSeguimientoGps();
  const [clave, setClave] = useState(0);
  const posicion = useEnvioPosicion((s) => s.posicion);

  const enCamino = useMemo(() => (consulta.data ?? []).filter((d) => d.estado === 'en_camino'), [consulta.data]);
  const [elegido, setElegido] = useState<number | null>(null);
  const domicilio =
    enCamino.find((d) => d.id === (gps.domicilioId ?? elegido)) ?? enCamino.find((d) => d.id === elegido) ?? enCamino[0];

  // Si el domicilio que se seguía ya no va en camino (se reportó), se deja de enviar.
  useEffect(() => {
    if (consulta.isSuccess && gps.domicilioId != null && !enCamino.some((d) => d.id === gps.domicilioId)) {
      useEnvioPosicion.getState().detener();
    }
  }, [consulta.isSuccess, enCamino, gps.domicilioId]);

  // Al llegar desde "Iniciar recorrido" el envío ya está activo: si falta el permiso, se pide.
  const { permiso } = gps;
  const { pedir } = permiso;
  const yaPidio = useRef(false);
  useEffect(() => {
    if (gps.modo === 'activo' && permiso.permiso === 'sin_preguntar' && !yaPidio.current) {
      yaPidio.current = true;
      void pedir();
    }
  }, [gps.modo, permiso.permiso, pedir]);

  if (consulta.isPending) return <EstadoDatos tipo="cargando" mensaje="Cargando tus domicilios…" />;
  if (consulta.isError) {
    return <EstadoDatos tipo="error" mensaje={consulta.error.message} alReintentar={() => consulta.refetch()} />;
  }
  if (!domicilio) {
    return (
      <EstadoDatos
        tipo="vacio"
        mensaje="No tienes domicilios en camino. Inicia el recorrido desde el detalle de un domicilio."
        accion={{ texto: 'Ver mis domicilios', alPresionar: () => router.navigate('/(equipo)/(tabs)') }}
      />
    );
  }

  const marcadores: MarcadorMapa[] = [MARCADOR_DESPACHO];
  if (domicilio.destino) {
    marcadores.push({
      id: `destino-${domicilio.id}`,
      tipo: 'destino',
      coordenadas: domicilio.destino.coordenadas,
      titulo: domicilio.direccion,
      descripcion: domicilio.destino.aproximado ? `${domicilio.barrio} (ubicación aproximada del barrio)` : domicilio.barrio,
    });
  }
  if (posicion) marcadores.push({ id: 'yo', tipo: 'domiciliario', coordenadas: posicion, titulo: 'Tú' });

  const esteDomicilio = gps.domicilioId === domicilio.id;
  const modo = esteDomicilio ? gps.modo : 'inactivo';

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">
        <Mapa marcadores={marcadores} enfoque={posicion ? { coordenadas: posicion, clave } : null} />
      </View>
      <ScrollView className="max-h-[55%] border-t border-border" contentContainerClassName="gap-3 p-4">
        {enCamino.length > 1 ? (
          <View className="flex-row flex-wrap gap-2">
            {enCamino.map((d) => (
              <Pressable
                key={d.id}
                accessibilityRole="button"
                onPress={() => setElegido(d.id)}
                disabled={gps.modo === 'activo'}
                className={cn(
                  'rounded-full border border-border px-3 py-1.5',
                  d.id === domicilio.id && 'border-primary bg-primary/10',
                )}
              >
                <Text className="text-sm">{tituloDomicilio(d)}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Pressable onPress={() => irAlDetalle(domicilio.id)} accessibilityRole="link">
          <Text className="font-semibold">
            {tituloDomicilio(domicilio)} · {domicilio.barrio}
          </Text>
          <Text variant="muted">{domicilio.direccion}</Text>
        </Pressable>
        {!domicilio.destino ? (
          <Text variant="muted" className="text-sm">
            El destino todavía no tiene coordenadas: guíate por la dirección.
          </Text>
        ) : null}

        <PanelPermiso permiso={permiso} />

        <EstadoEnvio modo={modo} ultimoEnvio={esteDomicilio ? gps.ultimoEnvio : null} error={gps.error} escuchando={gps.escuchando} />

        <View className="flex-row flex-wrap gap-2">
          {modo === 'inactivo' ? (
            <Button className="flex-1" onPress={() => void gps.activar(domicilio.id)}>
              <Ionicons name="radio-outline" size={18} color={THEME.primaryForeground} />
              <Text>Compartir mi posición</Text>
            </Button>
          ) : modo === 'activo' ? (
            <Button className="flex-1" variant="outline" onPress={gps.pausar}>
              <Ionicons name="pause" size={18} color={THEME.foreground} />
              <Text>Pausar</Text>
            </Button>
          ) : (
            <Button className="flex-1" onPress={gps.reanudar}>
              <Ionicons name="play" size={18} color={THEME.primaryForeground} />
              <Text>Reanudar</Text>
            </Button>
          )}
          <Button variant="outline" disabled={!posicion} onPress={() => setClave((c) => c + 1)}>
            <Ionicons name="locate" size={18} color={THEME.foreground} />
            <Text>Centrar en mí</Text>
          </Button>
        </View>
        <Button
          variant="secondary"
          onPress={() =>
            void Linking.openURL(
              enlaceGoogleMaps(domicilio.destino?.aproximado === false ? domicilio.destino.coordenadas : `${domicilio.direccion}, ${domicilio.barrio}, Cartago`),
            )
          }
        >
          <Ionicons name="navigate-outline" size={18} color={THEME.foreground} />
          <Text>Cómo llegar en Google Maps</Text>
        </Button>
      </ScrollView>
    </View>
  );
}

function EstadoEnvio({
  modo,
  ultimoEnvio,
  error,
  escuchando,
}: {
  modo: 'inactivo' | 'activo' | 'pausado';
  ultimoEnvio: number | null;
  error: string | null;
  escuchando: boolean;
}) {
  // Vuelve a dibujar cada 30 s para que "hace N min" no se quede quieto.
  const [, setPulso] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPulso((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  let texto: string;
  if (modo === 'inactivo') texto = 'Tu posición no se está compartiendo.';
  else if (modo === 'pausado') texto = 'Envío en pausa: el cliente ve tu última posición.';
  else if (!escuchando) texto = 'Esperando el GPS…';
  else if (ultimoEnvio) texto = `Compartiendo tu posición · enviada ${hace(new Date(ultimoEnvio))}.`;
  else texto = 'Compartiendo tu posición…';

  return (
    <View className="gap-1" accessibilityLiveRegion="polite">
      <View className="flex-row items-center gap-2">
        <View
          className={cn('h-2.5 w-2.5 rounded-full', modo === 'activo' && escuchando ? 'bg-green-600' : 'bg-muted-foreground')}
        />
        <Text>{texto}</Text>
      </View>
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
    </View>
  );
}

// ── Administrador (RF-16) ───────────────────────────────────────────────────

function MapaSupervision() {
  const [enFoco, setEnFoco] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setEnFoco(true);
      return () => setEnFoco(false);
    }, []),
  );
  // Consulta cada 15 s solo mientras la pantalla está abierta.
  const consulta = useQuery<Domicilio[], ErrorDeApi>({
    queryKey: claves.enCamino,
    queryFn: listarEnCamino,
    enabled: enFoco,
    refetchInterval: enFoco ? 15_000 : false,
    staleTime: 10_000,
  });

  if (consulta.isPending) return <EstadoDatos tipo="cargando" mensaje="Buscando domiciliarios en camino…" />;
  if (consulta.isError) {
    return <EstadoDatos tipo="error" mensaje={consulta.error.message} alReintentar={() => consulta.refetch()} />;
  }

  const ahora = Date.now();
  const marcadores: MarcadorMapa[] = [MARCADOR_DESPACHO];
  for (const d of consulta.data) {
    if (!d.ultimaPosicion) continue;
    const vieja = ahora - d.ultimaPosicion.recibidaEn.getTime() > POSICION_VIEJA_MS;
    marcadores.push({
      id: `domiciliario-${d.id}`,
      tipo: 'domiciliario',
      coordenadas: d.ultimaPosicion.coordenadas,
      titulo: d.domiciliario ?? 'Domiciliario',
      descripcion: `${tituloDomicilio(d)} · ${horaCorta(d.ultimaPosicion.recibidaEn)}${vieja ? ` (${hace(d.ultimaPosicion.recibidaEn)})` : ''}`,
      atenuado: vieja,
      alPresionar: () => irAlDetalle(d.id),
    });
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">
        <Mapa marcadores={marcadores} />
      </View>
      <ScrollView className="max-h-[40%] border-t border-border" contentContainerClassName="gap-2 p-4">
        <Text className="font-semibold">
          {consulta.data.length === 0
            ? 'Nadie va en camino ahora.'
            : `${consulta.data.length} en camino · se actualiza cada 15 s`}
        </Text>
        {consulta.data.map((d) => (
          <Pressable key={d.id} accessibilityRole="button" onPress={() => irAlDetalle(d.id)} className="gap-0.5 active:opacity-70">
            <Text>
              {d.domiciliario ?? 'Domiciliario'} · {tituloDomicilio(d)} · {d.barrio}
            </Text>
            <Text variant="muted" className="text-sm">
              {d.ultimaPosicion
                ? `Última posición ${hace(d.ultimaPosicion.recibidaEn)}`
                : 'Todavía no ha enviado su posición'}
              {d.salidaEn ? ` · salió a las ${horaCorta(d.salidaEn)}` : ''}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
