import type { ReactNode } from 'react'
import { Card, LevelBadge, ScreenHeader, StatusPill } from '../components/ui'
import { ScenarioPicker } from '../components/ScenarioPicker'
import { useStore } from '../lib/store'

function Ctl({ n, title, q, control, status }: { n: number; title: string; q: string; control: string; status: ReactNode }) {
  return (
    <div className="card flex flex-col p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-navy-900"><span className="mr-1.5 rounded bg-navy-900 px-1.5 py-0.5 text-[11px] text-white">{n}</span>{title}</h3>
        {status}
      </div>
      <p className="text-xs italic text-slate-500">{q}</p>
      <p className="mt-2 text-xs text-slate-700"><b>Control:</b> {control}</p>
    </div>
  )
}

export function RiskControl() {
  const { scenario: s, result: r, th } = useStore()
  return (
    <div>
      <ScreenHeader n={7} title="Risk control panel" question="How would a credit committee see this controlled? Seven separate risks, each with its own control. Status below is live for the selected customer." />
      <ScenarioPicker compact />
      <p className="mt-2 text-xs text-slate-500">Showing status for scenario {s.id}: {s.name}.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Ctl n={1} title="Identity risk" q="Is the applicant who they claim to be?" control="Identity verification against the application; a failure stops processing." status={<StatusPill ok={r.identityVerified} yes="VERIFIED" no="FAILED" />} />
        <Ctl n={2} title="Application fraud" q="Is this application genuine?" control="Fraud rules plus checks for unusual device, behaviour and repeat applications. Kept separate from credit risk." status={<LevelBadge level={r.fraudLevel} />} />
        <Ctl n={3} title="Credit risk" q="Can and will the customer repay?" control="Credit score plus cash-flow assessment plus repayment ability." status={<LevelBadge level={r.creditLevel} />} />
        <Ctl n={4} title="Model uncertainty" q="How sure is the model?" control={`Confidence threshold (${th.confidenceStp}) routes uncertain cases to a human.`} status={<span className={`rounded px-2 py-0.5 text-xs font-semibold ${r.confidence >= th.confidenceStp ? 'bg-ok-50 text-ok-600' : 'bg-warn-50 text-warn-600'}`}>{r.confidence.toFixed(0)} · {r.confidenceLevel.toUpperCase()}</span>} />
        <Ctl n={5} title="Data quality" q="Is the data complete and consistent?" control="Checks for missing data and backup rules: weak data lowers confidence and triggers review or a request for information." status={<span className={`rounded px-2 py-0.5 text-xs font-semibold ${s.inputs.dataCompleteness >= 80 ? 'bg-ok-50 text-ok-600' : s.inputs.dataCompleteness >= 65 ? 'bg-warn-50 text-warn-600' : 'bg-hred-50 text-hred-600'}`}>{s.inputs.dataCompleteness}% COMPLETE</span>} />
        <Ctl n={6} title="Responsible lending (no over-borrowing)" q="Can the customer afford this without hardship?" control={`Repayment ability constraint: total debt burden capped at ${th.maxBurden}% of income; amount or tenure adjusted, or decline.`} status={<StatusPill ok={r.affordability !== 'FAIL'} yes={r.affordability === 'REDUCED' ? 'PASS (REDUCED)' : 'PASS'} />} />
        <Ctl n={7} title="Model risk" q="What if the model itself is wrong or drifts?" control="Monitoring (screen 10), tracking of overrides, regular re-checks of the scorecard, and rules that cap how much we lend whatever the score says." status={<span className="rounded bg-sky-100 px-2 py-0.5 text-xs font-semibold text-navy-800">PROGRAMME-LEVEL</span>} />
      </div>
      <Card className="mt-4" title="How the controls combine for this customer">
        <p className="text-sm text-slate-700">{r.reason}</p>
      </Card>
    </div>
  )
}
