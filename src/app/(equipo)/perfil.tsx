import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { cerrarSesion } from '@/servicios/sesion';
import { useSesion } from '@/store/sesion';

const NOMBRE_ROL = { administrador: 'Administrador', domiciliario: 'Domiciliario' } as const;

/** Datos de la cuenta y cierre de sesión (RF-03). */
export default function Perfil() {
  const usuario = useSesion((s) => s.usuario);
  const clienteConsultas = useQueryClient();
  const [cerrando, setCerrando] = useState(false);

  async function salir() {
    setCerrando(true);
    await cerrarSesion();
    // Lo cargado con esta cuenta no debe verlo la siguiente.
    clienteConsultas.clear();
    router.replace('/');
  }

  if (!usuario) return null;

  return (
    <View className="flex-1 gap-4 bg-background p-4">
      <Card>
        <CardHeader>
          <CardTitle>{usuario.nombre}</CardTitle>
          <CardDescription>{usuario.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Text variant="muted">Rol: {NOMBRE_ROL[usuario.rol]}</Text>
        </CardContent>
      </Card>
      <Button variant="destructive" onPress={salir} disabled={cerrando}>
        <Text>{cerrando ? 'Cerrando sesión…' : 'Cerrar sesión'}</Text>
      </Button>
    </View>
  );
}
