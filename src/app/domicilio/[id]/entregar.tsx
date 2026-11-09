import { PantallaPendiente } from '@/components/PantallaPendiente';

export default function ConfirmarEntrega() {
  return (
    <PantallaPendiente
      icono="checkmark-circle-outline"
      titulo="Confirmar entrega"
      descripcion="Unidades entregadas por producto, entre 0 y lo pedido, y quién recibió. Si faltan unidades, queda como entrega parcial con su motivo."
    />
  );
}
