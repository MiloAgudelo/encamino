# Karamba by marCe: datos del negocio

Datos tomados de la información pública de karambabymarce.com (catálogo y políticas publicadas) el 2026-11-03. Se usan como datos de prueba en `datos/semilla/`.

## El negocio

- **Qué hace:** desayunos sorpresa, regalos personalizados y pastelería a domicilio. Funciona desde 2013.
- **Sede:** Cartago, Valle del Cauca (código postal 762022). La dirección exacta y las coordenadas no se publican. **Pendiente:** confirmarlas con el cliente para ubicar el punto de despacho en el mapa.
- **Zonas de entrega:** Cartago, Pereira, Dosquebradas y Ansermanuevo. Hay 787 barrios registrados: 455 en Pereira, 276 en Cartago, 55 en Dosquebradas y 1 en Ansermanuevo.
- **Horario:** lunes a sábado de 06:30 a 19:00; domingos de 08:00 a 12:00.
- **Contacto:** 311 610 8002 (WhatsApp), karambatienda@gmail.com, Instagram y TikTok `@karambatienda`, Facebook `TiendaKaramba`.
- **Marca:** el logo y las fuentes (GuldScript y Quick) están publicados en Cloudinary.

## Catálogo

Tiene 42 productos en tres categorías:

| Categoría | Productos | Rango de precio (COP) |
| --- | --- | --- |
| Regalos especiales (en caja de cartón) | 28 | 43.000 a 146.000 |
| Sorpresas exclusivas (bandejas de madera) | 12 | 92.000 a 252.000 |
| Especial Halloween | 2 | 50.000 a 76.000 |

Cada producto trae nombre con código (`K01 • DESAYUNA Y PIDE UN DESEO`), precio, descripción con lo que incluye, hasta cuatro imágenes y la marca de "más pedido".

Motivos de pedido: cumpleaños, aniversario, amor y amistad, día de la madre, agradecimiento, recuperación y otros 12 (ver `datos/semilla/motivos.json`).

## Domicilio

- El domicilio solo tiene costo en la Comuna 1, la Comuna 3 y la Comuna 7 de Cartago, Zaragoza y Puerto Caldas. En el resto de destinos está incluido en el precio (confirmado por Karamba el 2026-11-09).
- En las zonas con costo, la web publica **desde $5.500**. El cliente también puede recoger el pedido.
- **El tiempo estimado de entrega es de media a una hora.**
- El domiciliario espera un tiempo prudencial. Si tiene que regresar, el pedido se reprograma y el domicilio nuevo se cobra antes. Pasa lo mismo cuando hay cambios o errores en la dirección.
- No se toman fotos durante la entrega, para cuidar la privacidad de quien recibe. Al cliente se le comparte una foto del regalo antes de salir.
- Los cambios se piden por WhatsApp hasta un día antes, o con 24 horas de anticipación si el producto es personalizado.

## Reglas que salen de aquí para la app

- **Estados del domicilio:** *pendiente*, *en camino*, *entregado* y *no entregado*. El último cubre cuando el domiciliario espera y nadie recibe.
- **Total del pedido:** suma de unidades por precio, más el valor del domicilio, que es $0 si el destino tiene el domicilio incluido o si el cliente recoge.
- **Hora estimada de llegada:** salida más 30 a 60 minutos.
- **Pago en efectivo:** el cambio que debe llevar el domiciliario es el billete con que paga el cliente menos el total. El billete no puede ser menor que el total.
