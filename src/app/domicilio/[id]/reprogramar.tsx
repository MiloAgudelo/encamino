import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { EstadoDatos } from '@/components/EstadoDatos';
import { ErrorEnvio } from '@/components/FormularioDomicilio';
import { RequiereSesion } from '@/components/RequiereSesion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useDomiciliarios, useDomicilio, useReprogramar } from '@/hooks/consultas/useDomicilios';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import {
  BARRIOS,
  buscarBarrioPorNombre,
  CAUSAS_REGRESO,
  calcularCobroReprogramacion,
  formatearPesos,
  normalizarTexto,
  RECARGO_REPROGRAMACION,
  zonaDeBarrio,
  type Barrio,
  type CausaRegreso,
} from '@/logica/cobroReprogramacion';
import { tituloDomicilio, type Domicilio } from '@/modelos/domicilio';

export default function PantallaReprogramar() {
  return (
    <RequiereSesion rol="administrador">
      <Stack.Screen options={{ title: 'Reprogramar domicilio' }} />
      <CargarDomicilio />
    </RequiereSesion>
  );
}

function CargarDomicilio() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idNumerico = Number(id);
  const consulta = useDomicilio(idNumerico);

  if (consulta.error?.tipo === 'no_encontrado' || !(Number.isInteger(idNumerico) && idNumerico > 0)) {
    return <EstadoDatos tipo="vacio" mensaje="Domicilio no encontrado." accion={{ texto: 'Volver', alPresionar: () => router.back() }} />;
  }
  if (consulta.isPending) return <EstadoDatos tipo="cargando" mensaje="Cargando domicilio…" />;
  if (consulta.isError) {
    return <EstadoDatos tipo="error" mensaje={consulta.error.message} alReintentar={() => consulta.refetch()} />;
  }
  if (consulta.data.estado !== 'no_entregado') {
    return (
      <EstadoDatos
        tipo="vacio"
        mensaje="Solo se reprograma un domicilio no entregado."
        accion={{ texto: 'Volver', alPresionar: () => router.back() }}
      />
    );
  }
  return <Reprogramar domicilio={consulta.data} />;
}

/**
 * Reprogramar con cobro (RF-17, RN-08 y RN-09). El valor se recalcula al
 * cambiar la causa, el barrio o los valores, y se guarda como nota del intento nuevo.
 */
function Reprogramar({ domicilio: d }: { domicilio: Domicilio }) {
  const barrioInicial = useMemo(() => buscarBarrioPorNombre(d.barrio), [d.barrio]);
  const [barrio, setBarrio] = useState<Barrio | null>(barrioInicial);
  const [cambiarDestino, setCambiarDestino] = useState(false);
  const [causa, setCausa] = useState<CausaRegreso | null>(null);
  const [recargo, setRecargo] = useState(String(RECARGO_REPROGRAMACION));
  const [tarifaZona, setTarifaZona] = useState(String(zonaDeBarrio(barrioInicial?.id ?? -1)?.tarifa ?? 0));
  const [domiciliarioId, setDomiciliarioId] = useState<number | null>(null);
  const [errorDomiciliario, setErrorDomiciliario] = useState<string | null>(null);
  const domiciliarios = useDomiciliarios();
  const reprogramar = useReprogramar(d.id);

  const zona = barrio ? zonaDeBarrio(barrio.id) : null;
  const resultado = calcularCobroReprogramacion({ recargo, tarifaZona, responsable: causa?.responsable ?? null });
  const errores = resultado.ok ? {} : resultado.errores;

  function elegirBarrio(nuevo: Barrio) {
    setBarrio(nuevo);
    setTarifaZona(String(zonaDeBarrio(nuevo.id)?.tarifa ?? 0));
    setCambiarDestino(false);
  }

  function guardar() {
    if (!domiciliarioId) {
      setErrorDomiciliario('Elige el domiciliario del domicilio nuevo.');
      return;
    }
    if (!resultado.ok || !causa) return;
    const destino = barrio ? `${barrio.nombre} (${barrio.ciudad})` : d.barrio;
    const nota =
      `Reprogramado. Causa: ${causa.texto}. Destino: ${destino}. ` +
      (resultado.exento
        ? 'Valor del domicilio nuevo: $0 (causa de Karamba).'
        : `Valor del domicilio nuevo: ${formatearPesos(resultado.valor)} (recargo ${formatearPesos(resultado.recargo)} + zona ${formatearPesos(resultado.tarifaZona)}).`);
    reprogramar
      .mutateAsync({ domiciliarioId, nota })
      .then((nuevo) => router.replace({ pathname: '/domicilio/[id]', params: { id: String(nuevo.id) } }))
      .catch(() => {
        // El error se muestra con reprogramar.error.
      });
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
        <View className="gap-1">
          <Text variant="h4">{tituloDomicilio(d)}</Text>
          <Text variant="muted" className="text-base">
            No entregado{d.motivoNoEntrega ? `: ${d.motivoNoEntrega}` : ''}
          </Text>
        </View>

        <Seccion titulo="1. Causa del regreso">
          <View className="flex-row flex-wrap gap-2">
            {CAUSAS_REGRESO.map((c) => (
              <Chip key={c.id} texto={c.texto} activo={causa?.id === c.id} alPresionar={() => setCausa(c)} />
            ))}
          </View>
          {errores.causa ? <TextoError texto={errores.causa} /> : null}
          {causa?.responsable === 'karamba' ? (
            <Text variant="muted">Si la causa es de Karamba, el domicilio nuevo no se cobra.</Text>
          ) : null}
        </Seccion>

        <Seccion titulo="2. Destino">
          <Text>{barrio ? `${barrio.nombre} · ${barrio.ciudad}` : `${d.barrio} (no está en el listado de barrios)`}</Text>
          <Text variant="muted">{d.direccion}</Text>
          <View
            className={cn('self-start rounded-md px-2 py-1', zona ? 'bg-primary/10' : 'bg-muted')}
            accessibilityLabel="Tipo de zona"
          >
            <Text className="text-sm">
              {zona ? `Zona con tarifa: ${zona.nombre} (${formatearPesos(zona.tarifa)})` : 'Domicilio incluido en el precio del pedido'}
            </Text>
          </View>
          {cambiarDestino ? (
            <BuscadorBarrio alElegir={elegirBarrio} alCancelar={() => setCambiarDestino(false)} />
          ) : (
            <Button variant="outline" size="sm" className="self-start" onPress={() => setCambiarDestino(true)}>
              <Ionicons name="swap-horizontal-outline" size={16} color={THEME.foreground} />
              <Text>Cambió la dirección</Text>
            </Button>
          )}
        </Seccion>

        <Seccion titulo="3. Valores">
          <CampoPesos etiqueta="Recargo por reprogramar" valor={recargo} alCambiar={setRecargo} error={errores.recargo} />
          <CampoPesos etiqueta="Tarifa de la zona del destino" valor={tarifaZona} alCambiar={setTarifaZona} error={errores.tarifaZona} />
        </Seccion>

        <Card className="border-ring bg-secondary/40 py-4">
          <CardContent className="gap-1 px-4">
            <Text variant="muted">Valor del domicilio nuevo</Text>
            <Text variant="h2" className="border-0 pb-0" accessibilityLiveRegion="polite">
              {resultado.ok ? formatearPesos(resultado.valor) : '—'}
            </Text>
            {resultado.ok ? (
              <Text variant="muted">
                {resultado.exento
                  ? 'Causa de Karamba: sin cobro.'
                  : `${formatearPesos(resultado.recargo)} de recargo + ${formatearPesos(resultado.tarifaZona)} de la zona`}
              </Text>
            ) : (
              <Text variant="muted">Completa la causa y los valores para calcularlo.</Text>
            )}
          </CardContent>
        </Card>

        <Seccion titulo="4. Domiciliario">
          {domiciliarios.isPending ? (
            <ActivityIndicator color={THEME.primary} />
          ) : domiciliarios.isError ? (
            <View className="gap-2">
              <TextoError texto={domiciliarios.error.message} />
              <Button variant="outline" size="sm" className="self-start" onPress={() => void domiciliarios.refetch()}>
                <Text>Reintentar</Text>
              </Button>
            </View>
          ) : domiciliarios.data.length === 0 ? (
            <Text variant="muted">No hay domiciliarios activos.</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {domiciliarios.data.map((u) => (
                <Chip
                  key={u.id}
                  texto={u.nombre}
                  activo={domiciliarioId === u.id}
                  alPresionar={() => {
                    setDomiciliarioId(u.id);
                    setErrorDomiciliario(null);
                  }}
                />
              ))}
            </View>
          )}
          {errorDomiciliario ? <TextoError texto={errorDomiciliario} /> : null}
        </Seccion>

        {reprogramar.isError ? (
          <ErrorEnvio
            mensaje={
              reprogramar.error.tipo === 'sin_conexion'
                ? 'Sin conexión: el domicilio no se reprogramó. Tus datos siguen aquí; inténtalo de nuevo.'
                : reprogramar.error.message
            }
          />
        ) : null}

        <Button onPress={guardar} disabled={reprogramar.isPending || !resultado.ok}>
          {reprogramar.isPending ? <ActivityIndicator color={THEME.background} /> : null}
          <Text>{reprogramar.isPending ? 'Guardando…' : 'Reprogramar y asignar'}</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="gap-2 px-4">{children}</CardContent>
    </Card>
  );
}

function Chip({ texto, activo, alPresionar }: { texto: string; activo: boolean; alPresionar: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={alPresionar}
      className={cn('rounded-full border px-3 py-1.5 active:opacity-70', activo ? 'border-primary bg-primary' : 'border-border')}
    >
      <Text className={cn('text-sm', activo ? 'text-primary-foreground' : 'text-foreground')}>{texto}</Text>
    </Pressable>
  );
}

function TextoError({ texto }: { texto: string }) {
  return <Text className="text-sm text-destructive">{texto}</Text>;
}

function CampoPesos({
  etiqueta,
  valor,
  alCambiar,
  error,
}: {
  etiqueta: string;
  valor: string;
  alCambiar: (v: string) => void;
  error?: string;
}) {
  return (
    <View className="gap-1.5">
      <Label>{etiqueta}</Label>
      <Input
        value={valor}
        onChangeText={alCambiar}
        keyboardType="numeric"
        accessibilityLabel={etiqueta}
        aria-invalid={!!error}
        className={cn(error && 'border-destructive')}
      />
      {error ? <TextoError texto={error} /> : null}
    </View>
  );
}

function BuscadorBarrio({ alElegir, alCancelar }: { alElegir: (b: Barrio) => void; alCancelar: () => void }) {
  const [texto, setTexto] = useState('');
  const resultados = useMemo(() => {
    const buscado = normalizarTexto(texto);
    if (buscado.length < 2) return [];
    return BARRIOS.filter((b) => normalizarTexto(b.nombre).includes(buscado)).slice(0, 8);
  }, [texto]);

  return (
    <View className="gap-2">
      <Input value={texto} onChangeText={setTexto} placeholder="Busca el barrio nuevo" autoFocus autoCorrect={false} />
      {texto.trim().length >= 2 && resultados.length === 0 ? <Text variant="muted">Ningún barrio coincide.</Text> : null}
      {resultados.map((b) => {
        const zona = zonaDeBarrio(b.id);
        return (
          <Pressable
            key={b.id}
            accessibilityRole="button"
            onPress={() => alElegir(b)}
            className="rounded-md border border-border px-3 py-2 active:opacity-70"
          >
            <Text>
              {b.nombre} · {b.ciudad}
            </Text>
            <Text variant="muted" className="text-sm">
              {zona ? `${zona.nombre}, ${formatearPesos(zona.tarifa)}` : 'Domicilio incluido'}
            </Text>
          </Pressable>
        );
      })}
      <Button variant="ghost" size="sm" className="self-start" onPress={alCancelar}>
        <Text>Cancelar</Text>
      </Button>
    </View>
  );
}
