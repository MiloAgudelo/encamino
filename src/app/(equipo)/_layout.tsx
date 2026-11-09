import { Drawer } from 'expo-router/drawer';

import { THEME } from '@/lib/theme';

/** Accesos complementarios del equipo. Las secciones frecuentes viven en las pestañas. */
export default function LayoutEquipo() {
  return (
    <Drawer screenOptions={{ drawerActiveTintColor: THEME.primary }}>
      <Drawer.Screen name="(tabs)" options={{ title: 'Domicilios', drawerLabel: 'Domicilios' }} />
      <Drawer.Screen name="punto-despacho" options={{ title: 'Punto de despacho' }} />
      <Drawer.Screen name="ubicacion" options={{ title: 'Permisos de ubicación' }} />
      <Drawer.Screen name="perfil" options={{ title: 'Mi perfil' }} />
    </Drawer>
  );
}
