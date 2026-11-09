import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface AvisoSimuladoProps {
  /** Qué se está simulando, por ejemplo "Ingreso sin cuenta". */
  que?: string;
  className?: string;
}

/** Identifica en la pantalla una operación simulada, para que no pase por real (RNF-09). */
export function AvisoSimulado({ que, className }: AvisoSimuladoProps) {
  return (
    <Badge variant="secondary" className={cn('self-center', className)}>
      <Text>{que ? `Simulado · ${que}` : 'Simulado'}</Text>
    </Badge>
  );
}
