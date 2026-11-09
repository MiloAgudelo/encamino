import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

type EstadoDatosProps =
  | { tipo: 'cargando'; mensaje?: string; esqueleto?: boolean }
  | { tipo: 'vacio'; mensaje: string; accion?: { texto: string; alPresionar: () => void } }
  | { tipo: 'error'; mensaje?: string; alReintentar: () => void };

/**
 * Carga, vacío y error de una pantalla con datos remotos (RNF-02).
 * El error siempre ofrece "Reintentar".
 */
export function EstadoDatos(props: EstadoDatosProps) {
  if (props.tipo === 'cargando') {
    if (props.esqueleto) {
      return (
        <View className="gap-3 p-4" accessibilityLabel={props.mensaje ?? 'Cargando'}>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </View>
      );
    }
    return (
      <Centro>
        <ActivityIndicator color={THEME.primary} />
        <Text variant="muted">{props.mensaje ?? 'Cargando…'}</Text>
      </Centro>
    );
  }

  if (props.tipo === 'vacio') {
    return (
      <Centro>
        <Text variant="muted" className="text-center text-base">
          {props.mensaje}
        </Text>
        {props.accion ? (
          <Button variant="outline" onPress={props.accion.alPresionar}>
            <Text>{props.accion.texto}</Text>
          </Button>
        ) : null}
      </Centro>
    );
  }

  return (
    <Centro>
      <Text className="text-center font-semibold">No pudimos cargar la información</Text>
      <Text variant="muted" className="text-center">
        {props.mensaje ?? 'Revisa tu conexión e inténtalo de nuevo.'}
      </Text>
      <Button onPress={props.alReintentar}>
        <Text>Reintentar</Text>
      </Button>
    </Centro>
  );
}

function Centro({ children }: { children: ReactNode }) {
  return <View className="flex-1 items-center justify-center gap-3 p-6">{children}</View>;
}
