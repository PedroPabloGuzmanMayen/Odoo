#!/usr/bin/env bash
# Elimina la base de datos y los archivos adjuntos para empezar de cero.
set -euo pipefail
cd "$(dirname "$0")/.."
read -r -p "Esto borrará TODOS los datos de Odoo. ¿Continuar? [s/N] " r
[[ "$r" =~ ^[sS]$ ]] || exit 0
docker compose down -v
echo "Datos eliminados. Ejecute ./scripts/instalar.sh para reinstalar."
