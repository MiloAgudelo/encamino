import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AvisoSimulado } from '@/components/AvisoSimulado';
import { EstadoDatos } from '@/components/EstadoDatos';
import { TarjetaDomicilio } from '@/components/TarjetaDomicilio';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import type { ResumenDomicilio } from '@/modelos/domicilio';

// Datos de ejemplo hasta conectar el backend. El 999999 no existe, para probar la ruta inexistente.
const EJEMPLO: ResumenDomicilio[] = [
  { id: 1, numeroPedido: '1287', barrio: 'El Prado', ciudad: 'Cartago', franja: '8:00 – 9:00', estado: 'en_camino' },
  { id: 2, numeroPedido: '1290', barrio: 'San Jerónimo', ciudad: 'Cartago', franja: '9:00 – 10:00', estado: 'pendiente' },
  { id: 999999, numeroPedido: '0000', barrio: 'Domicilio inexistente', ciudad: 'Cartago', franja: 'Sin franja', estado: 'no_entregado' },
];

export default function DomiciliosDeHoy() {
  const abrir = (id: number) => router.push({ pathname: '/domicilio/[id]', params: { id: String(id) } });

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-3 p-4">
      <View className="items-start gap-1">
        <Text variant="h4">Domicilios de hoy</Text>
        <AvisoSimulado que="datos de ejemplo" className="self-start" />
      </View>
      {EJEMPLO.map((domicilio) => (
        <TarjetaDomicilio key={domicilio.id} domicilio={domicilio} alPresionar={abrir} />
      ))}
      <Separator className="my-2" />
      <Text variant="muted">Así se ven los estados de carga, vacío y error:</Text>
      <View className="rounded-lg border border-border">
        <EstadoDatos tipo="cargando" esqueleto />
      </View>
      <View className="h-40 rounded-lg border border-border">
        <EstadoDatos tipo="vacio" mensaje="No tienes domicilios para hoy" />
      </View>
      <View className="h-48 rounded-lg border border-border">
        <EstadoDatos tipo="error" alReintentar={() => {}} />
      </View>
    </ScrollView>
  );
}
