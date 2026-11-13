# EnCamino: requisitos

Versión del 2026-11-09. Los datos que el cliente todavía no confirma están marcados **[Por confirmar con el cliente]**.

## 1. Cliente y problema

**Cliente:** Karamba by marCe, en Cartago (Valle del Cauca). Hace desayunos sorpresa, regalos personalizados y pastelería a domicilio en Cartago, Pereira, Dosquebradas y Ansermanuevo. Ver `docs/negocio.md`.

**Usuarios:**

| Usuario | Qué necesita |
| --- | --- |
| Domiciliario | Saber qué lleva y a dónde, compartir su posición mientras va en camino y reportar cómo terminó cada entrega. |
| Cliente | Saber dónde va su pedido sin tener que escribir por WhatsApp. Casi nunca es quien recibe el regalo. |
| Administrador | Ver en un solo lugar quién va en camino, dónde está cada domiciliario y qué entregas fallaron. |

**Cómo se hace hoy.** Karamba ya tiene un sistema propio (panel administrativo y backend en `riveragiraldo/karamba-backend`). El administrador registra el pedido, le asigna un domiciliario y le envía por WhatsApp un enlace donde el domiciliario marca *entregado* o *no entregado*. El cliente tiene un enlace de seguimiento con la línea de tiempo del pedido. Lo que no existe es la ubicación en vivo: el sistema solo guarda el punto GPS del momento en que se reporta la entrega. Mientras el pedido va en camino, el cliente pregunta por WhatsApp "¿ya viene?" y el administrador tiene que llamar al domiciliario para responder.

**Cómo se hará con EnCamino.** El domiciliario inicia el recorrido desde la app y comparte su posición mientras va en camino. El cliente toca el enlace de seguimiento que le llega por WhatsApp y ve el estado y al domiciliario en el mapa desde el navegador, sin instalar nada; si prefiere, puede usar la app con el mismo código. El administrador ve a todos los que van en camino en la app y en un tablero del panel web pensado para el televisor del local. Antes de salir, el domiciliario cuenta lo que carga de cada producto; al llegar, confirma quién recibió o reporta que no pudo entregar. Si hay que volver, el administrador reprograma el domicilio y la app calcula cuánto cuesta el domicilio nuevo.

**Beneficio esperado:** menos mensajes de "¿ya viene?", supervisión de las entregas sin llamar a nadie, ningún domiciliario que salga sin un producto y un cobro de reprogramación consistente con la política publicada.

## 2. Alcance

### Proceso principal: llevar un domicilio de principio a fin

1. El administrador asigna el pedido a un domiciliario en el panel de Karamba (ya existe).
2. El domiciliario ve el domicilio en su lista de hoy, abre el detalle e **inicia el recorrido**.
3. La app envía su posición mientras el seguimiento está activo. Puede pausarlo y reanudarlo.
4. El cliente abre su enlace de seguimiento en el navegador (o su código en la app) y ve el estado, los productos y al domiciliario en el mapa.
5. El domiciliario **confirma la entrega** con las unidades entregadas de cada producto, o **reporta la no entrega** con motivo y foto.
6. El cliente ve el resultado. El administrador lo ve en su lista y en el mapa.

| Entradas | Reglas | Resultado |
| --- | --- | --- |
| Domicilio asignado, unidades cargadas por producto, posición del teléfono, quién recibió, motivo y foto de no entrega | RN-01 a RN-07 | Domicilio cerrado como entregado o no entregado; posición visible para el cliente solo mientras va en camino |

### Funciones complementarias

1. **Supervisión en vivo.** El administrador ve en una lista y en un mapa a todos los domiciliarios en camino, en la app y en un tablero del panel web que se deja abierto en el televisor del local.
2. **Reprogramación con cobro.** Sobre un domicilio no entregado, el administrador calcula el valor del domicilio nuevo y lo asigna. El cliente ve el valor en su seguimiento.
3. **Historial.** Domicilios terminados con filtro por fecha, domiciliario y resultado.

| Entradas | Reglas | Resultado |
| --- | --- | --- |
| Zona del destino (con costo o con domicilio incluido), causa del regreso, cambio de dirección | RN-08 y RN-09 | Valor del domicilio nuevo, domicilio reasignado y valor visible en el seguimiento del cliente |

### Fuera del alcance

- Crear o editar pedidos: se siguen registrando en el panel de Karamba.
- Pagos dentro de la app: en Karamba todo se paga antes de la entrega.
- Seguimiento en segundo plano, rutas óptimas, navegación giro a giro y distancia por vía. El mapa muestra puntos, nunca una línea recta presentada como ruta.
- Notificaciones push.
- Otras mejoras al panel web de Karamba: van en un backlog aparte. Solo entran el seguimiento en el navegador y el tablero en vivo (§4.6 y §5.2).

## 3. Reglas de negocio

| ID | Regla |
| --- | --- |
| RN-01 | Estados del domicilio: *pendiente* → *en camino* → *entregado* o *no entregado*. Un estado nunca retrocede. No hay entrega parcial: el pedido siempre se entrega completo (decidido el 2026-11-10). |
| RN-02 | Solo el domiciliario asignado puede iniciar el recorrido, enviar posiciones y reportar el resultado de su domicilio vigente. |
| RN-03 | La posición se envía solo mientras el domicilio está *en camino* y el seguimiento está activo, con un intervalo de 10 a 15 segundos **[Por confirmar con el cliente]**. Al reportar el resultado o salir del mapa, se deja de enviar. |
| RN-04 | El cliente ve la posición del domiciliario solo mientras su domicilio está *en camino*. Después del reporte ve el resultado, pero no la posición ni los datos del domiciliario, como ya hace hoy el enlace público de Karamba. |
| RN-05 | El destinatario no usa la app ni recibe avisos, para no arruinar la sorpresa. |
| RN-06 | El pedido siempre se entrega completo. Antes de salir, el domiciliario cuenta las unidades que carga de cada producto, entre 0 y la cantidad pedida, y solo puede iniciar el recorrido cuando todas están completas. Si al llegar no puede entregar, reporta *no entregado*. |
| RN-07 | Para reportar *no entregado* son obligatorios el motivo y la foto. Antes se muestra el protocolo de Karamba: contactar al destinatario, luego al cliente y luego a Karamba. |
| RN-08 | Solo se reprograma un domicilio vigente en *no entregado*. La reprogramación crea un intento nuevo; el anterior queda en el historial. |
| RN-09 | El domicilio solo tiene costo en las zonas con tarifa: Comunas 1, 3 y 7 de Cartago, $2.000; Zaragoza, $6.000; Puerto Caldas, $5.000. En el resto de destinos está incluido en el precio del pedido. Valor del domicilio nuevo al reprogramar = recargo de reprogramación ($5.000) + tarifa de la zona del destino ($0 si tiene domicilio incluido). Ejemplos: destino con domicilio incluido, $5.000; Comuna 1, $7.000; Puerto Caldas, $10.000; Zaragoza, $11.000. Si la causa es de Karamba (retraso o error interno), el valor es $0. Si la dirección cambia, se usa la zona del destino nuevo. Ninguna tarifa puede quedar vacía, ser negativa ni tener decimales. Los barrios de cada zona están en `datos/semilla/zonas-domicilio.json`. |

## 4. Requisitos funcionales

Prioridad: **Alta** es el núcleo del proceso principal; **Media** completa una función complementaria.

### 4.1 Acceso y navegación

| ID | Nombre | Descripción | Rol | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- | --- | --- |
| RF-01 | Inicio | La app abre en una pantalla con dos caminos: seguir un pedido con su código o ingresar como equipo de Karamba. | Todos | Alta | El botón "Seguir mi pedido" está deshabilitado mientras el código esté vacío. "Soy del equipo de Karamba" abre el ingreso. No hay botones sin acción. |
| RF-02 | Ingreso del equipo | El domiciliario o el administrador entra con su correo y contraseña de Karamba. | Domiciliario, administrador | Alta | Con los campos vacíos o un correo mal escrito, se muestra un mensaje por campo y no se envía nada. Con credenciales incorrectas, el mensaje no revela cuál dato falló. Una cuenta con otro rol (cocina, decoración, etc.) ve "Esta app es para domiciliarios y administradores". Sin conexión, se informa y no se entra. |
| RF-03 | Sesión persistente | La sesión se conserva al cerrar y abrir la app, hasta que el usuario la cierre. | Domiciliario, administrador | Media | Al reabrir la app, el usuario sigue dentro con su rol. Si el token venció, se renueva solo; si la renovación falla, vuelve al ingreso. "Cerrar sesión" borra los tokens del teléfono. |
| RF-04 | Navegación por rol | Pestañas Hoy, Mapa e Historial; menú lateral con Punto de despacho, Permisos de ubicación y Mi perfil; el detalle y los formularios se abren encima con regreso. | Domiciliario, administrador | Alta | El domiciliario ve sus domicilios; el administrador ve todos y además puede reprogramar. El botón de regreso vuelve a la pantalla anterior. Una ruta inexistente muestra "Esta pantalla no existe" con un botón para volver al inicio. |

### 4.2 Seguimiento del cliente

| ID | Nombre | Descripción | Rol | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- | --- | --- |
| RF-05 | Abrir el seguimiento | La app es opcional para el cliente: el enlace de WhatsApp abre el seguimiento en el navegador (RF-21). Quien instale la app entra con el mismo código, pegándolo o tocando el enlace `encamino://seguimiento/<código>`. | Cliente | Alta | Un código válido abre su pedido. Un código inexistente o mal formado muestra "No encontramos este pedido" y la opción de volver a escribirlo. Los últimos códigos consultados se recuerdan en el teléfono. |
| RF-06 | Estado del pedido | Muestra la línea de tiempo del pedido, los productos con imagen y la franja de entrega. | Cliente | Alta | Se ve un indicador de carga y luego los datos. Si falla, aparece un mensaje con "Reintentar". Un producto sin imagen muestra una imagen alternativa. |
| RF-07 | Domiciliario en el mapa | Mientras el domicilio está *en camino*, el mapa muestra el punto de despacho y la última posición del domiciliario, con la hora de esa posición. | Cliente | Alta | La posición se actualiza sola cada 15 segundos sin recargar la pantalla. Si la última posición tiene más de 2 minutos, se muestra "Última posición hace N min". Antes de salir y después del reporte, no se muestra ninguna posición (RN-04). |
| RF-08 | Resultado y reprogramación | Muestra cómo terminó el domicilio y, si se reprogramó, el valor del domicilio nuevo. | Cliente | Media | Para un domicilio no entregado se ve el motivo. Para un domicilio reprogramado se ve el valor calculado (RN-09) y la nueva franja. |

### 4.3 Domiciliario

| ID | Nombre | Descripción | Rol | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- | --- | --- |
| RF-09 | Domicilios de hoy | Lista de los domicilios asignados al domiciliario para hoy, con barrio, franja y estado. | Domiciliario | Alta | Muestra carga, lista vacía ("No tienes domicilios para hoy") y error con "Reintentar". La búsqueda por barrio, dirección o número de pedido filtra la lista sin pedir datos nuevos por cada letra. El filtro por estado se combina con la búsqueda. Deslizar hacia abajo recarga. |
| RF-10 | Detalle del domicilio | Al tocar un domicilio se abre su detalle por identificador: destino, quien recibe, franja, productos con cantidades y acciones según el estado. | Domiciliario, administrador | Alta | La ruta `domicilio/[id]` muestra el domicilio tocado y no otro. Un identificador inexistente, o un domicilio de otro domiciliario, muestra "Domicilio no encontrado" y un botón para volver. |
| RF-11 | Iniciar recorrido | Desde el detalle, el domiciliario cuenta con + y − las unidades que carga de cada producto, marca la salida y el domicilio pasa a *en camino* (RN-06). | Domiciliario | Alta | Solo aparece en *pendiente*. Pide confirmación. No deja salir hasta que cada producto tenga todas sus unidades. Sin conexión, no cambia el estado y se informa. Tras iniciar, abre el mapa con el seguimiento activo. |
| RF-12 | Compartir posición | En el mapa, el domiciliario activa, pausa y reanuda el envío de su posición, y centra el mapa en su ubicación actual. | Domiciliario | Alta | Activar pide el permiso de ubicación en primer plano si falta. Pausar detiene el envío; reanudar lo retoma. Al salir de la pantalla o reportar el resultado, la suscripción se libera. El marcador del domiciliario es distinto del del punto de despacho y del destino. |
| RF-13 | Confirmar entrega | El domiciliario confirma la entrega del pedido completo e indica quién recibió. | Domiciliario | Alta | Solo con el domicilio *en camino*. Quién recibió llega escrito con el destinatario del pedido y no se envía vacío. Sin conexión, no se muestra confirmación y los datos del formulario se conservan. |
| RF-14 | Reportar no entrega | Formulario con motivo y foto, precedido del protocolo de contacto. | Domiciliario | Alta | Sin motivo o sin foto, se muestra un mensaje por campo y no se envía. Con conexión, el domicilio queda *no entregado* y el administrador lo ve. Sin conexión, no se confirma nada. |

### 4.4 Administrador

| ID | Nombre | Descripción | Rol | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- | --- | --- |
| RF-15 | Domicilios en curso | Lista de todos los domicilios de hoy con filtro por domiciliario y por estado. | Administrador | Alta | Muestra el mismo tratamiento de carga, vacío y error que RF-09. Los no entregados vigentes aparecen primero. |
| RF-16 | Mapa de supervisión | Mapa con el punto de despacho y la última posición de cada domiciliario en camino. | Administrador | Media | Cada marcador muestra el nombre del domiciliario y la hora de su posición. Tocarlo abre el detalle del domicilio. Se actualiza cada 15 segundos mientras la pantalla está abierta y deja de consultar al salir. |
| RF-17 | Reprogramar con cobro | Sobre un domicilio *no entregado*, el administrador elige la causa, confirma o cambia el destino, ve el valor calculado y asigna un domiciliario. | Administrador | Media | El valor se recalcula al cambiar la causa o el barrio, y la pantalla dice si el destino está en una zona con tarifa o con domicilio incluido (RN-09). Una tarifa vacía, no numérica, negativa o con decimales se rechaza con mensaje. No se puede guardar sin domiciliario. El intento anterior queda en el historial. |
| RF-18 | Historial | Domicilios terminados con filtro por fecha, domiciliario y resultado. | Domiciliario, administrador | Media | El domiciliario ve solo los suyos. Sin resultados se muestra un estado vacío con la opción de limpiar los filtros. |

### 4.5 Mapa, ubicación y permisos

| ID | Nombre | Descripción | Rol | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- | --- | --- |
| RF-19 | Punto de despacho | Dirección, horario y contacto de Karamba, con su marcador en el mapa. | Todos | Media | El marcador está en Carrera 9 # 17-38, Cartago (4.745682, -75.920676). Si el mapa no carga, se muestra un mensaje con "Reintentar" y el resto de la app sigue funcionando. |
| RF-20 | Permisos de ubicación | Explica para qué se usa la ubicación y maneja el permiso denegado, el regreso desde ajustes y el GPS apagado. | Domiciliario | Alta | Con el permiso denegado, se explica el motivo y se ofrece abrir los ajustes; al volver con el permiso concedido, funciona sin reiniciar la app. Con el GPS apagado se muestra "Activa la ubicación del teléfono". En ambos casos se pueden seguir usando la lista, el detalle y los formularios. |

### 4.6 Panel web de Karamba

Dos páginas del panel web (`karamba-frontend`) muestran lo que reporta la app, para quien no la tiene instalada. Leen los mismos datos del backend.

| ID | Nombre | Descripción | Rol | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- | --- | --- |
| RF-21 | Seguimiento en el navegador | La página pública que ya existe en `/pedidos/seguimiento/<código>`, la misma que el administrador envía por WhatsApp, suma el mapa con el punto de despacho y la posición del domiciliario. | Cliente | Alta | Abre en el navegador del teléfono sin instalar nada ni iniciar sesión. Mientras el domicilio está *en camino*, la posición se actualiza sola cada 15 segundos; deja de consultar cuando el domicilio termina o la pestaña queda oculta, y retoma al volver. Cumple RN-04 y lo mismo que RF-07 y RF-08: "Última posición hace N min" y nada de posición antes de salir ni después del reporte. Un código inexistente muestra "No encontramos este pedido". |
| RF-22 | Tablero en vivo | Página del panel a pantalla completa para dejar abierta en el televisor del local: mapa con el punto de despacho y todos los domiciliarios en camino, y al lado la lista de domicilios del día por estado. | Administrador | Media | Solo entra una sesión de administrador. Se actualiza sola cada 15 segundos sin tocar nada y el mapa se ajusta para mostrar a todos los domiciliarios. Cada marcador muestra el nombre, el número de pedido y la hora de su posición; una posición de más de 2 minutos se atenúa con "hace N min". Los *no entregados* vigentes aparecen primero y resaltados. Textos y marcadores legibles a 3 metros en un televisor de 1920 × 1080. Si se cae la conexión, muestra "Sin conexión · último dato hh:mm" sin borrar lo que había y se recupera sola. La sesión se renueva sola durante la jornada. |

## 5. Cambios en el sistema de Karamba

EnCamino usa el backend de Karamba (Django REST con JWT). Lo que ya existe se reutiliza; lo que falta se agrega en ramas propias y por pull request, siguiendo las convenciones de `riveragiraldo/karamba-docs`.

### 5.1 `karamba-backend`

| ID | Cambio | Ya existe | Nuevo |
| --- | --- | --- | --- |
| B-01 | Ingreso y renovación de sesión | `POST /api/auth/login/`, `/refresh/`, `GET /api/auth/me/` | — |
| B-02 | Lista y detalle de domicilios por rol | `GET /api/domicilios/domicilios/`, `GET .../<pk>/` | **Hecho (2026-11-10).** El detalle incluye `productos`: las líneas del pedido con id de línea, producto, cantidad e imagen. El listado no las trae. |
| B-03 | Iniciar recorrido | — | **Hecho (2026-11-10).** `POST .../<pk>/iniciar/` (solo el domiciliario asignado, solo desde *pendiente*, una vez) guarda `salida_en`. El domicilio expone `estado` (PENDIENTE, EN_CAMINO, ENTREGADO, NO_ENTREGADO), derivado de `salida_en` y `resultado`; `resultado` no cambia y el listado acepta `?estado=`. El estado del pedido no se toca; el seguimiento muestra *Domiciliario asignado* hasta la salida (ADR 0003). |
| B-04 | Posiciones del domiciliario | — | **Hecho (2026-11-10).** Modelo `PosicionDomicilio`; `POST .../<pk>/posicion/` (domiciliario asignado, solo *en camino*, coordenadas validadas); `GET .../<pk>/posicion/` y `ultima_posicion` en el detalle para el administrador; en el seguimiento público, `domicilio.ultima_posicion` solo mientras está *en camino* (RN-04). Horas en ISO 8601. |
| B-05 | Confirmar entrega desde la app | `POST publico/<token>/entregar/` | **Hecho (2026-11-10).** `POST .../<pk>/entregar/` para el domiciliario asignado, solo *en camino*, con la misma lógica que el enlace público (sincroniza el pedido y avisa al administrador). No hay entrega parcial: el pedido siempre se entrega completo, y las unidades se verifican al salir (RF-11). |
| B-06 | No entrega con foto | `POST publico/<token>/no-entregar/` y firma de Cloudinary | **Hecho (2026-11-10).** `POST .../<pk>/no-entregar/` y `.../<pk>/firma-foto/` para el domiciliario asignado, solo *en camino*, con las mismas validaciones. Sin credenciales de Cloudinary, y solo con `DEBUG`, la firma responde `simulado` y se acepta la foto simulada (RNF-09); el enlace público nunca la acepta. |
| B-07 | Reprogramación con cobro | `POST .../<pk>/reasignar/` | Zonas con tarifa (Comunas 1, 3 y 7, Zaragoza y Puerto Caldas) asignadas a sus barrios y recargo de reprogramación, editables desde el panel; causa y valor en el intento nuevo. |
| B-08 | Seguimiento del cliente | `GET /api/pedidos/pedidos/seguimiento/<token>/` | Agregar el estado del domicilio vigente, la última posición (según RN-04) y el valor de reprogramación. **Hecho:** `domiciliario_asignado` y el bloque `domicilio` con estado, salida y última posición. **Falta:** el valor de reprogramación (B-07). |
| B-09 | Entorno local | La conexión a PostgreSQL se configura con `DB_HOST`, `DB_PORT`, `DB_USER` y `DB_PASSWORD`; el `.env` de desarrollo del equipo apunta a la base de producción. | Un `.env` local que apunta a un PostgreSQL local y un comando que carga datos de prueba. Ver `docs/desarrollo-local.md`. |
| B-10 | Posiciones de todos en camino | — | **Hecho (2026-11-10).** `GET .../en-camino/` (solo administrador): en una sola respuesta, cada domicilio *en camino* con su domiciliario, número de pedido, barrio y última posición. Lo usan el mapa de supervisión de la app (RF-16) y el tablero (RF-22), para no hacer una consulta por domiciliario cada 15 segundos. |
| B-11 | Coordenadas del destino | El barrio tiene latitud y longitud de su centro. | Al registrar o cambiar la dirección de un pedido, el backend la convierte en coordenadas con Geocoding API de Google y las guarda en el domicilio, una sola vez. Si no encuentra la dirección, usa el centro del barrio y lo marca como aproximado. La llave vive solo en el backend. **Parcial (2026-11-10):** el domicilio ya expone el centro del barrio (`pedido_barrio_lat/lng`) y la app lo muestra como destino aproximado; falta la geocodificación. Los barrios de los datos de prueba no tienen coordenadas, así que en la demo el destino aparece sin marcador y la app ofrece buscar la dirección en Google Maps. |

### 5.2 `karamba-frontend`

| ID | Cambio | Ya existe | Nuevo |
| --- | --- | --- | --- |
| F-01 | Mapa en el seguimiento público | `/pedidos/seguimiento/:token` (`SeguimientoPedido.jsx`) con línea de tiempo y productos; carga los datos una vez. El administrador ya envía el enlace por WhatsApp desde la lista de pedidos. | Mapa de Google (Maps JavaScript API), consulta cada 15 segundos mientras está *en camino* y se detiene al terminar o con la pestaña oculta (RF-21). |
| F-02 | Tablero en vivo | — | Ruta del panel solo para administrador, a pantalla completa, con el mapa de Google y la lista de B-10 (RF-22). El mapa se carga una vez y solo se mueven los marcadores. |

## 6. Requisitos no funcionales

| ID | Categoría | Descripción | Cómo se verifica |
| --- | --- | --- | --- |
| RNF-01 | Usabilidad | Textos legibles, controles con ícono y texto, formularios que el teclado no tapa y áreas seguras respetadas. Estilos con NativeWind, componentes de React Native Reusables y la fuente de la marca (Quick y GuldScript). | En un teléfono Android se completan RF-11 a RF-14 sin ayuda y ningún campo queda tapado. |
| RNF-02 | Estados de datos | Toda pantalla con datos remotos muestra carga, vacío y error con "Reintentar"; los productos sin imagen muestran una alternativa. | Se fuerza cada estado (backend apagado, lista vacía, producto sin imagen) y aparece el mensaje correspondiente. |
| RNF-03 | Datos remotos | Una sola instancia de Axios con la URL base del backend; respuestas tipadas y adaptadas por un mapper al modelo interno; consultas con TanStack Query, claves por recurso y un tiempo de caché definido. | La revisión del código muestra una única configuración HTTP y ningún componente consume la respuesta cruda. |
| RNF-04 | Estado compartido | Zustand guarda la sesión, el estado del seguimiento (activo o en pausa) y los códigos consultados. Lo remoto vive solo en TanStack Query. | Ningún dato del backend se copia a Zustand. |
| RNF-05 | Sin conexión | La app detecta la falta de conexión, lo informa y no muestra confirmaciones falsas; al volver la conexión, la misma acción se completa con "Reintentar". | Con modo avión, confirmar una entrega muestra un error y no cambia nada; sin modo avión, la misma acción funciona. |
| RNF-06 | Seguridad | Los tokens se guardan en el almacenamiento seguro del teléfono. El backend valida el rol en cada endpoint nuevo. No se guardan secretos en variables `EXPO_PUBLIC_`. Cada llave de Google tiene su propia restricción: la de Android al paquete y la huella del certificado, la del panel al dominio de Karamba y la de Geocoding solo en el backend. | Con una cuenta de domiciliario, pedir el detalle de otro domiciliario devuelve 404. El repo tiene `.env.template` y no tiene `.env`. |
| RNF-07 | Privacidad | Solo se pide el permiso de ubicación en primer plano, al usar el mapa. El cliente no ve la posición fuera del recorrido ni los datos del domiciliario después de la entrega. | El permiso no aparece al abrir la app. Después del reporte, el seguimiento público no devuelve la posición. |
| RNF-08 | Liberación de recursos | El seguimiento GPS y las consultas periódicas se detienen al pausar o al salir de la pantalla. | Al salir del mapa desaparece el indicador de ubicación del sistema y el backend deja de recibir posiciones. |
| RNF-09 | Operaciones simuladas | En el entorno local, la subida de la foto a Cloudinary y los mensajes de WhatsApp pueden no tener credenciales. Si se simulan, la pantalla lo dice ("Simulado"). | Ninguna operación simulada aparece como real en la interfaz. |
| RNF-10 | Compatibilidad | Android con Expo SDK 58. Se entregan `package.json` y `pnpm-lock.yaml`. | La app se instala desde cero con el README y corre en un teléfono Android real. |
| RNF-11 | Tipado | Entidades, props, respuestas y resultados con tipos; sin `any` como salida general. | `pnpm typecheck` termina sin errores. |
| RNF-12 | Costo de Google Maps | El mapa de la app es nativo (`react-native-maps` con Google). En la web, el mapa se carga una vez por página y luego solo se actualizan los marcadores. Cada dirección se geocodifica una sola vez. La cuenta de Google tiene un tope de gasto diario. | La actualización periódica del tablero no vuelve a cargar el mapa; un pedido ya geocodificado no vuelve a consultar Geocoding API. |

## 7. Mapa de pantallas

```
Stack raíz (src/app/_layout.tsx)
├── index                         Inicio: código de seguimiento o ingreso del equipo
├── ingresar                      Ingreso del equipo
├── seguimiento/[token]           Seguimiento del cliente (ruta dinámica)
├── (equipo)  Drawer
│   ├── (tabs)  Tabs
│   │   ├── index                 Hoy: domicilios de hoy / en curso
│   │   ├── mapa                  Mapa en vivo
│   │   └── historial             Historial
│   ├── punto-despacho            Punto de despacho
│   ├── ubicacion                 Permisos de ubicación
│   └── perfil                    Mi perfil y cerrar sesión
├── domicilio/[id]                Detalle del domicilio (ruta dinámica)
├── domicilio/[id]/entregar       Confirmar entrega (contador por línea)
├── domicilio/[id]/no-entregar    Reportar no entrega (formulario)
├── domicilio/[id]/reprogramar    Reprogramar con cobro (cálculo, solo administrador)
└── +not-found                    Ruta inexistente
```

Los wireframes de cada pantalla están en `docs/wireframes/`.

## 8. Matriz de requisitos técnicos

La columna "Evidencia" se completa a medida que cada requisito se demuestra (commit, captura o prueba).

| Requisito técnico | Función | Pantalla | Archivo | Evidencia |
| --- | --- | --- | --- | --- |
| Expo + TypeScript + Expo Router | Base del proyecto | Todas | `package.json`, `app.json`, `src/app/` | Proyecto base con rutas |
| Stack | Detalle y formularios con regreso | Detalle, Confirmar entrega, No entrega, Reprogramar | `src/app/_layout.tsx` | Proyecto base con rutas |
| Tabs | Hoy, Mapa, Historial | Pestañas del equipo | `src/app/(equipo)/(tabs)/_layout.tsx` | Proyecto base con rutas |
| Drawer | Punto de despacho, permisos, perfil | Menú lateral | `src/app/(equipo)/_layout.tsx` | Proyecto base con rutas |
| Ruta dinámica e id inexistente | RF-10, RF-05 | Detalle, Seguimiento | `src/app/domicilio/[id]/index.tsx`, `src/app/seguimiento/[token].tsx` | Probado contra la API local: `domicilio/999999` y códigos inexistentes o mal formados muestran su mensaje |
| Inicio definido y ruta rota | RF-01, RF-04 | Inicio, No encontrada | `src/app/index.tsx`, `src/app/+not-found.tsx` | Proyecto base con rutas |
| NativeWind y fuente propia | RNF-01 | Todas | `tailwind.config.js`, `src/global.css`, `babel.config.js`, `metro.config.js`, `assets/fonts/` | NativeWind configurado; falta la fuente |
| Componentes reutilizables con props tipadas | Base de React Native Reusables (botón, tarjeta, campo, etiqueta, insignia, separador, esqueleto, texto) y componentes propios: tarjeta de domicilio, estado de carga/error/vacío y aviso de simulado | Inicio, Hoy, Historial, Detalle, Seguimiento | `src/components/ui/`, `src/components/TarjetaDomicilio.tsx`, `EstadoDatos.tsx`, `AvisoSimulado.tsx` | Base de componentes |
| Lista, tarjetas, búsqueda y filtro | RF-09, RF-15, RF-18 | Hoy, Historial | `src/app/(equipo)/(tabs)/index.tsx`, `historial.tsx` | Hoy conectado: búsqueda y filtro por estado sobre la lista cargada, deslizar para recargar; falta Historial |
| Carga, vacío, error, reintentar e imagen alternativa | RNF-02 | Hoy, Detalle, Seguimiento | `src/components/EstadoDatos.tsx`, `src/components/FilaProducto.tsx` | Usado en Hoy, Detalle y Seguimiento con datos reales; imagen alternativa en los productos del detalle y del seguimiento |
| useState y useEffect | Formularios, contador, ciclo del GPS | Detalle, Confirmar entrega, No entrega, Mapa | `src/app/domicilio/[id]/index.tsx`, `entregar.tsx`, `no-entregar.tsx`, `src/hooks/useSeguimientoGps.ts` | useState en el contador de carga y en los formularios; useEffect en el ciclo del GPS (suscripción, estado de la app, regreso desde ajustes) |
| Hook propio | Seguimiento GPS: permiso, activar, pausar, reanudar y limpieza | Mapa | `src/hooks/useSeguimientoGps.ts`, `src/hooks/usePermisoUbicacion.ts`, `src/logica/envioPosicion.ts` | El GPS se escucha solo con el mapa en foco y la app al frente; envía una posición cada 15 s; se detiene si el backend dice que el domicilio ya no va en camino (probado en la versión web con la geolocalización del navegador) |
| Zustand (separado de TanStack) | Sesión, estado del seguimiento, códigos consultados | Ingresar, Mapa, Inicio | `src/store/sesion.ts`, `src/store/seguimiento.ts` | Sesión (`src/store/sesion.ts`), códigos consultados (`src/store/codigosConsultados.ts`) y estado del seguimiento GPS (`src/store/seguimiento.ts`: domicilio, activo o pausado, último envío y error) |
| Contador con límites | RF-11: unidades cargadas por producto antes de salir | Detalle (Iniciar recorrido) | `src/components/ContadorUnidades.tsx` | De 0 a lo pedido; − deshabilitado en 0 y + en el máximo; "Sí, iniciar" deshabilitado hasta completar la carga (probado en la versión web) |
| Cálculo con validaciones | RF-17: cobro por reprogramar (RN-09) | Reprogramar | `src/logica/cobroReprogramacion.ts` | Pendiente |
| Formulario con validaciones | RF-02, RF-13, RF-14 | Ingresar, Confirmar entrega, No entrega | `src/app/ingresar.tsx`, `src/app/domicilio/[id]/entregar.tsx`, `no-entregar.tsx` | Ingresar: errores por campo, credenciales incorrectas sin revelar el dato y rol sin acceso. Confirmar entrega: quién recibió obligatorio. No entrega: protocolo primero, motivo y foto obligatorios con un mensaje por campo |
| Axios con URL base centralizada | Acceso al backend de Karamba | Todas las de datos | `src/servicios/api.ts`, `src/servicios/sesion.ts`, `.env.template` | Una instancia con el token y su renovación automática |
| Listado y detalle por HTTP | B-02, B-03 | Hoy, Detalle | `src/servicios/domicilios.ts` | Lista del día, detalle con productos e inicio del recorrido contra la API local |
| Interfaces de respuesta, modelo interno y mapper | Domicilio, posición, seguimiento | Hoy, Detalle, Seguimiento | `src/tipos/api.ts`, `src/modelos/`, `src/mapeadores/` | Domicilio (con productos y estado *en camino*), posición, seguimiento y sesión |
| TanStack Query con queryKey y caché | Consultas y actualización periódica | Hoy, Detalle, Mapa, Seguimiento | `src/hooks/consultas/` | Claves por recurso (`claves.ts`), caché de 30 s, consulta cada 15 s del seguimiento con domiciliario asignado o en camino, mutaciones que actualizan el detalle e invalidan las listas, y consulta de los domicilios en camino cada 15 s solo con el mapa del administrador abierto |
| Google Maps con expo-location (ADR 0002) | Punto de despacho, destino y domiciliarios | Mapa, Seguimiento, Punto de despacho | `src/components/mapa/Mapa.tsx` (y `Mapa.web.tsx`), `app.json`, `app.config.js` | Mapa de Google con marcadores de color distinto para despacho, destino y domiciliario, ajuste a todos los marcadores, centrar y mensaje con "Reintentar" si no carga. En web, `react-native-maps` no existe: se muestran los mismos puntos como lista. Visto en Android (emulador Pixel 9 con Expo Go, 2026-11-13): mapa de Google con marcadores, "Centrar en mí" y seguimiento del cliente con la posición del domiciliario. Una vez, justo después del diálogo de permiso, mostró "El mapa no cargó"; no se volvió a reproducir |
| Permiso, GPS apagado y regreso desde ajustes | RF-20 | Mapa, Permisos de ubicación | `src/hooks/usePermisoUbicacion.ts`, `src/components/mapa/PanelPermiso.tsx`, `src/app/(equipo)/ubicacion.tsx` | Permiso negado: explicación y "Permitir"; bloqueado: "Abrir ajustes"; GPS apagado: "Activa la ubicación del teléfono"; se revisa al volver al frente. Probado en Android (emulador): negado con "Permitir ubicación", bloqueado con "Abrir ajustes", concedido desde los ajustes y reconocido al volver sin reiniciar, y GPS apagado con su aviso. Si el GPS se enciende sin salir de la app (por ejemplo, desde el panel rápido), la pantalla no se actualiza hasta volver a entrar |
| Centrar, activar, pausar y reanudar | RF-12 | Mapa | `src/app/(equipo)/(tabs)/mapa.tsx` | Compartir, pausar (no envía) y reanudar (vuelve a enviar), probados contra el backend en la versión web y en Android (emulador): llega una posición cada 15 a 21 s; "Centrar en mí" se habilita con la primera lectura y lleva a la posición. En el teléfono el texto del botón se corta ("Centrar en") |
| Liberar suscripciones | RNF-08 | Mapa | `src/hooks/useSeguimientoGps.ts` | La suscripción se quita al pausar, al cambiar de pestaña, al pasar la app a segundo plano y al reportar; probado en la versión web y en Android (emulador) que en la pestaña Hoy y en segundo plano no se envía nada |
| Conservación de datos | Domicilios, entregas y posiciones en el backend; sesión y códigos en el teléfono | Todas | Backend de Karamba, `src/store/` | Salida, posiciones, entregas y no entregas quedan en el backend y las ven el administrador y el cliente (probado en la versión web con dos roles); sesión en el almacenamiento seguro y códigos en Zustand persistente |
| Sin conexión sin confirmaciones falsas | RNF-05 | Detalle (Iniciar recorrido), Confirmar entrega, No entrega, Reprogramar | `src/servicios/api.ts`, `src/lib/clienteConsultas.ts` | Iniciar recorrido, Confirmar entrega y No entrega: sin conexión informan, el estado no cambia y los formularios conservan lo escrito; las escrituras no se pausan ni se reenvían solas al volver la red (probado en la versión web desconectando el navegador). Falta Reprogramar |
| Operaciones simuladas identificadas | RNF-09 | No entrega (foto sin Cloudinary en local), Detalle | `src/components/AvisoSimulado.tsx`, `src/servicios/fotos.ts` | En local la foto no se sube: el formulario y el detalle lo dicen con "Simulado". La cámara se probó en Android (emulador): permiso, foto y vista previa en el formulario |
| `.env.template` sin secretos | RNF-06 | — | `.env.template` | `.env.template` solo con la URL del backend y la llave de Android vacía; `.env` fuera del repo |

## 9. Conservación de la información

- **Compartido entre teléfonos:** domicilios, entregas, no entregas, reprogramaciones y posiciones viven en el backend de Karamba (PostgreSQL). Lo que reporta el domiciliario lo ven el administrador y el cliente en sus propios teléfonos.
- **Solo en el teléfono:** la sesión (tokens en almacenamiento seguro) y los códigos de seguimiento consultados (almacenamiento persistente de Zustand). El estado del seguimiento GPS (activo o en pausa) vive solo en memoria: si la app se cierra, el domiciliario vuelve a activar el envío desde el mapa, para que nunca se comparta la posición sin que lo vea.
- **Límite:** sin conexión no se guarda nada en el backend. La app no pone reportes en cola para enviarlos después; lo informa y deja reintentar.

## 10. Límites conocidos

- El seguimiento funciona solo con la app abierta en primer plano; no hay seguimiento en segundo plano.
- En iPhone, el GPS solo entrega posiciones cuando el teléfono se mueve: si el domiciliario se queda quieto, no se envían posiciones nuevas y el cliente ve "Última posición hace N min" aunque el envío esté activo. En Android llegan cada pocos segundos.
- La posición se actualiza cada 10 a 15 segundos, no al instante. Es consistente con el resto del sistema de Karamba, que trabaja con consultas periódicas en lugar de conexiones en tiempo real.
- Los domiciliarios ocasionales que hoy usan un usuario genérico y el enlace público quedan fuera de la app hasta que tengan cuenta propia; pueden seguir usando el enlace. Como el enlace no tiene botón de salida, su cliente ve *Domiciliario asignado* hasta la entrega (ADR 0003).
- En el entorno local, la foto de no entrega y los avisos por WhatsApp pueden estar simulados (RNF-09).
- La app no crea pedidos ni cobra: eso sigue en el panel de Karamba.
- El tablero necesita un navegador en el televisor (televisor inteligente, computador o dispositivo conectado por HDMI). La sesión de administrador se renueva sola durante 7 días; después hay que volver a ingresar.
- Cualquiera que tenga el enlace de seguimiento ve al domiciliario mientras va en camino. Por eso el enlace no muestra la posición fuera del recorrido (RN-04).
- Los mapas dependen de Google: sin conexión no cargan, y la app propia (no Expo Go) necesita su llave de Android.

## 11. Por confirmar con el cliente

- Los barrios marcados "por revisar" en `datos/semilla/zonas-domicilio.json` (RN-09). La asignación del resto sale del listado de Planeación de Cartago por comuna.
- Causas del regreso que se consideran de Karamba y no se cobran (RN-09).
- Intervalo de envío de la posición (RN-03).
- Qué equipo mueve el televisor del local y su resolución (RF-22).
