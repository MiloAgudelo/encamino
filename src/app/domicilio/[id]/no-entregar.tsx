import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, View } from 'react-native';

import { AvisoSimulado } from '@/components/AvisoSimulado';
import { ErrorEnvio, FormularioDomicilio, volverAlDetalle } from '@/components/FormularioDomicilio';
import { RequiereSesion } from '@/components/RequiereSesion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useReportarNoEntrega } from '@/hooks/consultas/useDomicilios';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { tituloDomicilio, type Domicilio } from '@/modelos/domicilio';
import { pedirFirmaFoto } from '@/servicios/fotos';

const MOTIVOS_FRECUENTES = ['Nadie atendió', 'Dirección incorrecta', 'El destinatario no lo recibió'];

export default function PantallaNoEntrega() {
  return (
    <RequiereSesion>
      <FormularioDomicilio titulo="Reportar no entrega">{(d) => <NoEntrega domicilio={d} />}</FormularioDomicilio>
    </RequiereSesion>
  );
}

/** Reportar no entrega (RF-14): primero el protocolo de contacto (RN-07), luego motivo y foto. */
function NoEntrega({ domicilio: d }: { domicilio: Domicilio }) {
  const [protocoloSeguido, setProtocoloSeguido] = useState(false);

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10" keyboardShouldPersistTaps="handled">
        <View className="gap-1">
          <Text variant="h4">{tituloDomicilio(d)}</Text>
          <Text variant="muted" className="text-base">
            {d.barrio} · {d.direccion}
          </Text>
        </View>
        {protocoloSeguido ? (
          <Formulario domicilio={d} />
        ) : (
          <Protocolo domicilio={d} alTerminar={() => setProtocoloSeguido(true)} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** RN-07: contactar al destinatario, luego al cliente y luego a Karamba. */
function Protocolo({ domicilio: d, alTerminar }: { domicilio: Domicilio; alTerminar: () => void }) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle>Antes de reportar</CardTitle>
      </CardHeader>
      <CardContent className="gap-3 px-4">
        <Paso numero={1} texto={`Llama a quien recibe${d.quienRecibe ? `: ${d.quienRecibe}` : ''}.`} telefono={d.telefonoQuienRecibe} />
        <Paso numero={2} texto={`Si no contesta, llama al cliente${d.cliente ? `: ${d.cliente}` : ''}.`} telefono={d.telefonoCliente} />
        <Paso numero={3} texto="Si tampoco hay respuesta, avisa a Karamba antes de irte." telefono={null} />
        <Button variant="outline" onPress={alTerminar}>
          <Text>Ya seguí el protocolo</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

function Paso({ numero, texto, telefono }: { numero: number; texto: string; telefono: string | null }) {
  return (
    <View className="gap-2">
      <View className="flex-row gap-3">
        <View className="h-6 w-6 items-center justify-center rounded-full bg-muted">
          <Text className="text-sm font-semibold">{numero}</Text>
        </View>
        <Text className="flex-1">{texto}</Text>
      </View>
      {telefono ? (
        <Button variant="secondary" size="sm" onPress={() => Linking.openURL(`tel:${telefono}`)}>
          <Ionicons name="call-outline" size={16} color={THEME.foreground} />
          <Text>Llamar a {telefono}</Text>
        </Button>
      ) : null}
    </View>
  );
}

interface Errores {
  motivo?: string;
  foto?: string;
}

function Formulario({ domicilio: d }: { domicilio: Domicilio }) {
  const [motivo, setMotivo] = useState('');
  const [uriFoto, setUriFoto] = useState<string | null>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  const reportar = useReportarNoEntrega(d.id);
  // Solo para avisar en pantalla si la foto se va a simular (entorno local sin Cloudinary, RNF-09).
  const firma = useQuery({
    // Fuera del prefijo 'domicilios': al reportar se invalida ese prefijo y no debe volver a pedir firma.
    queryKey: ['firma-foto', d.id],
    queryFn: () => pedirFirmaFoto(d.id),
    staleTime: Infinity,
    retry: false,
  });
  const fotoSimulada = firma.data != null && 'simulado' in firma.data;

  async function tomarFoto() {
    setErrorCamara(null);
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      setErrorCamara(
        permiso.canAskAgain
          ? 'Necesitamos la cámara para la foto de evidencia.'
          : 'La cámara está bloqueada para EnCamino. Actívala en los ajustes del teléfono.',
      );
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!resultado.canceled && resultado.assets[0]) {
      setUriFoto(resultado.assets[0].uri);
      setErrores((e) => ({ ...e, foto: undefined }));
    }
  }

  function enviar() {
    const nuevos: Errores = {};
    if (motivo.trim().length < 3) nuevos.motivo = 'Escribe el motivo de la no entrega.';
    if (!uriFoto) nuevos.foto = 'Toma una foto de evidencia.';
    setErrores(nuevos);
    if (nuevos.motivo || nuevos.foto) return;
    // mutateAsync: al confirmar, el formulario se desmonta (ver entregar.tsx).
    reportar
      .mutateAsync({ motivo: motivo.trim(), uriFoto: uriFoto! })
      .then(() => volverAlDetalle(d.id))
      .catch(() => {
        // El error se muestra con reportar.error.
      });
  }

  return (
    <View className="gap-4">
      <View className="gap-1.5">
        <Label nativeID="etiqueta-motivo">Motivo</Label>
        <View className="flex-row flex-wrap gap-2">
          {MOTIVOS_FRECUENTES.map((m) => (
            <Pressable
              key={m}
              accessibilityRole="button"
              onPress={() => {
                setMotivo(m);
                setErrores((e) => ({ ...e, motivo: undefined }));
              }}
              className={cn('rounded-full border border-border px-3 py-1.5 active:opacity-70', motivo === m && 'border-primary bg-primary/10')}
            >
              <Text className="text-sm">{m}</Text>
            </Pressable>
          ))}
        </View>
        <Input
          aria-labelledby="etiqueta-motivo"
          aria-invalid={!!errores.motivo}
          value={motivo}
          onChangeText={setMotivo}
          placeholder="Qué pasó"
          multiline
          numberOfLines={3}
          editable={!reportar.isPending}
          className={cn('min-h-20 py-2', errores.motivo && 'border-destructive')}
          style={{ textAlignVertical: 'top' }}
        />
        {errores.motivo ? <Text className="text-sm text-destructive">{errores.motivo}</Text> : null}
      </View>

      <View className="gap-1.5">
        <Label nativeID="etiqueta-foto">Foto de evidencia</Label>
        {fotoSimulada ? <AvisoSimulado que="la foto no se sube en el entorno local" className="self-start" /> : null}
        {uriFoto ? (
          <Image
            source={{ uri: uriFoto }}
            style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 8 }}
            contentFit="cover"
            accessibilityLabel="Foto de evidencia tomada"
          />
        ) : null}
        <Button variant="outline" onPress={tomarFoto} disabled={reportar.isPending} aria-labelledby="etiqueta-foto">
          <Ionicons name="camera-outline" size={18} color={THEME.foreground} />
          <Text>{uriFoto ? 'Tomar otra foto' : 'Tomar foto'}</Text>
        </Button>
        {errores.foto ? <Text className="text-sm text-destructive">{errores.foto}</Text> : null}
        {errorCamara ? (
          <View className="gap-2">
            <Text className="text-sm text-destructive">{errorCamara}</Text>
            <Button variant="secondary" size="sm" onPress={() => void Linking.openSettings()}>
              <Text>Abrir ajustes</Text>
            </Button>
          </View>
        ) : null}
      </View>

      {reportar.isError ? (
        <ErrorEnvio
          mensaje={
            reportar.error.tipo === 'sin_conexion'
              ? 'Sin conexión: la no entrega no se registró. Tus datos siguen aquí; inténtalo de nuevo.'
              : reportar.error.message
          }
        />
      ) : null}

      <Button variant="destructive" onPress={enviar} disabled={reportar.isPending}>
        {reportar.isPending ? <ActivityIndicator color={THEME.background} /> : null}
        <Text>{reportar.isPending ? 'Enviando…' : 'Reportar no entrega'}</Text>
      </Button>
    </View>
  );
}
