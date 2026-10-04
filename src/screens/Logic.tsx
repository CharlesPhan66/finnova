import { Card, DecisionBadge, ScreenHeader, Slider, Tag } from '../components/ui'
import { ScenarioPicker } from '../components/ScenarioPicker'
import { DEFAULT_THRESHOLDS, SCORECARD_NOTE } from '../lib/data'
import type { Rule } from '../lib/engine'
import { useStore } from '../lib/store'

function RuleCard({ title, hint, rules, mode, fired }: { title: string; hint: string; rules: Rule[]; mode: 'all' | 'any'; fired: boolean }) {
  return (
    <div className={`rounded-xl border-2 p-3 transition ${fired ? 'border-navy-700 bg-sky-50 shadow' : 'border-sky-200 bg-white'}`}>
      <div className="mb-1 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-navy-900">{title}</h4>
        {fired && <span className="rounded bg-navy-900 px-2 py-0.5 text-[10px] font-semibold text-white">APPLIES</span>}
      </div>
      <p className="mb-2 text-[11px] text-slate-500">{hint} ({mode === 'all' ? 'ALL must be true' : 'ANY one is enough'})</p>
      <ul className="space-y-1">
        {rules.map((r) => (
          <li key={r.label} className="flex items-start gap-2 text-xs">
            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${r.pass ? 'bg-ok-600' : 'bg-slate-300'}`}>{r.pass ? '✓' : '·'}</span>
            <span className="text-slate-700"><b>{r.label}</b> <span className="text-slate-500">({r.value})</span></span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Logic() {
  const { scenario: s, result: r, th, setTh, ov, setOv } = useStore()
  const stpOk = r.rules.stp.every((x) => x.pass)
  const declineHit = r.rules.decline.some((x) => x.pass)
  const referHit = r.decision === 'Review'
  const set = (k: keyof typeof th) => (n: number) => setTh({ ...th, [k]: n })

  return (
    <div>
      <ScreenHeader n={5} title="Explainable decision logic" question="Every decision shows the rule that fired, the factors for and against, and a plain reason. Never “the AI says no”." />
      <ScenarioPicker compact />
      <p className="mt-2 text-xs text-slate-500">Scorecard: {SCORECARD_NOTE}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <RuleCard title="Approve" hint="Automatic, no person involved" rules={r.rules.stp} mode="all" fired={r.decision === 'Approve'} />
        <RuleCard title="Review" hint="Not an automatic approval and not a decline" rules={r.rules.refer} mode="any" fired={referHit} />
        <RuleCard title="Decline" hint="Hard stops" rules={r.rules.decline} mode="any" fired={declineHit} />
      </div>
      <p className="mt-2 text-[11px] text-slate-500">Rule order: Decline conditions are checked first (they are hard stops owned by policy), then Approve, otherwise Review. {stpOk ? '' : 'Not every Approve condition is met for this customer.'}</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3" title={<>Decision for scenario {s.id}</>} right={<DecisionBadge d={r.decision} big />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-ok-50 p-3">
              <p className="mb-1.5 text-xs font-semibold text-ok-600">Positive factors</p>
              <ul className="space-y-1 text-xs text-slate-700">{r.positives.length ? r.positives.map((p) => <li key={p}>✓ {p}</li>) : <li>None identified</li>}</ul>
            </div>
            <div className="rounded-lg bg-warn-50 p-3">
              <p className="mb-1.5 text-xs font-semibold text-warn-600">{r.decision === 'Decline' ? 'Reasons and risk factors' : 'Risk factors'}</p>
              <ul className="space-y-1 text-xs text-slate-700">{r.risks.length ? r.risks.map((p) => <li key={p}>{r.decision === 'Decline' ? '✕' : '△'} {p}</li>) : <li>None identified</li>}</ul>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3">
            <p className="text-xs font-semibold text-navy-800">Decision explanation</p>
            <p className="mt-1 text-sm text-slate-800">{r.reason}</p>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Missing-data what-if" sub="Applies to the selected customer" right={<Tag kind="sim" />}>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!ov.cicMissing} onChange={(e) => setOv({ ...ov, cicMissing: e.target.checked })} /> CIC unavailable</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!ov.identityFail} onChange={(e) => setOv({ ...ov, identityFail: e.target.checked })} /> Identity verification fails</label>
            <fieldset className="flex flex-wrap items-center gap-3 text-xs">
              <legend className="mb-1 text-xs font-medium text-slate-700">Cash-flow evidence</legend>
              {([['Customer data', null], ['Strong', 'strong'], ['Weak', 'weak']] as const).map(([l, v]) => (
                <label key={l} className="flex items-center gap-1"><input type="radio" name="cf" checked={(ov.cashflow ?? null) === v} onChange={() => setOv({ ...ov, cashflow: v })} />{l}</label>
              ))}
            </fieldset>
            <button onClick={() => setOv({})} className="rounded border border-sky-200 px-2 py-1 text-xs hover:bg-sky-50">Reset</button>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
            <li><b>CIC missing + strong cash-flow:</b> still assessable, confidence is trimmed.</li>
            <li><b>CIC missing + weak cash-flow:</b> refer for more information, or decline if confidence is below the data floor.</li>
            <li><b>Identity fails:</b> stop immediately.</li>
          </ul>
        </Card>
      </div>

      <Card className="mt-4" title="Policy thresholds" sub="Illustrative policy thresholds, team assumption" right={<button onClick={() => setTh(DEFAULT_THRESHOLDS)} className="rounded border border-sky-200 px-2 py-1 text-xs hover:bg-sky-50">Reset defaults</button>}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Slider label="Confidence needed to approve automatically" tip="Lowest confidence at which the engine can approve without a person." value={th.confidenceStp} min={50} max={95} step={1} onChange={set('confidenceStp')} fmt={(n) => `${n}`} />
          <Slider label="Data-sufficiency floor" tip="Below this confidence, with both the credit file and the cash-flow evidence weak, the application is declined with a request for more information." value={th.confidenceFloor} min={10} max={60} step={1} onChange={set('confidenceFloor')} fmt={(n) => `${n}`} />
          <Slider label="Credit risk Low up to PD" value={th.pdLowMax} min={1} max={8} step={0.5} onChange={set('pdLowMax')} fmt={(n) => `${n}%`} />
          <Slider label="Credit risk Medium up to PD" value={th.pdMedMax} min={5} max={20} step={0.5} onChange={set('pdMedMax')} fmt={(n) => `${n}%`} />
          <Slider label="Fraud Low up to score" value={th.fraudLowMax} min={10} max={50} step={1} onChange={set('fraudLowMax')} fmt={(n) => `${n}`} />
          <Slider label="Fraud High from score" value={th.fraudHighMin} min={40} max={90} step={1} onChange={set('fraudHighMin')} fmt={(n) => `${n}`} />
          <Slider label="Identity match minimum" value={th.identityMin} min={70} max={99} step={1} onChange={set('identityMin')} fmt={(n) => `${n}`} />
          <Slider label="Maximum total debt burden" tip="Existing debt service plus the new monthly payment, as % of verified monthly income. A rule to protect customers from over-borrowing." value={th.maxBurden} min={20} max={60} step={1} onChange={set('maxBurden')} fmt={(n) => `${n}%`} />
          <label className="flex items-start gap-2 text-xs text-slate-700">
            <input className="mt-0.5" type="checkbox" checked={th.firstTimeNoStp} onChange={(e) => setTh({ ...th, firstTimeNoStp: e.target.checked })} />
            <span>Hard rule: never auto-approve first-time borrowers (low limit {(th.firstTimeCap / 1e6).toFixed(0)}M) <Tag kind="assumption" /></span>
          </label>
        </div>
      </Card>
    </div>
  )
}
