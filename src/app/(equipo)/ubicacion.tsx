import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ScrollView, View } from 'react-native';

import { EstadoDatos } from '@/components/EstadoDatos';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { usePermisoUbicacion, type EstadoPermiso } from '@/hooks/usePermisoUbicacion';
import { THEME } from '@/lib/theme';

const TEXTO_PERMISO: Record<EstadoPermiso, string> = {
  cargando: 'Revisando…',
  sin_preguntar: 'Todavía no lo has dado',
  concedido: 'Concedido mientras usas la app',
  denegado: 'Negado',
  bloqueado: 'Bloqueado en los ajustes del teléfono',
};

/**
 * Estado del permiso de ubicación y del GPS (RF-20): para qué se usa, cómo
 * darlo y un acceso a los ajustes. Al volver de los ajustes se revisa solo.
 */
export default function PermisosUbicacion() {
  const permiso = usePermisoUbicacion();
  if (permiso.permiso === 'cargando') return <EstadoDatos tipo="cargando" mensaje="Revisando la ubicación…" />;

  const concedido = permiso.permiso === 'concedido';
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4 pb-10">
      <Card className="py-4">
        <CardContent className="gap-3 px-4">
          <Estado
            ok={concedido}
            titulo="Permiso de ubicación"
            texto={TEXTO_PERMISO[permiso.permiso]}
          />
          <Separator />
          <Estado
            ok={permiso.gpsEncendido !== false}
            titulo="Ubicación del teléfono (GPS)"
            texto={permiso.gpsEncendido === false ? 'Apagada: activa la ubicación del teléfono' : 'Encendida'}
          />
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="gap-2 px-4">
          <Text className="font-semibold">Para qué se usa</Text>
          <Text variant="muted">
            Solo mientras tienes abierto el mapa con un domicilio en camino y el envío activo, EnCamino comparte tu
            posición cada 15 segundos. El cliente la ve únicamente mientras su domicilio va en camino. No se usa en
            segundo plano ni después de reportar el resultado.
          </Text>
          <Text variant="muted">Sin ubicación puedes seguir usando la lista, el detalle y los formularios.</Text>
        </CardContent>
      </Card>

      {permiso.permiso === 'sin_preguntar' || permiso.permiso === 'denegado' ? (
        <Button onPress={() => void permiso.pedir()}>
          <Text>Permitir ubicación</Text>
        </Button>
      ) : null}
      {permiso.permiso === 'bloqueado' || permiso.gpsEncendido === false ? (
        <Button variant="outline" onPress={permiso.abrirAjustes}>
          <Text>Abrir ajustes del teléfono</Text>
        </Button>
      ) : null}
    </ScrollView>
  );
}

function Estado({ ok, titulo, texto }: { ok: boolean; titulo: string; texto: string }) {
  const icono: ComponentProps<typeof Ionicons>['name'] = ok ? 'checkmark-circle' : 'alert-circle';
  return (
    <View className="flex-row gap-3">
      <Ionicons name={icono} size={20} color={ok ? THEME.primary : THEME.destructive} />
      <View className="flex-1 gap-0.5">
        <Text className="font-semibold">{titulo}</Text>
        <Text variant="muted">{texto}</Text>
      </View>
    </View>
  );
}
