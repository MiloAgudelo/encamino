import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    <View style={estilos.contenedor}>
      <Ionicons name={icono} size={48} color="#8A4B6E" />
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.descripcion}>{descripcion}</Text>
      <Text style={estilos.aviso}>En construcción</Text>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, backgroundColor: '#FFF8F3' },
  titulo: { fontSize: 22, fontWeight: '700', color: '#3B2230', textAlign: 'center' },
  descripcion: { fontSize: 16, color: '#5C4652', textAlign: 'center', maxWidth: 320 },
  aviso: { fontSize: 13, color: '#8A4B6E', borderWidth: 1, borderColor: '#8A4B6E', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
});
