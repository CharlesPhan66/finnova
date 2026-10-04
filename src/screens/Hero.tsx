import { useEffect, useState } from 'react'
import { Card, ScreenHeader, Tag } from '../components/ui'
import { CASE } from '../lib/data'
import { useStore } from '../lib/store'

const CURRENT = [
  { t: 'Customer', d: 'Applies at branch or after checkout' },
  { t: 'Documents', d: 'Physical or scanned pack' },
  { t: 'Manual verification', d: 'Checked line by line' },
  { t: 'CIC', d: 'Credit history only' },
  { t: 'Credit officer', d: 'Centralized manual review' },
  { t: 'Decision', d: 'Often a decline for thin files' },
]
const PROPOSED = [
  { t: 'Customer', d: 'Applies at checkout' },
  { t: 'Consent', d: 'Customer approves data use' },
  { t: 'Digital data', d: 'Bank, work platform, e-wallet, credit bureau' },
  { t: 'Identity + Fraud', d: 'Screened before credit' },
  { t: 'Cash-flow + Credit + Repayment ability', d: 'Assessed together, scored separately' },
  { t: 'Decision engine', d: 'Scorecard + policy rules' },
  { t: 'Approve / Review / Decline', d: 'Confidence decides the route' },
]

function Flow({ steps, active, tone }: { steps: { t: string; d: string }[]; active: number; tone: 'red' | 'blue' }) {
  const on = tone === 'red' ? 'border-hred-600 bg-hred-50' : 'border-navy-600 bg-sky-100'
  const dot = tone === 'red' ? 'bg-hred-600' : 'bg-navy-700'
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => {
        const lit = i < active
        return (
          <li key={s.t} className="relative flex gap-3 pb-3 last:pb-0">
            {i < steps.length - 1 && <span className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5 ${i < active - 1 ? dot : 'bg-sky-200'}`} />}
            <span className={`z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white transition-colors ${lit ? dot : 'bg-slate-300'}`}>{i + 1}</span>
            <div className={`flex-1 rounded-lg border px-3 py-2 transition-all ${lit ? `${on} animate-flow` : 'border-sky-200 bg-white opacity-70'}`}>
              <p className="text-sm font-semibold text-navy-900">{s.t}</p>
              <p className="text-xs text-slate-600">{s.d}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function Hero() {
  const { ec } = useStore()
  const [step, setStep] = useState(7)
  const [play, setPlay] = useState(false)

  useEffect(() => {
    if (!play) return
    const id = window.setInterval(() => {
      setStep((s) => {
        if (s >= 7) { setPlay(false); return 7 }
        return s + 1
      })
    }, 650)
    return () => window.clearInterval(id)
  }, [play])

  const run = () => { setStep(0); setPlay(true) }

  return (
    <div>
      <ScreenHeader n={1} title="Baseline vs Proposed underwriting" question="The bottleneck is not that approval is slow. A document-centric manual process cannot use the digital cash-flow and behavioural data that already exists for customers with little credit history.">
        <button onClick={run} className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">{play ? 'Playing…' : 'Play both journeys'}</button>
      </ScreenHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Current: document-centric manual underwriting" sub="Built for branch lending" right={<Tag kind="case" />} className="border-t-4 border-t-hred-600">
          <Flow steps={CURRENT} active={Math.min(step, 6)} tone="red" />
          <div className={`mt-4 grid grid-cols-2 gap-3 transition-opacity ${step >= 6 ? 'opacity-100' : 'opacity-30'}`}>
            <div className="rounded-lg bg-hred-50 p-3 text-center">
              <p className="text-2xl font-bold text-hred-600">{CASE.tatMinDays}–{CASE.tatMaxDays} days</p>
              <p className="text-xs text-slate-600">Decision TAT (business days)</p>
            </div>
            <div className="rounded-lg bg-hred-50 p-3 text-center">
              <p className="text-2xl font-bold text-hred-600">380K</p>
              <p className="text-xs text-slate-600">VND per application</p>
            </div>
          </div>
        </Card>

        <Card title="Proposed: real-time, data-driven underwriting" sub="Scorecard + policy rules + human review" right={<Tag kind="assumption" text="PROPOSED DESIGN" />} className="border-t-4 border-t-navy-700">
          <Flow steps={PROPOSED} active={step} tone="blue" />
          <div className={`mt-4 grid grid-cols-2 gap-3 transition-opacity ${step >= 7 ? 'opacity-100' : 'opacity-30'}`}>
            <div className="rounded-lg bg-sky-100 p-3 text-center">
              <p className="text-2xl font-bold text-navy-800">Near-real-time</p>
              <p className="text-xs text-slate-600">Minutes, not days · assumed {ec.proposedMinutes} min <Tag kind="assumption" /></p>
            </div>
            <div className="rounded-lg bg-sky-100 p-3 text-center">
              <p className="text-2xl font-bold text-navy-800">Automated</p>
              <p className="text-xs text-slate-600">Unit cost set on the Impact screen <Tag kind="assumption" /></p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="The causal chain this simulation demonstrates" className="mt-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-hred-600/30 bg-hred-50/50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-hred-600">Today</p>
            <p className="text-sm text-slate-700">Documents and credit file → manual verification and review → fixed effort per application → slow and costly → <b>limited visibility on customers with little credit history</b> → poor economics for small-ticket point-of-purchase loans.</p>
          </div>
          <div className="rounded-lg border border-navy-600/30 bg-sky-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-700">Proposed</p>
            <p className="text-sm text-slate-700">Consented digital data → identity, fraud, credit and repayment ability assessed separately → scorecard + rules + human review → Approve, Review or Decline → <b>faster decision, lower unit cost, better access, controlled credit risk</b>.</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">Customer mix (<Tag kind="case" />): salaried with history 35.5%, salaried no history 20.5%, gig / platform 15.0%, online merchants 14.5%, first-time borrowers 14.5%. The four groups the case says are hard to assess the old way add up to 64.5% of applications (sum of the case shares).</p>
      </Card>
    </div>
  )
}
