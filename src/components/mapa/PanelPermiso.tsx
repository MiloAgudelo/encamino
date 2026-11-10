import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import type { PermisoUbicacion } from '@/hooks/usePermisoUbicacion';

/**
 * Explica qué falta para usar la ubicación (RF-20): permiso negado, bloqueado
 * o GPS apagado. No muestra nada si todo está bien. La lista, el detalle y los
 * formularios siguen funcionando sin ubicación.
 */
export function PanelPermiso({ permiso }: { permiso: PermisoUbicacion }) {
  if (permiso.permiso === 'denegado') {
    return (
      <Aviso texto="Sin permiso de ubicación no se puede enviar tu posición. El cliente y Karamba solo la ven mientras vas en camino.">
        <Button size="sm" onPress={() => void permiso.pedir()}>
          <Text>Permitir ubicación</Text>
        </Button>
      </Aviso>
    );
  }
  if (permiso.permiso === 'bloqueado') {
    return (
      <Aviso texto="La ubicación está bloqueada para EnCamino. Actívala en los ajustes del teléfono y vuelve aquí.">
        <Button size="sm" onPress={permiso.abrirAjustes}>
          <Text>Abrir ajustes</Text>
        </Button>
      </Aviso>
    );
  }
  if (permiso.permiso === 'concedido' && permiso.gpsEncendido === false) {
    return (
      <Aviso texto="Activa la ubicación del teléfono.">
        <Button size="sm" variant="outline" onPress={() => void permiso.revisar()}>
          <Text>Ya la activé</Text>
        </Button>
      </Aviso>
    );
  }
  return null;
}

function Aviso({ texto, children }: { texto: string; children: React.ReactNode }) {
  return (
    <View className="gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3" accessibilityRole="alert">
      <View className="flex-row gap-2">
        <Ionicons name="location-outline" size={18} color={THEME.destructive} />
        <Text className="flex-1 text-sm">{texto}</Text>
      </View>
      <View className="flex-row">{children}</View>
    </View>
  );
}
