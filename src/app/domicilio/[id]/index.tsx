import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { PantallaPendiente } from '@/components/PantallaPendiente';

export default function DetalleDomicilio() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <PantallaPendiente
      icono="cube-outline"
      titulo={`Domicilio #${id}`}
      descripcion="Destino, franja de entrega, productos, estado y acciones. Si el domicilio no existe o no es tuyo, lo dice y ofrece volver."
    >
      <Link href={{ pathname: '/domicilio/[id]/entregar', params: { id } }}>
        <Text style={{ color: '#8A4B6E', fontSize: 16, fontWeight: '700' }}>Confirmar entrega</Text>
      </Link>
      <Link href={{ pathname: '/domicilio/[id]/no-entregar', params: { id } }}>
        <Text style={{ color: '#8A4B6E', fontSize: 16 }}>Reportar no entrega</Text>
      </Link>
      <Link href={{ pathname: '/domicilio/[id]/reprogramar', params: { id } }}>
        <Text style={{ color: '#8A4B6E', fontSize: 16 }}>Reprogramar (administrador)</Text>
      </Link>
    </PantallaPendiente>
  );
}
