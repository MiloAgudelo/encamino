import { useLocalSearchParams } from 'expo-router';

import { PantallaPendiente } from '@/components/PantallaPendiente';

export default function Seguimiento() {
  const { token } = useLocalSearchParams<{ token: string }>();

  return (
    <PantallaPendiente
      icono="navigate-outline"
      titulo="Seguimiento del pedido"
      descripcion={`Estado del pedido, mapa con el punto de despacho y la posición del domiciliario mientras va en camino. Código: ${token}`}
    />
  );
}
