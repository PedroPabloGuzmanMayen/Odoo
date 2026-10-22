import { useState } from 'react'
import { AlertTriangle, BookMarked, CheckCircle2, Cloud, Download, FileSpreadsheet, Heart, Lightbulb, Medal, MessagesSquare, Scale, Upload } from 'lucide-react'
import clsx from 'clsx'
import { Badge, Card, CardHead, SceneHeader, Segmented } from '@/components/ui'
import { clasificacion, conclusiones, meses, proyecto, recomendaciones, type Mes } from '@/data/tesis'

// Filas de ejemplo para ilustrar la herramienta (no son estudiantes reales).
const ejemplo = [
  { id: '193', p: [0.04, 0.02, 0.01, 0.0] },
  { id: '1369', p: [0.31, 0.44, 0.61, 0.83] },
  { id: '331', p: [0.12, 0.08, 0.05, 0.02] },
  { id: '1566', p: [0.62, 0.71, 0.86, 0.94] },
  { id: '1121', p: [0.18, 0.27, 0.19, 0.09] },
  { id: '1613', p: [0.02, 0.01, 0.01, 0.0] },
  { id: '2207', p: [0.24, 0.13, 0.08, 0.05] },
]

export function HerramientaScene() {
  const [mes, setMes] = useState<Mes>('Enero')
  const mi = meses.indexOf(mes)
  const umbral = clasificacion.find((c) => c.modelo === 'Random Forest' && c.mes === mes)!.umbral
  return (
    <section className="space-y-6">
      <SceneHeader
        eyebrow="Fase 6 · Prueba de concepto"
        title="Una herramienta para usar el modelo"
        intro="Interfaz en Gradio desplegada en Hugging Face Spaces. El docente sube dos archivos .csv, elige el mes y obtiene la probabilidad de reprobar de cada estudiante con el modelo Random Forest de ese mes."
      />

      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-4">
        <div className="space-y-4">
          {[
            { icon: Upload, t: 'Subir datos', d: 'Un .csv con la información general de los estudiantes y otro con sus notas en las actividades del semestre.' },
            { icon: FileSpreadsheet, t: 'Elegir el mes', d: 'La herramienta usa el modelo entrenado para ese mes y valida que los archivos tengan datos hasta esa fecha.' },
            { icon: Download, t: 'Exportar', d: 'Las predicciones se descargan en .csv para darles seguimiento.' },
            { icon: Cloud, t: 'En la nube', d: 'Desplegada en Hugging Face Spaces para facilitar su evaluación.' },
          ].map((s) => (
            <Card key={s.t}>
              <div className="p-4 flex gap-3">
                <div className="h-fit rounded-md border border-border/60 bg-muted/40 p-2 text-primary"><s.icon size={16} aria-hidden="true" /></div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">{s.t}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card tone="accent">
          <CardHead
            title="Detección temprana de riesgo académico"
            hint="Vista ilustrativa con estudiantes de ejemplo."
            right={<Badge tone="warn">Ejemplo</Badge>}
          />
          <div className="p-5 pt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow">Mes</span>
              <Segmented label="Mes" value={mes} options={meses} onChange={setMes} />
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2"><FileSpreadsheet size={14} className="text-muted-foreground" aria-hidden="true" /><span className="truncate">registro_estudiantes.csv</span></div>
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2"><FileSpreadsheet size={14} className="text-muted-foreground" aria-hidden="true" /><span className="truncate">notas_actividades.csv</span></div>
            </div>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-xs min-w-[360px]">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">Est_ID</th>
                    <th className="text-left font-medium px-3 py-2">Probabilidad de reprobar</th>
                    <th className="text-left font-medium px-3 py-2">Predicción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ejemplo.map((e) => {
                    const prob = e.p[mi]
                    const riesgo = prob >= umbral
                    return (
                      <tr key={e.id}>
                        <td className="px-3 py-2 font-mono num">{e.id}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 rounded bg-muted"><div className={clsx('h-1.5 rounded', riesgo ? 'bg-bad' : 'bg-good')} style={{ width: `${prob * 100}%` }} /></div>
                            <span className="font-mono num">{prob.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">{riesgo ? <Badge tone="bad">En riesgo</Badge> : <Badge tone="good">Fuera de riesgo</Badge>}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">Umbral de decisión del Random Forest en {mes.toLowerCase()}: <span className="font-mono text-foreground num">{umbral.toFixed(3)}</span>. Un estudiante se marca en riesgo si su probabilidad lo iguala o supera.</p>
          </div>
        </Card>
      </div>
    </section>
  )
}

export function DiscusionScene() {
  const comparacion = [
    { m: 'Random Forest', t: 'Mejor balance entre sensibilidad y precisión, consistente todos los meses. PR-AUC 0.940, casi igual a la mejor (0.942).', tone: 'primary' as const, tag: 'Elegido' },
    { m: 'LightGBM', t: 'Competitivo: detecta al menos el 89.6 % cada mes y tiene la PR-AUC promedio más alta, pero la precisión más baja en enero.', tone: 'neutral' as const },
    { m: 'XGBoost', t: 'Mayor sensibilidad en enero y marzo, pero menos precisión en febrero y marzo: más falsas alarmas.', tone: 'neutral' as const },
    { m: 'Regresión logística', t: 'La mejor precisión promedio, pero en enero solo detecta el 72.9 %. Y enero es el mes más importante.', tone: 'neutral' as const },
    { m: 'Árbol de decisión', t: 'Alta sensibilidad, pero la peor precisión en febrero y marzo.', tone: 'neutral' as const },
  ]
  return (
    <section className="space-y-6">
      <SceneHeader eyebrow="Discusión" title="Por qué Random Forest y qué nos dicen los datos" intro="Las métricas se obtuvieron sobre el conjunto de prueba, así que el modelo no muestra señales de sobreajuste y generaliza bien." />

      <Card>
        <CardHead icon={Medal} title="Selección del mejor modelo" />
        <ul className="p-5 pt-3 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {comparacion.map((c) => (
            <li key={c.m} className={clsx('rounded-md border p-3 space-y-1', c.tone === 'primary' ? 'border-primary/50 bg-primary/5 md:col-span-2 lg:col-span-1 lg:row-span-2' : 'border-border bg-card/60')}>
              <p className="text-sm font-semibold flex items-center gap-2">{c.m}{c.tag && <Badge tone="primary">{c.tag}</Badge>}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.t}</p>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card tone="primary">
          <CardHead icon={BookMarked} title="Coincide con Pineda (2024)" />
          <div className="p-5 pt-3 space-y-2 text-sm text-muted-foreground">
            <p>En Cálculo 1, repetir el curso no mejoró el rendimiento; lo empeoró. Aquí, quienes cursaron dos veces o más también tuvieron peores notas: solo el <strong className="text-foreground">5.3 %</strong> reprobó en el primer intento, frente al <strong className="text-bad">83 %</strong> en el segundo.</p>
            <p>En ambos trabajos el porcentaje acumulado tiene gran capacidad predictiva. El patrón parece repetirse en varios cursos de la Universidad.</p>
          </div>
        </Card>
        <Card tone="warn">
          <CardHead icon={AlertTriangle} title="Limitaciones" />
          <ul className="p-5 pt-3 space-y-2.5 text-sm">
            <li className="flex gap-2"><span className="text-warn">▸</span><span className="text-muted-foreground">En 2019 las entregas fueron en papel y Canvas casi no se usaba. Unos 400 estudiantes de ese año limitaron la relación entre tiempos de entrega, calificación y reprobación.</span></li>
            <li className="flex gap-2"><span className="text-warn">▸</span><span className="text-muted-foreground">Muchos registros sin puntaje PAA, lo que pudo reducir su capacidad predictiva.</span></li>
            <li className="flex gap-2"><span className="text-warn">▸</span><span className="text-muted-foreground">Sin variables demográficas ni socioeconómicas, muy usadas en investigaciones similares.</span></li>
          </ul>
        </Card>
      </div>

      <Card>
        <div className="p-5 grid md:grid-cols-[auto_1fr] gap-4 items-center">
          <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-accent w-fit"><Scale size={22} aria-hidden="true" /></div>
          <p className="text-sm md:text-base max-w-3xl">Un error de ~10 puntos en la nota estimada dificulta saber si un estudiante cercano a 61 va a reprobar. Por eso la regresión queda como <strong>complemento</strong>: el docente puede revisar la nota estimada de quienes el clasificador no marcó en riesgo.</p>
        </div>
      </Card>
    </section>
  )
}

export function ConclusionesScene() {
  return (
    <section className="space-y-6">
      <SceneHeader eyebrow="Cierre" title="Conclusiones y recomendaciones" />

      <Card tone="primary">
        <CardHead icon={CheckCircle2} title="Conclusiones" />
        <ol className="p-5 pt-3 grid md:grid-cols-2 gap-x-6 gap-y-3">
          {conclusiones.map((c, i) => (
            <li key={i} className={clsx('flex gap-3 text-sm', i === 0 && 'md:col-span-2')}>
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary num">{i + 1}</span>
              <span className={clsx('leading-relaxed', i === 0 ? 'text-foreground font-medium' : 'text-muted-foreground')}>{c}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-base font-semibold"><Lightbulb size={16} className="text-accent" aria-hidden="true" /> Recomendaciones para futuras investigaciones</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recomendaciones.map((r) => (
            <Card key={r.titulo}>
              <div className="p-4 space-y-1">
                <p className="text-sm font-semibold">{r.titulo}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.texto}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card tone="accent">
        <div className="p-6 grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="space-y-2">
            <p className="eyebrow flex items-center gap-1.5"><Heart size={11} aria-hidden="true" /> Agradecimientos</p>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">A mis padres, Juan Pablo y Doris; a mi hermano, Juan Ignacio; a Lucho; y a mi asesora, {proyecto.asesora.replace('Ing. ', '')}, por su orientación y por facilitar el acceso a los datos.</p>
          </div>
          <div className="text-left md:text-right space-y-1">
            <p className="text-3xl font-semibold tracking-tight">¡Gracias!</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 md:justify-end"><MessagesSquare size={12} aria-hidden="true" /> Preguntas y comentarios</p>
          </div>
        </div>
      </Card>
    </section>
  )
}
