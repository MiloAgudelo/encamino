import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { extraerCodigo } from '@/servicios/seguimiento';
import { useCodigosConsultados } from '@/store/codigosConsultados';
import { useSesion } from '@/store/sesion';

/** Inicio: el cliente sigue su pedido con su código; el equipo de Karamba ingresa con su cuenta (RF-01). */
export default function Inicio() {
  const [codigo, setCodigo] = useState('');
  const codigoLimpio = codigo.trim();
  const codigos = useCodigosConsultados((s) => s.codigos);
  const haySesion = useSesion((s) => s.usuario != null);

  const seguir = (texto: string) =>
    router.push({ pathname: '/seguimiento/[token]', params: { token: extraerCodigo(texto) } });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="flex-grow justify-center gap-6 p-6" keyboardShouldPersistTaps="handled">
          <View className="items-center gap-1">
            <Text variant="h1">EnCamino</Text>
            <Text variant="muted" className="text-center text-base">
              Tu pedido de Karamba by marCe, en el mapa.
            </Text>
          </View>

          <Card>
            <CardHeader>
              <CardTitle>Sigue tu pedido</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <View className="gap-1.5">
                <Label nativeID="etiqueta-codigo">Código o enlace de seguimiento</Label>
                <Input
                  aria-labelledby="etiqueta-codigo"
                  value={codigo}
                  onChangeText={setCodigo}
                  placeholder="Pégalo desde el mensaje de WhatsApp"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={() => codigoLimpio && seguir(codigoLimpio)}
                />
              </View>
              <Button disabled={codigoLimpio.length === 0} onPress={() => seguir(codigoLimpio)}>
                <Text>Seguir mi pedido</Text>
              </Button>
              {codigos.length > 0 ? (
                <View className="gap-1 pt-1">
                  <Text variant="muted">Consultados antes</Text>
                  {codigos.map((c) => (
                    <Pressable
                      key={c}
                      accessibilityRole="button"
                      accessibilityLabel={`Abrir el pedido con código ${c}`}
                      onPress={() => seguir(c)}
                      className="rounded-md py-2 active:bg-accent"
                    >
                      <Text className="font-mono text-sm" numberOfLines={1}>
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </CardContent>
          </Card>

          <Button variant="link" onPress={() => router.push(haySesion ? '/(equipo)/(tabs)' : '/ingresar')}>
            <Text>{haySesion ? 'Ir a mis domicilios' : 'Soy del equipo de Karamba'}</Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
