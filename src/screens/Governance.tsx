import { Card, ScreenHeader, Tag } from '../components/ui'

type Cls = 'A' | 'B' | 'C'
const CLS: Record<Cls, { label: string; cls: string }> = {
  A: { label: 'A · Case-provided / existing', cls: 'bg-navy-900 text-white' },
  B: { label: 'B · Potential via partners + consent', cls: 'bg-sky-200 text-navy-900' },
  C: { label: 'C · Team assumption / future', cls: 'bg-warn-50 text-warn-600 ring-1 ring-warn-600/30' },
}

const ROWS: { src: string; cls: Cls; use: string; cond: string }[] = [
  { src: 'CIC / credit bureau', cls: 'A', use: 'Traditional credit history, existing loans', cond: 'Case-supported traditional credit data. Short or empty for the target customer groups.' },
  { src: 'Existing HLB transaction data', cls: 'A', use: 'Salary, balances, spending, repayments', cond: 'Case-supported and reasonable for existing customers only. Internal use rules still apply.' },
  { src: 'Platform income (gig / marketplace payouts)', cls: 'B', use: 'Recurring income of gig workers and merchants', cond: 'Requires partner agreement and customer consent; subject to legality and availability.' },
  { src: 'E-wallet activity', cls: 'B', use: 'Transaction frequency and cash-flow behaviour', cond: 'Digital footprint example from the case. Needs consent, a legal basis, available data and a workable process.' },
  { src: 'Telecom / utility payment behaviour', cls: 'B', use: 'Payment regularity for first-time borrowers', cond: 'Only where appropriate and legally permissible, with consent. Availability uncertain.' },
  { src: 'Online sales history (e-commerce)', cls: 'B', use: 'Merchant revenue and recurrence', cond: 'Via marketplace partners and merchant consent.' },
  { src: 'Device and behavioural signals', cls: 'C', use: 'Application-fraud screening', cond: 'Assumed collectable in the checkout journey; design and privacy review needed.' },
  { src: 'Repeat-application and shared fraud signals', cls: 'C', use: 'Duplicate and suspicious application detection', cond: 'Future source. Depends on banks agreeing to share data.' },
  { src: 'Outcome data from this lending line', cls: 'C', use: 'Updating and monitoring the scorecard', cond: 'Builds up after launch. At the start we use simple stand-ins and cautious limits.' },
]

export function Governance() {
  return (
    <div>
      <ScreenHeader n={11} title="Data governance" question="Which data do we rely on, and how sure are we that HLBVN can actually use it? Nothing here implies HLBVN already holds every source or has regulatory approval." />
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(CLS) as Cls[]).map((k) => <span key={k} className={`rounded px-2.5 py-1 text-xs font-semibold ${CLS[k].cls}`}>{CLS[k].label}</span>)}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead><tr className="border-b border-sky-200 text-[11px] uppercase tracking-wide text-slate-500"><th className="py-2">Data source</th><th>Class</th><th>Used for</th><th>Conditions</th></tr></thead>
            <tbody className="divide-y divide-sky-100 align-top">
              {ROWS.map((r) => (
                <tr key={r.src}>
                  <td className="py-2.5 pr-3 font-medium text-slate-800">{r.src}</td>
                  <td className="pr-3"><span className={`whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold ${CLS[r.cls].cls}`}>{r.cls}</span></td>
                  <td className="pr-3 text-xs text-slate-700">{r.use}</td>
                  <td className="text-xs text-slate-600">{r.cond}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="Guardrails">
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li>Consent is captured before any data beyond the credit bureau is read, and the customer sees what is used.</li>
            <li>No regulatory approval is claimed for any source. Legal review per source is a launch gate.</li>
            <li>If a class B source is unavailable, the engine falls back to class A data and lowers confidence, routing more cases to humans.</li>
          </ul>
        </Card>
        <Card title="What this prototype uses" right={<Tag kind="sim" />}>
          <p className="text-sm text-slate-700">Only invented, synthetic customer profiles. No real data, no connection to partners, credit bureaus or HLBVN systems.</p>
        </Card>
      </div>
    </div>
  )
}
