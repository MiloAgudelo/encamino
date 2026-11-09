import { Link, useLocalSearchParams } from 'expo-router';

import { PantallaPendiente } from '@/components/PantallaPendiente';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function DetalleDomicilio() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PantallaPendiente
      icono="cube-outline"
      titulo={`Domicilio #${id}`}
      descripcion="Destino, franja de entrega, productos, estado y acciones. Si el domicilio no existe o no es tuyo, lo dice y ofrece volver."
    >
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
      <Link href={{ pathname: '/domicilio/[id]/reprogramar', params: { id } }} asChild>
        <Button variant="ghost">
          <Text>Reprogramar (administrador)</Text>
        </Button>
      </Link>
    </PantallaPendiente>
  );
}
