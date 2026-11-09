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
- **Responsable:** Camilo Agudelo.
- **Evidencia:** `docs/requisitos.md`, `docs/wireframes/`, `docs/adr/0001-backend-de-karamba-como-api.md`, `src/app/`, `CONTEXT.md`.
- **Dificultad:** el backend de Karamba no tiene ambiente de pruebas y su desarrollo local apunta a la base de producción. Se decidió trabajar con una copia local y datos de prueba. Además, el modelo de pedido no guarda la forma de pago, así que el cálculo pasó del cambio a llevar al cobro por reprogramación.
- **Observaciones de revisión:** pendiente.
- **Siguiente paso:** confirmar con el cliente las tarifas de domicilio, las coordenadas del punto de despacho y el intervalo de la posición; montar el backend local con datos de prueba; configurar NativeWind con la fuente de la marca y construir los componentes reutilizables.
