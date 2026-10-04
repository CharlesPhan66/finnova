import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip as RTip, XAxis, YAxis } from 'recharts'
import { Bar, Card, Metric, ScreenHeader, Slider, Tag, Tip } from '../components/ui'
import { CASE } from '../lib/data'
import { vnd } from '../lib/format'

const STAGES = [
  { t: 'Application', w: 0.05 },
  { t: 'Document submission', w: 0.2 },
  { t: 'Document verification', w: 0.25 },
  { t: 'CIC check', w: 0.1 },
  { t: 'Credit officer review', w: 0.3 },
  { t: 'Manual decision', w: 0.07 },
  { t: 'Customer response', w: 0.03 },
]

const CURVE = Array.from({ length: 60 }, (_, i) => {
  const a = CASE.minLoan + ((CASE.maxLoan - CASE.minLoan) * i) / 59
  return { amount: a, ratio: (CASE.costPerApp / a) * 100 }
})

export function CurrentProcess() {
  const [amount, setAmount] = useState(10_000_000)
  const [tat, setTat] = useState(3.2)
  const ratio = (CASE.costPerApp / amount) * 100
  const tone = ratio >= 10 ? 'red' : ratio >= 3 ? 'amber' : 'green'

  return (
    <div>
      <ScreenHeader n="Overview · part 2" title="Current process simulator" question="Why does today's process take days, and why does a fixed per-application cost hurt most on small tickets?" />
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3" title="Decision timeline" sub="Where the days go in centralized manual review" right={<Tag kind="case" text="RANGE: CASE FACT" />}>
          <Slider label="Decision TAT for this application" tip="The case gives a range of 1.8 to 4.6 business days. Where one application lands inside the range is a simulation input." value={tat} min={CASE.tatMinDays} max={CASE.tatMaxDays} step={0.1} onChange={setTat} fmt={(n) => `${n.toFixed(1)} days`} kind="sim" />
          <ol className="mt-4 space-y-2">
            {STAGES.map((s, i) => (
              <li key={s.t} className="grid grid-cols-[1.5rem_1fr_4rem] items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-hred-600 text-[11px] font-bold text-white">{i + 1}</span>
                <div>
                  <p className="text-xs font-medium text-slate-700">{s.t}</p>
                  <Bar value={s.w * 100 * 3} color="#c8102e" />
                </div>
                <span className="text-right text-xs font-semibold tabular-nums text-navy-900">{(s.w * tat).toFixed(2)} d</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[11px] text-slate-500">The split of days across stages is a <Tag kind="assumption" /> used to explain where waiting happens. Only the 1.8–4.6 day total is a case fact.</p>
        </Card>

        <Card className="lg:col-span-2" title="Fixed cost vs ticket size" sub="380,000 VND per application" right={<Tag kind="case" />}>
          <label className="block">
            <span className="mb-1 flex items-center justify-between text-xs font-medium text-slate-700"><span>Requested loan amount</span><span className="font-semibold tabular-nums text-navy-900">{vnd(amount)} VND</span></span>
            <input type="range" min={CASE.minLoan} max={CASE.maxLoan} step={100_000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} aria-label="Requested loan amount" />
            <span className="text-[11px] text-slate-400">Case range 1.6M – 90.1M VND</span>
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[1_600_000, 2_000_000, 5_000_000, 10_000_000, 30_000_000, 90_100_000].map((a) => (
              <button key={a} onClick={() => setAmount(a)} className={`rounded border px-2 py-1 text-xs ${a === amount ? 'border-navy-700 bg-navy-900 text-white' : 'border-sky-200 hover:border-navy-600'}`}>{vnd(a)}</button>
            ))}
          </div>
          <div className="mt-4">
            <Metric label="Processing cost as % of principal" tone={tone} value={`${ratio.toFixed(ratio < 1 ? 2 : 1)}%`} tag="sim"
              tip="380,000 ÷ requested amount. Illustrates how a fixed review cost weighs on small loans. Not an official case statistic." sub={`380K / ${vnd(amount)} = ${ratio.toFixed(1)}%`} />
            <p className="mt-2 text-[11px] font-medium text-navy-700">Illustrative calculation based on case benchmark.</p>
          </div>
          <div className="mt-3 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CURVE} margin={{ left: -10, right: 8, top: 6 }}>
                <CartesianGrid stroke="#e4eefa" vertical={false} />
                <XAxis dataKey="amount" type="number" domain={[CASE.minLoan, CASE.maxLoan]} tickFormatter={(v: number) => vnd(v)} tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 10 }} />
                <RTip formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Cost / principal']} labelFormatter={(v) => `Loan ${vnd(Number(v))}`} />
                <Area dataKey="ratio" stroke="#c8102e" fill="#fdecee" strokeWidth={2} isAnimationActive={false} />
                <ReferenceDot x={amount} y={ratio} r={5} fill="#0a2a5c" stroke="#fff" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Why customers with little credit history are hard to assess here" sub="Evidence the process can read vs evidence that already exists">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-hred-50 p-3">
              <p className="mb-1.5 text-xs font-semibold text-hred-700">Process can read</p>
              <ul className="space-y-1 text-xs text-slate-700"><li>Payslips, contracts, business papers</li><li>CIC / credit history</li><li>Collateral or traditional evidence</li></ul>
            </div>
            <div className="rounded-lg bg-sky-100 p-3">
              <p className="mb-1.5 text-xs font-semibold text-navy-800">Exists but goes unused</p>
              <ul className="space-y-1 text-xs text-slate-700"><li>Salary and regular money coming into the account</li><li>Platform payouts, online sales</li><li>E-wallet and transaction behaviour<Tip text="Data beyond the credit bureau such as platform income, e-wallet and telecom/utility behaviour is only usable with customer consent and where legally and operationally available." /></li></ul>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600">Result: no file means no evidence, so the customer is declined or waits for documents they may not have. The same fixed effort is spent either way.</p>
        </Card>
        <Card title="Application mix" sub="Share of inbound applications" right={<Tag kind="case" />}>
          <ul className="space-y-2.5">
            {CASE.mix.map((m, i) => (
              <li key={m.key}>
                <div className="mb-1 flex justify-between text-xs"><span className="text-slate-700">{m.label}</span><span className="font-semibold tabular-nums text-navy-900">{m.share.toFixed(1)}%</span></div>
                <Bar value={m.share * 2.5} color={i === 0 ? '#0a2a5c' : '#1f5bb8'} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
