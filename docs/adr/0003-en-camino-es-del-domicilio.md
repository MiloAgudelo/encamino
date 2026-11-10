# 0003. "En camino" lo marca la salida del domicilio, no la asignación del pedido

Fecha: 2026-11-10. Estado: aceptada.

## Contexto

En el sistema de Karamba, el pedido pasa a *En camino* en cuanto el administrador le asigna un domiciliario. Es a propósito: cubre los pedidos "de ya para ya", que se registran y se asignan cuando ya están listos para salir. Ese estado, junto con `domicilio_asignado`, bloquea la edición del pedido y el alistamiento, alimenta los reportes y la tarea programada del registro tardío, y decide qué botones ve el administrador en el panel.

Para el cliente, en cambio, *En camino* debe significar que el domiciliario ya salió. Si el pedido se asigna a las 8:00 y el domiciliario sale a las 10:00, el cliente ve "en camino" durante dos horas y vuelve a preguntar por WhatsApp, que es justo lo que EnCamino quiere evitar. Además, la posición en vivo solo tiene sentido desde la salida (RN-03, RN-04).

## Decisión

- El estado del pedido no cambia: sigue pasando a *En camino* al asignarse, con todo lo que depende de eso.
- El domicilio guarda la hora de salida (`salida_en`), que marca el domiciliario con "Iniciar recorrido" en la app. Su estado (*pendiente*, *en camino*, *entregado*, *no entregado*) se deriva de esa hora y del resultado. *En camino* no es un valor nuevo del resultado, así que el enlace público de entrega, la reasignación y el panel, que preguntan por el resultado pendiente, siguen funcionando igual con un domicilio que ya salió.
- El seguimiento del cliente muestra *Domiciliario asignado* hasta la salida y *En camino* (con la última posición) desde la salida. A la página web del seguimiento, que todavía no conoce el paso *asignado*, el backend le muestra *En alistamiento* en ese intervalo.
- Los pedidos sin domicilio registrado (registro tardío, hito marcado a mano) o con estado puesto a mano conservan el comportamiento anterior.

## Consecuencias

- El cliente solo ve "en camino" cuando es verdad, sin tocar la lógica de estados que ya usa el resto del sistema.
- Los domiciliarios ocasionales que usan el enlace público no tienen botón de salida: su cliente verá *Domiciliario asignado* hasta la entrega. Se resuelve agregando "Salí con el pedido" a esa página del panel cuando haga falta.
- La página web del seguimiento debe aprender el paso *Domiciliario asignado* (F-01) para mostrarlo igual que la app.
