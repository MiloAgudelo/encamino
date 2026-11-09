// Extiende app.json con lo que depende del entorno.
// GOOGLE_MAPS_ANDROID_API_KEY solo hace falta para compilar la app propia (APK);
// Expo Go trae su propia llave. No lleva el prefijo EXPO_PUBLIC_ porque no se
// lee desde el código: va al AndroidManifest durante la compilación.
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY }],
  ],
});
