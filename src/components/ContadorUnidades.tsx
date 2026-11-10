import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface ContadorUnidadesProps {
  /** Nombre del producto, para la etiqueta de accesibilidad. */
  nombre: string;
  valor: number;
  /** Límite superior: la cantidad pedida. El inferior es 0. */
  maximo: number;
  alCambiar: (valor: number) => void;
}

/**
 * Contador con + y − entre 0 y `maximo` (verificación de la carga, RF-11).
 * El botón que llegó a su límite queda deshabilitado.
 */
export function ContadorUnidades({ nombre, valor, maximo, alCambiar }: ContadorUnidadesProps) {
  const puedeRestar = valor > 0;
  const puedeSumar = valor < maximo;

  return (
    <View className="flex-row items-center gap-2">
      <BotonContador
        icono="remove"
        etiqueta={`Quitar una unidad de ${nombre}`}
        habilitado={puedeRestar}
        alPresionar={() => alCambiar(Math.max(0, valor - 1))}
      />
      <Text
        className={cn('min-w-12 text-center font-semibold', valor === maximo && 'text-primary')}
        accessibilityLabel={`${valor} de ${maximo} unidades de ${nombre}`}
      >
        {valor}/{maximo}
      </Text>
      <BotonContador
        icono="add"
        etiqueta={`Sumar una unidad de ${nombre}`}
        habilitado={puedeSumar}
        alPresionar={() => alCambiar(Math.min(maximo, valor + 1))}
      />
    </View>
  );
}

function BotonContador({
  icono,
  etiqueta,
  habilitado,
  alPresionar,
}: {
  icono: 'add' | 'remove';
  etiqueta: string;
  habilitado: boolean;
  alPresionar: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled: !habilitado }}
      disabled={!habilitado}
      onPress={alPresionar}
      className={cn(
        'h-10 w-10 items-center justify-center rounded-full border border-border active:opacity-70',
        !habilitado && 'opacity-40',
      )}
    >
      <Ionicons name={icono} size={20} color={habilitado ? THEME.foreground : THEME.mutedForeground} />
    </Pressable>
  );
}
