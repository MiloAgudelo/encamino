import { PantallaPendiente } from '@/components/PantallaPendiente';

export default function Mapa() {
  return (
    <PantallaPendiente
      icono="map-outline"
      titulo="Mapa en vivo"
      descripcion="OpenStreetMap con el punto de despacho y los destinos. El domiciliario activa, pausa y reanuda el envío de su posición; el administrador ve a todos los que van en camino."
    />
  );
}
