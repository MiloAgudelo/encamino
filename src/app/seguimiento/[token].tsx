import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import { EstadoDatos } from '@/components/EstadoDatos';
import { FilaProducto } from '@/components/FilaProducto';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useSeguimiento } from '@/hooks/consultas/useSeguimiento';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { hace } from '@/lib/tiempo';
import { PASOS_SEGUIMIENTO, type Seguimiento } from '@/modelos/seguimiento';
import { extraerCodigo } from '@/servicios/seguimiento';
import { useCodigosConsultados } from '@/store/codigosConsultados';

/** Seguimiento del pedido con el código del cliente (RF-05 a RF-08). */
export default function PantallaSeguimiento() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const codigo = extraerCodigo(token ?? '');
  const consulta = useSeguimiento(codigo);
  const recordar = useCodigosConsultados((s) => s.recordar);

  // Solo se recuerdan los códigos que existen.
  useEffect(() => {
    if (consulta.isSuccess) recordar(codigo);
  }, [consulta.isSuccess, codigo, recordar]);

  if (consulta.error?.tipo === 'no_encontrado') return <NoEncontrado />;
  if (consulta.isPending) return <EstadoDatos tipo="cargando" mensaje="Buscando tu pedido…" />;
  if (consulta.isError) {
    return <EstadoDatos tipo="error" mensaje={consulta.error.message} alReintentar={() => consulta.refetch()} />;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-4 pb-10"
      refreshControl={
        <RefreshControl refreshing={consulta.isRefetching} onRefresh={() => void consulta.refetch()} tintColor={THEME.primary} />
      }
    >
      <Contenido seguimiento={consulta.data} />
    </ScrollView>
  );
}

function NoEncontrado() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
      <Ionicons name="help-circle-outline" size={44} color={THEME.mutedForeground} />
      <Text variant="h4" className="text-center">
        No encontramos este pedido
      </Text>
      <Text variant="muted" className="max-w-xs text-center text-base">
        Revisa que el código esté completo, tal como llegó en el mensaje de WhatsApp.
      </Text>
      <Button onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
        <Text>Escribir otro código</Text>
      </Button>
    </View>
  );
}

function Contenido({ seguimiento: s }: { seguimiento: Seguimiento }) {
  const indiceActual = PASOS_SEGUIMIENTO.findIndex((p) => p.paso === s.pasoActual);

  return (
    <>
      <View className="gap-1">
        <Text variant="h3">Pedido #{s.numeroPedido}</Text>
        <Text variant="muted" className="text-base">
          Llega el {s.fechaEntrega} entre {s.franja}
          {s.ciudad ? ` · ${s.ciudad}` : ''}
        </Text>
      </View>

      <Card className="py-4">
        <CardContent className="gap-3 px-4">
          {PASOS_SEGUIMIENTO.map(({ paso, etiqueta }, i) => {
            const hecho = i < indiceActual;
            const actual = i === indiceActual;
            return (
              <View key={paso} className="flex-row items-center gap-3">
                <View
                  className={cn(
                    'h-4 w-4 rounded-full border-2',
                    hecho ? 'border-primary bg-primary' : actual ? 'border-primary' : 'border-border',
                  )}
                />
                <Text className={cn(actual ? 'font-semibold' : hecho ? '' : 'text-muted-foreground')}>
                  {etiqueta}
                  {actual && (paso === 'asignado' || paso === 'en_camino') && s.domiciliario ? ` · ${s.domiciliario}` : ''}
                  {actual && paso === 'entregado' && s.entregadoEn ? ` · ${s.entregadoEn}` : ''}
                </Text>
              </View>
            );
          })}
        </CardContent>
      </Card>

      {s.pasoActual === 'asignado' ? (
        <Text variant="muted">Te avisamos aquí cuando el domiciliario salga. Se actualiza solo cada 15 segundos.</Text>
      ) : null}
      {s.pasoActual === 'en_camino' ? (
        <Text variant="muted">
          {s.ultimaPosicion
            ? `Última posición del domiciliario ${hace(s.ultimaPosicion.recibidaEn)}. `
            : 'El domiciliario todavía no ha enviado su posición. '}
          Se actualiza solo cada 15 segundos; el mapa llega con el GPS de la app.
        </Text>
      ) : null}

      {s.intentosNoEntrega.length > 0 ? (
        <Card className="border-destructive/40 py-4">
          <CardContent className="gap-2 px-4">
            <Text className="font-semibold">No se pudo entregar</Text>
            {s.intentosNoEntrega.map((intento, i) => (
              <Text key={i} variant="muted">
                {[intento.fecha, intento.motivo].filter(Boolean).join(' · ')}
              </Text>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle>Tu pedido</CardTitle>
        </CardHeader>
        <CardContent className="gap-3 px-4">
          {s.productos.map((p) => (
            <FilaProducto key={p.id} nombre={p.nombre} cantidad={p.cantidad} imagen={p.imagen} />
          ))}
        </CardContent>
      </Card>
    </>
  );
}
