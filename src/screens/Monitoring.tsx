import { useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts'
import { Card, ScreenHeader, Tag, Tip } from '../components/ui'

type Mode = 'normal' | 'drift' | 'fraud'
type St = 'GREEN' | 'AMBER' | 'RED'

interface M { k: string; unit: string; base: number; amber: number; red: number; dir: 'high' | 'low'; tip: string; drift?: number; fraud?: number; d: number }

const METRICS: M[] = [
  { k: 'Approval rate', unit: '%', base: 52, amber: 60, red: 66, dir: 'high', tip: 'Watch for a rise. Approving more without better risk data can mean the rules are getting too loose.', drift: 1.1, d: 0 },
  { k: 'Automatic decision rate', unit: '%', base: 40, amber: 34, red: 27, dir: 'low', tip: 'Share of applications decided with no person involved (also called STP, straight-through processing).', fraud: 0.8, d: 0 },
  { k: 'Manual review rate', unit: '%', base: 22, amber: 30, red: 38, dir: 'high', tip: 'Share of applications sent to a credit officer.', fraud: 1.5, drift: 1.3, d: 0 },
  { k: 'Decision TAT', unit: 'min', base: 5, amber: 10, red: 20, dir: 'high', tip: 'Typical time to reach a decision for automatic applications.', fraud: 1.2, d: 1 },
  { k: 'Default rate', unit: '%', base: 4.5, amber: 5.5, red: 7, dir: 'high', tip: 'Customers who stop paying early, among newly approved loans.', drift: 1.4, d: 1 },
  { k: 'NPL ratio', unit: '%', base: 2.8, amber: 3.5, red: 5, dir: 'high', tip: 'Bad loans as a share of all loans.', drift: 1.3, d: 1 },
  { k: 'Expected loss', unit: '% paid out', base: 1.7, amber: 2.0, red: 3.0, dir: 'high', tip: 'Compared with the loss limit set on screen 8.', drift: 1.5, d: 2 },
  { k: 'Fraud rate', unit: '% of apps', base: 0.6, amber: 0.9, red: 1.5, dir: 'high', tip: 'Applications confirmed as fraud.', fraud: 3, d: 2 },
  { k: 'False positives', unit: '% good declined', base: 1.8, amber: 2.5, red: 4, dir: 'high', tip: 'Good customers wrongly declined by fraud or credit rules.', fraud: 1.5, d: 1 },
  { k: 'False negatives', unit: '% fraud passed', base: 0.2, amber: 0.35, red: 0.6, dir: 'high', tip: 'Fraud that passed the checks and was found later.', fraud: 3, d: 2 },
  { k: 'Model drift (PSI)', unit: 'index', base: 0.06, amber: 0.1, red: 0.25, dir: 'high', tip: 'How much the scores have shifted compared with the period the scorecard was built on.', drift: 4.5, d: 2 },
  { k: 'Data drift (PSI)', unit: 'index', base: 0.05, amber: 0.1, red: 0.25, dir: 'high', tip: 'How much the incoming data has changed, for example when a partner changes its data.', drift: 5.5, d: 2 },
  { k: 'Override rate', unit: '% of reviews', base: 6, amber: 10, red: 15, dir: 'high', tip: 'How often officers change the engine\'s recommendation. A high number means people and the engine disagree.', drift: 1.9, d: 1 },
]

const status = (m: M, v: number): St => {
  if (m.dir === 'high') return v >= m.red ? 'RED' : v >= m.amber ? 'AMBER' : 'GREEN'
  return v <= m.red ? 'RED' : v <= m.amber ? 'AMBER' : 'GREEN'
}
const cls = { GREEN: 'bg-ok-50 text-ok-600', AMBER: 'bg-warn-50 text-warn-600', RED: 'bg-hred-50 text-hred-600' }
const meaning = { GREEN: 'Within policy', AMBER: 'Needs review', RED: 'Risk threshold breached' }
const stroke = { GREEN: '#12805c', AMBER: '#b7791f', RED: '#c8102e' }

const noise = (i: number, j: number) => Math.sin((i + 1) * 12.9898 + (j + 1) * 78.233) * 0.5

export function Monitoring() {
  const [mode, setMode] = useState<Mode>('normal')

  const data = useMemo(() => METRICS.map((m, i) => {
    const f = mode === 'drift' ? m.drift ?? 1 : mode === 'fraud' ? m.fraud ?? 1 : 1
    const series = Array.from({ length: 12 }, (_, w) => {
      const ramp = f === 1 ? 0 : Math.max(0, (w - 7) / 4)
      const v = m.base * (1 + noise(i, w) * 0.05) * (1 + (f - 1) * ramp)
      return { w, v }
    })
    const v = series[11].v
    return { m, series, v, st: status(m, v) }
  }), [mode])

  const counts = { GREEN: 0, AMBER: 0, RED: 0 }
  data.forEach((d) => counts[d.st]++)

  return (
    <div>
      <ScreenHeader n={10} title="Monitoring dashboard" question="How would the committee know early that the model, the data or the portfolio is moving outside policy?" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-600">Simulate:</span>
        {([['normal', 'Normal operation'], ['drift', 'Data / model drift'], ['fraud', 'Fraud wave']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} aria-pressed={mode === k} className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${mode === k ? 'border-navy-700 bg-navy-900 text-white' : 'border-sky-200 bg-white hover:border-navy-600'}`}>{l}</button>
        ))}
        <span className="ml-auto flex items-center gap-2 text-xs">
          {(['GREEN', 'AMBER', 'RED'] as const).map((s) => <span key={s} className={`rounded px-2 py-1 font-semibold ${cls[s]}`}>{counts[s]} {s}</span>)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.map(({ m, series, v, st }) => (
          <Card key={m.k}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-700"><Tip text={m.tip}>{m.k}</Tip></p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-navy-900">{v.toFixed(m.d)}<span className="ml-1 text-xs font-normal text-slate-500">{m.unit}</span></p>
              </div>
              <span title={meaning[st]} className={`rounded px-2 py-0.5 text-[11px] font-bold ${cls[st]}`}>{st}</span>
            </div>
            <div className="mt-2 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Line dataKey="v" stroke={stroke[st]} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">{meaning[st]} · amber {m.dir === 'high' ? '≥' : '≤'} {m.amber} · red {m.dir === 'high' ? '≥' : '≤'} {m.red}</p>
          </Card>
        ))}
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500"><Tag kind="sim" /> The 12-week numbers and limits are made up to show how the warnings work. <b>Green</b> within policy · <b>Amber</b> needs review · <b>Red</b> risk threshold breached, with a set response (stop automatic approvals for the affected group, tighten the limits, re-check the scorecard).</p>
    </div>
  )
}
