import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { ErrorEnvio, FormularioDomicilio, volverAlDetalle } from '@/components/FormularioDomicilio';
import { FilaProducto } from '@/components/FilaProducto';
import { RequiereSesion } from '@/components/RequiereSesion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useConfirmarEntrega } from '@/hooks/consultas/useDomicilios';
import { THEME } from '@/lib/theme';
import { tituloDomicilio, type Domicilio } from '@/modelos/domicilio';

export default function PantallaConfirmarEntrega() {
  return (
    <RequiereSesion>
      <FormularioDomicilio titulo="Confirmar entrega">{(d) => <ConfirmarEntrega domicilio={d} />}</FormularioDomicilio>
    </RequiereSesion>
  );
}

/**
 * Confirmar entrega (RF-13). El pedido siempre se entrega completo: el
 * domiciliario solo indica quién recibió. Sin conexión no confirma nada y el
 * formulario conserva lo escrito.
 */
function ConfirmarEntrega({ domicilio: d }: { domicilio: Domicilio }) {
  const [quienRecibio, setQuienRecibio] = useState(d.quienRecibe ?? '');
  const [errorCampo, setErrorCampo] = useState<string | null>(null);
  const entregar = useConfirmarEntrega(d.id);

  function enviar() {
    const nombre = quienRecibio.trim();
    if (nombre.length < 2) {
      setErrorCampo('Escribe el nombre de quien recibió el pedido.');
      return;
    }
    setErrorCampo(null);
    // mutateAsync y no mutate(..., { onSuccess }): al confirmar, el detalle en caché pasa a
    // "entregado" y este formulario se desmonta antes de que corra el onSuccess por llamada.
    entregar
      .mutateAsync({ quienRecibio: nombre })
      .then(() => volverAlDetalle(d.id))
      .catch(() => {
        // El error se muestra con entregar.error.
      });
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
        <View className="gap-1">
          <Text variant="h4">{tituloDomicilio(d)}</Text>
          <Text variant="muted" className="text-base">
            {d.barrio} · {d.direccion}
          </Text>
        </View>

        {d.productos.length > 0 ? (
          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle>Se entrega completo</CardTitle>
            </CardHeader>
            <CardContent className="gap-3 px-4">
              {d.productos.map((p) => (
                <FilaProducto key={p.idLinea} nombre={p.nombre} cantidad={p.cantidad} imagen={p.imagen} />
              ))}
            </CardContent>
          </Card>
        ) : null}

        <View className="gap-1.5">
          <Label nativeID="etiqueta-quien-recibio">Quién recibió</Label>
          <Input
            aria-labelledby="etiqueta-quien-recibio"
            aria-invalid={!!errorCampo}
            value={quienRecibio}
            onChangeText={setQuienRecibio}
            placeholder="Nombre de quien recibió"
            autoCapitalize="words"
            editable={!entregar.isPending}
            onSubmitEditing={enviar}
            className={errorCampo ? 'border-destructive' : undefined}
          />
          {errorCampo ? <Text className="text-sm text-destructive">{errorCampo}</Text> : null}
        </View>

        {entregar.isError ? (
          <ErrorEnvio
            mensaje={
              entregar.error.tipo === 'sin_conexion'
                ? 'Sin conexión: la entrega no se registró. Tus datos siguen aquí; inténtalo de nuevo.'
                : entregar.error.message
            }
          />
        ) : null}

        <Button onPress={enviar} disabled={entregar.isPending}>
          {entregar.isPending ? <ActivityIndicator color={THEME.primaryForeground} /> : null}
          <Text>{entregar.isPending ? 'Confirmando…' : 'Confirmar entrega'}</Text>
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
