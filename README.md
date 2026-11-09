# EnCamino

Rastreo de domicilios en tiempo real para Karamba by marCe: el domiciliario comparte su ubicación y actualiza el estado del domicilio, el cliente lo sigue en el mapa y el administrador supervisa las entregas en curso.

Aplicación móvil con React Native, TypeScript, Expo (SDK 58) y Expo Router. Los mapas son de Google Maps (`react-native-maps`). Usa como API el backend de Karamba ([`riveragiraldo/karamba-backend`](https://github.com/riveragiraldo/karamba-backend)).

## Requisitos

- Node.js 24 o superior y pnpm.
- Un teléfono Android con Expo Go para SDK 58, en la misma red Wi-Fi que el PC.
- Una copia local de `karamba-backend` con datos de prueba para usar los datos reales del flujo. Sin ella, la app abre y navega, pero las pantallas de datos todavía no están conectadas.

## Instalación y ejecución

```bash
pnpm install
cp .env.template .env      # y ajusta EXPO_PUBLIC_API_URL
pnpm start                 # escanea el código QR con Expo Go
```

En Expo Go el mapa funciona sin llave. Para compilar la app propia hace falta `GOOGLE_MAPS_ANDROID_API_KEY` en `.env` (ver `.env.template`).

Otros comandos:

| Comando | Qué hace |
| --- | --- |
| `pnpm typecheck` | Verifica los tipos de TypeScript |
| `pnpm check` | Revisa que las dependencias coincidan con el SDK de Expo |

## Componentes

La interfaz usa [React Native Reusables](https://reactnativereusables.com), la versión de shadcn/ui para React Native, sobre NativeWind 4. Los componentes se copian al repo en `src/components/ui/` y se pueden modificar. Para agregar otro:

```bash
npx @react-native-reusables/cli@latest add dialog --styling-library nativewind
```

Los colores del tema están en `src/global.css` (clases) y en `src/lib/theme.ts` (navegación e íconos). Los componentes propios de EnCamino (`TarjetaDomicilio`, `EstadoDatos`, `AvisoSimulado`) están en `src/components/`.

## Documentación

- [`docs/requisitos.md`](docs/requisitos.md): cliente y problema, alcance, reglas de negocio, requisitos, mapa de pantallas y matriz.
- [`docs/wireframes/`](docs/wireframes/): wireframes de cada pantalla (`index.html` y las imágenes en `png/`).
- [`docs/negocio.md`](docs/negocio.md): datos del negocio y reglas que salen de ellos.
- [`CONTEXT.md`](CONTEXT.md): glosario del dominio.
- [`docs/adr/`](docs/adr/): decisiones de arquitectura.
- [`docs/bitacora.md`](docs/bitacora.md): bitácora de avances.
