import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

interface FilaProductoProps {
  nombre: string;
  cantidad: number;
  /** URL de la imagen; null si el producto no tiene. */
  imagen: string | null;
}

/** Un producto con su miniatura y cantidad, en el detalle y en el seguimiento. */
export function FilaProducto({ nombre, cantidad, imagen }: FilaProductoProps) {
  const [imagenFallo, setImagenFallo] = useState(false);
  const mostrarImagen = imagen && !imagenFallo;

  return (
    <View className="flex-row items-center gap-3">
      {mostrarImagen ? (
        <Image
          source={{ uri: imagen }}
          style={{ width: 48, height: 48, borderRadius: 8 }}
          contentFit="cover"
          onError={() => setImagenFallo(true)}
          accessibilityLabel={nombre}
        />
      ) : (
        // Imagen alternativa cuando el producto no tiene foto o no cargó (RF-06).
        <View className="h-12 w-12 items-center justify-center rounded-lg bg-muted">
          <Ionicons name="gift-outline" size={22} color={THEME.mutedForeground} />
        </View>
      )}
      <Text className="flex-1">
        {nombre} <Text variant="muted">× {cantidad}</Text>
      </Text>
    </View>
  );
}
