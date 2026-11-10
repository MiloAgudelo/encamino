import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Linking, ScrollView, View } from 'react-native';

import { AvisoSimulado } from '@/components/AvisoSimulado';
import { ContadorUnidades } from '@/components/ContadorUnidades';
import { EstadoDatos } from '@/components/EstadoDatos';
import { FilaProducto } from '@/components/FilaProducto';
import { RequiereSesion } from '@/components/RequiereSesion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useDomicilio, useIniciarRecorrido } from '@/hooks/consultas/useDomicilios';
import { THEME } from '@/lib/theme';
import { hace, horaCorta } from '@/lib/tiempo';
import { ETIQUETA_ESTADO, tituloDomicilio, type Domicilio, type ProductoDomicilio } from '@/modelos/domicilio';
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
  const terminado = d.estado === 'entregado';
  // RN-02: el backend solo deja al domiciliario asignado; aquí solo ve los suyos.
  const esDomiciliario = !esAdministrador;

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
        <Badge
          variant={
            d.estado === 'no_entregado'
              ? 'destructive'
              : d.estado === 'pendiente'
                ? 'outline'
                : d.estado === 'en_camino'
                  ? 'default'
                  : 'secondary'
          }
        >
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

      {d.estado === 'en_camino' ? (
        <Card className="border-primary/40 py-4">
          <CardContent className="gap-3 px-4">
            <Dato icono="bicycle-outline" etiqueta="En camino">
              {d.salidaEn ? `Salió a las ${horaCorta(d.salidaEn)}` : 'Recorrido iniciado'}
            </Dato>
            {esAdministrador ? (
              <Dato icono="navigate-outline" etiqueta="Última posición">
                {d.ultimaPosicion
                  ? `${hace(d.ultimaPosicion.recibidaEn)} · ${d.ultimaPosicion.coordenadas.latitud.toFixed(5)}, ${d.ultimaPosicion.coordenadas.longitud.toFixed(5)}`
                  : 'Todavía no ha enviado su posición'}
              </Dato>
            ) : (
              <Text variant="muted">El mapa con el envío de tu posición llega en la siguiente etapa.</Text>
            )}
          </CardContent>
        </Card>
      ) : null}

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
          <CardContent className="gap-3 px-4">
            <Dato icono="alert-circle-outline" etiqueta="No se pudo entregar">
              {d.motivoNoEntrega ?? 'Sin motivo registrado'}
            </Dato>
            {d.fotoNoEntrega ? (
              <Image
                source={{ uri: d.fotoNoEntrega }}
                style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 8 }}
                contentFit="cover"
                accessibilityLabel="Foto de evidencia de la no entrega"
              />
            ) : (
              <AvisoSimulado que="foto no guardada en el entorno local" />
            )}
          </CardContent>
        </Card>
      ) : null}

      {d.numeroPedido ? (
        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent className="gap-3 px-4">
            {d.productos.length > 0 ? (
              d.productos.map((p) => (
                <FilaProducto key={p.idLinea} nombre={p.nombre} cantidad={p.cantidad} imagen={p.imagen} />
              ))
            ) : (
              <Text variant="muted">El pedido no tiene productos registrados.</Text>
            )}
          </CardContent>
        </Card>
      ) : null}

      {esDomiciliario && d.estado === 'pendiente' ? <IniciarRecorrido id={d.id} productos={d.productos} /> : null}

      {esDomiciliario && d.estado === 'en_camino' ? (
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

/**
 * Botón "Iniciar recorrido" con confirmación (RF-11). Antes de salir, el
 * domiciliario cuenta lo que carga de cada producto: siempre se entrega el
 * pedido completo, así que solo puede salir cuando cada línea está completa.
 */
function IniciarRecorrido({ id, productos }: { id: number; productos: ProductoDomicilio[] }) {
  const [confirmando, setConfirmando] = useState(false);
  const [cargadas, setCargadas] = useState<Record<number, number>>({});
  const iniciar = useIniciarRecorrido(id);
  const faltan = productos.reduce((total, p) => total + p.cantidad - (cargadas[p.idLinea] ?? 0), 0);
  const cargaCompleta = faltan === 0;

  if (!confirmando) {
    return (
      <Button onPress={() => setConfirmando(true)}>
        <Ionicons name="bicycle-outline" size={18} color={THEME.primaryForeground} />
        <Text>Iniciar recorrido</Text>
      </Button>
    );
  }

  return (
    <Card className="border-primary/40 py-4">
      <CardContent className="gap-3 px-4">
        {productos.length > 0 ? (
          <>
            <Text className="font-semibold">Verifica lo que llevas</Text>
            <Text variant="muted">Cuenta las unidades de cada producto que cargas. El pedido se entrega completo.</Text>
            {productos.map((p) => (
              <View key={p.idLinea} className="flex-row items-center gap-3">
                <Text className="flex-1" numberOfLines={2}>
                  {p.nombre}
                </Text>
                <ContadorUnidades
                  nombre={p.nombre}
                  valor={cargadas[p.idLinea] ?? 0}
                  maximo={p.cantidad}
                  alCambiar={(valor) => setCargadas((anterior) => ({ ...anterior, [p.idLinea]: valor }))}
                />
              </View>
            ))}
            <Text variant="muted" accessibilityLiveRegion="polite">
              {cargaCompleta
                ? 'Carga completa.'
                : `Faltan ${faltan} ${faltan === 1 ? 'unidad' : 'unidades'} por cargar.`}
            </Text>
            <Separator />
          </>
        ) : null}
        <Text className="font-semibold">¿Ya saliste con el pedido?</Text>
        <Text variant="muted">
          El domicilio pasa a "En camino" y el cliente lo verá en su seguimiento. No se puede deshacer.
        </Text>
        {iniciar.isError ? (
          <View className="flex-row gap-2" accessibilityRole="alert">
            <Ionicons name="alert-circle-outline" size={18} color={THEME.destructive} />
            <Text className="flex-1 text-destructive">
              {iniciar.error.tipo === 'sin_conexion'
                ? 'Sin conexión: el domicilio sigue pendiente. Revisa tu internet e inténtalo de nuevo.'
                : iniciar.error.message}
            </Text>
          </View>
        ) : null}
        <View className="flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={iniciar.isPending}
            onPress={() => {
              iniciar.reset();
              setConfirmando(false);
            }}
          >
            <Text>Cancelar</Text>
          </Button>
          <Button className="flex-1" disabled={iniciar.isPending || !cargaCompleta} onPress={() => iniciar.mutate()}>
            <Text>{iniciar.isPending ? 'Iniciando…' : 'Sí, iniciar'}</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
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
