import { PantallaPendiente } from '@/components/PantallaPendiente';
import { RequiereSesion } from '@/components/RequiereSesion';

export default function ConfirmarEntrega() {
  return (
    <RequiereSesion>
      <PantallaPendiente
        icono="checkmark-circle-outline"
        titulo="Confirmar entrega"
        descripcion="Unidades entregadas por producto, entre 0 y lo pedido, y quién recibió. Si faltan unidades, queda como entrega parcial con su motivo."
      />
    </RequiereSesion>
  );
}
