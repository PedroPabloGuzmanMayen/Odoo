import type { ReactNode } from 'react'
import { usePalette } from '@/lib/theme'

// Estilos compartidos para Recharts, tomados de los tokens del tema.
export function useChartStyle() {
  const p = usePalette()
  return {
    p,
    axis: { stroke: p.border, tick: { fill: p['muted-foreground'], fontSize: 11 }, tickLine: false },
    grid: { stroke: p.border, strokeDasharray: '3 3', vertical: false },
    tooltip: {
      contentStyle: { background: p.card, border: `1px solid ${p.border}`, borderRadius: 8, fontSize: 12, color: p.foreground },
      labelStyle: { color: p.foreground, fontWeight: 600 },
      itemStyle: { color: p.foreground },
      cursor: { fill: p.muted, opacity: 0.5 },
    },
  }
}

export function Legend({ items }: { items: Array<{ label: string; color: string; strong?: boolean }> }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} aria-hidden="true" />
          <span className={i.strong ? 'text-foreground font-medium' : undefined}>{i.label}</span>
        </li>
      ))}
    </ul>
  )
}

// Caja de rango intercuartílico horizontal (q1–q3 con mediana) en una escala dada.
export function IqrBar({ label, q1, med, q3, min, max, color, unit = '' }: { label: ReactNode; q1: number; med: number; q3: number; min: number; max: number; color: string; unit?: string }) {
  const x = (v: number) => ((v - min) / (max - min)) * 100
  return (
    <div className="grid grid-cols-[minmax(0,6.5rem)_1fr_auto] items-center gap-3">
      <span className="text-xs text-muted-foreground truncate">{label}</span>
      <div className="relative h-7 rounded bg-muted/50" title={`Q1 ${q1} · mediana ${med} · Q3 ${q3}`}>
        <div className="absolute inset-y-1 rounded-sm" style={{ left: `${x(q1)}%`, width: `${x(q3) - x(q1)}%`, background: color, opacity: 0.85 }} />
        <div className="absolute inset-y-0 w-0.5 bg-foreground" style={{ left: `${x(med)}%` }} />
      </div>
      <span className="w-14 text-right text-xs font-mono text-foreground num">
        {med.toLocaleString('es-GT')}{unit}
      </span>
    </div>
  )
}
