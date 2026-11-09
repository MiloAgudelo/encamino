import { PantallaPendiente } from '@/components/PantallaPendiente';

export default function Reprogramar() {
  return (
    <PantallaPendiente
      icono="repeat-outline"
      titulo="Reprogramar domicilio"
      descripcion="Calcula el valor del domicilio nuevo según la ciudad, el barrio y si cambió la dirección, y lo asigna a un domiciliario. El cliente ve el valor en su seguimiento."
    />
  );
}
