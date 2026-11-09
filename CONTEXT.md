# EnCamino

Rastreo de domicilios de Karamba by marCe: quien reparte informa dónde va y cómo terminó cada entrega, quien compró la sigue en el mapa y la tienda supervisa las entregas en curso.

## Lenguaje

### Personas

**Cliente**:
Quien hace el pedido, lo paga y sigue su domicilio en el mapa. Casi nunca es quien recibe el regalo.
_Evitar_: comprador, usuario, destinatario

**Destinatario**:
La persona que recibe el regalo en la dirección del domicilio. No usa la app y no ve el seguimiento, para no arruinar la sorpresa.
_Evitar_: cliente, receptor, beneficiario

**Domiciliario**:
Quien lleva el domicilio, comparte su ubicación mientras va en camino y registra cómo terminó la entrega.
_Evitar_: repartidor, mensajero, conductor

**Administrador**:
Persona de Karamba que supervisa los domicilios en curso y los reasigna cuando hace falta.
_Evitar_: admin, supervisor, operador

### Pedido y domicilio

**Pedido**:
Lo que el cliente le compra a Karamba: productos con sus unidades, motivo, forma de pago y total. Existe aunque el cliente lo recoja en la tienda.
_Evitar_: orden, compra, domicilio (cuando se habla de lo comprado)

**Domicilio**:
La entrega de un pedido en una dirección, a cargo de un domiciliario. Los estados y las acciones de entrega son del domicilio, no del pedido. Un pedido que se recoge no tiene domicilio.
_Evitar_: envío, entrega (como sustantivo del objeto), despacho, pedido (cuando se habla del recorrido)

### Recorrido y resultado

**Recorrido**:
El trayecto del domiciliario desde que inicia la salida hasta que reporta el resultado. Solo durante el recorrido se comparte su posición.
_Evitar_: viaje, ruta (una ruta implica un camino calculado, que la app no traza)

**Posición**:
El punto GPS del teléfono del domiciliario enviado durante el recorrido. El cliente solo la ve mientras su domicilio está en camino.
_Evitar_: ubicación del cliente, rastreo (como sustantivo)

**Entrega parcial**:
Resultado de un domicilio en el que se entregaron menos unidades de las pedidas en al menos un producto. Lleva un motivo.
_Evitar_: entrega incompleta, faltante

**Reprogramación**:
Un intento nuevo de domicilio después de una no entrega o una entrega parcial. Tiene su propio valor, que se cobra antes de salir salvo que la causa sea de Karamba.
_Evitar_: reenvío, reasignación (reasignar es solo cambiar de domiciliario)

### Acceso

**Código de seguimiento**:
El identificador que Karamba le envía al cliente por WhatsApp para seguir su pedido sin cuenta. Abre el seguimiento en la app.
_Evitar_: token (en la interfaz), contraseña, número de pedido

**Punto de despacho**:
El lugar de Karamba en Cartago desde donde salen los domicilios.
_Evitar_: tienda, sede, bodega
