import { AlertTriangle, BookOpen, Brain, CalendarClock, GraduationCap, Layers, Lightbulb, Scale, Target, TrendingDown, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge, Card, CardHead, Quote, SceneHeader, Stat } from '@/components/ui'
import { useChartStyle } from '@/components/charts'
import { datos, proyecto } from '@/data/tesis'

export function InicioScene() {
  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="primary">Trabajo de graduación</Badge>
          <Badge>{proyecto.universidad}</Badge>
        </div>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-4xl leading-[1.08]">{proyecto.titulo}</h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl">{proyecto.subtitulo}</p>
      </header>

      <Card tone="primary">
        <div className="p-6 flex flex-col md:flex-row md:items-stretch gap-6 md:divide-x md:divide-border">
          <div className="md:w-2/5 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target size={14} aria-hidden="true" />
              <p className="eyebrow">Resultado principal</p>
            </div>
            <p className="text-5xl md:text-6xl font-semibold tracking-tight num text-primary">89.6 %</p>
            <p className="text-sm text-muted-foreground max-w-xs">de los estudiantes que reprobaron fueron detectados desde <strong className="text-foreground">enero</strong>, el primer mes del semestre.</p>
          </div>
          <div className="flex-1 md:pl-6 grid grid-cols-2 gap-4 content-center">
            <div>
              <p className="eyebrow">Modelo elegido</p>
              <p className="mt-1 text-xl font-semibold">Random Forest</p>
              <p className="text-xs text-muted-foreground">Clasificación, uno por mes</p>
            </div>
            <div>
              <p className="eyebrow">Para abril</p>
              <p className="mt-1 text-xl font-semibold num">100 %</p>
              <p className="text-xs text-muted-foreground">de casos detectados, 96 % de alertas acertadas</p>
            </div>
            <div>
              <p className="eyebrow">Autor</p>
              <p className="mt-1 text-sm font-medium">{proyecto.autor}</p>
            </div>
            <div>
              <p className="eyebrow">Asesora</p>
              <p className="mt-1 text-sm font-medium">{proyecto.asesora}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Estudiantes analizados" value={datos.estudiantesFinal.toLocaleString('es-GT')} sub={`Pensamiento Cuantitativo, ${datos.periodo}`} icon={Users} />
        <Stat label="Tasa de reprobación" value={`${datos.tasaReprobacion} %`} sub="Clases desbalanceadas" icon={TrendingDown} tone="warn" />
        <Stat label="Modelos entrenados" value="40" sub="5 algoritmos × 4 meses × 2 enfoques" icon={Layers} />
        <Stat label="Registros de actividades" value={datos.filasActividades.toLocaleString('es-GT')} sub="Tareas, parciales y entregas en Canvas" icon={BookOpen} />
      </div>

      <Card>
        <CardHead icon={Lightbulb} title="De dónde nace la investigación" hint="Prefacio" />
        <div className="p-5 pt-3 grid md:grid-cols-[1.4fr_1fr] gap-6">
          <Quote>
            Desde el inicio de mi carrera me interesó cómo la tecnología puede mejorar el aprendizaje. Siempre tuve curiosidad por saber si existen patrones que definan el rendimiento de un estudiante desde el inicio del curso: ¿en qué parcial se obtienen las peores notas?, ¿un parcial específico puede condicionar el resultado del curso?
          </Quote>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="text-accent">▸</span> Primeros proyectos: una app de cuestionarios de matemática, sociales y física.</li>
            <li className="flex gap-2"><span className="text-accent">▸</span> Un modelo de recomendación para elegir carrera universitaria.</li>
            <li className="flex gap-2"><span className="text-accent">▸</span> Objetivo: apoyar a docentes y a la institución en el aprendizaje personalizado.</li>
          </ul>
        </div>
      </Card>
    </section>
  )
}

const graduacionHatfield = [
  { grupo: 'Hombres blancos', sin: 0.48, con: 0.33 },
  { grupo: 'Mujeres afroamericanas', sin: 0.28, con: 0.15 },
]

export function ProblemaScene() {
  const { p, axis, grid, tooltip } = useChartStyle()
  const data = graduacionHatfield.flatMap((g) => [
    { k: `${g.grupo} · sin DFW`, v: g.sin * 100, c: p['chart-5'] },
    { k: `${g.grupo} · con DFW`, v: g.con * 100, c: p.bad },
  ])
  return (
    <section className="space-y-6">
      <SceneHeader
        eyebrow="Justificación"
        title="Reprobar un curso clave cuesta más que una nota"
        intro="El estudiante se retrasa en su plan de estudios, pierde tiempo y, muchas veces, motivación. Diversos estudios relacionan la reprobación de cursos clave con la deserción universitaria."
      />

      <div className="grid md:grid-cols-3 gap-4">
        <Card tone="accent" className="md:col-span-1">
          <CardHead icon={GraduationCap} title="Pensamiento Cuantitativo" hint="Un curso clave (gateway course)" />
          <ul className="p-5 pt-3 space-y-2.5 text-sm">
            <li className="flex gap-2"><span className="text-accent">▸</span> Curso introductorio de matemática en varias ingenierías.</li>
            <li className="flex gap-2"><span className="text-accent">▸</span> Prerrequisito de Cálculo 1.</li>
            <li className="flex gap-2"><span className="text-accent">▸</span> Introduce funciones y funciones trigonométricas.</li>
          </ul>
        </Card>
        <Card className="md:col-span-2">
          <CardHead icon={AlertTriangle} title="Una nota baja en un curso clave reduce la graduación" hint="Probabilidad de graduarse en STEM según tener al menos una nota menor a C- (DFW). Hatfield et al., 2022, 110,000 estudiantes." />
          <div className="h-56 px-2 pb-3 pt-2">
            <ResponsiveContainer>
              <BarChart data={data} layout="vertical" margin={{ left: 8, right: 40 }}>
                <CartesianGrid {...grid} horizontal={false} vertical />
                <XAxis type="number" domain={[0, 60]} unit=" %" {...axis} />
                <YAxis type="category" dataKey="k" width={190} {...axis} />
                <Tooltip {...tooltip} formatter={(v: number) => [`${v.toFixed(0)} %`, 'Prob. de graduarse']} />
                <Bar dataKey="v" radius={[0, 4, 4, 0]} barSize={18}>
                  {data.map((d) => <Cell key={d.k} fill={d.c} />)}
                  <LabelList dataKey="v" position="right" formatter={(v: number) => `${v.toFixed(0)} %`} style={{ fill: p.foreground, fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Precálculo (EE. UU.)" value="> 60 %" sub="de quienes sacaron menos de C- no se graduó (Adaricheva et al., 2025)" tone="bad" icon={TrendingDown} />
        <Stat label="Intervención temprana" value="Tutorías" sub="Acompañamiento psicológico y meditación mejoran el rendimiento (Hernández Suárez et al., 2025)" tone="good" icon={CalendarClock} />
        <Stat label="Antecedente en la UVG" value="Cálculo 1" sub="Pineda (2024) predijo el riesgo con LightGBM, SVM y regresión logística" tone="primary" icon={BookOpen} />
      </div>

      <Card>
        <div className="p-5 grid md:grid-cols-[auto_1fr] gap-4 items-center">
          <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-primary w-fit"><Scale size={22} aria-hidden="true" /></div>
          <div className="space-y-1">
            <p className="eyebrow">El problema a investigar</p>
            <p className="text-base md:text-lg font-medium max-w-3xl">Para aplicar una intervención temprana, primero hay que identificar <span className="text-primary">con precisión y con anticipación</span> a los estudiantes en riesgo de reprobar.</p>
          </div>
        </div>
      </Card>
    </section>
  )
}

const conceptos = [
  { t: 'Análisis del aprendizaje', d: 'Aplica ciencia de datos a la información de los estudiantes para personalizar y optimizar el aprendizaje (learning analytics).' },
  { t: 'Ingeniería del aprendizaje', d: 'El docente analiza datos de desempeño, propone una intervención y mide su efecto para refinarla.' },
  { t: 'Aprendizaje supervisado', d: 'El modelo aprende de ejemplos donde ya se conoce la respuesta: aquí, si el estudiante aprobó y con qué nota.' },
  { t: 'Clasificación vs. regresión', d: 'Clasificación predice una clase finita (aprueba / reprueba). Regresión predice un valor numérico (la nota final).' },
]

const algoritmos = [
  { t: 'Árbol de decisión', d: 'Divide los datos con umbrales sobre las variables que mejor separan las clases.' },
  { t: 'Random Forest', d: 'Combina muchos árboles entrenados con subconjuntos distintos y toma la predicción más frecuente.' },
  { t: 'XGBoost y LightGBM', d: 'Ensambles de árboles por gradiente; muy fuertes en datos tabulares y permiten ponderar la clase minoritaria.' },
  { t: 'Regresión logística / lineal', d: 'Modelos de referencia, simples e interpretables.' },
]

export function MarcoScene() {
  return (
    <section className="space-y-6">
      <SceneHeader eyebrow="Marco teórico" title="Conceptos que sostienen el proyecto" intro="Los modelos se evalúan con métricas pensadas para clases desbalanceadas: lo importante es encontrar a quienes van a reprobar sin llenar de falsas alarmas al docente." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {conceptos.map((c) => (
          <Card key={c.t}>
            <div className="p-5 space-y-2">
              <p className="text-sm font-semibold">{c.t}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.d}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-4">
        <Card>
          <CardHead icon={Brain} title="Algoritmos utilizados" />
          <ul className="p-5 pt-3 divide-y divide-border">
            {algoritmos.map((a) => (
              <li key={a.t} className="py-2.5 first:pt-0 last:pb-0">
                <p className="text-sm font-medium">{a.t}</p>
                <p className="text-xs text-muted-foreground">{a.d}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card tone="primary">
          <CardHead icon={Target} title="Cómo se lee un resultado" hint="Matriz de confusión con la clase de interés: estudiantes que reprueban." />
          <div className="p-5 pt-3 space-y-4">
            <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5 text-xs">
              <span />
              <span className="eyebrow text-center">Reprobó</span>
              <span className="eyebrow text-center">Aprobó</span>
              <span className="eyebrow self-center pr-1 [writing-mode:vertical-rl] rotate-180 text-center">Alerta</span>
              <div className="rounded-md border border-good/40 bg-good/10 p-3"><p className="font-semibold text-good">Caso real detectado</p><p className="text-muted-foreground">Verdadero positivo</p></div>
              <div className="rounded-md border border-warn/40 bg-warn/10 p-3"><p className="font-semibold text-warn">Falsa alarma</p><p className="text-muted-foreground">Falso positivo</p></div>
              <span className="eyebrow self-center pr-1 [writing-mode:vertical-rl] rotate-180 text-center">Sin alerta</span>
              <div className="rounded-md border border-bad/40 bg-bad/10 p-3"><p className="font-semibold text-bad">Caso que se escapa</p><p className="text-muted-foreground">Falso negativo</p></div>
              <div className="rounded-md border border-border bg-muted/40 p-3"><p className="font-semibold">Sin riesgo, bien</p><p className="text-muted-foreground">Verdadero negativo</p></div>
            </div>
            <dl className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-md border border-border bg-card/60 p-3">
                <dt className="font-semibold">Sensibilidad → casos reales detectados</dt>
                <dd className="text-muted-foreground mt-1 font-mono">VP / (VP + FN)</dd>
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <dt className="font-semibold">Precisión → alertas acertadas</dt>
                <dd className="text-muted-foreground mt-1 font-mono">VP / (VP + FP) · falsas alarmas = 1 − precisión</dd>
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <dt className="font-semibold">F2-score</dt>
                <dd className="text-muted-foreground mt-1">Balancea ambas, pero la sensibilidad pesa el doble (β = 2).</dd>
              </div>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <dt className="font-semibold">RMSE y MAE</dt>
                <dd className="text-muted-foreground mt-1">Error promedio de la nota estimada, en puntos (0–100).</dd>
              </div>
            </dl>
          </div>
        </Card>
      </div>
    </section>
  )
}
