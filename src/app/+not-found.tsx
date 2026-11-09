import { Link, Stack } from 'expo-router';
import { Text } from 'react-native';

import { PantallaPendiente } from '@/components/PantallaPendiente';

export default function NoEncontrada() {
  return (
    <>
      <Stack.Screen options={{ title: 'No encontrada' }} />
      <PantallaPendiente icono="help-circle-outline" titulo="Esta pantalla no existe" descripcion="El enlace está roto o ya no está disponible.">
        <Link href="/">
          <Text style={{ color: '#8A4B6E', fontSize: 16, fontWeight: '700' }}>Volver al inicio</Text>
        </Link>
      </PantallaPendiente>
    </>
  );
}
