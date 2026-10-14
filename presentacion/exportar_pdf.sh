#!/usr/bin/env bash
# Genera los PDF de la presentación con Chromium sin interfaz:
#   presentacion/Dulces_Delicias_presentacion.pdf  (una diapositiva por página, para entregar)
#   presentacion/Dulces_Delicias_guion.pdf         (diapositiva + notas del orador, para ensayar)
# Busca chromium / google-chrome en el PATH; en NixOS, si no hay, lo usa con "nix shell".
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
RAIZ="$(cd "$DIR/.." && pwd)"
PUERTO=8799

CHROME=""
for c in chromium chromium-browser google-chrome google-chrome-stable; do
  if command -v "$c" >/dev/null 2>&1; then CHROME="$(command -v "$c")"; break; fi
done
if [ -z "$CHROME" ]; then
  if command -v nix >/dev/null 2>&1; then
    echo "No hay Chromium en el PATH; se usará el de nixpkgs (la primera vez se descarga)."
    CHROME="$(nix build nixpkgs#chromium --no-link --print-out-paths)/bin/chromium"
  else
    echo "Instale Chromium o Google Chrome para exportar a PDF." >&2; exit 1
  fi
fi

python3 -m http.server "$PUERTO" --bind 127.0.0.1 --directory "$RAIZ" >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
sleep 1

imprimir() {
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --run-all-compositor-stages-before-draw \
    --virtual-time-budget=8000 --print-to-pdf="$2" "http://127.0.0.1:${PUERTO}/presentacion/index.html$1" 2>/dev/null
  echo "Listo: $2"
}
imprimir "" "$DIR/Dulces_Delicias_presentacion.pdf"
imprimir "?guion" "$DIR/Dulces_Delicias_guion.pdf"
