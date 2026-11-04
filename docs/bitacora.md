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
