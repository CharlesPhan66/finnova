import { useState } from 'react'
import { ScreenHeader } from '../components/ui'

const QA: [string, string][] = [
  ['Why is this the bottleneck?', 'Not because approval is slow in itself. The process is built around documents and bureau history, so it cannot use the cash-flow and behavioural data that already exists for thin-file customers. That drives delay, a fixed 380K cost per application, and exclusion of the segments the case highlights. The fixed cost matters most on small tickets.'],
  ['Why alternative data?', 'Those customers have little bureau history but real income and activity. Bank inflows, platform payouts and wallet behaviour are direct evidence of capacity to repay. It is used only with consent and where legally and operationally available.'],
  ['Why AI?', 'To combine many weak, heterogeneous signals, catch nonlinear patterns, output a probability with a confidence level, segment dynamically and flag anomalies. It adds judgement where rules have no single decisive variable. It does not replace policy.'],
  ['Why not simple rules?', 'Fixed thresholds on a few variables either reject good thin-file customers or admit risky ones, and cannot express confidence. Rules stay in the design for hard constraints; the model adds the probability and the confidence that decide who needs a human.'],
  ['How is fraud controlled?', 'Identity and fraud are screened first, scored separately from credit, and a high fraud score declines regardless of how good the credit looks (scenario F). Rules plus anomaly detection, with fraud metrics monitored on screen 10.'],
  ['What happens when the model is uncertain?', 'Confidence below the threshold routes to a credit officer with the evidence pack. With missing data and weak evidence the engine asks for more information or declines. First-time borrowers are never auto-approved.'],
  ['Who owns the final decision?', 'The bank. Policy rules and limits are set and owned by credit risk; the model recommends within them; credit officers decide referrals and can override, and overrides are tracked.'],
  ['How does HLBVN earn?', 'Interest revenue less funding cost, processing cost and expected credit loss. Lower unit cost and faster decisions make small-ticket loans viable; higher conversion adds volume. Contribution is modelled on screen 9 with adjustable assumptions.'],
  ['How is incremental value measured?', 'A controlled test: route a share of applications through the new engine and keep a comparable control on the current process. Compare TAT, cost per application, conversion, approval, STP, default and expected loss, then contribution per application.'],
  ['Deployable in 6–12 months?', 'Plausibly, in phases, as a proposal and not a commitment: start with existing customers and class A data and conservative thresholds with high referral; add consented partner data one source at a time; validate the model and monitoring before widening STP. Timing depends on data agreements and model validation.'],
]

export function JudgeQA() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div>
      <ScreenHeader n={12} title="Why this works: judge Q&A" question="Short answers to the ten questions a credit committee or judge is likely to ask." />
      <ul className="space-y-2">
        {QA.map(([q, a], i) => (
          <li key={q} className="card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center gap-3 px-4 py-3 text-left">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-navy-900 text-xs font-bold text-white">{i + 1}</span>
              <span className="flex-1 text-sm font-semibold text-navy-900">{q}</span>
              <span className="text-navy-600" aria-hidden>{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <p className="border-t border-sky-100 px-4 py-3 pl-[3.25rem] text-sm text-slate-700">{a}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
