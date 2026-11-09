import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NAV_THEME } from '@/lib/theme';

export default function LayoutRaiz() {
  const [clienteConsultas] = useState(() => new QueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={clienteConsultas}>
          <ThemeProvider value={NAV_THEME}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="ingresar" options={{ title: 'Ingresar' }} />
              <Stack.Screen name="seguimiento/[token]" options={{ title: 'Tu pedido' }} />
              <Stack.Screen name="(equipo)" options={{ headerShown: false }} />
              <Stack.Screen name="domicilio/[id]/index" options={{ title: 'Domicilio' }} />
              <Stack.Screen name="domicilio/[id]/entregar" options={{ title: 'Confirmar entrega' }} />
              <Stack.Screen name="domicilio/[id]/no-entregar" options={{ title: 'Reportar no entrega' }} />
              <Stack.Screen name="domicilio/[id]/reprogramar" options={{ title: 'Reprogramar domicilio' }} />
            </Stack>
            <PortalHost />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
