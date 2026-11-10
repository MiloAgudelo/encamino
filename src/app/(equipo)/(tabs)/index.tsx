import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';

import { EstadoDatos } from '@/components/EstadoDatos';
import { TarjetaDomicilio } from '@/components/TarjetaDomicilio';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useDomiciliosDeHoy } from '@/hooks/consultas/useDomicilios';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { ETIQUETA_ESTADO, type Domicilio, type EstadoDomicilio } from '@/modelos/domicilio';
import { useSesion } from '@/store/sesion';

type Filtro = 'todos' | EstadoDomicilio;

const FILTROS: Filtro[] = ['todos', 'pendiente', 'en_camino', 'no_entregado', 'entregado'];

/** Los no entregados vigentes van primero, luego por franja (RF-15). */
const ORDEN_ESTADO: Record<EstadoDomicilio, number> = {
  no_entregado: 0,
  en_camino: 1,
  pendiente: 2,
  entregado: 3,
};

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function coincide(d: Domicilio, busqueda: string): boolean {
  if (!busqueda) return true;
  return [d.barrio, d.direccion, d.numeroPedido ?? '', d.domiciliario ?? ''].some((campo) =>
    normalizar(campo).includes(busqueda),
  );
}

/** Domicilios de hoy (RF-09) o, para el administrador, todos los de hoy (RF-15). */
export default function DomiciliosDeHoy() {
  const esAdministrador = useSesion((s) => s.usuario?.rol === 'administrador');
  const consulta = useDomiciliosDeHoy();
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');

  // Buscar y filtrar no pide datos nuevos: trabaja sobre la lista ya cargada.
  const visibles = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    return (consulta.data ?? [])
      .filter((d) => (filtro === 'todos' || d.estado === filtro) && coincide(d, termino))
      .sort((a, b) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado] || a.franja.localeCompare(b.franja));
  }, [consulta.data, busqueda, filtro]);

  const conteo = (f: Filtro) =>
    f === 'todos' ? (consulta.data?.length ?? 0) : (consulta.data ?? []).filter((d) => d.estado === f).length;

  if (consulta.isPending) return <EstadoDatos tipo="cargando" esqueleto mensaje="Cargando domicilios" />;
  if (consulta.isError) {
    return <EstadoDatos tipo="error" mensaje={consulta.error.message} alReintentar={() => consulta.refetch()} />;
  }

  const hayFiltros = busqueda.trim() !== '' || filtro !== 'todos';

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerClassName="gap-3 p-4 pb-8"
      data={visibles}
      keyExtractor={(d) => String(d.id)}
      refreshControl={
        <RefreshControl refreshing={consulta.isRefetching} onRefresh={() => void consulta.refetch()} tintColor={THEME.primary} />
      }
      ListHeaderComponent={
        <View className="gap-3">
          <Input
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder={esAdministrador ? 'Buscar por barrio, dirección, pedido o domiciliario' : 'Buscar por barrio, dirección o pedido'}
            autoCorrect={false}
            accessibilityLabel="Buscar domicilios"
          />
          <View className="flex-row flex-wrap gap-2">
            {FILTROS.map((f) => (
              <Pressable
                key={f}
                accessibilityRole="button"
                accessibilityState={{ selected: filtro === f }}
                onPress={() => setFiltro(f)}
                className={cn(
                  'rounded-full border px-3 py-1.5',
                  filtro === f ? 'border-primary bg-primary' : 'border-border bg-background',
                )}
              >
                <Text className={cn('text-sm', filtro === f ? 'text-primary-foreground' : 'text-foreground')}>
                  {f === 'todos' ? 'Todos' : ETIQUETA_ESTADO[f]} {conteo(f)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <TarjetaDomicilio
          domicilio={item}
          mostrarDomiciliario={esAdministrador}
          alPresionar={(id) => router.push({ pathname: '/domicilio/[id]', params: { id: String(id) } })}
        />
      )}
      ListEmptyComponent={
        hayFiltros ? (
          <EstadoDatos
            tipo="vacio"
            mensaje="Ningún domicilio coincide con la búsqueda."
            accion={{ texto: 'Limpiar filtros', alPresionar: () => {
                  setBusqueda('');
                  setFiltro('todos');
                },
              }}
          />
        ) : (
          <EstadoDatos tipo="vacio" mensaje={esAdministrador ? 'No hay domicilios para hoy.' : 'No tienes domicilios para hoy.'} />
        )
      }
    />
  );
}
