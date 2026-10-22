// Convierte el build de un solo archivo en el formato de página publicada
// (sin <!doctype>, <html>, <head> ni <body>: la plataforma agrega ese esqueleto).
import { readFileSync, writeFileSync } from 'node:fs'
const file = new URL('../dist-artifact/index.html', import.meta.url)
let html = readFileSync(file, 'utf8')
html = html
  .replace(/<!doctype html>/i, '')
  .replace(/<html[^>]*>|<\/html>/gi, '')
  .replace(/<head>|<\/head>/gi, '')
  .replace(/<body>|<\/body>/gi, '')
  .replace(/<meta charset="UTF-8" \/>\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '')
  .trim()
writeFileSync(new URL('../dist-artifact/presentacion.html', import.meta.url), html + '\n')
console.log('dist-artifact/presentacion.html listo')
