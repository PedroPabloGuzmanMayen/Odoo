# Presentación del trabajo de graduación

Web interactiva para presentar *Detección temprana del riesgo de reprobación en Pensamiento Cuantitativo*
(UVG, 2019–2022). Estilo basado en [JosueSay/admin-ti/app](https://github.com/JosueSay/admin-ti/tree/main/app):
React + Vite + Tailwind + Recharts, barra lateral por secciones y tema claro/oscuro.

```bash
npm install
npm run dev              # http://localhost:5173
npm run build            # versión estática en dist/
npm run build:artifact   # un solo archivo HTML en dist-artifact/
```

- Navega con las flechas ← → del teclado o con los botones al pie de cada sección.
- Cada sección tiene su enlace directo: `#inicio`, `#problema`, `#marco`, `#datos`, `#metodologia`,
  `#variables`, `#hallazgos`, `#clasificacion`, `#regresion`, `#importancia`, `#herramienta`,
  `#discusion`, `#conclusiones`.
- Todas las cifras están en `src/data/tesis.ts`. Las importancias de variables se leyeron de las
  figuras 6.6–6.15 (valores aproximados); reemplázalas por las exactas si las tienes.
