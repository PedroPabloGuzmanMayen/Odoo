import { useState } from 'react'
import { Award, BarChart3, Crosshair, Repeat, Ruler, Sigma, Users } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import clsx from 'clsx'
import { Badge, Card, CardHead, SceneHeader, Segmented, Stat } from '@/components/ui'
import { IqrBar, Legend, useChartStyle } from '@/components/charts'
import { modelColor } from '@/lib/theme'
import {
  acumuladoPorMes, clasificacion, importanciaClf, importanciaReg, meses, modelos, modelosReg, notaPorIntento, paaPorClase,
  parcialesPorClase, promediosClf, promediosReg, regresion, reprobacionPorGenero, reprobacionPorIntento, reprobadosPrueba, variablesImp,
} from '@/data/tesis'

const mesCorto = (m: string) => m.slice(0, 3)

// ---------------------------------------------------------------- Hallazgos
export function HallazgosScene() {
  const { p, axis, grid, tooltip } = useChartStyle()
  return (
    <section className="space-y-6">
      <SceneHeader
        eyebrow="Análisis exploratorio"
        title="Repetir el curso no mejora el resultado"
        intro="El rendimiento cae a partir del segundo intento. El patrón coincide con lo encontrado por Pineda (2024) en Cálculo 1 y sugiere que se repite en varios cursos del Departamento de Matemática."
      />

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4">
        <Card tone="bad">
          <CardHead icon={Repeat} title="Tasa de reprobación según el número de intento" hint="Estudiantes 2019–2022 (n = 2,325)." />
          <div className="h-64 px-2 pb-3 pt-3">
            <ResponsiveContainer>
              <BarChart data={reprobacionPorIntento} margin={{ top: 24, right: 12, left: -8 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="intento" {...axis} />
                <YAxis domain={[0, 100]} unit=" %" {...axis} />
                <Tooltip {...tooltip} formatter={(v: number) => [`${v} %`, 'Reprobó']} />
                <Bar dataKey="tasa" radius={[4, 4, 0, 0]} barSize={56}>
                  {reprobacionPorIntento.map((d, i) => <Cell key={d.intento} fill={i === 0 ? p.primary : p.bad} />)}
                  <LabelList dataKey="tasa" position="top" formatter={(v: number) => `${v} %`} style={{ fill: p.foreground, fontSize: 12, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="px-5 pb-4 text-xs text-muted-foreground">n = 2,083 · 224 · 18 estudiantes. El grupo de 3 o más intentos es pequeño.</p>
        </Card>

        <Card>
          <CardHead icon={Ruler} title="Nota final según el intento" hint="Caja = 50 % central de los estudiantes; línea = mediana. Aprobación: 61 puntos." />
          <div className="p-5 pt-4 space-y-3">
            {notaPorIntento.map((n) => (
              <IqrBar key={n.intento} label={`Intento ${n.intento}`} q1={n.q1} med={n.mediana} q3={n.q3} min={0} max={100} color={n.intento === '1' ? p.primary : p.bad} />
            ))}
            <p className="text-xs text-muted-foreground pt-1">En el tercer y cuarto intento ningún estudiante alcanzó la nota mínima.</p>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHead title="Mediana en exámenes parciales" hint="Los rangos centrales no se traslapan." />
          <div className="p-5 pt-4 space-y-3">
            <IqrBar label="Aprobó" q1={parcialesPorClase.aprobado.q1} med={parcialesPorClase.aprobado.mediana} q3={parcialesPorClase.aprobado.q3} min={0} max={100} color={p.primary} />
            <IqrBar label="Reprobó" q1={parcialesPorClase.reprobado.q1} med={parcialesPorClase.reprobado.mediana} q3={parcialesPorClase.reprobado.q3} min={0} max={100} color={p.bad} />
          </div>
        </Card>
        <Card>
          <CardHead title="Puntaje en la PAA" hint="Hay traslape, pero quienes aprueban suelen tener más puntos." />
          <div className="p-5 pt-4 space-y-3">
            <IqrBar label="Aprobó" q1={paaPorClase.aprobado.q1} med={paaPorClase.aprobado.mediana} q3={paaPorClase.aprobado.q3} min={900} max={1500} color={p.primary} />
            <IqrBar label="Reprobó" q1={paaPorClase.reprobado.q1} med={paaPorClase.reprobado.mediana} q3={paaPorClase.reprobado.q3} min={900} max={1500} color={p.bad} />
          </div>
        </Card>
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHead icon={Users} title="Reprobación por género" hint="Diferencia leve; asociación débil (V de Cramér 0.062). Se descartó." />
          <ul className="p-5 pt-4 space-y-3">
            {reprobacionPorGenero.map((g) => (
              <li key={g.genero} className="space-y-1">
                <div className="flex justify-between text-xs"><span>{g.genero}</span><span className="font-mono num">{g.tasa} % · {g.reprobados} de {g.total.toLocaleString('es-GT')}</span></div>
                <div className="h-2 rounded bg-muted"><div className="h-2 rounded" style={{ width: `${(g.tasa / 20) * 100}%`, background: p['chart-5'] }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHead icon={BarChart3} title="Porcentaje acumulado en actividades al cierre de cada mes" hint="Medianas por clase. Desde febrero los rangos centrales de ambos grupos dejan de traslaparse." />
        <div className="h-60 px-2 pb-3 pt-3">
          <ResponsiveContainer>
            <LineChart data={acumuladoPorMes} margin={{ right: 24, left: -8, top: 8 }}>
              <CartesianGrid {...grid} />
              <XAxis dataKey="mes" {...axis} />
              <YAxis domain={[40, 100]} unit=" %" {...axis} />
              <Tooltip {...tooltip} formatter={(v: number, n: string) => [`${v} %`, n === 'aprobado' ? 'Aprobó' : 'Reprobó']} />
              <Line dataKey="aprobado" stroke={p.primary} strokeWidth={2.5} dot={{ r: 3, fill: p.primary }} />
              <Line dataKey="reprobado" stroke={p.bad} strokeWidth={2.5} dot={{ r: 3, fill: p.bad }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="px-5 pb-4"><Legend items={[{ label: 'Aprobó', color: p.primary }, { label: 'Reprobó', color: p.bad }]} /></div>
      </Card>
    </section>
  )
}

// ---------------------------------------------------------------- Clasificación
type MetricaClf = 'Casos reales detectados' | 'Falsas alarmas' | 'F2-score' | 'PR-AUC'
const metricasClf: MetricaClf[] = ['Casos reales detectados', 'Falsas alarmas', 'F2-score', 'PR-AUC']

function valorClf(r: { sens: number; prec: number; f2: number; prauc: number }, m: MetricaClf) {
  if (m === 'Casos reales detectados') return r.sens * 100
  if (m === 'Falsas alarmas') return (1 - r.prec) * 100
  if (m === 'F2-score') return r.f2 * 100
  return r.prauc * 100
}

export function ClasificacionScene() {
  const { p, axis, grid, tooltip } = useChartStyle()
  const [metrica, setMetrica] = useState<MetricaClf>('Casos reales detectados')
  const data = meses.map((mes) => {
    const row: Record<string, number | string> = { mes }
    for (const m of modelos) {
      const r = clasificacion.find((c) => c.modelo === m && c.mes === mes)!
      row[m] = +valorClf(r, metrica).toFixed(1)
    }
    return row
  })
  const rf = meses.map((mes) => {
    const r = clasificacion.find((c) => c.modelo === 'Random Forest' && c.mes === mes)!
    const tp = Math.round(r.sens * reprobadosPrueba)
    const alertas = Math.round(tp / r.prec)
    return { mes, tp, fp: alertas - tp, sens: r.sens, prec: r.prec }
  })
  const lowerBetter = metrica === 'Falsas alarmas'
  const yDomain: [number, number] = lowerBetter ? [0, 40] : [60, 100]

  return (
    <section className="space-y-6">
      <SceneHeader
        eyebrow="Resultados · Clasificación"
        title="Random Forest detecta casi todos los casos desde enero"
        intro="Métricas sobre el conjunto de prueba, con datos que los modelos nunca vieron. La clase de interés son los estudiantes que reprueban. Todos los modelos mejoran conforme avanza el semestre."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {rf.map((r) => (
          <Card key={r.mes} tone={r.mes === 'Enero' ? 'primary' : 'neutral'}>
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between"><p className="eyebrow">{r.mes}</p><Badge tone="primary">Random Forest</Badge></div>
              <p className="text-3xl font-semibold num tracking-tight">{(r.sens * 100).toFixed(1)} %</p>
              <p className="text-xs text-muted-foreground">casos reales detectados · <span className="text-foreground font-medium num">{r.tp} de {reprobadosPrueba}</span></p>
              <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
                <span className="text-muted-foreground">Falsas alarmas</span>
                <span className="font-mono num text-warn">{((1 - r.prec) * 100).toFixed(1)} % · {r.fp}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHead
          icon={Crosshair}
          title="Comparación de los cinco algoritmos por mes"
          hint={lowerBetter ? 'Falsas alarmas = alertas que resultaron ser estudiantes que aprobaron (1 − precisión). Menos es mejor.' : 'Más es mejor.'}
          right={<Segmented label="Métrica" value={metrica} options={metricasClf} onChange={setMetrica} />}
        />
        <div className="h-72 px-2 pt-4">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ right: 12, left: -8 }} barCategoryGap="18%">
              <CartesianGrid {...grid} />
              <XAxis dataKey="mes" {...axis} />
              <YAxis domain={yDomain} allowDataOverflow unit=" %" {...axis} />
              <Tooltip {...tooltip} formatter={(v: number) => `${v.toFixed(1)} %`} />
              {modelos.map((m, i) => (
                <Bar key={m} dataKey={m} fill={modelColor(p, i)} radius={[3, 3, 0, 0]} opacity={i === 0 ? 1 : 0.75} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="px-5 pb-4 pt-2"><Legend items={modelos.map((m, i) => ({ label: m, color: modelColor(p, i), strong: i === 0 }))} /></div>
      </Card>

      <Card tone="primary">
        <CardHead icon={Award} title="Promedio de los cuatro meses" hint="Random Forest logra el mejor equilibrio: el F2-score promedio más alto con una precisión cercana a la mejor." />
        <div className="p-5 pt-3 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="text-left font-medium py-2">Modelo</th>
                <th className="text-right font-medium py-2">Casos reales detectados</th>
                <th className="text-right font-medium py-2">Falsas alarmas</th>
                <th className="text-right font-medium py-2">F2-score</th>
                <th className="text-right font-medium py-2">PR-AUC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {promediosClf.map((r) => {
                const best = r.modelo === 'Random Forest'
                const max = (k: 'sens' | 'f2' | 'prauc') => r[k] === Math.max(...promediosClf.map((x) => x[k]))
                const minFa = r.prec === Math.max(...promediosClf.map((x) => x.prec))
                return (
                  <tr key={r.modelo} className={clsx(best && 'bg-primary/5')}>
                    <td className="py-2.5 font-medium">{r.modelo} {best && <Badge tone="primary">Elegido</Badge>}</td>
                    <td className={clsx('py-2.5 text-right font-mono num', max('sens') && 'text-good font-semibold')}>{(r.sens * 100).toFixed(1)} %</td>
                    <td className={clsx('py-2.5 text-right font-mono num', minFa && 'text-good font-semibold')}>{((1 - r.prec) * 100).toFixed(1)} %</td>
                    <td className={clsx('py-2.5 text-right font-mono num', max('f2') && 'text-good font-semibold')}>{r.f2.toFixed(3)}</td>
                    <td className={clsx('py-2.5 text-right font-mono num', max('prauc') && 'text-good font-semibold')}>{r.prauc.toFixed(3)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">En verde, el mejor valor de cada columna. Conteos de las tarjetas: sobre los {reprobadosPrueba} estudiantes reprobados del conjunto de prueba.</p>
        </div>
      </Card>
    </section>
  )
}

// ---------------------------------------------------------------- Regresión
export function RegresionScene() {
  const { p, axis, grid, tooltip } = useChartStyle()
  const [metrica, setMetrica] = useState<'MAE' | 'RMSE'>('MAE')
  const key = metrica === 'MAE' ? 'mae' : 'rmse'
  const regColor = (i: number) => (i === 4 ? p.primary : [p['chart-5'], p['chart-2'], p['chart-3'], p['chart-4']][i])
  const data = meses.map((mes) => {
    const row: Record<string, number | string> = { mes: mesCorto(mes) }
    for (const m of modelosReg) row[m] = regresion.find((r) => r.modelo === m && r.mes === mes)![key]
    return row
  })
  return (
    <section className="space-y-6">
      <SceneHeader
        eyebrow="Resultados · Regresión"
        title="Estimar la nota exacta es difícil al inicio"
        intro="La regresión lineal fue el mejor modelo de regresión, pero en los primeros meses su error ronda los 10 a 15 puntos. Con muchos estudiantes cerca del límite de 61, ese error no permite decidir quién está en riesgo."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Mejor modelo" value="Lineal" sub="RMSE 8.7 · MAE 6.7 · r 0.907 promedio" icon={Award} tone="primary" />
        <Stat label="Error en enero" value="14.9 pts" sub="RMSE de la regresión lineal" icon={Sigma} tone="bad" />
        <Stat label="Error en abril" value="4.1 pts" sub="RMSE; correlación 0.985" icon={Sigma} tone="good" />
        <Stat label="Cerca del límite" value="210+" sub="estudiantes con nota entre 56 y 65 (entrenamiento)" icon={Ruler} tone="warn" />
      </div>

      <Card>
        <CardHead
          icon={Sigma}
          title={`${metrica === 'MAE' ? 'Error absoluto medio' : 'Raíz del error cuadrático medio'} por mes`}
          hint="Puntos de la nota final (0 a 100). Menos es mejor. La franja marca un error de 10 puntos o más."
          right={<Segmented label="Métrica de error" value={metrica} options={['MAE', 'RMSE'] as const} onChange={setMetrica} />}
        />
        <div className="h-72 px-2 pt-4">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ right: 24, left: -8, top: 8 }}>
              <CartesianGrid {...grid} />
              <ReferenceArea y1={10} y2={16} fill={p.bad} fillOpacity={0.08} />
              <ReferenceLine y={10} stroke={p.bad} strokeDasharray="4 4" label={{ value: '10 pts', position: 'insideTopRight', fill: p.bad, fontSize: 11 }} />
              <XAxis dataKey="mes" {...axis} />
              <YAxis domain={[0, 16]} {...axis} />
              <Tooltip {...tooltip} formatter={(v: number) => `${v.toFixed(2)} pts`} />
              {modelosReg.map((m, i) => (
                <Line key={m} dataKey={m} stroke={regColor(i)} strokeWidth={m === 'Regresión lineal' ? 3 : 1.75} dot={{ r: m === 'Regresión lineal' ? 4 : 2.5, fill: regColor(i) }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="px-5 pb-4 pt-2"><Legend items={modelosReg.map((m, i) => ({ label: m, color: regColor(i), strong: m === 'Regresión lineal' }))} /></div>
      </Card>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
        <Card>
          <CardHead title="Promedio de los cuatro meses" />
          <div className="p-5 pt-3 overflow-x-auto">
            <table className="w-full text-sm min-w-[380px]">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="text-left font-medium py-2">Modelo</th>
                  <th className="text-right font-medium py-2">RMSE</th>
                  <th className="text-right font-medium py-2">MAE</th>
                  <th className="text-right font-medium py-2">Correlación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {promediosReg.map((r) => (
                  <tr key={r.modelo} className={clsx(r.modelo === 'Regresión lineal' && 'bg-primary/5')}>
                    <td className="py-2.5 font-medium">{r.modelo}</td>
                    <td className="py-2.5 text-right font-mono num">{r.rmse.toFixed(3)}</td>
                    <td className="py-2.5 text-right font-mono num">{r.mae.toFixed(3)}</td>
                    <td className="py-2.5 text-right font-mono num">{r.r.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card tone="accent">
          <CardHead title="¿Por qué clasificación?" />
          <div className="p-5 pt-3 space-y-3 text-sm">
            <p className="text-muted-foreground">Los modelos de clasificación detectan más casos de reprobación desde el primer mes. La regresión se descartó como modelo principal, pero puede <strong className="text-foreground">complementarlo</strong>:</p>
            <div className="rounded-md border border-warn/40 bg-warn/10 p-3 text-xs">
              Un estudiante clasificado <strong>sin riesgo</strong> pero con una <strong>nota estimada baja</strong> merece revisión y seguimiento.
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- Importancia
export function ImportanciaScene() {
  const { p, axis, grid, tooltip } = useChartStyle()
  const [enfoque, setEnfoque] = useState<'Clasificación' | 'Regresión'>('Clasificación')
  const lista = enfoque === 'Clasificación' ? modelos : modelosReg
  const [modelo, setModelo] = useState<string>('Random Forest')
  const fuente = enfoque === 'Clasificación' ? importanciaClf : importanciaReg
  const m = (lista as readonly string[]).includes(modelo) ? modelo : 'Random Forest'
  const matriz = fuente[m]
  const trend = meses.map((mes, i) => ({
    mes: mesCorto(mes),
    intento: matriz[i][0],
    acumulado: matriz[i][1],
    examenes: +(matriz[i][2] + matriz[i][3]).toFixed(2),
    perfil: +(matriz[i][4] + matriz[i][5] + matriz[i][6]).toFixed(2),
  }))
  const series = [
    { k: 'intento', label: 'Número de intento', c: p.bad },
    { k: 'acumulado', label: '% acumulado en actividades', c: p.primary },
    { k: 'examenes', label: 'Exámenes parciales', c: p['chart-2'] },
    { k: 'perfil', label: 'PAA + colegio + título', c: p['chart-5'] },
  ]

  return (
    <section className="space-y-6">
      <SceneHeader
        eyebrow="Resultados · Variables influyentes"
        title="Al inicio pesa el historial; después, el rendimiento"
        intro="En enero, con poca información del curso, los modelos de clasificación dan más importancia al número de intento. Con el paso de los meses toman protagonismo el porcentaje acumulado y los exámenes parciales, mientras la PAA, el colegio y el título pierden peso hasta ser casi nulos."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Segmented label="Enfoque" value={enfoque} options={['Clasificación', 'Regresión'] as const} onChange={setEnfoque} />
        <Segmented label="Modelo" value={m} options={lista as readonly string[]} onChange={setModelo} />
      </div>

      <div className="grid lg:grid-cols-[1.25fr_1fr] gap-4">
        <Card>
          <CardHead title={`Importancia normalizada · ${m}`} hint="Cada columna suma 1. Valores leídos de las figuras 6.6 a 6.15; solo se comparan dentro del mismo modelo." />
          <div className="p-5 pt-3 overflow-x-auto">
            <table className="w-full text-xs min-w-[420px]">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left font-medium py-1.5 pr-2">Variable</th>
                  {meses.map((mes) => <th key={mes} className="font-medium py-1.5 text-center w-[16%]">{mesCorto(mes)}</th>)}
                </tr>
              </thead>
              <tbody>
                {variablesImp.map((v, vi) => (
                  <tr key={v}>
                    <td className="py-1 pr-2 whitespace-nowrap">{v}</td>
                    {meses.map((_, mi) => {
                      const val = matriz[mi][vi]
                      const na = mi === 0 && (vi === 2 || vi === 3) || (mi === 1 && vi === 3)
                      return (
                        <td key={mi} className="p-0.5">
                          <div
                            className="rounded px-1.5 py-1.5 text-center font-mono num"
                            style={{ background: na ? 'transparent' : `color-mix(in srgb, ${p.primary} ${Math.round(8 + val * 62)}%, transparent)`, color: p.foreground, fontWeight: val >= 0.3 ? 600 : 400 }}
                          >
                            {na ? <span className="text-muted-foreground">–</span> : val.toFixed(2)}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHead title="Tendencia a lo largo del semestre" hint="Importancia agrupada por tipo de variable." />
          <div className="h-64 px-2 pt-3">
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ right: 20, left: -12, top: 8 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="mes" {...axis} />
                <YAxis domain={[0, 1]} {...axis} />
                <Tooltip {...tooltip} formatter={(v: number, n: string) => [v.toFixed(2), series.find((s) => s.k === n)?.label ?? n]} />
                {series.map((s) => <Line key={s.k} dataKey={s.k} stroke={s.c} strokeWidth={2.25} dot={{ r: 3, fill: s.c }} />)}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-4 pt-2"><Legend items={series.map((s) => ({ label: s.label, color: s.c }))} /></div>
        </Card>
      </div>

      <Card tone="accent">
        <div className="p-5 grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="eyebrow">Clasificación</p>
            <p className="text-muted-foreground">El número de intento es la variable con mayor capacidad predictiva en los primeros meses: ayuda a saber <strong className="text-foreground">si</strong> un estudiante va a reprobar.</p>
          </div>
          <div className="space-y-1">
            <p className="eyebrow">Regresión</p>
            <p className="text-muted-foreground">El porcentaje acumulado domina desde enero; el intento aporta poco para estimar <strong className="text-foreground">la nota exacta</strong>.</p>
          </div>
        </div>
      </Card>
    </section>
  )
}
