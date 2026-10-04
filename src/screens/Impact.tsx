import { useState, type ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip as RTip, XAxis, YAxis } from 'recharts'
import { Card, Metric, ScreenHeader, Slider, Tag, Tip } from '../components/ui'
import { CASE, type Kind } from '../lib/data'
import { contribution } from '../lib/engine'
import { vnd } from '../lib/format'
import { useStore } from '../lib/store'

interface P {
  n: number; amount: number; apr: number; tenure: number
  approval: number; conversion: number; stp: number; defaultRate: number
  cost: number; review: number; tatDays: number
}

function run(p: P, funding: number, lgd: number) {
  const booked = (p.n * p.approval * p.conversion) / 10_000
  const per = contribution(p.amount, p.tenure, p.apr, funding, p.defaultRate, lgd, 0)
  const processing = p.n * p.cost
  const revenue = booked * per.revenue
  const fund = booked * per.funding
  const loss = booked * per.loss
  const net = revenue - fund - processing - loss
  const disb = booked * p.amount
  return { booked, revenue, fund, processing, loss, net, disb, perApp: net / p.n, elPct: disb ? (loss / disb) * 100 : 0 }
}

function breakeven(p: P, funding: number, lgd: number): number | null {
  for (let a = CASE.minLoan; a <= CASE.maxLoan; a += 100_000) {
    if (run({ ...p, amount: a }, funding, lgd).net >= 0) return a
  }
  return null
}

export function Impact() {
  const { ec, setEc } = useStore()
  const [amount, setAmount] = useState(10_000_000)
  const [apr, setApr] = useState(18)
  const [n, setN] = useState(1000)
  const [appC, setAppC] = useState(40)
  const [appP, setAppP] = useState(52)
  const [convC, setConvC] = useState(55)
  const [convP, setConvP] = useState(75)
  const [stp, setStp] = useState(40)
  const [defC, setDefC] = useState(4)
  const [defP, setDefP] = useState(4.5)

  const stpEff = Math.min(stp, appP)
  const reviewP = Math.min(100 - stpEff, appP - stpEff + 10)
  const refCost = CASE.costPerApp * (ec.reviewCostPct / 100)
  const costP = ec.proposedCost + (reviewP / 100) * refCost
  const base = { n, amount, apr, tenure: 12 }
  const cur: P = { ...base, approval: appC, conversion: convC, stp: 0, defaultRate: defC, cost: CASE.costPerApp, review: 100, tatDays: 3.2 }
  const pro: P = { ...base, approval: appP, conversion: convP, stp: stpEff, defaultRate: defP, cost: costP, review: reviewP, tatDays: 0 }
  const c = run(cur, ec.funding, ec.lgd)
  const p = run(pro, ec.funding, ec.lgd)
  const beC = breakeven(cur, ec.funding, ec.lgd)
  const beP = breakeven(pro, ec.funding, ec.lgd)

  const bars = [
    { name: 'Revenue', Current: c.revenue / 1e6, Proposed: p.revenue / 1e6 },
    { name: 'Funding', Current: -c.fund / 1e6, Proposed: -p.fund / 1e6 },
    { name: 'Processing', Current: -c.processing / 1e6, Proposed: -p.processing / 1e6 },
    { name: 'Expected loss', Current: -c.loss / 1e6, Proposed: -p.loss / 1e6 },
    { name: 'Contribution', Current: c.net / 1e6, Proposed: p.net / 1e6 },
  ]

  const rows: [string, ReactNode, ReactNode, Kind, string][] = [
    ['Decision TAT', `${CASE.tatMinDays}–${CASE.tatMaxDays} business days`, `Minutes (assumed ${ec.proposedMinutes} min)`, 'assumption', 'Current is the case fact range. Proposed is an adjustable assumption, not an HLBVN target.'],
    ['Cost per application', `${vnd(c.processing / n)} VND`, `${vnd(costP)} VND`, 'assumption', 'Current = case benchmark. Proposed = automated cost X + review share × reduced review cost.'],
    ['Automatic decision rate (STP)', '0% (all manually reviewed)', `${stpEff}%`, 'assumption', 'Share of applications decided with no person involved.'],
    ['Manual review rate', '100%', `${reviewP}%`, 'sim', 'Approved after review (approval − STP) plus 10 points sent to review then declined. Assumption-driven.'],
    ['Approval rate', `${appC}%`, `${appP}%`, 'assumption', 'Proposed approval rises only because customers with little credit history become assessable; risk limits still apply.'],
    ['Customers who drop out', `${100 - convC}%`, `${100 - convP}%`, 'assumption', 'Share of approved customers who do not complete the purchase loan. Faster decisions assumed to reduce it.'],
    ['Expected loss (% of loans paid out)', `${c.elPct.toFixed(2)}%`, `${p.elPct.toFixed(2)}%`, 'sim', 'Default rate × LGD.'],
    ['Default rate', `${defC}%`, `${defP}%`, 'assumption', 'Proposed is set slightly higher to reflect customers with little credit history; adjust to test.'],
    ['Loans paid out', `${vnd(c.disb)} VND`, `${vnd(p.disb)} VND`, 'sim', 'Booked loans × average loan amount.'],
    ['Contribution', `${vnd(c.net)} VND`, `${vnd(p.net)} VND`, 'sim', 'Revenue − funding − processing − expected credit loss.'],
  ]

  return (
    <div>
      <ScreenHeader n={9} title="Impact and unit economics" question="For small-ticket lending, a fixed manual review cost can consume most of the loan economics. What changes when cost and time fall, with risk still controlled?">
        <button onClick={() => setEc({ ...ec, proposedCost: 60_000 })} className="rounded border border-sky-200 bg-white px-3 py-1.5 text-xs hover:bg-sky-50">Reset cost X</button>
      </ScreenHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Contribution per application" value={`${vnd(c.perApp)} → ${vnd(p.perApp)}`} tag="sim" tone={p.perApp >= 0 ? 'green' : 'red'} tip="Contribution ÷ applications, current then proposed." />
        <Metric label="Cost per application" value={`${vnd(CASE.costPerApp)} → ${vnd(costP)}`} tag="assumption" tip="380K is the case benchmark; the proposed figure is an assumption." />
        <Metric label="Cost reduction" value={`${((1 - costP / CASE.costPerApp) * 100).toFixed(0)}%`} tag="sim" tone="green" />
        <Metric label="Break-even average ticket" value={`${beC ? vnd(beC) : '> 90.1M'} → ${beP ? vnd(beP) : '> 90.1M'}`} tag="sim" tip="Smallest average loan size at which total contribution is not negative, with the sliders as set." sub="Current → proposed" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2" title="Assumptions (sliders)" right={<Tag kind="assumption" />}>
          <div className="space-y-3.5">
            <Slider label="Average loan amount" value={amount} min={CASE.minLoan} max={CASE.maxLoan} step={100_000} onChange={setAmount} fmt={(v) => vnd(v)} />
            <Slider label="Revenue: interest rate (APR)" tip="Flat annuity pricing over 12 months. Not an HLBVN rate." value={apr} min={8} max={36} step={0.5} onChange={setApr} fmt={(v) => `${v}%`} />
            <Slider label="Proposed automated cost (X)" tip="Cost per application for an automated decision. The 380K benchmark applies to centralized manual review only." value={ec.proposedCost} min={10_000} max={380_000} step={5_000} onChange={(v) => setEc({ ...ec, proposedCost: v })} fmt={(v) => `${vnd(v)}`} />
            <Slider label="Review cost (% of 380K)" value={ec.reviewCostPct} min={10} max={100} step={5} onChange={(v) => setEc({ ...ec, reviewCostPct: v })} fmt={(v) => `${v}%`} />
            <Slider label="Funding cost (p.a.)" value={ec.funding} min={2} max={15} step={0.25} onChange={(v) => setEc({ ...ec, funding: v })} fmt={(v) => `${v}%`} />
            <Slider label="LGD" value={ec.lgd} min={20} max={100} step={1} onChange={(v) => setEc({ ...ec, lgd: v })} fmt={(v) => `${v}%`} />
            <Slider label="Number of applications" value={n} min={100} max={10000} step={100} onChange={setN} fmt={(v) => v.toLocaleString()} />
          </div>
        </Card>
        <Card className="lg:col-span-3" title="Current vs proposed" sub="Contribution = Revenue − Funding − Processing − Expected credit loss (M VND, for this group of applications)" right={<Tag kind="sim" />}>
          <div className="mb-3 grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-hred-600">Current</p>
              <Slider label="Approval rate" value={appC} min={10} max={80} step={1} onChange={setAppC} fmt={(v) => `${v}%`} />
              <Slider label="Conversion (customer completes)" value={convC} min={20} max={95} step={1} onChange={setConvC} fmt={(v) => `${v}%`} />
              <Slider label="Default rate" value={defC} min={0.5} max={12} step={0.1} onChange={setDefC} fmt={(v) => `${v.toFixed(1)}%`} />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-navy-700">Proposed</p>
              <Slider label="Approval rate" value={appP} min={10} max={80} step={1} onChange={setAppP} fmt={(v) => `${v}%`} />
              <Slider label="Conversion (customer completes)" value={convP} min={20} max={95} step={1} onChange={setConvP} fmt={(v) => `${v}%`} />
              <Slider label="Default rate" value={defP} min={0.5} max={12} step={0.1} onChange={setDefP} fmt={(v) => `${v.toFixed(1)}%`} />
              <Slider label="Automatic decision rate (STP)" value={stp} min={0} max={80} step={1} onChange={setStp} fmt={(v) => `${v}%`} />
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ left: -4, right: 6, top: 6 }}>
                <CartesianGrid stroke="#e4eefa" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v.toFixed(0)}`} />
                <RTip formatter={(v) => `${Number(v).toFixed(1)}M VND`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Current" fill="#c8102e" radius={[3, 3, 0, 0]}>{bars.map((b) => <Cell key={b.name} fill={b.name === 'Contribution' ? '#7a0b1c' : '#e08a96'} />)}</Bar>
                <Bar dataKey="Proposed" fill="#1f5bb8" radius={[3, 3, 0, 0]}>{bars.map((b) => <Cell key={b.name} fill={b.name === 'Contribution' ? '#0a2a5c' : '#7fa7e0'} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4" title="Metric comparison" sub="Each row is labelled by what kind of number it is">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead><tr className="border-b border-sky-200 text-[11px] uppercase tracking-wide text-slate-500"><th className="py-2">Metric</th><th>Current</th><th>Proposed</th><th>Type</th></tr></thead>
            <tbody className="divide-y divide-sky-100">
              {rows.map(([k, a, b, kind, tip]) => (
                <tr key={k}>
                  <td className="py-2 pr-2 font-medium text-slate-800"><Tip text={tip}>{k}</Tip></td>
                  <td className="pr-2 tabular-nums text-slate-700">{a}</td>
                  <td className="pr-2 font-semibold tabular-nums text-navy-900">{b}</td>
                  <td><Tag kind={kind} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">Current approval, conversion, default rate and the proposed values are team assumptions to be replaced with HLBVN data. The model does not claim HLBVN will achieve these figures. Incremental value is measured by comparing a controlled test group against the current process on the same metrics.</p>
      </Card>
    </div>
  )
}
