# Desarrollo local

EnCamino usa como API el backend de Karamba. Para desarrollar y hacer demostraciones se usa una copia local de ese backend con su propia base de datos y datos de prueba. **Nunca** se apunta a la base real: el backend de Karamba no tiene ambiente de pruebas y su base real es la de producción.

## 1. Base de datos local

PostgreSQL 17 (la misma versión mayor que producción) en Docker, definido en `docker-compose.yml` de este repo. Necesita Docker Desktop abierto.

```bash
docker compose up -d
```

Queda en `127.0.0.1:5437` con usuario y contraseña `encamino`, base `postgres` en UTF-8 (la que usa Django). Los datos viven en el volumen `encamino_datos-postgres` y el contenedor vuelve a arrancar solo cuando se abre Docker Desktop.

- Apagar: `docker compose stop`.
- Borrar la base y empezar de cero: `docker compose down -v`, luego `up -d`, migrar y cargar los datos de prueba.

## 2. Backend

Copia de `riveragiraldo/karamba-backend` en `D:/dev/karamba-backend`, rama `feat/encamino-entorno-local`. Python 3.14 (el proyecto fija 3.13; las dependencias funcionan igual con 3.14).

```bash
cd D:/dev/karamba-backend
py -3.14 -m venv venv
./venv/Scripts/python -m pip install -r requirements.txt
```

`.env` del backend (no se sube; solo local, sin credenciales de servicios externos):

```
SECRET_KEY=solo-local-encamino-no-usar-en-produccion
DEBUG=True
DB_HOST=127.0.0.1
DB_PORT=5437
DB_USER=encamino
DB_PASSWORD=encamino
ALLOWED_HOSTS_EXTRA=<IP-del-PC>
```

Antes de migrar, comprueba a dónde apunta:

```bash
./venv/Scripts/python manage.py shell -c "from django.conf import settings as s; d=s.DATABASES['default']; print(d['HOST'], d['PORT'])"
# debe imprimir: 127.0.0.1 5437
```

Migrar, cargar los datos de prueba y levantar el servidor:

```bash
./venv/Scripts/python manage.py migrate
./venv/Scripts/python -X utf8 manage.py cargar_datos_encamino --datos ../encamino/datos/semilla
./venv/Scripts/python manage.py runserver 0.0.0.0:8000
```

`cargar_datos_encamino` se niega a correr si `DEBUG` no es `True` o si la base no está en `localhost`. Con `--reiniciar` borra y vuelve a crear los pedidos de prueba (solo los marcados `[EnCamino demo]`).

## 3. Datos de prueba

- Ciudades, barrios (con los mismos id que en producción) y los 42 productos del catálogo público.
- Usuarios, todos con la contraseña `encamino-local`:

| Correo | Rol |
| --- | --- |
| `admin@encamino.local` | Administrador |
| `juan@encamino.local` | Domiciliario |
| `ana@encamino.local` | Domiciliario |

- Seis pedidos ficticios para el día en que se cargan, cada uno con su domicilio: cuatro pendientes, uno entregado y uno no entregado, repartidos entre zonas con domicilio incluido y zonas con tarifa.

## 4. App

En `.env` de EnCamino, la URL del backend con la IP del PC en la red Wi-Fi (el teléfono no entiende `localhost`):

```
EXPO_PUBLIC_API_URL=http://<IP-del-PC>:8000/api
```

Pon la misma IP en `ALLOWED_HOSTS_EXTRA` del `.env` del backend para que Django la acepte. Si cambias de red, la IP cambia: actualiza los dos `.env` y reinicia el backend (`ipconfig` muestra la IP actual).

## Comprobación rápida

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ -H "Content-Type: application/json" \
  -d '{"email":"juan@encamino.local","password":"encamino-local"}'
# con el access que devuelve:
curl http://127.0.0.1:8000/api/domicilios/domicilios/ -H "Authorization: Bearer <access>"
```

Juan ve solo sus tres domicilios. El seguimiento público (`/api/pedidos/pedidos/seguimiento/<token>/`) responde sin sesión y devuelve 404 con un código que no existe.
