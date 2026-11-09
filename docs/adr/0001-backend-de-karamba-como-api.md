# 0001. El backend de Karamba es la API de EnCamino

Fecha: 2026-11-09. Estado: aceptada.

## Contexto

La primera idea era montar una API propia en Cloudflare Workers con D1. Después se vio que Karamba ya tiene un sistema en producción (Django REST con JWT, PostgreSQL en Supabase) con pedidos, usuarios con rol `DOMICILIARIO`, asignación de domicilios, reporte de entrega y no entrega, y un seguimiento público por código para el cliente. Lo único que falta para el rastreo es la posición en vivo del domiciliario.

Con una API aparte, los domicilios, los usuarios y los estados quedarían duplicados en dos sistemas, y el administrador tendría que mantenerlos sincronizados a mano.

## Decisión

EnCamino usa `karamba-backend` como su única API. Lo que ya existe se reutiliza; lo que falta (posiciones, inicio del recorrido, entrega con unidades por línea y reprogramación con cobro, ver `docs/requisitos.md` §5) se agrega a ese backend en ramas propias y por pull request, siguiendo sus convenciones. El propietario autorizó modificar y mejorar el backend y el panel web.

La posición se consulta cada 10 a 15 segundos, sin WebSocket, en línea con la decisión del propio sistema de trabajar con consultas periódicas en lugar de conexiones en tiempo real.

## Consecuencias

- Una sola fuente de verdad: lo que reporta el domiciliario en la app lo ve el administrador en el panel web y el cliente en su seguimiento.
- La app depende de un backend sin ambiente de pruebas, en el que un cambio en `main` va directo a producción. Por eso el desarrollo y las demostraciones usan una copia local del backend con su propia base y datos de prueba, nunca la base compartida con producción.
- La configuración actual del backend no permite elegir otra base para el desarrollo local; agregar esa opción es parte del trabajo (B-09).
- Los domiciliarios ocasionales que hoy usan un usuario genérico y el enlace público siguen con el enlace hasta tener cuenta propia.
