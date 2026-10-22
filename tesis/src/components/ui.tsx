import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type Tone = 'primary' | 'accent' | 'good' | 'warn' | 'bad' | 'neutral'
const lineTone: Record<Tone, string> = {
  primary: 'via-primary/60', accent: 'via-accent/60', good: 'via-good/60', warn: 'via-warn/60', bad: 'via-bad/60', neutral: 'via-foreground/25',
}
const textTone: Record<Tone, string> = {
  primary: 'text-primary', accent: 'text-accent', good: 'text-good', warn: 'text-warn', bad: 'text-bad', neutral: 'text-foreground',
}

export function Card({ children, tone, className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <div className={clsx('card', className)}>
      {tone && <div className={clsx('topline bg-gradient-to-r from-transparent to-transparent', lineTone[tone])} />}
      {children}
    </div>
  )
}

export function CardHead({ icon: Icon, title, hint, right }: { icon?: LucideIcon; title: string; hint?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
      <div className="min-w-0 space-y-1">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          {Icon && <Icon size={16} aria-hidden="true" className="shrink-0 text-muted-foreground" />}
          {title}
        </h3>
        {hint && <p className="text-xs text-muted-foreground max-w-prose">{hint}</p>}
      </div>
      {right}
    </div>
  )
}

export function Stat({ label, value, sub, icon: Icon, tone = 'neutral' }: { label: string; value: ReactNode; sub?: ReactNode; icon?: LucideIcon; tone?: Tone }) {
  return (
    <Card tone={tone}>
      <div className="p-5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="eyebrow">{label}</p>
          {Icon && (
            <div className="rounded-md border border-border/60 bg-muted/40 p-2 text-muted-foreground">
              <Icon size={15} aria-hidden="true" />
            </div>
          )}
        </div>
        <p className={clsx('text-3xl font-semibold tracking-tight num', textTone[tone])}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </Card>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  const cls: Record<Tone, string> = {
    primary: 'border-primary/40 text-primary bg-primary/10',
    accent: 'border-accent/50 text-accent bg-accent/10',
    good: 'border-good/40 text-good bg-good/10',
    warn: 'border-warn/40 text-warn bg-warn/10',
    bad: 'border-bad/40 text-bad bg-bad/10',
    neutral: 'border-border text-muted-foreground bg-muted/40',
  }
  return <span className={clsx('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap', cls[tone])}>{children}</span>
}

export function SceneHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: ReactNode }) {
  return (
    <header className="space-y-2">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h2>
      {intro && <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{intro}</p>}
    </header>
  )
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-md border border-border bg-muted/40 p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={clsx(
            'rounded px-2.5 py-1 text-xs transition-colors',
            value === o ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground border border-transparent',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export function Quote({ children }: { children: ReactNode }) {
  return <blockquote className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-foreground/90 max-w-prose">{children}</blockquote>
}

export const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)} %`
