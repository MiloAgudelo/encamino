import { Ionicons } from '@expo/vector-icons';
import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Linking, ScrollView, View } from 'react-native';

import { EstadoDatos } from '@/components/EstadoDatos';
import { RequiereSesion } from '@/components/RequiereSesion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useDomicilio } from '@/hooks/consultas/useDomicilios';
import { THEME } from '@/lib/theme';
import { ETIQUETA_ESTADO, tituloDomicilio, type Domicilio } from '@/modelos/domicilio';
import { useSesion } from '@/store/sesion';

export default function PantallaDetalle() {
  return (
    <RequiereSesion>
      <DetalleDomicilio />
    </RequiereSesion>
  );
}

/** Detalle de un domicilio por identificador (RF-10). */
function DetalleDomicilio() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idNumerico = Number(id);
  const consulta = useDomicilio(idNumerico);

  const idValido = Number.isInteger(idNumerico) && idNumerico > 0;
  if (!idValido || consulta.error?.tipo === 'no_encontrado') return <NoEncontrado />;
  if (consulta.isPending) return <EstadoDatos tipo="cargando" mensaje="Cargando domicilio…" />;
  if (consulta.isError) {
    return <EstadoDatos tipo="error" mensaje={consulta.error.message} alReintentar={() => consulta.refetch()} />;
  }

  return <Contenido domicilio={consulta.data} />;
}

function NoEncontrado() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
      <Stack.Screen options={{ title: 'Domicilio' }} />
      <Ionicons name="search-outline" size={44} color={THEME.mutedForeground} />
      <Text variant="h4" className="text-center">
        Domicilio no encontrado
      </Text>
      <Text variant="muted" className="max-w-xs text-center text-base">
        No existe o no está asignado a ti.
      </Text>
      <Button onPress={() => (router.canGoBack() ? router.back() : router.replace('/(equipo)/(tabs)'))}>
        <Text>Volver</Text>
      </Button>
    </View>
  );
}

function Contenido({ domicilio }: { domicilio: Domicilio }) {
  const esAdministrador = useSesion((s) => s.usuario?.rol === 'administrador');
  const d = domicilio;
  const id = String(d.id);
  const terminado = d.estado === 'entregado' || d.estado === 'entrega_parcial';

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4 pb-10">
      <Stack.Screen options={{ title: tituloDomicilio(d) }} />

      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text variant="h4">{d.barrio}</Text>
          <Text variant="muted" className="text-base">
            {d.direccion}
          </Text>
        </View>
        <Badge variant={d.estado === 'no_entregado' ? 'destructive' : d.estado === 'pendiente' ? 'outline' : 'secondary'}>
          <Text>{ETIQUETA_ESTADO[d.estado]}</Text>
        </Badge>
      </View>

      <Card className="py-4">
        <CardContent className="gap-3 px-4">
          <Dato icono="time-outline" etiqueta="Franja de entrega">
            {d.franja}
            {d.fechaEntrega ? ` · ${d.fechaEntrega}` : ''}
          </Dato>
          <Separator />
          <Dato icono="person-outline" etiqueta="Quién recibe">
            {d.quienRecibe ?? 'Sin registrar'}
          </Dato>
          {d.telefonoQuienRecibe ? (
            <Button variant="outline" size="sm" onPress={() => Linking.openURL(`tel:${d.telefonoQuienRecibe}`)}>
              <Ionicons name="call-outline" size={16} color={THEME.foreground} />
              <Text>Llamar a {d.telefonoQuienRecibe}</Text>
            </Button>
          ) : null}
          {esAdministrador ? (
            <>
              <Separator />
              <Dato icono="bicycle-outline" etiqueta="Domiciliario">
                {d.domiciliario ?? 'Sin asignar'}
              </Dato>
              <Dato icono="storefront-outline" etiqueta="Cliente">
                {d.cliente ?? 'Sin registrar'}
              </Dato>
            </>
          ) : null}
          {d.observaciones ? (
            <>
              <Separator />
              <Dato icono="document-text-outline" etiqueta="Observaciones">
                {d.observaciones}
              </Dato>
            </>
          ) : null}
        </CardContent>
      </Card>

      {terminado ? (
        <Card className="py-4">
          <CardContent className="px-4">
            <Dato icono="checkmark-circle-outline" etiqueta="Entregado">
              {[d.entregadoA, d.entregadoEn].filter(Boolean).join(' · ') || 'Sin detalle'}
            </Dato>
          </CardContent>
        </Card>
      ) : null}
      {d.estado === 'no_entregado' ? (
        <Card className="border-destructive/40 py-4">
          <CardContent className="px-4">
            <Dato icono="alert-circle-outline" etiqueta="No se pudo entregar">
              {d.motivoNoEntrega ?? 'Sin motivo registrado'}
            </Dato>
          </CardContent>
        </Card>
      ) : null}

      <Text variant="muted">
        Los productos del pedido aparecerán aquí cuando el backend los incluya en el detalle (B-02).
      </Text>

      {d.estado === 'pendiente' ? (
        <View className="gap-2">
          <Link href={{ pathname: '/domicilio/[id]/entregar', params: { id } }} asChild>
            <Button>
              <Text>Confirmar entrega</Text>
            </Button>
          </Link>
          <Link href={{ pathname: '/domicilio/[id]/no-entregar', params: { id } }} asChild>
            <Button variant="outline">
              <Text>Reportar no entrega</Text>
            </Button>
          </Link>
        </View>
      ) : null}
      {esAdministrador && d.estado === 'no_entregado' ? (
        <Link href={{ pathname: '/domicilio/[id]/reprogramar', params: { id } }} asChild>
          <Button>
            <Text>Reprogramar</Text>
          </Button>
        </Link>
      ) : null}
    </ScrollView>
  );
}

function Dato({
  icono,
  etiqueta,
  children,
}: {
  icono: ComponentProps<typeof Ionicons>['name'];
  etiqueta: string;
  children: ReactNode;
}) {
  return (
    <View className="flex-row gap-3">
      <Ionicons name={icono} size={18} color={THEME.mutedForeground} style={{ marginTop: 2 }} />
      <View className="flex-1 gap-0.5">
        <Text variant="muted">{etiqueta}</Text>
        <Text>{children}</Text>
      </View>
    </View>
  );
}
