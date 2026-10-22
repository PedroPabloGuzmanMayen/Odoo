import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react'
import {
  BookOpen, ChevronLeft, ChevronRight, ClipboardCheck, Database, FlaskConical, GitBranch, Home, Lightbulb, ListFilter,
  Menu, MessagesSquare, Moon, PanelLeftClose, PanelLeftOpen, Sigma, Sparkles, Sun, Target, Wrench, X,
  type LucideIcon,
} from 'lucide-react'
import clsx from 'clsx'
import { InicioScene, MarcoScene, ProblemaScene } from '@/scenes/contexto'
import { DatosScene, MetodologiaScene, VariablesScene } from '@/scenes/proceso'
import { ClasificacionScene, HallazgosScene, ImportanciaScene, RegresionScene } from '@/scenes/resultados'
import { ConclusionesScene, DiscusionScene, HerramientaScene } from '@/scenes/cierre'

type Scene = { id: string; label: string; icon: LucideIcon; component: ComponentType }
const grupos: Array<{ titulo: string; escenas: Scene[] }> = [
  {
    titulo: 'Contexto',
    escenas: [
      { id: 'inicio', label: 'Inicio', icon: Home, component: InicioScene },
      { id: 'problema', label: 'Problema', icon: Target, component: ProblemaScene },
      { id: 'marco', label: 'Marco teórico', icon: BookOpen, component: MarcoScene },
    ],
  },
  {
    titulo: 'Cómo se hizo',
    escenas: [
      { id: 'datos', label: 'Datos y limpieza', icon: Database, component: DatosScene },
      { id: 'metodologia', label: 'Metodología', icon: GitBranch, component: MetodologiaScene },
      { id: 'variables', label: 'Variables', icon: ListFilter, component: VariablesScene },
    ],
  },
  {
    titulo: 'Resultados',
    escenas: [
      { id: 'hallazgos', label: 'Hallazgos', icon: Lightbulb, component: HallazgosScene },
      { id: 'clasificacion', label: 'Clasificación', icon: ClipboardCheck, component: ClasificacionScene },
      { id: 'regresion', label: 'Regresión', icon: Sigma, component: RegresionScene },
      { id: 'importancia', label: 'Variables influyentes', icon: Sparkles, component: ImportanciaScene },
      { id: 'herramienta', label: 'Herramienta', icon: Wrench, component: HerramientaScene },
    ],
  },
  {
    titulo: 'Cierre',
    escenas: [
      { id: 'discusion', label: 'Discusión', icon: MessagesSquare, component: DiscusionScene },
      { id: 'conclusiones', label: 'Conclusiones', icon: FlaskConical, component: ConclusionesScene },
    ],
  },
]
const escenas = grupos.flatMap((g) => g.escenas)

const store = {
  get(k: string) { try { return localStorage.getItem(k) } catch { return null } },
  set(k: string, v: string) { try { localStorage.setItem(k, v) } catch { /* sin almacenamiento */ } },
}

function initialScene() {
  const h = typeof location !== 'undefined' ? location.hash.replace('#', '') : ''
  return escenas.some((s) => s.id === h) ? h : 'inicio'
}

function isDark() {
  const t = document.documentElement.getAttribute('data-theme')
  if (t) return t === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function App() {
  const [active, setActive] = useState(initialScene)
  const [collapsed, setCollapsed] = useState(() => store.get('tesis-sidebar') === 'collapsed')
  const [drawer, setDrawer] = useState(false)
  const [dark, setDark] = useState(isDark)

  const index = escenas.findIndex((s) => s.id === active)
  const Active = escenas[index].component
  const grupoActivo = useMemo(() => grupos.find((g) => g.escenas.some((s) => s.id === active))!.titulo, [active])

  const go = useCallback((id: string) => {
    setActive(id)
    setDrawer(false)
    try { history.replaceState(null, '', `#${id}`) } catch { /* el visor puede bloquearlo */ }
    document.getElementById('main')?.scrollTo({ top: 0 })
  }, [])

  const step = useCallback((d: number) => {
    const next = escenas[Math.min(escenas.length - 1, Math.max(0, index + d))]
    if (next.id !== active) go(next.id)
  }, [index, active, go])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, [role="radiogroup"]')) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); step(1) }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); step(-1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  useEffect(() => { store.set('tesis-sidebar', collapsed ? 'collapsed' : 'expanded') }, [collapsed])

  useEffect(() => {
    const sync = () => setDark(isDark())
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', sync)
    const mo = new MutationObserver(sync)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => { mq.removeEventListener('change', sync); mo.disconnect() }
  }, [])

  const toggleTheme = () => document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark')

  const nav = (compact: boolean) => (
    <nav className="flex-1 px-2 py-3 flex flex-col gap-3 overflow-y-auto" aria-label="Secciones">
      {grupos.map((g) => (
        <div key={g.titulo} className="flex flex-col gap-0.5">
          {!compact && <p className="eyebrow px-2.5 pb-1">{g.titulo}</p>}
          {compact && <div className="mx-2 mb-1 border-t border-border/60 first:hidden" />}
          {g.escenas.map((s) => {
            const Icon = s.icon
            const on = s.id === active
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => go(s.id)}
                aria-current={on ? 'page' : undefined}
                title={compact ? s.label : undefined}
                className={clsx(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors',
                  on ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  compact && 'justify-center',
                )}
              >
                <Icon size={15} className={clsx('shrink-0', on && 'text-primary')} aria-hidden="true" />
                {!compact && <span className="truncate">{s.label}</span>}
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )

  const brand = (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium truncate">UVG · Trabajo de graduación</p>
      <h1 className="text-sm font-semibold leading-tight truncate">Riesgo de reprobación</h1>
    </div>
  )

  const themeButton = (
    <button
      type="button"
      onClick={toggleTheme}
      className="shrink-0 p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
    >
      {dark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  )

  const prev = escenas[index - 1]
  const next = escenas[index + 1]

  return (
    <div className="flex h-full overflow-hidden bg-background text-foreground">
      {/* Barra lateral (escritorio) */}
      <aside className={clsx('hidden md:flex border-r border-border flex-col transition-[width] duration-200 ease-out', collapsed ? 'w-14' : 'w-60')}>
        <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-border/60">
          {!collapsed && brand}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="shrink-0 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>
        {nav(collapsed)}
        <div className={clsx('border-t border-border/60 px-3 py-3 flex items-center gap-2', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && <p className="text-[10px] text-muted-foreground">Usa ← → para avanzar</p>}
          {themeButton}
        </div>
      </aside>

      {/* Menú móvil */}
      {drawer && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <button type="button" aria-label="Cerrar menú" className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="relative z-10 w-64 max-w-[80%] h-full border-r border-border bg-card flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingLeft: 'env(safe-area-inset-left, 0px)' }}>
            <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-border/60">
              {brand}
              <button type="button" onClick={() => setDrawer(false)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" aria-label="Cerrar menú"><X size={15} /></button>
            </div>
            {nav(false)}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="md:hidden gutter flex items-center justify-between gap-2 py-2.5 border-b border-border">
          <button type="button" onClick={() => setDrawer(true)} className="p-1.5 rounded-md border border-border text-muted-foreground" aria-label="Abrir menú"><Menu size={15} /></button>
          <div className="min-w-0 text-center">
            <p className="eyebrow">{grupoActivo}</p>
            <p className="text-sm font-semibold truncate">{escenas[index].label}</p>
          </div>
          {themeButton}
        </div>

        <main id="main" className="flex-1 overflow-y-auto">
          <div className="gutter md:px-8 py-6 md:py-8 max-w-6xl">
            <div key={active} className="scene-enter">
              <Active />
            </div>

            <footer className="mt-10 pt-4 border-t border-border flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={!prev}
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none min-w-0"
              >
                <ChevronLeft size={15} aria-hidden="true" /><span className="truncate">{prev ? prev.label : 'Anterior'}</span>
              </button>
              <span className="text-xs text-muted-foreground font-mono num shrink-0">{index + 1} / {escenas.length}</span>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={!next}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none min-w-0"
              >
                <span className="truncate">{next ? next.label : 'Fin'}</span><ChevronRight size={15} aria-hidden="true" />
              </button>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
