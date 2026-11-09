import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

type NombreIcono = ComponentProps<typeof Ionicons>['name'];

interface PantallaPendienteProps {
  icono: NombreIcono;
  titulo: string;
  /** Qué va a hacer esta pantalla cuando esté construida. */
  descripcion: string;
  children?: ReactNode;
}

/**
 * Marca una ruta que ya existe en la navegación pero cuya función todavía no
 * está construida. Dice qué hará, para que nadie la confunda con una pantalla
 * terminada.
 */
export function PantallaPendiente({ icono, titulo, descripcion, children }: PantallaPendienteProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
      <Ionicons name={icono} size={48} color={THEME.mutedForeground} />
      <Text variant="h3" className="text-center">
        {titulo}
      </Text>
      <Text variant="muted" className="max-w-xs text-center text-base">
        {descripcion}
      </Text>
      <Badge variant="outline">
        <Text>En construcción</Text>
      </Badge>
      {children ? <View className="mt-2 w-full max-w-xs gap-2">{children}</View> : null}
    </View>
  );
}
