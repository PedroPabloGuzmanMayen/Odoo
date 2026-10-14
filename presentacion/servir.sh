#!/usr/bin/env bash
# Levanta la presentación en http://localhost:8000/presentacion/
# Se sirve desde la raíz del repositorio porque las diapositivas usan las
# capturas de docs/capturas/ y las fotos del módulo.
set -euo pipefail
PUERTO="${1:-8000}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
echo "Presentación:  http://localhost:${PUERTO}/presentacion/"
echo "Guion (notas): http://localhost:${PUERTO}/presentacion/?guion"
echo "Ctrl+C para detener."
exec python3 -m http.server "$PUERTO" --bind 127.0.0.1 --directory "$RAIZ"
