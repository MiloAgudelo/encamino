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

## 2026-11-10 — Verificación de la carga, entrega y no entrega

- **Objetivo de la sesión:** construir la entrega y la no entrega desde la app (B-05, B-06, RF-13, RF-14).
- **Tarea realizada:**
  - Decisión: no existe la entrega parcial; el domiciliario siempre entrega el pedido completo. Se quitó *entrega parcial* de los estados, de las reglas (RN-01, RN-06, RN-08), de los requisitos (RF-08, RF-13, RF-17, B-05, B-07) y del glosario.
  - Decisión: el contador de unidades con límites pasa a la salida. Antes de "Iniciar recorrido", el domiciliario cuenta con + y − lo que carga de cada producto (de 0 a lo pedido, con el botón del límite deshabilitado) y solo puede salir con la carga completa (RF-11, RN-06).
  - Backend (rama `feat/encamino-flujo-domiciliario`): `entregar/`, `no-entregar/` y `firma-foto/` autenticados, solo para el domiciliario asignado y con el recorrido iniciado. La entrega y la no entrega del enlace público pasaron a funciones compartidas, sin cambiar su comportamiento. Sin credenciales de Cloudinary, y solo con `DEBUG`, la foto se simula; el enlace público nunca acepta la foto simulada. 17 pruebas nuevas.
  - App: confirmar entrega con quién recibió (precargado con el destinatario y obligatorio); no entrega con el protocolo de contacto primero (llamar a quien recibe, al cliente y avisar a Karamba), luego motivo con opciones frecuentes y foto con la cámara (`expo-image-picker`), con un error por campo. En el entorno local la foto no se sube y la pantalla lo dice con "Simulado". El detalle muestra la foto o el aviso. Sin conexión, ningún formulario confirma nada y conservan lo escrito.
- **Responsable:** Camilo Agudelo.
- **Evidencia:** commit `448b368` en `karamba-backend`; commit `feat: verifica la carga al salir y reporta la entrega y la no entrega` en EnCamino. Verificación: `manage.py test domicilios` en verde (55 pruebas) y `pedidos_pedidos` con los mismos 28 fallos previos; `tsc` sin errores; empaquetado de Android correcto; prueba de flujo web de entrega y no entrega con 13 casos (ingreso, precarga, campo vacío, sin conexión, entrega, ruta repetida, protocolo, errores por campo, aviso de simulado, foto, sin conexión, no entrega, lista del administrador), más la de recorrido (11 casos, ahora con la verificación de la carga) y la original (14 casos), todas en verde. No se probó en un teléfono, ni la cámara real ni la subida real a Cloudinary.
- **Dificultad:** al confirmar, la caché marca el domicilio como reportado y el formulario se desmonta antes de que corra el `onSuccess` de cada llamada; se navega con `mutateAsync`. En la versión web, la cámara se reemplaza por el selector de archivos.
- **Observaciones de revisión:** pendiente.
- **Siguiente paso:** el mapa con el GPS que envía la posición (RF-12, RF-20); luego la reprogramación con cobro (B-07, RF-17). Queda desactualizado el wireframe de Confirmar entrega, que todavía muestra unidades por producto y entrega parcial.

## 2026-11-10 — Mapa, GPS y punto de despacho

- **Objetivo de la sesión:** construir el mapa con el envío de la posición del domiciliario, la supervisión del administrador y el mapa del cliente (RF-07, RF-11, RF-12, RF-16, RF-19, RF-20).
- **Tarea realizada:**
  - Karamba confirmó el punto de despacho: Carrera 9 # 17-38, Cartago (4.745682, -75.920676). Quedó en `src/constantes/despacho.ts` con el horario y el contacto publicados.
  - Backend: `GET domicilios/en-camino/` para el administrador, con la última posición de cada domicilio en una sola respuesta (B-10), y el centro del barrio como destino aproximado (parte de B-11). 6 pruebas nuevas.
  - App: componente de mapa con Google Maps y marcadores de color distinto para despacho, destino y domiciliario; en web, donde `react-native-maps` no existe, muestra los mismos puntos como lista.
  - Seguimiento GPS: hook propio con permiso en primer plano, GPS apagado y regreso desde ajustes; escucha solo con el mapa abierto y la app al frente; envía una posición cada 15 s; pausa, reanuda y centra. El estado vive en Zustand (`src/store/seguimiento.ts`).
  - "Iniciar recorrido" abre el mapa con el envío activo (RF-11). El administrador ve en el mapa a todos los que van en camino, con la hora de la posición y las viejas atenuadas, y se actualiza cada 15 s solo con la pantalla abierta (RF-16). El cliente ve el mapa con el domiciliario mientras va en camino (RF-07). Pantallas de punto de despacho (RF-19) y de permisos de ubicación (RF-20).
- **Responsable:** Camilo Agudelo.
- **Evidencia:** commit `d3b4509` en `karamba-backend`; commit `feat: mapa con GPS, supervisión y punto de despacho` en EnCamino. Verificación: `manage.py test domicilios` en verde (61 pruebas); `tsc` sin errores; empaquetado de Android y de web correctos; prueba de flujo web del mapa con 13 casos usando la geolocalización del navegador (iniciar abre el mapa, la posición llega al backend, un envío cada 15 s, pausar, reanudar, al salir del mapa deja de enviar, mapa del cliente, punto de despacho, permisos, supervisión del administrador y permiso negado), más las de recorrido (11), entrega (13) y original (14), todas en verde.
- **Dificultad:** `react-native-maps` no funciona en el navegador; el mapa tiene una versión web que lista los puntos, así que la exportación web y las pruebas siguen funcionando. Las pestañas siguen montadas al cambiar de pestaña, así que el GPS se ata al foco de la pantalla y no al montaje. Los barrios de los datos de prueba no tienen coordenadas, por lo que el destino aparece sin marcador en la demo.
- **Observaciones de revisión:** pendiente.
- **Siguiente paso:** probar en un teléfono con Expo Go el mapa de Google, el GPS real, el GPS apagado y el regreso desde ajustes, que no se han probado. Luego la reprogramación con cobro (B-07, RF-17) y el historial (RF-18).

## 2026-11-10 — Pruebas de flujo web en el repo

- **Objetivo de la sesión:** guardar en el repo las pruebas de flujo web que sirven de evidencia, para que cualquiera pueda volver a correrlas.
- **Tarea realizada:**
  - Las cuatro pruebas pasaron a `pruebas/web/` (`ingreso-y-seguimiento.js`, `recorrido.js`, `entrega.js` y `mapa.js`) con un módulo común. Ya no dependen de rutas de un equipo: abren Edge instalado, guardan las capturas en `pruebas/web/capturas/` (fuera de git) y toman de la API los datos que necesitan.
  - Cada prueba termina con el total de pasos y sale con error si alguno falla o si faltan datos de prueba. Antes solo imprimía la falla, y por eso una corrida anterior de la prueba de entrega no dejó rastro del paso que falló.
  - `playwright-core` quedó como dependencia de desarrollo. Los pasos para correrlas están en `docs/desarrollo-local.md`.
  - Corrección: la prueba de entrega y no entrega tiene 13 pasos, no 14 como decían las dos entradas anteriores.
- **Responsable:** Camilo Agudelo.
- **Evidencia:** commit `test: pasa las pruebas de flujo web al repo`. Verificación: las cuatro corridas desde el repo, recargando los datos antes de cada una: ingreso y seguimiento 14/14, recorrido 11/11, entrega y no entrega 13/13, mapa y GPS 13/13. Se comprobó que un paso fallido y la falta de datos de prueba terminan con código de salida 1.
- **Dificultad:** ninguna.
- **Observaciones de revisión:** pendiente.
- **Siguiente paso:** documentar los endpoints nuevos del backend, actualizar el wireframe de Confirmar entrega y probar en un teléfono.

## 2026-11-10 — Wireframes sin entrega parcial

- **Objetivo de la sesión:** que los wireframes reflejen la decisión de que el pedido siempre se entrega completo.
- **Tarea realizada:**
  - Confirmar entrega muestra los productos como "Se entrega completo" y solo pide quién recibió, ya escrito con el destinatario.
  - Wireframe nuevo, "Iniciar recorrido: verificar la carga", con el contador de unidades que antes estaba en la entrega.
  - Se quitó la entrega parcial de Domicilios en curso, del Historial (ya no hay filtro de parciales) y de la nota del seguimiento con resultado.
  - Se regeneraron las imágenes de las cuatro pantallas y se borró `docs/wireframes/png$id.png`, una copia suelta de otra imagen.
  - App: con una sola unidad por cargar, el aviso dice "Falta 1 unidad por cargar." en vez de "Faltan 1 unidad".
- **Responsable:** Camilo Agudelo.
- **Evidencia:** commit `docs: quita la entrega parcial de los wireframes`; `docs/wireframes/index.html` y `docs/wireframes/png/`. Verificación: `tsc` sin errores; se revisaron a ojo las imágenes regeneradas.
- **Dificultad:** ninguna.
- **Observaciones de revisión:** pendiente.
- **Siguiente paso:** documentar los endpoints nuevos del backend y probar en un teléfono.

## 2026-11-10 — Documentación del backend en karamba-docs

- **Objetivo de la sesión:** documentar en `karamba-docs`, con sus convenciones, lo que se agregó al backend para EnCamino.
- **Tarea realizada:**
  - Rama local `docs/encamino-flujo-domiciliario` en `karamba-docs`, sin subir. Módulo `domicilios`: las 7 rutas nuevas (8 operaciones) y los cambios al listado, al detalle y al serializador (`api.md`); `salida_en`, el estado derivado y `PosicionDomicilio` (`models.md`); la regla "en camino es del domicilio" con la condición antes de fusionar a `main` (`rules.md`); y notas en `README.md`, `dependencies.md` y `roadmap.md`. En `pedidos/api.md`, los campos nuevos del seguimiento público. Una entrada en `PROJECT_STATE.md`.
  - Todo va marcado como rama sin fusionar. `CHANGELOG.md` y `REALITY_MAP.md` no se tocaron: describen lo que está en producción.
  - En el backend se corrigió un comentario que todavía hablaba de entrega por unidades.
- **Responsable:** Camilo Agudelo.
- **Evidencia:** commit `9656d21` en `karamba-docs` (rama `docs/encamino-flujo-domiciliario`); commit `1c99885` en `karamba-backend` (rama `feat/encamino-flujo-domiciliario`). Verificación: `manage.py test domicilios` en verde después del cambio de comentario.
- **Dificultad:** ninguna.
- **Observaciones de revisión:** pendiente.
- **Siguiente paso:** probar en un teléfono Android con Expo Go.

## 2026-11-13 — Prueba en Android con emulador

- **Objetivo de la sesión:** recorrer en Android lo que solo se había probado en la versión web: mapa de Google, envío de la posición, permisos, cámara y las vistas del cliente y del administrador.
- **Tarea realizada:**
  - Emulador Pixel 9 (Android 16, con Google Play Services) y Expo Go, contra el backend local en Docker. El GPS se simuló con coordenadas de Cartago.
  - Se encontró y corrigió un fallo: al iniciar el recorrido desde la lista de Hoy, el mapa todavía tenía la lista anterior en memoria, con el domicilio como pendiente, y apagaba el envío antes de recibir la lista nueva. La versión web no lo mostraba porque la prueba entraba directo al detalle. Ahora, cuando el backend confirma un cambio, también se actualiza ese domicilio en las listas del día antes de recargarlas. Se confirmó la causa quitando el arreglo: con él, el envío arranca solo; sin él, se apaga.
  - Probado: iniciar recorrido con conteo de unidades, pedido del permiso, mapa con los marcadores, posiciones cada 15 a 21 s en el backend, "Centrar en mí", pausar y reanudar, nada enviado en la pestaña Hoy ni en segundo plano, GPS apagado y encendido, permiso negado, bloqueado y concedido desde los ajustes sin reiniciar, cámara con la foto en el formulario y el aviso "Simulado", no entrega registrada, seguimiento del cliente con el mapa y la posición, y mapa del administrador con Juan y Ana.
- **Responsable:** Camilo Agudelo.
- **Evidencia:** commit de esta sesión; posiciones consultadas en `/api/domicilios/domicilios/<id>/posicion/` durante la prueba.
- **Dificultad:** la interfaz de Android se trabó al arrancar el emulador por primera vez, y Fast Refresh no aplicó los cambios hasta reiniciar Expo Go.
- **Observaciones de revisión:** pendiente. Quedan tres detalles: el texto de "Centrar en mí" se corta en el teléfono; si el GPS se enciende desde el panel rápido sin salir de la app, la pantalla de ubicación no se actualiza; y una vez el mapa mostró "El mapa no cargó" justo después del diálogo de permiso, sin volver a reproducirse.
- **Siguiente paso:** probar en un teléfono físico lo que el emulador no cubre: GPS real en movimiento, la cámara con una foto de verdad y el rendimiento.

## 2026-11-13 — Arreglos de la prueba en Android

- **Objetivo de la sesión:** corregir los tres detalles que dejó la prueba en el emulador.
- **Tarea realizada:**
  - "Centrar en mí" se cortaba: Android midió el texto más angosto de lo que lo dibujó y la última palabra pasó a una segunda línea oculta. La acción principal (compartir, pausar o reanudar) ocupa ahora su propia fila, y "Centrar en mí" y "Cómo llegar" (antes "Cómo llegar en Google Maps") comparten la de abajo, cada uno a mitad de ancho.
  - La pantalla de Ubicación y el panel del mapa revisan el GPS y el permiso cada 3 s mientras están visibles y la app está al frente. Antes solo se revisaba al volver a la app, y el panel rápido de Android no la saca del frente.
  - El aviso "El mapa no cargó" aparecía cuando el mapa se montaba oculto (otra pestaña o el diálogo de permiso encima): Google Maps no avisa que está listo hasta que se ve, y el plazo de 15 s seguía corriendo. Ahora el plazo solo cuenta con la pantalla visible y la app al frente, y el mapa queda montado debajo del aviso para que se quite solo si responde tarde.
- **Responsable:** Camilo Agudelo.
- **Evidencia:** commit de esta sesión. En el emulador: los dos botones con su texto completo y el GPS apagado y encendido sin salir de la pantalla de Ubicación. Pruebas web en verde: recorrido (11/11), mapa (13/13) e ingreso y seguimiento (14/14).
- **Dificultad:** no se pudo repetir el caso exacto del mapa: después de las pruebas de permisos, Android dejó el permiso de Expo Go como bloqueado y no volvió a mostrar el diálogo. El arreglo del plazo se revisó en el código y se comprobó que el mapa sigue cargando en las pantallas del domiciliario y del cliente.
- **Observaciones de revisión:** pendiente.
- **Siguiente paso:** probar en un teléfono físico.
