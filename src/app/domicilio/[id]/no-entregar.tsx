import { PantallaPendiente } from '@/components/PantallaPendiente';
import { RequiereSesion } from '@/components/RequiereSesion';

export default function ReportarNoEntrega() {
  return (
    <RequiereSesion>
      <PantallaPendiente
        icono="close-circle-outline"
        titulo="Reportar no entrega"
        descripcion="Motivo y foto obligatorios. Antes de reportar se recuerda el protocolo: contactar al destinatario, luego al cliente y luego a Karamba."
      />
    </RequiereSesion>
  );
}
