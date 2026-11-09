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

**Cómo se hará con EnCamino.** El domiciliario inicia el recorrido desde la app y comparte su posición mientras va en camino. El cliente toca el enlace de seguimiento que le llega por WhatsApp y ve el estado y al domiciliario en el mapa desde el navegador, sin instalar nada; si prefiere, puede usar la app con el mismo código. El administrador ve a todos los que van en camino en la app y en un tablero del panel web pensado para el televisor del local. Al llegar, el domiciliario confirma cuántas unidades entregó de cada producto o reporta que no pudo entregar. Si hay que volver, el administrador reprograma el domicilio y la app calcula cuánto cuesta el domicilio nuevo.

**Beneficio esperado:** menos mensajes de "¿ya viene?", supervisión de las entregas sin llamar a nadie, registro de entregas parciales que hoy no queda en ninguna parte y un cobro de reprogramación consistente con la política publicada.

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
| Domicilio asignado, posición del teléfono, unidades entregadas por producto, quién recibió, motivo y foto de no entrega | RN-01 a RN-07 | Domicilio cerrado como entregado, entrega parcial o no entregado; posición visible para el cliente solo mientras va en camino |

### Funciones complementarias

1. **Supervisión en vivo.** El administrador ve en una lista y en un mapa a todos los domiciliarios en camino, en la app y en un tablero del panel web que se deja abierto en el televisor del local.
2. **Reprogramación con cobro.** Sobre un domicilio no entregado o entregado de forma parcial, el administrador calcula el valor del domicilio nuevo y lo asigna. El cliente ve el valor en su seguimiento.
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
| RN-01 | Estados del domicilio: *pendiente* → *en camino* → *entregado*, *entrega parcial* o *no entregado*. Un estado nunca retrocede. |
| RN-02 | Solo el domiciliario asignado puede iniciar el recorrido, enviar posiciones y reportar el resultado de su domicilio vigente. |
| RN-03 | La posición se envía solo mientras el domicilio está *en camino* y el seguimiento está activo, con un intervalo de 10 a 15 segundos **[Por confirmar con el cliente]**. Al reportar el resultado o salir del mapa, se deja de enviar. |
| RN-04 | El cliente ve la posición del domiciliario solo mientras su domicilio está *en camino*. Después del reporte ve el resultado, pero no la posición ni los datos del domiciliario, como ya hace hoy el enlace público de Karamba. |
| RN-05 | El destinatario no usa la app ni recibe avisos, para no arruinar la sorpresa. |
| RN-06 | Al confirmar la entrega, las unidades entregadas de cada producto van de 0 a la cantidad pedida. Si alguna es menor que lo pedido, el resultado es *entrega parcial* y el motivo es obligatorio. Si todas son 0, no se puede confirmar como entrega: hay que reportar *no entregado*. |
| RN-07 | Para reportar *no entregado* son obligatorios el motivo y la foto. Antes se muestra el protocolo de Karamba: contactar al destinatario, luego al cliente y luego a Karamba. |
| RN-08 | Solo se reprograma un domicilio vigente en *no entregado* o *entrega parcial*. La reprogramación crea un intento nuevo; el anterior queda en el historial. |
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
| RF-08 | Resultado y reprogramación | Muestra cómo terminó el domicilio y, si se reprogramó, el valor del domicilio nuevo. | Cliente | Media | Para una entrega parcial se ven las unidades entregadas por producto. Para un domicilio reprogramado se ve el valor calculado (RN-09) y la nueva franja. |

### 4.3 Domiciliario

| ID | Nombre | Descripción | Rol | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- | --- | --- |
| RF-09 | Domicilios de hoy | Lista de los domicilios asignados al domiciliario para hoy, con barrio, franja y estado. | Domiciliario | Alta | Muestra carga, lista vacía ("No tienes domicilios para hoy") y error con "Reintentar". La búsqueda por barrio, dirección o número de pedido filtra la lista sin pedir datos nuevos por cada letra. El filtro por estado se combina con la búsqueda. Deslizar hacia abajo recarga. |
| RF-10 | Detalle del domicilio | Al tocar un domicilio se abre su detalle por identificador: destino, quien recibe, franja, productos con cantidades y acciones según el estado. | Domiciliario, administrador | Alta | La ruta `domicilio/[id]` muestra el domicilio tocado y no otro. Un identificador inexistente, o un domicilio de otro domiciliario, muestra "Domicilio no encontrado" y un botón para volver. |
| RF-11 | Iniciar recorrido | Desde el detalle, el domiciliario marca la salida y el domicilio pasa a *en camino*. | Domiciliario | Alta | Solo aparece en *pendiente*. Pide confirmación. Sin conexión, no cambia el estado y se informa. Tras iniciar, abre el mapa con el seguimiento activo. |
| RF-12 | Compartir posición | En el mapa, el domiciliario activa, pausa y reanuda el envío de su posición, y centra el mapa en su ubicación actual. | Domiciliario | Alta | Activar pide el permiso de ubicación en primer plano si falta. Pausar detiene el envío; reanudar lo retoma. Al salir de la pantalla o reportar el resultado, la suscripción se libera. El marcador del domiciliario es distinto del del punto de despacho y del destino. |
| RF-13 | Confirmar entrega | El domiciliario ajusta con + y − las unidades entregadas de cada producto e indica quién recibió. | Domiciliario | Alta | Cada contador arranca en la cantidad pedida, no baja de 0 ni sube de lo pedido, y deshabilita el botón que llega al límite. Si alguna línea queda incompleta, se pide el motivo y el resultado es *entrega parcial* (RN-06). Sin conexión, no se muestra confirmación y los datos del formulario se conservan. |
| RF-14 | Reportar no entrega | Formulario con motivo y foto, precedido del protocolo de contacto. | Domiciliario | Alta | Sin motivo o sin foto, se muestra un mensaje por campo y no se envía. Con conexión, el domicilio queda *no entregado* y el administrador lo ve. Sin conexión, no se confirma nada. |

### 4.4 Administrador

| ID | Nombre | Descripción | Rol | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- | --- | --- |
| RF-15 | Domicilios en curso | Lista de todos los domicilios de hoy con filtro por domiciliario y por estado. | Administrador | Alta | Muestra el mismo tratamiento de carga, vacío y error que RF-09. Los no entregados vigentes aparecen primero. |
| RF-16 | Mapa de supervisión | Mapa con el punto de despacho y la última posición de cada domiciliario en camino. | Administrador | Media | Cada marcador muestra el nombre del domiciliario y la hora de su posición. Tocarlo abre el detalle del domicilio. Se actualiza cada 15 segundos mientras la pantalla está abierta y deja de consultar al salir. |
| RF-17 | Reprogramar con cobro | Sobre un domicilio *no entregado* o *entrega parcial*, el administrador elige la causa, confirma o cambia el destino, ve el valor calculado y asigna un domiciliario. | Administrador | Media | El valor se recalcula al cambiar la causa o el barrio, y la pantalla dice si el destino está en una zona con tarifa o con domicilio incluido (RN-09). Una tarifa vacía, no numérica, negativa o con decimales se rechaza con mensaje. No se puede guardar sin domiciliario. El intento anterior queda en el historial. |
| RF-18 | Historial | Domicilios terminados con filtro por fecha, domiciliario y resultado. | Domiciliario, administrador | Media | El domiciliario ve solo los suyos. Sin resultados se muestra un estado vacío con la opción de limpiar los filtros. |

### 4.5 Mapa, ubicación y permisos

| ID | Nombre | Descripción | Rol | Prioridad | Criterio de aceptación |
| --- | --- | --- | --- | --- | --- |
| RF-19 | Punto de despacho | Dirección, horario y contacto de Karamba, con su marcador en el mapa. | Todos | Media | El marcador está en las coordenadas de Karamba en Cartago **[Por confirmar con el cliente]**. Si el mapa no carga, se muestra un mensaje con "Reintentar" y el resto de la app sigue funcionando. |
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
| B-02 | Lista y detalle de domicilios por rol | `GET /api/domicilios/domicilios/`, `GET .../<pk>/` | El detalle incluye las líneas del pedido (producto, cantidad, imagen), que hoy solo devuelve el seguimiento público. |
| B-03 | Iniciar recorrido | — | `POST .../<pk>/iniciar/` y campo `salida_en`. Hoy el domicilio no tiene estado *en camino* propio: `resultado` solo admite PENDIENTE, ENTREGADO y NO_ENTREGADO. |
| B-04 | Posiciones del domiciliario | — | Modelo de posiciones; `POST .../<pk>/posicion/` (domiciliario asignado); `GET` de la última posición para el administrador y para el seguimiento público por código, este último solo mientras está *en camino* (RN-04). |
| B-05 | Entrega con unidades por línea | `POST publico/<token>/entregar/` | Tabla con las unidades entregadas por línea y el motivo. **Decisión pendiente:** agregar *entrega parcial* como valor nuevo de `resultado` toca la lógica de reasignación, que depende de `resultado='NO_ENTREGADO'`. La alternativa es dejar `resultado=ENTREGADO` con una marca de parcial y el detalle por línea. |
| B-06 | No entrega con foto | `POST publico/<token>/no-entregar/` y firma de Cloudinary | Versión autenticada para la app, con las mismas validaciones. |
| B-07 | Reprogramación con cobro | `POST .../<pk>/reasignar/` | Zonas con tarifa (Comunas 1, 3 y 7, Zaragoza y Puerto Caldas) asignadas a sus barrios y recargo de reprogramación, editables desde el panel; causa y valor en el intento nuevo; aceptar también *entrega parcial*. |
| B-08 | Seguimiento del cliente | `GET /api/pedidos/pedidos/seguimiento/<token>/` | Agregar el estado del domicilio vigente, la última posición (según RN-04) y el valor de reprogramación. |
| B-09 | Entorno local | La base está fija en PostgreSQL y el desarrollo local apunta a la misma base que producción. | Variable de entorno para usar una base local con datos de prueba. |
| B-10 | Posiciones de todos en camino | — | `GET .../en-camino/` (solo administrador): en una sola respuesta, cada domicilio *en camino* con su domiciliario, número de pedido, barrio y última posición. Lo usan el mapa de supervisión de la app (RF-16) y el tablero (RF-22), para no hacer una consulta por domiciliario cada 15 segundos. |
| B-11 | Coordenadas del destino | El barrio tiene latitud y longitud de su centro. | Al registrar o cambiar la dirección de un pedido, el backend la convierte en coordenadas con Geocoding API de Google y las guarda en el domicilio, una sola vez. Si no encuentra la dirección, usa el centro del barrio y lo marca como aproximado. La llave vive solo en el backend. |

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
| Ruta dinámica e id inexistente | RF-10, RF-05 | Detalle, Seguimiento | `src/app/domicilio/[id]/index.tsx`, `src/app/seguimiento/[token].tsx` | Pendiente |
| Inicio definido y ruta rota | RF-01, RF-04 | Inicio, No encontrada | `src/app/index.tsx`, `src/app/+not-found.tsx` | Proyecto base con rutas |
| NativeWind y fuente propia | RNF-01 | Todas | `tailwind.config.js`, `src/global.css`, `babel.config.js`, `metro.config.js`, `assets/fonts/` | NativeWind configurado; falta la fuente |
| Componentes reutilizables con props tipadas | Base de React Native Reusables (botón, tarjeta, campo, etiqueta, insignia, separador, esqueleto, texto) y componentes propios: tarjeta de domicilio, estado de carga/error/vacío y aviso de simulado | Inicio, Hoy, Historial, Detalle, Seguimiento | `src/components/ui/`, `src/components/TarjetaDomicilio.tsx`, `EstadoDatos.tsx`, `AvisoSimulado.tsx` | Base de componentes |
| Lista, tarjetas, búsqueda y filtro | RF-09, RF-15, RF-18 | Hoy, Historial | `src/app/(equipo)/(tabs)/index.tsx`, `historial.tsx` | Pendiente |
| Carga, vacío, error, reintentar e imagen alternativa | RNF-02 | Hoy, Detalle, Seguimiento | `src/components/EstadoDatos.tsx` | Componente listo; falta usarlo con datos reales |
| useState y useEffect | Formularios, contador, ciclo del GPS | Confirmar entrega, Mapa | `src/app/domicilio/[id]/entregar.tsx`, `src/hooks/useSeguimientoGps.ts` | Pendiente |
| Hook propio | Seguimiento GPS: permiso, activar, pausar, reanudar y limpieza | Mapa | `src/hooks/useSeguimientoGps.ts` | Pendiente |
| Zustand (separado de TanStack) | Sesión, estado del seguimiento, códigos consultados | Ingresar, Mapa, Inicio | `src/store/sesion.ts`, `src/store/seguimiento.ts` | Pendiente |
| Contador con límites | RF-13: unidades entregadas por línea | Confirmar entrega | `src/components/ContadorUnidades.tsx` | Pendiente |
| Cálculo con validaciones | RF-17: cobro por reprogramar (RN-09) | Reprogramar | `src/logica/cobroReprogramacion.ts` | Pendiente |
| Formulario con validaciones | RF-02, RF-14 | Ingresar, No entrega | `src/app/ingresar.tsx`, `src/app/domicilio/[id]/no-entregar.tsx` | Pendiente |
| Axios con URL base centralizada | Acceso al backend de Karamba | Todas las de datos | `src/servicios/api.ts`, `.env.template` | Pendiente |
| Listado y detalle por HTTP | B-02 | Hoy, Detalle | `src/servicios/domicilios.ts` | Pendiente |
| Interfaces de respuesta, modelo interno y mapper | Domicilio, posición, seguimiento | Hoy, Detalle, Seguimiento | `src/tipos/api.ts`, `src/modelos/`, `src/mapeadores/` | Pendiente |
| TanStack Query con queryKey y caché | Consultas y actualización periódica | Hoy, Detalle, Mapa, Seguimiento | `src/hooks/consultas/` | Pendiente |
| Google Maps con expo-location (ADR 0002) | Punto de despacho, destino y domiciliarios | Mapa, Seguimiento, Punto de despacho | `src/components/Mapa.tsx`, `app.config.js` | `react-native-maps` instalado |
| Permiso, GPS apagado y regreso desde ajustes | RF-20 | Mapa, Permisos de ubicación | `src/hooks/useSeguimientoGps.ts`, `src/app/(equipo)/ubicacion.tsx` | Pendiente |
| Centrar, activar, pausar y reanudar | RF-12 | Mapa | `src/app/(equipo)/(tabs)/mapa.tsx` | Pendiente |
| Liberar suscripciones | RNF-08 | Mapa | `src/hooks/useSeguimientoGps.ts` | Pendiente |
| Conservación de datos | Domicilios, entregas y posiciones en el backend; sesión y códigos en el teléfono | Todas | Backend de Karamba, `src/store/` | Pendiente |
| Sin conexión sin confirmaciones falsas | RNF-05 | Confirmar entrega, No entrega, Reprogramar | `src/servicios/api.ts` | Pendiente |
| Operaciones simuladas identificadas | RNF-09 | Ingresar, Hoy, No entrega | `src/components/AvisoSimulado.tsx` | Usado en Ingresar y en la lista de ejemplo |
| `.env.template` sin secretos | RNF-06 | — | `.env.template` | Pendiente |

## 9. Conservación de la información

- **Compartido entre teléfonos:** domicilios, entregas, no entregas, reprogramaciones y posiciones viven en el backend de Karamba (PostgreSQL). Lo que reporta el domiciliario lo ven el administrador y el cliente en sus propios teléfonos.
- **Solo en el teléfono:** la sesión (tokens en almacenamiento seguro), el estado del seguimiento y los códigos de seguimiento consultados (almacenamiento persistente de Zustand).
- **Límite:** sin conexión no se guarda nada en el backend. La app no pone reportes en cola para enviarlos después; lo informa y deja reintentar.

## 10. Límites conocidos

- El seguimiento funciona solo con la app abierta en primer plano; no hay seguimiento en segundo plano.
- La posición se actualiza cada 10 a 15 segundos, no al instante. Es consistente con el resto del sistema de Karamba, que trabaja con consultas periódicas en lugar de conexiones en tiempo real.
- Los domiciliarios ocasionales que hoy usan un usuario genérico y el enlace público quedan fuera de la app hasta que tengan cuenta propia; pueden seguir usando el enlace.
- En el entorno local, la foto de no entrega y los avisos por WhatsApp pueden estar simulados (RNF-09).
- La app no crea pedidos ni cobra: eso sigue en el panel de Karamba.
- El tablero necesita un navegador en el televisor (televisor inteligente, computador o dispositivo conectado por HDMI). La sesión de administrador se renueva sola durante 7 días; después hay que volver a ingresar.
- Cualquiera que tenga el enlace de seguimiento ve al domiciliario mientras va en camino. Por eso el enlace no muestra la posición fuera del recorrido (RN-04).
- Los mapas dependen de Google: sin conexión no cargan, y la app propia (no Expo Go) necesita su llave de Android.

## 11. Por confirmar con el cliente

- Dirección y coordenadas del punto de despacho en Cartago.
- Los barrios marcados "por revisar" en `datos/semilla/zonas-domicilio.json` (RN-09). La asignación del resto sale del listado de Planeación de Cartago por comuna.
- Causas del regreso que se consideran de Karamba y no se cobran (RN-09).
- Intervalo de envío de la posición (RN-03).
- Si una entrega parcial se registra como resultado propio o como entrega con marca de parcial (B-05).
- Qué equipo mueve el televisor del local y su resolución (RF-22).
