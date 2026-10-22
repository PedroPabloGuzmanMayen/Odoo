import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'node:path'

// `--mode artifact` empaqueta todo en un solo index.html (para publicarlo como página).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'artifact' ? [viteSingleFile()] : [])],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { outDir: mode === 'artifact' ? 'dist-artifact' : 'dist' },
}))
