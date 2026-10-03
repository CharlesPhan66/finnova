import type { ReactNode } from 'react'
import { Bar, Card, DecisionBadge, Gauge, LevelBadge, ScreenHeader, StatusPill, Tag, Tip } from '../components/ui'
import { ScenarioPicker } from '../components/ScenarioPicker'
import { vnd } from '../lib/format'
import { useStore } from '../lib/store'

function Row({ k, v, bar, tip }: { k: string; v: ReactNode; bar?: number; tip?: string }) {
  return (
    <div className="py-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-600">{tip ? <Tip text={tip}>{k}</Tip> : k}</span>
        <span className="font-semibold tabular-nums text-navy-900">{v}</span>
      </div>
      {bar !== undefined && <div className="mt-1"><Bar value={bar} /></div>}
    </div>
  )
}

function Group({ title, children, tone = 'sky' }: { title: string; children: ReactNode; tone?: 'sky' | 'red' }) {
  return (
    <div className={`rounded-lg border p-3 ${tone === 'red' ? 'border-hred-600/30 bg-hred-50/40' : 'border-sky-200 bg-white'}`}>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-navy-700">{title}</p>
      {children}
    </div>
  )
}

export function EngineScreen() {
  const { scenario: s, result: r, th } = useStore()
  const i = s.inputs
  const cic = { good: 'Good history', thin: 'Limited history', none: 'No file', poor: 'Late payments' }[i.cic]
  const repay = { clean: 'Clean', none: 'None on file', late: 'Late payments' }[i.repayment]

  return (
    <div>
      <ScreenHeader n={4} title="Decision engine" question="How does data become a decision? Five input families go in; identity, fraud and credit risk come out separately, with affordability and confidence deciding the route." />
      <ScenarioPicker compact />
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_auto_1fr]">
        <div className="space-y-3">
          <Group title="Traditional data">
            <Row k="CIC / bureau" v={cic} />
            <Row k="Existing monthly debt service" v={`${vnd(i.existingDebtMonthly)} VND`} />
            <Row k="Repayment history" v={repay} />
          </Group>
          <Group title="Cash-flow data">
            <Row k="Monthly income (observed)" v={`${vnd(i.monthlyIncome)} VND`} />
            <Row k="Income consistency" v={i.incomeConsistency} bar={i.incomeConsistency} tip="How steady month-to-month inflows are, 0–100." />
            <Row k="Recurring share of inflows" v={`${i.recurringShare}%`} bar={i.recurringShare} />
            <Row k="Living expenses / income" v={`${i.expenseRatio}%`} bar={i.expenseRatio} />
          </Group>
          <Group title="Digital activity (consent required)">
            <Row k="Platform income" v={i.platformIncome ? `${vnd(i.platformIncome)}/mo` : 'n/a'} />
            <Row k="E-commerce sales" v={i.ecommerceSales ? `${vnd(i.ecommerceSales)}/mo` : 'n/a'} />
            <Row k="E-wallet activity" v={i.ewalletActivity} bar={i.ewalletActivity} />
            <Row k="Transactions per month" v={i.txPerMonth} />
          </Group>
          <Group title="Affordability">
            <Row k="Requested" v={`${vnd(s.requested)} VND · ${s.tenure} mo`} />
            <Row k="Instalment at engine pricing" v={`${vnd(r.installment)}/mo`} />
            <Row k="Total debt burden" v={`${r.burden.toFixed(0)}% (limit ${th.maxBurden}%)`} bar={r.burden} />
          </Group>
          <Group title="Fraud / identity" tone="red">
            <Row k="Identity match" v={i.identityMatch} bar={i.identityMatch} />
            <Row k="Application consistency" v={i.appConsistency} bar={i.appConsistency} />
            <Row k="Device / behaviour risk" v={i.deviceRisk} bar={i.deviceRisk} />
            <Row k="Duplicate-application signals" v={i.duplicateSignals} />
          </Group>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 xl:w-44">
          <span className="text-2xl text-navy-600 xl:rotate-0 rotate-90">➜</span>
          <div className="w-full rounded-xl bg-navy-900 p-4 text-center text-white shadow-lg">
            <p className="text-[11px] uppercase tracking-widest text-sky-300">Decision engine</p>
            <p className="mt-2 text-xs leading-snug">AI model<br />+ policy rules<br />+ human oversight</p>
          </div>
          <span className="text-2xl text-navy-600 rotate-90 xl:rotate-0">➜</span>
        </div>

        <Card title="Engine outputs" right={<Tag kind="sim" />}>
          <div className="grid grid-cols-3 gap-2">
            <Gauge label="Credit risk (PD %)" value={Math.min(100, r.pd * 5)} lo={th.pdLowMax * 5} hi={th.pdMedMax * 5} display={`${r.pd.toFixed(1)}%`} />
            <Gauge label="Fraud score" value={r.fraudScore} lo={th.fraudLowMax} hi={th.fraudHighMin - 0.01} />
            <Gauge label="Confidence" value={r.confidence} lo={th.confidenceFloor + 15} hi={th.confidenceStp} invert />
          </div>
          <dl className="mt-3 divide-y divide-sky-100 text-sm">
            <div className="flex items-center justify-between py-2"><dt className="text-slate-600">Identity</dt><dd><StatusPill ok={r.identityVerified} yes="VERIFIED" no="FAILED" /></dd></div>
            <div className="flex items-center justify-between py-2"><dt className="text-slate-600">Fraud risk</dt><dd><LevelBadge level={r.fraudLevel} /></dd></div>
            <div className="flex items-center justify-between py-2"><dt className="text-slate-600">Credit risk</dt><dd><LevelBadge level={r.creditLevel} /></dd></div>
            <div className="flex items-center justify-between py-2"><dt className="text-slate-600">Affordability</dt><dd><StatusPill ok={r.affordability !== 'FAIL'} yes={r.affordability === 'REDUCED' ? 'PASS (REDUCED)' : 'PASS'} /></dd></div>
            <div className="flex items-center justify-between py-2"><dt className="text-slate-600">Model confidence</dt><dd className="font-semibold tabular-nums">{r.confidence.toFixed(0)} · {r.confidenceLevel}</dd></div>
            <div className="flex items-center justify-between py-2"><dt className="text-slate-600">Recommended decision</dt><dd><DecisionBadge d={r.decision} /></dd></div>
            <div className="flex items-center justify-between py-2"><dt className="text-slate-600">Recommended amount</dt><dd className="font-semibold">{r.offer ? `${vnd(r.offer.amount)} VND` : '—'}</dd></div>
            <div className="flex items-center justify-between py-2"><dt className="text-slate-600">Recommended tenure</dt><dd className="font-semibold">{r.offer ? `${r.offer.tenure} months` : '—'}</dd></div>
            <div className="flex items-center justify-between py-2"><dt className="text-slate-600">Human-review flag</dt><dd><StatusPill ok={!r.humanReview} yes="NO" no="YES" /></dd></div>
          </dl>
          {r.stopped && <p className="mt-2 rounded bg-hred-50 p-2 text-xs text-hred-700">Identity failed, so processing stops here. Fraud, credit and affordability results are not used.</p>}
          <p className="mt-3 text-[11px] text-slate-500">Identity, fraud and credit risk are never merged into one score. A strong credit profile cannot offset a fraud or identity failure.</p>
        </Card>
      </div>
    </div>
  )
}
