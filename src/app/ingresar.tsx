import { router } from 'expo-router';

import { AvisoSimulado } from '@/components/AvisoSimulado';
import { PantallaPendiente } from '@/components/PantallaPendiente';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function Ingresar() {
  return (
    <PantallaPendiente
      icono="log-in-outline"
      titulo="Ingreso del equipo"
      descripcion="Correo y contraseña de Karamba. Abre la vista del domiciliario o la del administrador según el rol."
    >
      <Button onPress={() => router.replace('/(equipo)/(tabs)')}>
        <Text>Entrar sin cuenta</Text>
      </Button>
      <AvisoSimulado que="sin validar credenciales" />
    </PantallaPendiente>
  );
}
