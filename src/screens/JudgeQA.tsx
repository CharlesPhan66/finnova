import { useState } from 'react'
import { ScreenHeader } from '../components/ui'

const QA: [string, string][] = [
  ['Why is this the bottleneck?', 'Not because approval is slow by itself. The process runs on documents and credit-credit history, so it cannot use the money-flow and behaviour data that already exists for customers with little credit history. That causes delay, a fixed 380K cost per application, and many good customers being turned away. A fixed cost hurts most on small loans.'],
  ['Why use data beyond the credit bureau?', 'These customers have little credit history but real income and activity. Bank inflows, platform payouts and wallet activity directly show whether they can repay. We use them only with the customer\'s consent and where the law and the data allow it.'],
  ['Where does AI fit?', 'The decision comes from an illustrative scorecard plus policy rules, with people reviewing grey cases. AI is used for checks from day one (face and live-person check, spotting fraud, choosing who to offer a loan to). An AI credit model runs next to the scorecard as a challenger. It decides nothing until it is proven.'],
  ['Why not only simple rules?', 'Fixed cut-offs on a few numbers either reject good customers with little history or let risky ones through, and they do not say how sure we are. The scorecard combines more signals and gives a confidence level, so we know when a person should look.'],
  ['How is fraud controlled?', 'Identity and fraud are checked first and scored separately from credit. A high fraud score means Decline, even if the credit looks good (scenario F). Fraud numbers are tracked on screen 10.'],
  ['What if the data is missing or the score is unsure?', 'Low confidence sends the case to a credit officer with the evidence. If data is missing and the evidence is weak, we ask for more information or decline. First-time borrowers are never approved automatically.'],
  ['Who owns the final decision?', 'The bank. Credit risk sets the rules and limits. The scorecard recommends within them. Credit officers decide Review cases and can override. Overrides are tracked.'],
  ['How does HLBVN earn money?', 'Interest income, minus funding cost, processing cost and expected credit loss. Lower cost and faster decisions make small loans worth doing, and more customers finish the loan. Screen 9 shows this with settings you can change.'],
  ['How do we measure the extra value?', 'Run a test: send some applications through the new engine and keep a similar group on the current process. Compare decision time, cost per application, approval, drop-out, default and expected loss, then profit per application.'],
  ['Can it launch in 6–12 months?', 'It could, in steps. This is a proposal, not a promise. Start with existing customers and bank data, with low limits and more manual review. Add partner data one source at a time, with consent. Check the scorecard and monitoring before allowing more automatic approvals.'],
]

export function JudgeQA() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div>
      <ScreenHeader n={12} title="Why this works: judge Q&A" question="Short answers to ten questions a credit committee or judge is likely to ask." />
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
