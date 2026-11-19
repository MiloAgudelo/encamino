import { Image } from 'expo-image';
import { Drawer, DrawerContentScrollView, DrawerItemList, type DrawerContentComponentProps } from 'expo-router/drawer';
import { View } from 'react-native';

import { RequiereSesion } from '@/components/RequiereSesion';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

const MONO = require('../../../assets/images/mono-karamba.png');

/** Menú lateral con el moño y el nombre de Karamba arriba. */
function ContenidoMenu(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props}>
      <View className="mb-2 flex-row items-center gap-3 border-b border-border px-4 pb-4 pt-2">
        <Image source={MONO} style={{ width: 40, height: 40 }} contentFit="contain" accessible={false} />
        <View>
          <Text className="font-marca text-2xl leading-[34px] text-primary">Karamba</Text>
          <Text className="font-quick text-sm tracking-[2px] text-muted-foreground">EnCamino</Text>
        </View>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

/** Accesos complementarios del equipo. Las secciones frecuentes viven en las pestañas. */
export default function LayoutEquipo() {
  return (
    <RequiereSesion>
      <Drawer
        drawerContent={(props) => <ContenidoMenu {...props} />}
        screenOptions={{
          drawerActiveTintColor: THEME.primary,
          drawerActiveBackgroundColor: 'hsl(36 63% 91%)',
          drawerInactiveTintColor: THEME.foreground,
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ title: 'Domicilios', drawerLabel: 'Domicilios' }} />
        <Drawer.Screen name="punto-despacho" options={{ title: 'Punto de despacho' }} />
        <Drawer.Screen name="ubicacion" options={{ title: 'Permisos de ubicación' }} />
        <Drawer.Screen name="perfil" options={{ title: 'Mi perfil' }} />
      </Drawer>
    </RequiereSesion>
  );
}
