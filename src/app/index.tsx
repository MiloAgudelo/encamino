import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Inicio: el cliente sigue su pedido con su código; el equipo de Karamba ingresa con su cuenta. */
export default function Inicio() {
  const [codigo, setCodigo] = useState('');
  const codigoLimpio = codigo.trim();

  return (
    <SafeAreaView style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Text style={estilos.marca}>EnCamino</Text>
        <Text style={estilos.lema}>Tu pedido de Karamba by marCe, en el mapa.</Text>
      </View>

      <View style={estilos.tarjeta}>
        <Text style={estilos.etiqueta}>Código de seguimiento</Text>
        <TextInput
          value={codigo}
          onChangeText={setCodigo}
          placeholder="Pégalo desde el mensaje de WhatsApp"
          autoCapitalize="none"
          autoCorrect={false}
          style={estilos.campo}
        />
        <Pressable
          accessibilityRole="button"
          disabled={codigoLimpio.length === 0}
          onPress={() => router.push({ pathname: '/seguimiento/[token]', params: { token: codigoLimpio } })}
          style={[estilos.boton, codigoLimpio.length === 0 && estilos.botonInactivo]}
        >
          <Text style={estilos.textoBoton}>Seguir mi pedido</Text>
        </Pressable>
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.push('/ingresar')} style={estilos.enlace}>
        <Text style={estilos.textoEnlace}>Soy del equipo de Karamba</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', gap: 24, padding: 24, backgroundColor: '#FFF8F3' },
  encabezado: { alignItems: 'center', gap: 6 },
  marca: { fontSize: 36, fontWeight: '800', color: '#8A4B6E' },
  lema: { fontSize: 16, color: '#5C4652', textAlign: 'center' },
  tarjeta: { gap: 10, padding: 16, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EADCD3' },
  etiqueta: { fontSize: 14, fontWeight: '600', color: '#3B2230' },
  campo: { borderWidth: 1, borderColor: '#D9C6BB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  boton: { alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: '#8A4B6E' },
  botonInactivo: { opacity: 0.4 },
  textoBoton: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  enlace: { alignItems: 'center', padding: 12 },
  textoEnlace: { color: '#8A4B6E', fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
});
