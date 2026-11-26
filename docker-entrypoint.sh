#!/bin/bash
set -e

# Limpiar caché de configuración previa
php artisan config:clear

# Ejecutar migraciones y seeders en la base de datos en la nube
php artisan migrate --force
php artisan db:seed --force

# Encender el servidor en el puerto que asigne Render
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}