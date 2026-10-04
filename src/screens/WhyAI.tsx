import { Card, ScreenHeader, Tag } from '../components/ui'

const STEPS = [
  { t: 'Data sources', d: 'Bank, credit bureau, partners (with consent)' },
  { t: 'Data intake', d: 'Only after the customer agrees' },
  { t: 'Data quality check', d: 'Missing or conflicting data' },
  { t: 'Features', d: 'Simple numbers built from the data' },
]

export function WhyAI() {
  return (
    <div>
      <ScreenHeader n={6} title="How the engine decides, and where AI fits" question="One story: the decision comes from an illustrative scorecard plus policy rules. People review the grey cases. AI runs next to it as a challenger and does not decide." />

      <Card title="Decision engine = scorecard + policy rules + human review">
        <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <div className="rounded-xl border-2 border-navy-600 bg-sky-50 p-3"><p className="text-sm font-bold text-navy-900">Scorecard <span className="font-normal text-slate-500">(champion)</span></p><p className="mt-1 text-xs text-slate-600">The current decision model. Turns many signals into a chance of default and a confidence level. Simple and easy to explain.</p></div>
          <span className="self-center text-center text-xl font-bold text-navy-700">+</span>
          <div className="rounded-xl border-2 border-navy-600 bg-sky-50 p-3"><p className="text-sm font-bold text-navy-900">Policy rules</p><p className="mt-1 text-xs text-slate-600">Hard limits: identity, fraud block, ability to repay, maximum exposure, regulation.</p></div>
          <span className="self-center text-center text-xl font-bold text-navy-700">+</span>
          <div className="rounded-xl border-2 border-navy-600 bg-sky-50 p-3"><p className="text-sm font-bold text-navy-900">Human review</p><p className="mt-1 text-xs text-slate-600">Credit officers decide the Review cases and can override.</p></div>
          <span className="self-center text-center text-xl font-bold text-hred-600">=</span>
          <div className="rounded-xl bg-navy-900 p-3 text-white"><p className="text-sm font-bold">Decision</p><p className="mt-1 text-xs text-sky-200">Approve · Review · Decline, each with reasons</p></div>
        </div>
        <p className="mt-3 rounded-lg bg-sky-50 p-2 text-xs text-slate-700"><b>The scorecard here is for illustration.</b> Its weights are not fitted to data. They will be re-estimated on the Round 3 dataset.</p>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="AI model is the challenger (runs in parallel)" right={<Tag kind="assumption" text="PROPOSED" />}>
          <ol className="space-y-2 text-sm text-slate-700">
            <li><b>1.</b> The AI model scores the same applications as the scorecard, in the background.</li>
            <li><b>2.</b> Its score is not used for any decision. It is only compared with the scorecard.</li>
            <li><b>3.</b> If it finds good customers the scorecard misses, at the same level of risk, the credit committee can decide to use it. Until then the scorecard decides.</li>
          </ol>
          <p className="mt-3 text-xs text-slate-500">Where AI is used from day one: checking faces and live person, spotting unusual or fraudulent applications, and choosing who to offer a loan to. These are checks, not credit decisions.</p>
        </Card>

        <Card title="Why add an AI challenger at all?">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-sky-200 text-[11px] uppercase tracking-wide text-slate-500"><th className="py-2 pr-2">Question</th><th className="pr-2">Scorecard + rules</th><th>AI challenger</th></tr></thead>
            <tbody className="divide-y divide-sky-100 align-top text-slate-700">
              <tr><td className="py-2 pr-2 font-medium">How many signals</td><td className="pr-2">A limited list</td><td>Many signals together</td></tr>
              <tr><td className="py-2 pr-2 font-medium">Patterns</td><td className="pr-2">Straight-line effects</td><td>Can find more complex patterns</td></tr>
              <tr><td className="py-2 pr-2 font-medium">Explaining</td><td className="pr-2">Easy</td><td>Harder, needs extra tools</td></tr>
              <tr><td className="py-2 pr-2 font-medium">Role</td><td className="pr-2">Decides</td><td>Compared, not used to decide</td></tr>
            </tbody>
          </table>
          <p className="mt-3 rounded-lg bg-hred-50 p-2 text-xs text-hred-700">Rules always own identity failure, fraud block, ability to repay, regulation and maximum exposure.</p>
        </Card>
      </div>

      <Card className="mt-4" title="Proposed architecture" sub="Example design only. HLBVN does not use any of these models today." right={<Tag kind="assumption" text="PROPOSED ARCHITECTURE" />}>
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center">
          {STEPS.map((a) => (
            <div key={a.t} className="contents">
              <div className="flex-1 rounded-lg border border-sky-200 bg-white p-2.5 md:min-w-[8rem]"><p className="text-xs font-semibold text-navy-900">{a.t}</p><p className="text-[11px] text-slate-500">{a.d}</p></div>
              <span className="text-center text-navy-600">➜</span>
            </div>
          ))}
          <div className="flex-[2] space-y-2 md:min-w-[11rem]">
            <div className="rounded-lg border-2 border-navy-600 bg-sky-50 p-2.5"><p className="text-xs font-semibold text-navy-900">Credit scorecard</p><p className="text-[11px] text-slate-500">Decides (illustrative weights)</p></div>
            <div className="rounded-lg border-2 border-hred-600/60 bg-hred-50/50 p-2.5"><p className="text-xs font-semibold text-navy-900">Fraud checks</p><p className="text-[11px] text-slate-500">Rules + unusual-pattern detection</p></div>
            <div className="rounded-lg border-2 border-dashed border-navy-600/50 bg-white p-2.5"><p className="text-xs font-semibold text-navy-900">AI challenger</p><p className="text-[11px] text-slate-500">Shadow mode, compare only</p></div>
          </div>
          <span className="text-center text-navy-600">➜</span>
          <div className="flex-1 rounded-lg border border-sky-200 bg-white p-2.5"><p className="text-xs font-semibold text-navy-900">Repayment ability</p><p className="text-[11px] text-slate-500">Rule-based budget check</p></div>
          <span className="text-center text-navy-600">➜</span>
          <div className="flex-1 rounded-lg border border-sky-200 bg-white p-2.5"><p className="text-xs font-semibold text-navy-900">Confidence</p><p className="text-[11px] text-slate-500">How complete and consistent the data is</p></div>
          <span className="text-center text-navy-600">➜</span>
          <div className="flex-1 rounded-lg border border-sky-200 bg-white p-2.5"><p className="text-xs font-semibold text-navy-900">Policy rules</p><p className="text-[11px] text-slate-500">Hard limits and thresholds</p></div>
          <span className="text-center text-navy-600">➜</span>
          <div className="flex-1 rounded-lg bg-navy-900 p-2.5 text-white"><p className="text-xs font-semibold">Decision</p><p className="text-[11px] text-sky-200">Approve / Review / Decline</p></div>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">After the decision: offer, acceptance, payout, loan monitoring, results, and back into the data. See screen 10. This prototype scores with a simple formula, not a trained model.</p>
      </Card>
    </div>
  )
}
