import { Pressable } from 'react-native';

import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { ETIQUETA_ESTADO, type EstadoDomicilio, type ResumenDomicilio } from '@/modelos/domicilio';

const VARIANTE_ESTADO: Record<EstadoDomicilio, BadgeProps['variant']> = {
  pendiente: 'outline',
  en_camino: 'default',
  entregado: 'secondary',
  entrega_parcial: 'secondary',
  no_entregado: 'destructive',
};

interface TarjetaDomicilioProps {
  domicilio: ResumenDomicilio;
  alPresionar: (id: number) => void;
  /** El administrador ve quién lleva el domicilio. */
  mostrarDomiciliario?: boolean;
}

/** Un domicilio en las listas de Hoy, En curso e Historial. */
export function TarjetaDomicilio({ domicilio, alPresionar, mostrarDomiciliario = false }: TarjetaDomicilioProps) {
  const { id, numeroPedido, barrio, ciudad, franja, estado, domiciliario } = domicilio;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Pedido ${numeroPedido}, ${barrio}, ${ETIQUETA_ESTADO[estado]}`}
      onPress={() => alPresionar(id)}
      className="active:opacity-70"
    >
      <Card className="gap-2 py-4">
        <CardHeader className="flex-row items-start justify-between gap-2 px-4">
          <CardTitle className="flex-1">
            #{numeroPedido} · {barrio}
          </CardTitle>
          <Badge variant={VARIANTE_ESTADO[estado]}>
            <Text>{ETIQUETA_ESTADO[estado]}</Text>
          </Badge>
        </CardHeader>
        <CardContent className="px-4">
          <CardDescription>
            {ciudad} · {franja}
            {mostrarDomiciliario && domiciliario ? ` · ${domiciliario}` : ''}
          </CardDescription>
        </CardContent>
      </Card>
    </Pressable>
  );
}
