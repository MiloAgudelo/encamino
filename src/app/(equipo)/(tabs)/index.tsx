import { Link } from 'expo-router';
import { Text } from 'react-native';

import { PantallaPendiente } from '@/components/PantallaPendiente';

export default function DomiciliosDeHoy() {
  return (
    <PantallaPendiente
      icono="list-outline"
      titulo="Domicilios de hoy"
      descripcion="Lista con búsqueda y filtro por estado. El domiciliario ve los suyos; el administrador ve todos los que están en curso."
    >
      <Link href={{ pathname: '/domicilio/[id]', params: { id: '1' } }}>
        <Text style={{ color: '#8A4B6E', fontSize: 16, fontWeight: '700' }}>Abrir domicilio #1</Text>
      </Link>
      <Link href={{ pathname: '/domicilio/[id]', params: { id: '999999' } }}>
        <Text style={{ color: '#8A4B6E', fontSize: 16 }}>Abrir un domicilio que no existe</Text>
      </Link>
    </PantallaPendiente>
  );
}
