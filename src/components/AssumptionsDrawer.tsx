import { STATIC_ASSUMPTIONS, type AssumptionItem } from '../lib/data'
import { vndFull } from '../lib/format'
import { useStore } from '../lib/store'
import { Tag } from './ui'

export function AssumptionsDrawer() {
  const { drawer, setDrawer, th, ec } = useStore()
  if (!drawer) return null

  const assumptions: AssumptionItem[] = [
    { kind: 'assumption', label: 'Proposed automated processing cost (X)', value: vndFull(ec.proposedCost), note: 'Adjustable on Impact screen' },
    { kind: 'assumption', label: 'Referral review cost, % of current manual cost', value: `${ec.referralCostPct}%` },
    { kind: 'assumption', label: 'Proposed decision time', value: `${ec.proposedMinutes} minutes (shown as "minutes / near-real-time")`, note: 'Not an HLBVN target' },
    { kind: 'assumption', label: 'Illustrative policy thresholds', value: `STP confidence ≥ ${th.confidenceStp} · data floor ${th.confidenceFloor} · PD low ≤ ${th.pdLowMax}% · PD medium ≤ ${th.pdMedMax}% · fraud low ≤ ${th.fraudLowMax} · fraud high ≥ ${th.fraudHighMin} · identity ≥ ${th.identityMin} · max debt burden ${th.maxBurden}%` },
    { kind: 'assumption', label: 'First-time borrower rule', value: `${th.firstTimeNoStp ? 'No STP' : 'STP allowed'}; conservative limit ${vndFull(th.firstTimeCap)}` },
    { kind: 'assumption', label: 'Indicative pricing (APR)', value: `Low risk ${ec.aprLow}% · Medium risk ${ec.aprMed}%` },
    { kind: 'assumption', label: 'Funding cost / LGD', value: `${ec.funding}% p.a. · LGD ${ec.lgd}%` },
    { kind: 'assumption', label: 'Portfolio inputs on Impact screen', value: 'Approval, STP, conversion, abandonment, default rate, volume, average loan size' },
    { kind: 'assumption', label: 'Customer profiles A–H', value: 'Synthetic customers; no real data. Income, debt and behaviour values are invented for illustration' },
    { kind: 'assumption', label: 'Current-process outcome and TAT per profile', value: 'Each TAT sits inside the case range 1.8–4.6 days; the position inside it is our choice' },
    { kind: 'assumption', label: 'Expected-loss risk curve and EL limit', value: 'PD rises exponentially with riskier applicants; EL limit set on screen 8' },
    { kind: 'assumption', label: 'Monitoring values and limits', value: 'All 12-week series and Green/Amber/Red limits are invented for illustration' },
  ]
  const sims: AssumptionItem[] = [
    { kind: 'sim', label: '380K as % of principal', value: 'Illustrative calculation based on case benchmark (380,000 ÷ requested amount)' },
    { kind: 'sim', label: 'PD, fraud score, confidence, affordability, decision, offer', value: 'Computed live by the rule + score engine for each profile' },
    { kind: 'sim', label: 'Contribution, expected loss, cost reduction, approval and STP impact', value: 'Computed from case facts and team assumptions; not HLBVN results' },
    { kind: 'sim', label: 'Monitoring status (Green / Amber / Red)', value: 'Computed against the invented limits' },
  ]
  const groups: [string, AssumptionItem[], 'case' | 'assumption' | 'sim'][] = [
    ['Case facts', STATIC_ASSUMPTIONS, 'case'],
    ['Team assumptions (live values)', assumptions, 'assumption'],
    ['Simulated outputs', sims, 'sim'],
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Assumptions">
      <button aria-label="Close assumptions" className="absolute inset-0 bg-navy-950/40" onClick={() => setDrawer(false)} />
      <aside className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-navy-900 px-4 py-3 text-white">
          <div>
            <h2 className="text-base font-semibold">Assumptions register</h2>
            <p className="text-xs text-sky-200">Facts, assumptions and simulated outputs are kept separate</p>
          </div>
          <button onClick={() => setDrawer(false)} className="rounded bg-white/10 px-2.5 py-1 text-sm hover:bg-white/20">Close</button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {groups.map(([title, items, kind]) => (
            <div key={title}>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-900">{title}<Tag kind={kind} /></h3>
              <ul className="space-y-2">
                {items.map((a) => (
                  <li key={a.label} className="rounded-lg border border-sky-200 p-2.5">
                    <p className="text-xs font-semibold text-slate-800">{a.label}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{a.value}</p>
                    {a.note && <p className="mt-0.5 text-[11px] text-slate-400">{a.note}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="rounded-lg bg-hred-50 p-3 text-xs text-hred-700">
            This is a simulation for a business case competition. Nothing shown here is an HLBVN result, target or policy, and no real customer data is used.
          </p>
        </div>
      </aside>
    </div>
  )
}
