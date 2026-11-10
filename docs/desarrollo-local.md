# Desarrollo local

EnCamino usa como API el backend de Karamba. Para desarrollar y hacer demostraciones se usa una copia local de ese backend con su propia base de datos y datos de prueba. **Nunca** se apunta a la base real: el backend de Karamba no tiene ambiente de pruebas y su base real es la de producción.

## 1. Requisitos

- Docker Desktop abierto.
- La copia de `riveragiraldo/karamba-backend` junto a este repo, en `D:/dev/karamba-backend`, rama `feat/encamino-entorno-local`. Si está en otra carpeta, indícala con la variable `KARAMBA_BACKEND_DIR`.
- El `.env` del backend (no se sube; solo local, sin credenciales de servicios externos):

```
SECRET_KEY=solo-local-encamino-no-usar-en-produccion
DEBUG=True
DB_HOST=127.0.0.1
DB_PORT=5437
DB_USER=encamino
DB_PASSWORD=encamino
ALLOWED_HOSTS_EXTRA=<IP-del-PC>
```

Dentro de Docker, `docker-compose.yml` reemplaza la conexión por la del contenedor de la base (`postgres:5432`). Los valores de arriba solo sirven si alguna vez corres Django fuera de Docker.

## 2. Levantar el entorno

Desde este repo:

```bash
docker compose up -d
```

Levanta dos contenedores que vuelven a arrancar solos cada vez que se abre Docker Desktop:

| Contenedor | Qué es | Puerto |
| --- | --- | --- |
| `encamino-postgres` | PostgreSQL 17 (la misma versión mayor que producción), UTF-8, usuario y contraseña `encamino` | `127.0.0.1:5437` |
| `encamino-backend` | Django con Python 3.13 (la versión que fija el backend), `runserver` | `0.0.0.0:8000` |

El código del backend se monta como volumen: al guardar un archivo, Django se recarga solo. Si cambia `requirements.txt`, reconstruye con `docker compose up -d --build`.

La primera vez, y cada vez que haya migraciones nuevas, migra y carga los datos de prueba:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py cargar_datos_encamino --datos /datos
```

En Git Bash, antepón `MSYS_NO_PATHCONV=1` a la segunda línea para que no convierta `/datos` en una ruta de Windows.

`cargar_datos_encamino` se niega a correr si `DEBUG` no es `True` o si la base no es local. Con `--reiniciar` borra y vuelve a crear los pedidos de prueba (solo los marcados `[EnCamino demo]`).

Otros comandos:

- Ver lo que pasa en el backend: `docker compose logs -f backend`.
- Apagar todo: `docker compose stop`.
- Borrar la base y empezar de cero: `docker compose down -v`, luego `up -d`, migrar y cargar los datos.
- Comprobar a dónde apunta Django: `docker compose exec backend python manage.py shell -c "from django.conf import settings as s; print(s.DATABASES['default']['HOST'])"` debe imprimir `postgres`.

## 3. Datos de prueba

- Ciudades, barrios (con los mismos id que en producción) y los 42 productos del catálogo público.
- Usuarios, todos con la contraseña `encamino-local`:

| Correo | Rol |
| --- | --- |
| `admin@encamino.local` | Administrador |
| `juan@encamino.local` | Domiciliario |
| `ana@encamino.local` | Domiciliario |

- Seis pedidos ficticios para el día en que se cargan, cada uno con su domicilio: tres pendientes, uno en camino con una posición, uno entregado y uno no entregado, repartidos entre zonas con domicilio incluido y zonas con tarifa.
- Sin `CLOUDINARY_*` en el `.env` local, la foto de no entrega no se sube: el backend la acepta como simulada solo con `DEBUG=True`, y la app lo dice con "Simulado".

## 4. App

En `.env` de EnCamino, la URL del backend con la IP del PC en la red Wi-Fi (el teléfono no entiende `localhost`):

```
EXPO_PUBLIC_API_URL=http://<IP-del-PC>:8000/api
```

Pon la misma IP en `ALLOWED_HOSTS_EXTRA` del `.env` del backend para que Django la acepte. Si cambias de red, la IP cambia: actualiza los dos `.env` y reinicia el backend con `docker compose up -d --force-recreate backend` (`ipconfig` muestra la IP actual).

## Comprobación rápida

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ -H "Content-Type: application/json" \
  -d '{"email":"juan@encamino.local","password":"encamino-local"}'
# con el access que devuelve:
curl http://127.0.0.1:8000/api/domicilios/domicilios/ -H "Authorization: Bearer <access>"
```

Juan ve solo sus tres domicilios. El seguimiento público (`/api/pedidos/pedidos/seguimiento/<token>/`) responde sin sesión y devuelve 404 con un código que no existe.
