# Instalacion del entorno de desarrollo backend

**Instalar librerias del sistema:**

`sudo apt-get install python3-dev docker doxygen`

## Paquetes de Python

En el directorio `./backend`
`python3 -m pip install -r requirements.txt`

## Definir variables de entorno

Hacer una copia de `template.env` y renombrarlo a `.env` y rellenar los campos vacios

## Instalar y arrancar los contenedores

`docker-compose up --build`

Tardara un poco en arrancar

**Realizar las migraciones iniciales**

Django nos dara el siguiente mensaje:
```
django_backend | You have 18 unapplied migration(s). Your project may not work properly until you apply the migrations for app(s): admin, auth, contenttypes, sessions.
```

Las migraciones son cambios pendientes de realizar en la estructura de la base de datos (p.e nuevas tablas)

`docker exec -it django_backend python manage.py migrate`

### Otros comandos utiles

> Esta lista se ira actualizando conforme se avance en el desarrollo

**Acceder al contenedor de la base de datos**

`docker exec -it mysql_db bash`

**Acceder al contenedor de Django**

`docker exec -it django_backend bash`

**Generar documentacion**

`docker exec -it django_backend doxygen Doxyfile`

La documentacion se generara en `./backend/doc/html`