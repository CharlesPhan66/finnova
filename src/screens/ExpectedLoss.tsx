import { useMemo, useState } from 'react'
import { CartesianGrid, ComposedChart, Line, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip as RTip, XAxis, YAxis } from 'recharts'
import { Card, Metric, ScreenHeader, Slider, Tag } from '../components/ui'
import { contribution } from '../lib/engine'
import { vnd } from '../lib/format'
import { useStore } from '../lib/store'

const N = 1000
const pdAt = (p: number) => 0.8 * Math.exp(3.6 * p) // PD in %, p = applicant rank 0 (best) .. 1 (worst)

export function ExpectedLoss() {
  const { ec } = useStore()
  const [pd, setPd] = useState(4)
  const [lgd, setLgd] = useState(ec.lgd)
  const [ead, setEad] = useState(12_000_000)
  const [approval, setApproval] = useState(55)
  const [limit, setLimit] = useState(2)

  const el = (pd / 100) * (lgd / 100) * ead

  const curve = useMemo(() => {
    const rows: { a: number; contrib: number; elRate: number; elAmt: number }[] = []
    let net = 0
    let elSum = 0
    let disb = 0
    for (let k = 1; k <= 100; k++) {
      const p = (k - 0.5) / 100
      const c = contribution(ead, 12, ec.aprMed, ec.funding, pdAt(p), lgd, 0)
      net += c.net * (N / 100)
      elSum += c.loss * (N / 100)
      disb += ead * (N / 100)
      rows.push({ a: k, contrib: (net - N * ec.proposedCost) / 1e6, elRate: (elSum / disb) * 100, elAmt: elSum })
    }
    return rows
  }, [ead, lgd, ec.aprMed, ec.funding, ec.proposedCost])

  const feasible = curve.filter((r) => r.elRate <= limit)
  const opt = feasible.length ? feasible.reduce((b, r) => (r.contrib > b.contrib ? r : b)) : curve[0]
  const unconstrained = curve.reduce((b, r) => (r.contrib > b.contrib ? r : b))
  const cur = curve[approval - 1]
  const breach = cur.elRate > limit
  const pastOpt = !breach && approval > opt.a
  const approvedLoans = Math.round((N * approval) / 100)

  return (
    <div>
      <ScreenHeader n={8} title="Expected loss and risk discipline" question="Higher approval is not automatically better. The right approval rate is set by economics and risk limits." />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2" title="Expected loss for one loan" sub="EL = PD × LGD × EAD" right={<Tag kind="assumption" />}>
          <div className="space-y-4">
            <Slider label="PD (probability of default)" tip="Chance the borrower defaults over the loan life." value={pd} min={0.5} max={30} step={0.5} onChange={setPd} fmt={(n) => `${n.toFixed(1)}%`} />
            <Slider label="LGD (loss given default)" tip="Share of the exposure not recovered after default. Unsecured consumer credit is assumed high." value={lgd} min={20} max={100} step={1} onChange={setLgd} fmt={(n) => `${n}%`} />
            <Slider label="EAD (exposure at default)" tip="Amount outstanding if default happens. Case range 1.6M–90.1M VND." value={ead} min={1_600_000} max={90_100_000} step={100_000} onChange={setEad} fmt={(n) => `${vnd(n)}`} />
          </div>
          <div className="mt-4 rounded-xl bg-navy-900 p-4 text-center text-white">
            <p className="text-xs text-sky-200">{pd.toFixed(1)}% × {lgd}% × {vnd(ead)}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{vnd(el)} VND</p>
            <p className="text-xs text-sky-200">expected loss per loan · {(el / ead * 100).toFixed(2)}% of exposure <Tag kind="sim" /></p>
          </div>
        </Card>

        <Card className="lg:col-span-3" title="What happens when approval widens" sub={`Per ${N.toLocaleString()} synthetic applicants ranked from lowest to highest risk, 12-month loans of the EAD above`} right={<Tag kind="sim" />}>
          <div className="mb-3 grid gap-4 sm:grid-cols-2">
            <Slider label="Approval rate" value={approval} min={10} max={100} step={1} onChange={setApproval} fmt={(n) => `${n}%`} />
            <Slider label="Risk limit: expected loss ÷ disbursed" tip="Risk appetite. The optimum is the best contribution that stays at or under this limit." value={limit} min={1} max={8} step={0.25} onChange={setLimit} fmt={(n) => `${n.toFixed(2)}%`} />
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={curve} margin={{ left: -6, right: 6, top: 22 }}>
                <CartesianGrid stroke="#e4eefa" vertical={false} />
                <XAxis dataKey="a" type="number" domain={[1, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="l" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v.toFixed(0)}M`} />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                <RTip formatter={(v, n) => [n === 'Contribution (M VND)' ? `${Number(v).toFixed(1)}M` : `${Number(v).toFixed(2)}%`, n]} labelFormatter={(v) => `Approval ${v}%`} />
                <ReferenceLine yAxisId="r" y={limit} stroke="#c8102e" strokeDasharray="4 3" label={{ value: 'EL limit', fontSize: 10, fill: '#c8102e', position: 'insideTopLeft' }} />
                <ReferenceLine yAxisId="l" x={opt.a} stroke="#12805c" strokeDasharray="4 3" label={{ value: 'Optimum', fontSize: 10, fill: '#12805c', position: 'top' }} />
                <Line yAxisId="l" name="Contribution (M VND)" dataKey="contrib" stroke="#0a2a5c" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line yAxisId="r" name="Expected loss rate" dataKey="elRate" stroke="#c8102e" strokeWidth={2} dot={false} isAnimationActive={false} />
                <ReferenceDot yAxisId="l" x={cur.a} y={cur.contrib} r={6} fill="#0a2a5c" stroke="#fff" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Navy: total contribution (left axis, after {vnd(ec.proposedCost)} automated cost per application). Red: expected loss ÷ disbursed (right axis).</p>
        </Card>
      </div>

      <div className="mt-4" aria-live="polite">
        {breach && (
          <div className="rounded-xl border-2 border-hred-600 bg-hred-50 p-4">
            <p className="text-base font-bold text-hred-600">Growth without risk discipline</p>
            <p className="mt-1 text-sm text-slate-700">At {approval}% approval, {approvedLoans} loans are booked but expected loss reaches {cur.elRate.toFixed(2)}% of disbursement, above the {limit.toFixed(2)}% limit. Approval is up; so is loss.</p>
          </div>
        )}
        {pastOpt && (
          <div className="rounded-xl border-2 border-warn-600 bg-warn-50 p-4">
            <p className="text-base font-bold text-warn-600">Past the optimum</p>
            <p className="mt-1 text-sm text-slate-700">Within the risk limit, but contribution is below the best point ({opt.a}% approval). The extra customers add more expected loss than margin.</p>
          </div>
        )}
        {!breach && !pastOpt && (
          <div className="rounded-xl border-2 border-ok-600 bg-ok-50 p-4">
            <p className="text-base font-bold text-ok-600">Within risk limit</p>
            <p className="mt-1 text-sm text-slate-700">Expected loss {cur.elRate.toFixed(2)}% of disbursement is inside the {limit.toFixed(2)}% limit. Widening approval further would be tested against the limit, not just against volume.</p>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Selected approval" value={`${approval}%`} sub={`${approvedLoans} loans`} />
        <Metric label="Expected loss ÷ disbursed" value={`${cur.elRate.toFixed(2)}%`} tone={breach ? 'red' : 'green'} tag="sim" />
        <Metric label="Contribution" value={`${cur.contrib.toFixed(1)}M`} tone={cur.contrib < 0 ? 'red' : 'navy'} tag="sim" sub="VND per cohort" />
        <Metric label="Optimum within limit" value={`${opt.a}% approval`} tone="green" tag="sim" sub={opt.a < unconstrained.a ? `Without the limit the peak would be ${unconstrained.a}%, which breaches it` : 'Limit does not bind'} />
      </div>
      <p className="mt-3 text-[11px] text-slate-500">Risk curve (PD rising from 0.8% for the best applicant to about 29% for the worst) and the limit are <Tag kind="assumption" />. They show the shape of the trade-off, not HLBVN loss data.</p>
    </div>
  )
}
