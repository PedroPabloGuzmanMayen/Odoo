#!/usr/bin/env bash
# Crea la base de datos "dulces_delicias" e instala el módulo del caso de estudio.
# Uso: ./scripts/instalar.sh [--simular]
set -euo pipefail
cd "$(dirname "$0")/.."

DB=dulces_delicias

docker compose up -d db
echo "Esperando a PostgreSQL..."
until docker compose exec -T db pg_isready -U odoo >/dev/null 2>&1; do sleep 2; done

echo "Instalando Odoo + módulo dulces_delicias (puede tardar varios minutos)..."
docker compose run --rm odoo odoo -d "$DB" \
    -i dulces_delicias --load-language=es_419 --without-demo=all --stop-after-init

if [[ "${1:-}" == "--simular" ]]; then
    echo "Ejecutando la simulación completa del caso de estudio..."
    docker compose run --rm -T odoo odoo shell -d "$DB" --no-http < scripts/simular.py
fi

docker compose up -d odoo
echo
echo "Listo. Abra http://localhost:8069  (usuario: admin / contraseña: admin)"
