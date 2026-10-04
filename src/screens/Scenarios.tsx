import { useEffect, useState, type ReactNode } from 'react'
import { DecisionBadge, Card, LevelBadge, Metric, ScreenHeader, Tag } from '../components/ui'
import { PhoneMock } from '../components/PhoneMock'
import { ScenarioPicker } from '../components/ScenarioPicker'
import { CASE } from '../lib/data'
import { scenarioEcon } from '../lib/econ'
import { vnd } from '../lib/format'
import { useStore } from '../lib/store'

const STAGES = ['Input data', 'Risk assessment', 'Decision', 'Offer', 'Economic result']

function Pane({ title, tone, children }: { title: string; tone: 'red' | 'blue'; children: ReactNode }) {
  return (
    <div className={`animate-flow rounded-lg border p-3 ${tone === 'red' ? 'border-hred-600/30 bg-hred-50/40' : 'border-navy-600/30 bg-sky-50'}`}>
      <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${tone === 'red' ? 'text-hred-600' : 'text-navy-700'}`}>{title}</p>
      {children}
    </div>
  )
}

export function Scenarios() {
  const { scenario: s, result: r, ec } = useStore()
  const [stage, setStage] = useState(0)
  const e = scenarioEcon(s, r, ec)

  // Start from the first step whenever a different customer is picked
  useEffect(() => { setStage(0) }, [s.id])
  const next = () => setStage((v) => Math.min(4, v + 1))
  const restart = () => setStage(0)

  const i = s.inputs
  const curBad = s.current.outcome !== 'Approve'

  return (
    <div>
      <ScreenHeader n={3} title="Run a customer scenario" question="Pick a synthetic customer, then tap through the phone at your own pace: input → risk → decision → offer → economics. Current treatment is shown next to the proposed one.">
        <button onClick={restart} className="rounded-md bg-hred-600 px-4 py-2 text-sm font-semibold text-white hover:bg-hred-700">Restart</button>
      </ScreenHeader>
      <ScenarioPicker compact />
      <p className="mt-2 text-xs text-slate-500">Dot colour = proposed-engine outcome with current thresholds. Customers are synthetic <Tag kind="assumption" />.</p>

      <Card className="mt-4" title={<>Scenario {s.id}: {s.name}</>} sub={s.blurb} right={<span className="text-xs text-slate-500">Requests {vnd(s.requested)} VND over {s.tenure} months</span>}>
        <ol className="mb-4 flex flex-wrap gap-1.5" aria-label="Simulation progress">
          {STAGES.map((t, k) => (
            <li key={t}>
              <button onClick={() => setStage(k)} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${k < stage ? 'bg-navy-900 text-white' : k === stage ? 'animate-pulseRing bg-sky-200 text-navy-900' : 'bg-sky-100 text-slate-400 hover:text-slate-600'}`}>
                <span>{k + 1}</span>{t}
              </button>
            </li>
          ))}
        </ol>

        <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {stage >= 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              <Pane title="Current: what the officer sees" tone="red">
                <ul className="space-y-1 text-xs text-slate-700">
                  <li><b>Documents:</b> {s.docs}</li>
                  <li><b>CIC:</b> {i.cic === 'good' ? 'Good history' : i.cic === 'poor' ? 'Late payments' : i.cic === 'thin' ? 'Limited history' : 'No file'}</li>
                  <li><b>Digital cash-flow, device, behaviour:</b> not used</li>
                </ul>
              </Pane>
              <Pane title="Proposed: what the engine sees (consented)" tone="blue">
                <ul className="space-y-1 text-xs text-slate-700">
                  <li><b>Income:</b> {vnd(i.monthlyIncome)}/month, steadiness {i.incomeConsistency}, repeating {i.recurringShare}%</li>
                  <li><b>Digital:</b> {i.platformIncome ? `platform ${vnd(i.platformIncome)}/mo · ` : ''}{i.ecommerceSales ? `online sales ${vnd(i.ecommerceSales)}/mo · ` : ''}wallet activity {i.ewalletActivity}, {i.txPerMonth} tx/month</li>
                  <li><b>Identity / fraud:</b> match {i.identityMatch}, device risk {i.deviceRisk}, duplicates {i.duplicateSignals}</li>
                  <li><b>Data completeness:</b> {i.dataCompleteness}%</li>
                </ul>
              </Pane>
            </div>
          )}
          {stage >= 1 && (
            <div className="grid gap-3 md:grid-cols-2">
              <Pane title="Current: risk view" tone="red"><p className="text-xs text-slate-700">{s.current.why}</p></Pane>
              <Pane title="Proposed: three separate risks" tone="blue">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div><p className="mb-1 text-slate-500">Identity</p><span className={`rounded px-2 py-0.5 font-semibold ${r.identityVerified ? 'bg-ok-50 text-ok-600' : 'bg-hred-50 text-hred-600'}`}>{r.identityVerified ? 'VERIFIED' : 'FAILED'}</span></div>
                  <div><p className="mb-1 text-slate-500">Fraud</p><LevelBadge level={r.fraudLevel} /></div>
                  <div><p className="mb-1 text-slate-500">Credit (PD {r.pd.toFixed(1)}%)</p><LevelBadge level={r.creditLevel} /></div>
                </div>
                <p className="mt-2 text-xs text-slate-600">Repayment ability: <b>{r.affordability === 'FAIL' ? 'FAIL' : 'PASS'}</b> (debt burden {r.burden.toFixed(0)}%) · Confidence <b>{r.confidence.toFixed(0)}</b></p>
              </Pane>
            </div>
          )}
          {stage >= 2 && (
            <div className="grid gap-3 md:grid-cols-2">
              <Pane title="Current: decision" tone="red">
                <p className={`text-base font-semibold ${curBad ? 'text-hred-600' : 'text-ok-600'}`}>{s.current.outcome}</p>
                <p className="text-xs text-slate-600">after ~{s.current.tatDays.toFixed(1)} business days <Tag kind="sim" /></p>
              </Pane>
              <Pane title="Proposed: decision" tone="blue">
                <DecisionBadge d={r.decision} big />
                <p className="mt-1 text-xs text-slate-600">in under {ec.proposedMinutes} minutes <Tag kind="assumption" /></p>
                <p className="mt-2 text-xs text-slate-700">{r.reason}</p>
              </Pane>
            </div>
          )}
          {stage >= 3 && (
            <div className="grid gap-3 md:grid-cols-2">
              <Pane title="Current: offer" tone="red">
                <p className="text-xs text-slate-700">{s.current.outcome === 'Approve' ? `${vnd(s.requested)} over ${s.tenure} months after the wait.` : s.current.outcome === 'Approve (fraud missed)' ? 'Loan would be issued to a fraudster.' : 'No offer. The customer leaves or waits for documents.'}</p>
              </Pane>
              <Pane title="Proposed: offer" tone="blue">
                {r.offer ? (
                  <>
                    <p className="text-sm font-semibold text-navy-900">{vnd(r.offer.amount)} VND · {r.offer.tenure} months</p>
                    <p className="text-xs text-slate-600">Monthly payment ≈ {vnd(r.offer.installment)}/month · indicative APR {r.offer.apr}% <Tag kind="assumption" /></p>
                    <p className="mt-1 text-xs text-slate-600">{r.offer.note}{r.decision === 'Review' ? ' Subject to human review.' : ''}</p>
                  </>
                ) : <p className="text-xs text-slate-700">No offer. Customer receives a plain reason and, where data was missing, a route to resubmit.</p>}
              </Pane>
            </div>
          )}
          {stage >= 4 && (
            <div className="grid gap-3 md:grid-cols-2">
              <Pane title="Current: contribution per application" tone="red">
                <p className={`text-xl font-semibold tabular-nums ${e.current.net < 0 ? 'text-hred-600' : 'text-ok-600'}`}>{vnd(e.current.net)} VND <Tag kind="sim" /></p>
                <p className="text-xs text-slate-600">Includes 380K review cost <Tag kind="case" />. {e.current.note}</p>
              </Pane>
              <Pane title="Proposed: contribution per application" tone="blue">
                <p className={`text-xl font-semibold tabular-nums ${e.proposed.net < 0 ? 'text-hred-600' : 'text-ok-600'}`}>{vnd(e.proposed.net)} VND <Tag kind="sim" /></p>
                <p className="text-xs text-slate-600">Revenue {vnd(e.proposed.revenue)} − funding {vnd(e.proposed.funding)} − processing {vnd(e.proposed.processing)} − expected loss {vnd(e.proposed.loss)}. {e.proposed.note}</p>
              </Pane>
            </div>
          )}
        </div>
        <div className="xl:sticky xl:top-20 xl:self-start">
          <p className="mb-2 text-center text-xs font-semibold text-navy-900">What the customer sees</p>
          <PhoneMock s={s} r={r} step={stage} onNext={next} onRestart={restart} />
          <p className="mt-2 text-center text-[11px] text-slate-500">Tap the buttons on the phone to move to the next step. The panels on the left follow.</p>
        </div>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">Case range for TAT is {CASE.tatMinDays}–{CASE.tatMaxDays} days <Tag kind="case" />; position inside the range, the profile and all outputs are simulated.</p>
      </Card>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Current decision" value={s.current.outcome} tone={curBad ? 'red' : 'green'} tag="sim" />
        <Metric label="Proposed decision" value={r.decision === 'Approve' ? 'Approve' : r.decision === 'Review' ? 'Review' : 'Decline'} tone={r.decision === 'Approve' ? 'green' : r.decision === 'Review' ? 'amber' : 'red'} tag="sim" />
        <Metric label="Time to decision" value={`${s.current.tatDays.toFixed(1)} d → < ${ec.proposedMinutes} min`} tag="sim" />
        <Metric label="Unit cost" value={`380K → ${vnd(r.decision === 'Review' ? ec.proposedCost + CASE.costPerApp * ec.reviewCostPct / 100 : ec.proposedCost)}`} tag="assumption" tip="Current cost is the case benchmark. Proposed cost is an adjustable team assumption (Impact screen)." />
      </div>
    </div>
  )
}
