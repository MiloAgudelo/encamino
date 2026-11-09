# 0002. Google Maps para los mapas y las direcciones

Fecha: 2026-11-09. Estado: aceptada. Reemplaza el plan inicial de OpenStreetMap con Leaflet dentro de una WebView.

## Contexto

EnCamino muestra mapas en tres lugares: la app (domiciliario, administrador y cliente), el seguimiento del cliente en el navegador y el tablero del televisor del local. El plan inicial era OpenStreetMap con Leaflet en una WebView para la app.

Una WebView obliga a mantener una página HTML dentro de la app y a pasar cada posición por mensajes entre la app y la página. Los gestos y los marcadores se sienten menos fluidos que en un mapa nativo.

Además, Karamba solo tiene las coordenadas del centro de cada barrio. Con eso, el destino aparece en un punto aproximado y no en la dirección del pedido.

Karamba tiene créditos en Google Cloud.

## Decisión

- **App:** `react-native-maps` con Google como proveedor. Es un mapa nativo y funciona en Expo Go para Android. La app propia lee su llave de `GOOGLE_MAPS_ANDROID_API_KEY` al compilar (`app.config.js`).
- **Panel web** (seguimiento en el navegador y tablero en vivo): Maps JavaScript API. El mapa se carga una vez por página y la actualización periódica solo mueve los marcadores.
- **Backend:** Geocoding API convierte la dirección del pedido en coordenadas una sola vez y las guarda (B-11). Si no la encuentra, usa el centro del barrio y lo marca como aproximado.
- La posición del domiciliario se sigue tomando con `expo-location`.

## Consecuencias

- Mapas más fluidos y destinos exactos en la app, el seguimiento y el tablero.
- Dependencia de Google y de su facturación. Para controlar el costo: una llave por uso con su restricción (paquete de Android y huella del certificado, dominio del panel, solo el backend para Geocoding), tope de gasto diario en la cuenta y geocodificación una sola vez por pedido (RNF-06 y RNF-12).
- La regla de no dibujar una línea recta como si fuera una ruta se mantiene: el mapa solo muestra marcadores.
- Se retira `react-native-webview` de las dependencias.
