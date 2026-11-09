# Imagen de desarrollo de karamba-backend para EnCamino. Solo instala las
# dependencias: el código se monta como volumen desde la copia local del
# backend, así que los cambios se recargan sin reconstruir la imagen.
# Python 3.13, la versión que fija el backend (.python-version).
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONUTF8=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY --from=backend requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
