import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { EstadoDatos } from '@/components/EstadoDatos';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useDomicilio } from '@/hooks/consultas/useDomicilios';
import { THEME } from '@/lib/theme';
import type { Domicilio } from '@/modelos/domicilio';

/** Vuelve al detalle del domicilio. */
export function volverAlDetalle(id: number) {
  if (router.canGoBack()) router.back();
  else router.replace({ pathname: '/domicilio/[id]', params: { id: String(id) } });
}

/**
 * Carga el domicilio de la ruta y solo muestra el formulario si va en camino
 * (RN-01: se reporta después de iniciar el recorrido).
 */
export function FormularioDomicilio({
  titulo,
  children,
}: {
  titulo: string;
  children: (domicilio: Domicilio) => ReactNode;
}) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idNumerico = Number(id);
  const consulta = useDomicilio(idNumerico);

  let contenido: ReactNode;
  if (consulta.error?.tipo === 'no_encontrado' || !(Number.isInteger(idNumerico) && idNumerico > 0)) {
    contenido = <Aviso texto="Domicilio no encontrado." id={idNumerico} />;
  } else if (consulta.isPending) {
    contenido = <EstadoDatos tipo="cargando" mensaje="Cargando domicilio…" />;
  } else if (consulta.isError) {
    contenido = <EstadoDatos tipo="error" mensaje={consulta.error.message} alReintentar={() => consulta.refetch()} />;
  } else if (consulta.data.estado === 'pendiente') {
    contenido = <Aviso texto="Primero inicia el recorrido desde el detalle." id={idNumerico} />;
  } else if (consulta.data.estado !== 'en_camino') {
    contenido = <Aviso texto="Este domicilio ya fue reportado." id={idNumerico} />;
  } else {
    contenido = children(consulta.data);
  }

  return (
    <>
      <Stack.Screen options={{ title: titulo }} />
      {contenido}
    </>
  );
}

function Aviso({ texto, id }: { texto: string; id: number }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
      <Ionicons name="information-circle-outline" size={44} color={THEME.mutedForeground} />
      <Text variant="h4" className="text-center">
        {texto}
      </Text>
      <Button onPress={() => volverAlDetalle(id)}>
        <Text>Volver</Text>
      </Button>
    </View>
  );
}

/** Mensaje de error del envío, con un texto claro cuando no hay conexión. */
export function ErrorEnvio({ mensaje }: { mensaje: string }) {
  return (
    <View className="rounded-md border border-destructive/40 bg-destructive/10 p-3" accessibilityRole="alert">
      <Text className="text-sm text-destructive">{mensaje}</Text>
    </View>
  );
}
