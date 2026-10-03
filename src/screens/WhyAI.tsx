import { Card, ScreenHeader, Tag } from '../components/ui'

const ARCH = [
  { t: 'Data layer', d: 'Bank, bureau, consented partners' },
  { t: 'Ingestion', d: 'Consent-gated feeds' },
  { t: 'Data quality', d: 'Missing / conflicting checks' },
  { t: 'Feature engineering', d: 'Cash-flow and behaviour features' },
]

export function WhyAI() {
  return (
    <div>
      <ScreenHeader n={6} title="Why AI, and where it stops" question="AI is used only where it adds something rules cannot. Rules keep every hard constraint. Humans own exceptions." />

      <Card title="Decision engine = AI model + policy rules + human oversight">
        <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <div className="rounded-xl border-2 border-navy-600 bg-sky-50 p-3"><p className="text-sm font-bold text-navy-900">AI model</p><p className="mt-1 text-xs text-slate-600">Multi-source features, nonlinear patterns, probability and confidence, segmentation, anomaly detection</p></div>
          <span className="self-center text-center text-xl font-bold text-navy-700">+</span>
          <div className="rounded-xl border-2 border-navy-600 bg-sky-50 p-3"><p className="text-sm font-bold text-navy-900">Policy rules</p><p className="mt-1 text-xs text-slate-600">Hard constraints: identity, fraud block, affordability, exposure limits, regulation</p></div>
          <span className="self-center text-center text-xl font-bold text-navy-700">+</span>
          <div className="rounded-xl border-2 border-navy-600 bg-sky-50 p-3"><p className="text-sm font-bold text-navy-900">Human oversight</p><p className="mt-1 text-xs text-slate-600">Referrals, overrides, limits on automation, periodic validation</p></div>
          <span className="self-center text-center text-xl font-bold text-hred-600">=</span>
          <div className="rounded-xl bg-navy-900 p-3 text-white"><p className="text-sm font-bold">Decision engine</p><p className="mt-1 text-xs text-sky-200">STP · Refer · Decline, each with reasons</p></div>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Rules alone vs the incremental role of AI">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-sky-200 text-[11px] uppercase tracking-wide text-slate-500"><th className="py-2 pr-2">Need</th><th className="pr-2">Rules only</th><th>With AI model</th></tr></thead>
            <tbody className="divide-y divide-sky-100 align-top text-slate-700">
              <tr><td className="py-2 pr-2 font-medium">Variables</td><td className="pr-2">A few fixed ones</td><td>Many heterogeneous behavioural features</td></tr>
              <tr><td className="py-2 pr-2 font-medium">Patterns</td><td className="pr-2">Linear thresholds</td><td>Nonlinear interactions, e.g. income volatility with recurring share</td></tr>
              <tr><td className="py-2 pr-2 font-medium">Output</td><td className="pr-2">Pass / fail</td><td>Probability of default plus a confidence score</td></tr>
              <tr><td className="py-2 pr-2 font-medium">Segments</td><td className="pr-2">Static product buckets</td><td>Dynamic segmentation of thin-file customers</td></tr>
              <tr><td className="py-2 pr-2 font-medium">Fraud</td><td className="pr-2">Known patterns only</td><td>Anomaly detection on new patterns</td></tr>
            </tbody>
          </table>
          <p className="mt-3 rounded-lg bg-hred-50 p-2 text-xs text-hred-700">AI does not decide identity failure, fraud blocking, affordability limits, regulatory requirements or maximum exposure. Those stay as rules.</p>
        </Card>

        <Card title="Why not just add more rules?">
          <ul className="space-y-2 text-sm text-slate-700">
            <li>Thin-file customers have no single decisive variable. Value comes from combining many weak signals.</li>
            <li>Fixed cut-offs either decline good thin-file customers or admit risky ones.</li>
            <li>Rules cannot express confidence, so they cannot tell the engine when to hand over to a human.</li>
            <li>The model is the incremental part. If it is weak, the policy layer still keeps risk inside limits.</li>
          </ul>
        </Card>
      </div>

      <Card className="mt-4" title="Proposed architecture" sub="Example design; HLBVN does not use any of these models today" right={<Tag kind="assumption" text="PROPOSED ARCHITECTURE" />}>
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:flex-wrap md:items-center">
          {ARCH.map((a) => (
            <div key={a.t} className="contents">
              <div className="flex-1 rounded-lg border border-sky-200 bg-white p-2.5 md:min-w-[8rem]"><p className="text-xs font-semibold text-navy-900">{a.t}</p><p className="text-[11px] text-slate-500">{a.d}</p></div>
              <span className="text-center text-navy-600">➜</span>
            </div>
          ))}
          <div className="flex-[1.6] space-y-2">
            <div className="rounded-lg border-2 border-navy-600 bg-sky-50 p-2.5"><p className="text-xs font-semibold text-navy-900">Credit model</p><p className="text-[11px] text-slate-500">Example: gradient boosting, explainable ML</p></div>
            <div className="rounded-lg border-2 border-hred-600/60 bg-hred-50/50 p-2.5"><p className="text-xs font-semibold text-navy-900">Fraud model</p><p className="text-[11px] text-slate-500">Example: anomaly detection + rules</p></div>
          </div>
          <span className="text-center text-navy-600">➜</span>
          <div className="flex-1 rounded-lg border border-sky-200 bg-white p-2.5"><p className="text-xs font-semibold text-navy-900">Affordability</p><p className="text-[11px] text-slate-500">Rule-based capacity check</p></div>
          <span className="text-center text-navy-600">➜</span>
          <div className="flex-1 rounded-lg border border-sky-200 bg-white p-2.5"><p className="text-xs font-semibold text-navy-900">Model confidence</p><p className="text-[11px] text-slate-500">Coverage and consistency</p></div>
          <span className="text-center text-navy-600">➜</span>
          <div className="flex-1 rounded-lg border border-sky-200 bg-white p-2.5"><p className="text-xs font-semibold text-navy-900">Policy engine</p><p className="text-[11px] text-slate-500">Hard rules and thresholds</p></div>
          <span className="text-center text-navy-600">➜</span>
          <div className="flex-1 rounded-lg bg-navy-900 p-2.5 text-white"><p className="text-xs font-semibold">Decision</p><p className="text-[11px] text-sky-200">STP / Refer / Decline</p></div>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">After the decision: offer, acceptance, disbursement, post-loan monitoring, outcome data, and model and policy monitoring (screen 10) feed back into the data layer. This prototype scores with a transparent formula, not a trained model.</p>
      </Card>
    </div>
  )
}
