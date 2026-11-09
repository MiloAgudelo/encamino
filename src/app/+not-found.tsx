import { Link, Stack } from 'expo-router';

import { PantallaPendiente } from '@/components/PantallaPendiente';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function NoEncontrada() {
  return (
    <>
      <Stack.Screen options={{ title: 'No encontrada' }} />
      <PantallaPendiente icono="help-circle-outline" titulo="Esta pantalla no existe" descripcion="El enlace está roto o ya no está disponible.">
        <Link href="/" asChild>
          <Button>
            <Text>Volver al inicio</Text>
          </Button>
        </Link>
      </PantallaPendiente>
    </>
  );
}
