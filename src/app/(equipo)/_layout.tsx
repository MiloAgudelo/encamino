import { Drawer } from 'expo-router/drawer';

/** Accesos complementarios del equipo. Las secciones frecuentes viven en las pestañas. */
export default function LayoutEquipo() {
  return (
    <Drawer screenOptions={{ headerTintColor: '#8A4B6E', drawerActiveTintColor: '#8A4B6E' }}>
      <Drawer.Screen name="(tabs)" options={{ title: 'Domicilios', drawerLabel: 'Domicilios' }} />
      <Drawer.Screen name="punto-despacho" options={{ title: 'Punto de despacho' }} />
      <Drawer.Screen name="ubicacion" options={{ title: 'Permisos de ubicación' }} />
      <Drawer.Screen name="perfil" options={{ title: 'Mi perfil' }} />
    </Drawer>
  );
}
