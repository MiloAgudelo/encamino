import { Linking, Pressable, ScrollView, View } from 'react-native';

import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { COLOR_MARCADOR_CSS, NOMBRE_TIPO_MARCADOR, type MapaProps } from '@/components/mapa/tipos';
import { enlaceGoogleMaps } from '@/constantes/despacho';

/**
 * Versión web del mapa: `react-native-maps` no funciona en el navegador. Muestra
 * los mismos marcadores como lista, cada uno con su enlace a Google Maps, para
 * que la pantalla siga siendo útil y verificable. El mapa se ve en el teléfono.
 */
export function Mapa({ marcadores, alto }: MapaProps) {
  const lista = (
    <Card className="py-4">
      <CardContent className="gap-3 px-4">
        <Text variant="muted">El mapa se ve en la app del teléfono. Aquí, los puntos que mostraría:</Text>
        {marcadores.map((m) => (
          <View key={m.id} className="flex-row items-start gap-3" accessibilityLabel={`Marcador: ${m.titulo}`}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                marginTop: 4,
                backgroundColor: COLOR_MARCADOR_CSS[m.tipo],
                opacity: m.atenuado ? 0.5 : 1,
              }}
            />
            <Pressable className="flex-1 gap-0.5" onPress={m.alPresionar} disabled={!m.alPresionar}>
              <Text className="font-semibold">
                {m.titulo} <Text variant="muted">· {NOMBRE_TIPO_MARCADOR[m.tipo]}</Text>
              </Text>
              {m.descripcion ? <Text variant="muted">{m.descripcion}</Text> : null}
              <Text
                className="text-sm text-primary underline"
                onPress={() => void Linking.openURL(enlaceGoogleMaps(m.coordenadas))}
              >
                {m.coordenadas.latitud.toFixed(5)}, {m.coordenadas.longitud.toFixed(5)}
              </Text>
            </Pressable>
          </View>
        ))}
      </CardContent>
    </Card>
  );
  // Sin alto fijo ocupa el espacio disponible, como el mapa nativo, y se desplaza.
  return alto ? lista : <ScrollView className="flex-1" contentContainerClassName="p-4">{lista}</ScrollView>;
}
