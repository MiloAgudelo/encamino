import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { THEME } from '@/lib/theme';

type NombreIcono = ComponentProps<typeof Ionicons>['name'];

/** Ícono de pestaña que acepta el color que entrega la barra (ColorValue) y lo pasa como texto. */
function iconoPestana(nombre: NombreIcono) {
  return function IconoPestana({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={nombre} size={size} color={typeof color === 'string' ? color : undefined} />;
  };
}

export default function LayoutPestanas() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: THEME.primary }}>
      <Tabs.Screen name="index" options={{ title: 'Hoy', tabBarIcon: iconoPestana('list-outline') }} />
      <Tabs.Screen name="mapa" options={{ title: 'Mapa', tabBarIcon: iconoPestana('map-outline') }} />
      <Tabs.Screen name="historial" options={{ title: 'Historial', tabBarIcon: iconoPestana('time-outline') }} />
    </Tabs>
  );
}
