import { useEffect, useState } from 'react'

const names = ['foreground', 'muted-foreground', 'border', 'card', 'primary', 'accent', 'good', 'warn', 'bad', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'muted'] as const
export type Palette = Record<(typeof names)[number], string>

function read(): Palette {
  const s = getComputedStyle(document.documentElement)
  const out = {} as Palette
  for (const n of names) out[n] = `hsl(${s.getPropertyValue(`--${n}`).trim().replace(/ /g, ', ')})`
  return out
}

// Recharts dibuja SVG con atributos, que no resuelven var(); leemos los tokens y
// volvemos a pintar cuando cambia el tema (atributo data-theme o preferencia del sistema).
export function usePalette(): Palette {
  const [p, setP] = useState<Palette>(read)
  useEffect(() => {
    const update = () => setP(read())
    const mo = new MutationObserver(update)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', update)
    return () => { mo.disconnect(); mq.removeEventListener('change', update) }
  }, [])
  return p
}

export function modelColor(p: Palette, i: number) {
  return [p.primary, p['chart-2'], p['chart-3'], p['chart-4'], p['chart-5']][i % 5]
}
