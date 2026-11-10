# Bitácora de avances

Registro de cada sesión de trabajo: qué se buscaba, qué se hizo, quién lo hizo, dónde está la evidencia, qué dificultades aparecieron, qué observaciones se recibieron y cuál es el siguiente paso.

| Campo | Qué se anota |
| --- | --- |
| Fecha | Día de la sesión |
| Objetivo de la sesión | Lo que se quería lograr |
| Tarea realizada | Lo que efectivamente se hizo |
| Responsable | Quién lo hizo |
| Evidencia | Commit, issue, PR o archivo |
| Dificultad | Problemas encontrados y cómo se resolvieron |
| Observaciones de revisión | Comentarios recibidos en la revisión |
| Siguiente paso | Lo que sigue |

---

## 2026-11-03 — Definición y arranque

- **Objetivo de la sesión:** definir el cliente, el problema y el proceso principal, y dejar listo el repositorio para trabajar por issues.
- **Tarea realizada:**
  - Se tomó como cliente a Karamba by Marce, que pidió una aplicación para rastrear en tiempo real a sus domiciliarios.
  - Se definieron tres roles: domiciliario, cliente y administrador.
  - Proceso principal: el domiciliario toma un pedido, lo marca *en camino* compartiendo su ubicación y lo marca *entregado*; el cliente ve avanzar su pedido en el mapa; el administrador supervisa los pedidos en curso.
  - Se decidió usar Cloudflare Workers con D1 como servicio HTTP y almacenamiento compartido entre teléfonos.
  - Contador y cálculo del negocio: unidades de cada producto del pedido (con límite) y cambio a llevar en pagos en efectivo.
  - Se creó el repositorio en GitHub con las etiquetas de clasificación de issues.
  - Se tomaron de la información pública de karambabymarce.com el catálogo (42 productos con precios), las ciudades y barrios de entrega, los motivos de pedido y la política de entrega. Quedaron como datos de prueba en `datos/semilla/` y resumidos en `docs/negocio.md`.
- **Responsable:** Camilo Agudelo.
- **Evidencia:** commits `chore: inicializa el repositorio con las skills de flujo de trabajo` y `docs: agrega la bitácora y los datos del negocio`; `docs/negocio.md`; `datos/semilla/`.
- **Dificultad:** la web de Karamba se arma con JavaScript en el navegador, así que leerla como página no trae ningún dato. Se resolvió consultando directamente los listados públicos que usa la tienda.
- **Observaciones de revisión:** pendiente.
- **Siguiente paso:** confirmar con el cliente la dirección del punto de despacho; alinear el glosario del dominio y convertir el alcance en issues.

## 2026-11-04 — Documentación

- **Objetivo de la sesión:** documentación.
- **Tarea realizada:** análisis de los repositorios del cliente y comienzo de los wireframes.
- **Responsable:** Camilo Agudelo.
- **Evidencia:** sin commit.
- **Dificultad:** ninguna registrada.
- **Observaciones de revisión:** pendiente.
- **Siguiente paso:** continuar con los wireframes y los requisitos.

## 2026-11-09 — Integración con el sistema de Karamba, requisitos, wireframes y proyecto base

- **Objetivo de la sesión:** cerrar el alcance, escribir los requisitos, hacer los wireframes y dejar el proyecto ejecutable con sus primeras rutas.
- **Tarea realizada:**
  - Se revisaron los repositorios del sistema de Karamba (`karamba-backend`, `karamba-frontend` y `karamba-docs`). Ya existen pedidos, usuarios con rol domiciliario, asignación de domicilios, reporte de entrega y no entrega, y seguimiento público por código. Falta la posición en vivo.
  - Decisiones: EnCamino usa el backend de Karamba como API, en lugar de Cloudflare Workers + D1 (ADR 0001). Los pedidos se siguen creando en el panel de Karamba. El desarrollo usa una copia local del backend con datos de prueba. El contador va en las unidades entregadas por producto. El cálculo es el cobro por reprogramar un domicilio. Expo SDK 58.
  - Se escribieron los requisitos: cliente y problema, alcance, reglas de negocio, 20 requisitos funcionales, 11 no funcionales, los cambios necesarios en el backend, el mapa de pantallas y la matriz.
  - Se hicieron 21 wireframes, uno por pantalla y estado.
  - Se creó el proyecto Expo con Stack, Drawer y Tabs conectados, las rutas dinámicas del detalle y del seguimiento, y la pantalla de ruta inexistente. `tsc` sin errores y el empaquetado para Android funciona.
  - Se ampliaron el glosario (`CONTEXT.md`) y el README.
  - Se agregaron el seguimiento en el navegador, para que el cliente no tenga que instalar la app, y el tablero en vivo para el televisor del local, ambos en el panel web de Karamba (RF-21, RF-22, B-10, F-01 y F-02), con sus wireframes.
  - Karamba confirmó el cobro del domicilio: solo tienen costo las Comunas 1, 3 y 7 de Cartago ($2.000), Zaragoza ($6.000) y Puerto Caldas ($5.000); el resto va incluido. Reprogramar cuesta $5.000 más la tarifa de la zona. Se asignaron los barrios de Karamba a cada zona con el listado de Planeación de Cartago (`datos/semilla/zonas-domicilio.json`).
  - Se configuró NativeWind 4.2.7 con Tailwind 3.4 y React Native Reusables como librería de componentes. Sobre esa base se crearon `TarjetaDomicilio`, `EstadoDatos` y `AvisoSimulado`, y las pantallas pasaron a clases de NativeWind. Verificado con `tsc`, el empaquetado para Android y la versión web; falta probarlo en un teléfono.
  - Se cambió el mapa a Google Maps en la app, el panel web y el backend (geocodificación de direcciones), con permiso para reemplazar OpenStreetMap y Leaflet (ADR 0002).
  - Se montó el backend de Karamba en local: PostgreSQL 17 y Django en Docker (`docker-compose.yml`), con el código montado como volumen para que se recargue solo, `.env` propio y el comando `cargar_datos_encamino` con usuarios, pedidos y domicilios ficticios (rama `feat/encamino-entorno-local` de `karamba-backend`). Se comprobaron el ingreso, la lista de domicilios por domiciliario y el seguimiento público. Ver `docs/desarrollo-local.md`.
  - Se conectó la app a la API local: cliente HTTP con renovación del token, tipos de la API, mappers, consultas con TanStack Query y sesión en Zustand (tokens en el almacenamiento seguro). Quedaron con datos reales el ingreso con validaciones, la lista de hoy con búsqueda y filtro, el detalle del domicilio, el seguimiento del cliente con los códigos recordados y el cierre de sesión. Se probaron 14 casos del flujo en la versión web contra el backend local.
- **Responsable:** Camilo Agudelo.
- **Evidencia:** commits `fc220c3`, `923b3a5`, `5e074ed`, `1371954`, `de8c298`, `9dd32f8`, `0fbe753` y `f1b0d9a`; `docs/requisitos.md`, `docs/wireframes/`, `docs/adr/0001-backend-de-karamba-como-api.md`, `datos/semilla/zonas-domicilio.json`, `src/`, `CONTEXT.md`.
- **Dificultad:** el backend de Karamba no tiene ambiente de pruebas y su desarrollo local apunta a la base de producción. Se decidió trabajar con una copia local y datos de prueba. Además, el modelo de pedido no guarda la forma de pago, así que el cálculo pasó del cambio a llevar al cobro por reprogramación. Con pnpm, Metro no encontraba `react-native-css-interop` (dependencia interna de NativeWind); se resolvió instalándola como dependencia directa. `SafeAreaView` reemplaza el padding con los márgenes seguros, así que el padding va en una vista interna. La primera base local, con `embedded-postgres`, se creó en WIN1252 y se apagaba al cerrar la sesión; se reemplazó por PostgreSQL 17 en Docker, en UTF-8 y con arranque automático, como la versión de producción.
- **Observaciones de revisión:** pendiente.
- **Siguiente paso:** probar la app en un teléfono con Expo Go; agregar al backend los endpoints de EnCamino (B-02 a B-08: productos en el detalle, iniciar recorrido, posiciones, entrega por unidades, no entrega desde la app y reprogramación con cobro); construir el mapa con Google Maps y el GPS.

## 2026-11-10 — Productos en el detalle, iniciar recorrido y posiciones

- **Objetivo de la sesión:** agregar al backend de Karamba lo que desbloquea el flujo del domiciliario (B-02, B-03 y B-04) y conectarlo en la app.
- **Tarea realizada:**
  - Backend (rama `feat/encamino-flujo-domiciliario` de `karamba-backend`, desde `feat/encamino-entorno-local`):
    - El detalle del domicilio trae las líneas del pedido con id de línea, producto, cantidad e imagen (B-02).
    - Estado propio del domicilio: hora de salida (`salida_en`) y un estado derivado *pendiente*, *en camino*, *entregado* o *no entregado*. `POST .../iniciar/` solo para el domiciliario asignado, solo desde *pendiente* y una sola vez (B-03).
    - Modelo de posiciones, `POST .../posicion/` solo para el domiciliario asignado y solo *en camino*, con coordenadas validadas; última posición para el administrador (detalle y `GET .../posicion/`) y para el seguimiento público solo mientras va *en camino* (B-04, RN-04).
    - Se revisó todo lo que depende de que el pedido pase a *En camino* al asignarse (edición del pedido, alistamiento, tarea del registro tardío, reportes, botones del panel, enlace público). Se decidió no cambiar el estado del pedido y resolver lo que ve el cliente desde el domicilio: *Domiciliario asignado* hasta la salida y *En camino* después (ADR 0003).
    - Los datos de prueba incluyen un domicilio ya en camino con una posición.
    - 22 pruebas nuevas en `domicilios/tests.py`.
  - App: productos con imagen alternativa en el detalle, botón "Iniciar recorrido" con confirmación, entregar y no entregar solo desde *en camino* (RN-01), estado *en camino* en la lista, el detalle y el seguimiento, paso *Domiciliario asignado* en el seguimiento con la antigüedad de la última posición, y mapper de posición.
- **Responsable:** Camilo Agudelo.
- **Evidencia:** commit `bf9b7fd` en `karamba-backend` (rama `feat/encamino-flujo-domiciliario`); commit `feat: inicia el recorrido y muestra productos y estado en camino` en EnCamino; `docs/adr/0003-en-camino-es-del-domicilio.md`. Verificación: `manage.py test domicilios` en verde (38 pruebas); `tsc` sin errores; empaquetado de Android correcto; prueba de flujo web con 10 casos nuevos (asignado sin salida, productos, cancelar, sin conexión, iniciar, filtro *En camino*, seguimiento con y sin posición, posición para el administrador) y los 14 anteriores, todos en verde. No se probó en un teléfono.
- **Dificultad:** en la versión web, TanStack Query pausaba la escritura sin conexión y la enviaba sola al volver la red, de modo que el domicilio terminaba *en camino* sin que el domiciliario lo confirmara. Se configuraron las escrituras para fallar de una vez sin conexión. Además, 28 pruebas de `pedidos_pedidos` ya fallaban en la rama base porque crean pedidos con fecha del 1 de enero de 2026, ya vencida: el registro los marca entregados y bloquea su edición. No se tocaron.
- **Observaciones de revisión:** pendiente.
- **Siguiente paso:** decidir cómo se registra la entrega parcial (B-05) y construir los formularios de entrega y no entrega (B-05, B-06); luego el mapa con GPS que envía la posición. Pendientes del panel web: el paso *Domiciliario asignado* en el seguimiento (F-01) y la documentación de los endpoints nuevos en `karamba-docs`.
