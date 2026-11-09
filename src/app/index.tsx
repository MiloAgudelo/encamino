import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

/** Inicio: el cliente sigue su pedido con su código; el equipo de Karamba ingresa con su cuenta. */
export default function Inicio() {
  const [codigo, setCodigo] = useState('');
  const codigoLimpio = codigo.trim();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-6 p-6">
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
              <Label nativeID="etiqueta-codigo">Código de seguimiento</Label>
              <Input
                aria-labelledby="etiqueta-codigo"
                value={codigo}
                onChangeText={setCodigo}
                placeholder="Pégalo desde el mensaje de WhatsApp"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Button
              disabled={codigoLimpio.length === 0}
              onPress={() => router.push({ pathname: '/seguimiento/[token]', params: { token: codigoLimpio } })}
            >
              <Text>Seguir mi pedido</Text>
            </Button>
          </CardContent>
        </Card>

        <Button variant="link" onPress={() => router.push('/ingresar')}>
          <Text>Soy del equipo de Karamba</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
