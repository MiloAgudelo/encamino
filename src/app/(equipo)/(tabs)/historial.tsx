import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';

import { EstadoDatos } from '@/components/EstadoDatos';
import { TarjetaDomicilio } from '@/components/TarjetaDomicilio';
import { Text } from '@/components/ui/text';
import { useHistorial } from '@/hooks/consultas/useDomicilios';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { fechaLocal } from '@/servicios/domicilios';
import { useSesion } from '@/store/sesion';

type Periodo = 'hoy' | 'semana' | 'mes';
type Resultado = 'todos' | 'entregado' | 'no_entregado';

const PERIODOS: { id: Periodo; texto: string; dias: number }[] = [
  { id: 'hoy', texto: 'Hoy', dias: 0 },
  { id: 'semana', texto: 'Últimos 7 días', dias: 6 },
  { id: 'mes', texto: 'Últimos 30 días', dias: 29 },
];

const RESULTADOS: { id: Resultado; texto: string }[] = [
  { id: 'todos', texto: 'Todos' },
  { id: 'entregado', texto: 'Entregados' },
  { id: 'no_entregado', texto: 'No entregados' },
];

function haceDias(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fechaLocal(fecha);
}

/**
 * Historial (RF-18): domicilios terminados con filtro por fecha, resultado y,
 * para el administrador, domiciliario. El domiciliario solo ve los suyos.
 */
export default function Historial() {
  const esAdministrador = useSesion((s) => s.usuario?.rol === 'administrador');
  const [periodo, setPeriodo] = useState<Periodo>('semana');
  const [resultado, setResultado] = useState<Resultado>('todos');
  const [domiciliario, setDomiciliario] = useState<string | null>(null);

  const dias = PERIODOS.find((p) => p.id === periodo)?.dias ?? 6;
  const consulta = useHistorial(haceDias(dias), fechaLocal());

  const domiciliarios = useMemo(
    () => [...new Set((consulta.data ?? []).map((d) => d.domiciliario).filter((n): n is string => !!n))].sort(),
    [consulta.data],
  );

  const visibles = useMemo(
    () =>
      (consulta.data ?? [])
        .filter((d) => (resultado === 'todos' || d.estado === resultado) && (!domiciliario || d.domiciliario === domiciliario))
        .sort((a, b) => (b.fechaEntrega ?? '').localeCompare(a.fechaEntrega ?? '') || b.id - a.id),
    [consulta.data, resultado, domiciliario],
  );

  if (consulta.isPending) return <EstadoDatos tipo="cargando" esqueleto mensaje="Cargando historial" />;
  if (consulta.isError) {
    return <EstadoDatos tipo="error" mensaje={consulta.error.message} alReintentar={() => consulta.refetch()} />;
  }

  const hayFiltros = periodo !== 'semana' || resultado !== 'todos' || domiciliario !== null;
  const limpiar = () => {
    setPeriodo('semana');
    setResultado('todos');
    setDomiciliario(null);
  };

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
          <FilaFiltros>
            {PERIODOS.map((p) => (
              <Chip key={p.id} texto={p.texto} activo={periodo === p.id} alPresionar={() => setPeriodo(p.id)} />
            ))}
          </FilaFiltros>
          <FilaFiltros>
            {RESULTADOS.map((r) => (
              <Chip key={r.id} texto={r.texto} activo={resultado === r.id} alPresionar={() => setResultado(r.id)} />
            ))}
          </FilaFiltros>
          {esAdministrador && domiciliarios.length > 0 ? (
            <FilaFiltros>
              <Chip texto="Todos los domiciliarios" activo={domiciliario === null} alPresionar={() => setDomiciliario(null)} />
              {domiciliarios.map((n) => (
                <Chip key={n} texto={n} activo={domiciliario === n} alPresionar={() => setDomiciliario(n)} />
              ))}
            </FilaFiltros>
          ) : null}
          <Text variant="muted">
            {visibles.length} {visibles.length === 1 ? 'domicilio terminado' : 'domicilios terminados'}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View className="gap-1">
          {item.fechaEntrega ? <Text variant="muted" className="text-xs">{item.fechaEntrega}</Text> : null}
          <TarjetaDomicilio
            domicilio={item}
            mostrarDomiciliario={esAdministrador}
            alPresionar={(id) => router.push({ pathname: '/domicilio/[id]', params: { id: String(id) } })}
          />
        </View>
      )}
      ListEmptyComponent={
        <EstadoDatos
          tipo="vacio"
          mensaje="No hay domicilios terminados con estos filtros."
          accion={hayFiltros ? { texto: 'Limpiar filtros', alPresionar: limpiar } : undefined}
        />
      }
    />
  );
}

function FilaFiltros({ children }: { children: React.ReactNode }) {
  return <View className="flex-row flex-wrap gap-2">{children}</View>;
}

function Chip({ texto, activo, alPresionar }: { texto: string; activo: boolean; alPresionar: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={alPresionar}
      className={cn('rounded-full border px-3 py-1.5', activo ? 'border-primary bg-primary' : 'border-border bg-card')}
    >
      <Text className={cn('text-sm', activo ? 'text-primary-foreground' : 'text-foreground')}>{texto}</Text>
    </Pressable>
  );
}
