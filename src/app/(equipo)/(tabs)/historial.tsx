import { PantallaPendiente } from '@/components/PantallaPendiente';

export default function Historial() {
  return (
    <PantallaPendiente
      icono="time-outline"
      titulo="Historial"
      descripcion="Domicilios terminados, con filtro por fecha y resultado: entregado, entrega parcial o no entregado."
    />
  );
}
