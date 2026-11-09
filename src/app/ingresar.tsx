import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { aErrorDeApi } from '@/servicios/api';
import { ingresar } from '@/servicios/sesion';
import { useSesion } from '@/store/sesion';

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ErroresFormulario {
  email?: string;
  contrasena?: string;
}

function validar(email: string, contrasena: string): ErroresFormulario {
  const errores: ErroresFormulario = {};
  if (!email.trim()) errores.email = 'Escribe tu correo.';
  else if (!CORREO_VALIDO.test(email.trim())) errores.email = 'Revisa el correo: falta algo (por ejemplo, la @).';
  if (!contrasena) errores.contrasena = 'Escribe tu contraseña.';
  return errores;
}

/** Ingreso del equipo con la cuenta de Karamba (RF-02). */
export default function Ingresar() {
  const usuario = useSesion((s) => s.usuario);
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Redirect href="/(equipo)/(tabs)" />;

  async function enviar() {
    const nuevos = validar(email, contrasena);
    setErrores(nuevos);
    setErrorGeneral(null);
    if (nuevos.email || nuevos.contrasena) return;

    setEnviando(true);
    try {
      await ingresar(email.trim().toLowerCase(), contrasena);
      router.replace('/(equipo)/(tabs)');
    } catch (error) {
      setErrorGeneral(aErrorDeApi(error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerClassName="flex-grow justify-center p-6" keyboardShouldPersistTaps="handled">
        <Card>
          <CardHeader>
            <CardTitle>Equipo de Karamba</CardTitle>
            <CardDescription>Entra con el correo y la contraseña de tu cuenta de Karamba.</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-1.5">
              <Label nativeID="etiqueta-correo">Correo</Label>
              <Input
                aria-labelledby="etiqueta-correo"
                aria-invalid={!!errores.email}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                editable={!enviando}
                className={errores.email ? 'border-destructive' : undefined}
              />
              {errores.email ? <Text className="text-sm text-destructive">{errores.email}</Text> : null}
            </View>
            <View className="gap-1.5">
              <Label nativeID="etiqueta-contrasena">Contraseña</Label>
              <Input
                aria-labelledby="etiqueta-contrasena"
                aria-invalid={!!errores.contrasena}
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry
                autoComplete="password"
                editable={!enviando}
                onSubmitEditing={enviar}
                className={errores.contrasena ? 'border-destructive' : undefined}
              />
              {errores.contrasena ? <Text className="text-sm text-destructive">{errores.contrasena}</Text> : null}
            </View>
            {errorGeneral ? (
              <View className="rounded-md border border-destructive/40 bg-destructive/10 p-3">
                <Text className="text-sm text-destructive">{errorGeneral}</Text>
              </View>
            ) : null}
            <Button onPress={enviar} disabled={enviando}>
              {enviando ? <ActivityIndicator color={THEME.background} /> : null}
              <Text>{enviando ? 'Entrando…' : 'Entrar'}</Text>
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
