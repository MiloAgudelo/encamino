import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { crearClienteConsultas } from '@/lib/clienteConsultas';
import { NAV_THEME } from '@/lib/theme';

// La pantalla de carga se queda hasta que la fuente de la marca esté lista.
void SplashScreen.preventAutoHideAsync();

export default function LayoutRaiz() {
  const [clienteConsultas] = useState(crearClienteConsultas);
  // Si la fuente falla, la app sigue con la del sistema en vez de quedarse en blanco.
  const [fuentesListas, errorFuentes] = useFonts({
    Quicksand_500Medium: require('../../assets/fonts/Quicksand_500Medium.ttf'),
    Quicksand_700Bold: require('../../assets/fonts/Quicksand_700Bold.ttf'),
  });
  const listo = fuentesListas || errorFuentes != null;

  useEffect(() => {
    if (listo) void SplashScreen.hideAsync();
  }, [listo]);

  if (!listo) return null;

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
