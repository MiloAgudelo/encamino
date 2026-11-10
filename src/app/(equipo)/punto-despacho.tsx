import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Linking, ScrollView, View } from 'react-native';

import { Mapa } from '@/components/mapa/Mapa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { enlaceGoogleMaps, PUNTO_DESPACHO } from '@/constantes/despacho';
import { THEME } from '@/lib/theme';

/** Dirección, horario y contacto de Karamba, con su marcador en el mapa (RF-19). */
export default function PuntoDespacho() {
  const p = PUNTO_DESPACHO;
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4 pb-10">
      <Mapa
        alto={260}
        marcadores={[{ id: 'despacho', tipo: 'despacho', coordenadas: p.coordenadas, titulo: p.nombre, descripcion: p.direccion }]}
      />
      <Card className="py-4">
        <CardContent className="gap-3 px-4">
          <Fila icono="storefront-outline" titulo={p.nombre} texto={p.direccion} />
          <Separator />
          <Fila icono="time-outline" titulo="Horario" texto={p.horario.map((h) => `${h.dias}: ${h.horas}`).join('\n')} />
          <Separator />
          <Fila icono="logo-whatsapp" titulo="WhatsApp" texto={p.telefonoVisible} />
          <Fila icono="mail-outline" titulo="Correo" texto={p.correo} />
        </CardContent>
      </Card>
      <Button onPress={() => void Linking.openURL(enlaceGoogleMaps(p.coordenadas))}>
        <Ionicons name="navigate-outline" size={18} color={THEME.primaryForeground} />
        <Text>Cómo llegar</Text>
      </Button>
      <View className="flex-row gap-2">
        <Button className="flex-1" variant="outline" onPress={() => void Linking.openURL(`https://wa.me/${p.whatsapp}`)}>
          <Text>Escribir por WhatsApp</Text>
        </Button>
        <Button className="flex-1" variant="outline" onPress={() => void Linking.openURL(`tel:+${p.whatsapp}`)}>
          <Text>Llamar</Text>
        </Button>
      </View>
    </ScrollView>
  );
}

function Fila({ icono, titulo, texto }: { icono: ComponentProps<typeof Ionicons>['name']; titulo: string; texto: string }) {
  return (
    <View className="flex-row gap-3">
      <Ionicons name={icono} size={18} color={THEME.mutedForeground} style={{ marginTop: 2 }} />
      <View className="flex-1 gap-0.5">
        <Text variant="muted">{titulo}</Text>
        <Text>{texto}</Text>
      </View>
    </View>
  );
}
