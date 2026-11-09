import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { PantallaPendiente } from '@/components/PantallaPendiente';

export default function Ingresar() {
  return (
    <PantallaPendiente
      icono="log-in-outline"
      titulo="Ingreso del equipo"
      descripcion="Correo y contraseña de Karamba. Abre la vista del domiciliario o la del administrador según el rol."
    >
      <Pressable accessibilityRole="button" onPress={() => router.replace('/(equipo)/(tabs)')}>
        <Text style={{ color: '#8A4B6E', fontSize: 16, fontWeight: '700' }}>Entrar sin cuenta (simulado)</Text>
      </Pressable>
    </PantallaPendiente>
  );
}
