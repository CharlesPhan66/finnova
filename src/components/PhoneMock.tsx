import type { ReactNode } from 'react'
import type { Scenario } from '../lib/data'
import type { Result } from '../lib/engine'
import { vnd } from '../lib/format'

const LOGO = `${import.meta.env.BASE_URL}hlb-logo-horizontal.png`

function Frame({ children, step }: { children: ReactNode; step: number }) {
  return (
    <div className="mx-auto w-[290px]">
      <div className="rounded-[2.2rem] border-[9px] border-slate-900 bg-slate-900 shadow-xl">
        <div className="flex h-[540px] flex-col overflow-hidden rounded-[1.6rem] bg-white">
          <div className="flex items-center justify-between bg-white px-4 pb-1 pt-2 text-[10px] font-semibold text-slate-700">
            <span>9:41</span>
            <span className="h-1.5 w-14 rounded-full bg-slate-900" />
            <span>5G ▮</span>
          </div>
          <div key={step} className="flex flex-1 animate-flow flex-col px-4 pb-4 pt-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

function Top({ title }: { title: string }) {
  return (
    <div className="mb-3 border-b border-sky-100 pb-2">
      <img src={LOGO} alt="Hong Leong Bank" className="h-4 w-auto" />
      <p className="mt-2 text-sm font-semibold text-navy-900">{title}</p>
    </div>
  )
}

const Btn = ({ children, onClick, tone = 'navy' }: { children: ReactNode; onClick: () => void; tone?: 'navy' | 'ghost' }) => (
  <button onClick={onClick} className={`mt-auto w-full rounded-lg py-2.5 text-center text-sm font-semibold transition active:scale-[0.98] ${tone === 'navy' ? 'bg-navy-900 text-white hover:bg-navy-800' : 'border border-sky-300 text-navy-800 hover:bg-sky-50'}`}>{children}</button>
)

function declineText(r: Result): { title: string; body: string } {
  const d = r.rules.decline
  if (d[0].pass || d[1].pass) return { title: 'We could not finish your application online', body: 'Please contact us or visit a branch and we will help you.' }
  if (d[2].pass) return { title: 'This loan may be hard to repay right now', body: 'With your current monthly commitments, this amount is too high. A smaller amount may work.' }
  if (d[4].pass) return { title: 'We need a little more information', body: 'You can add more details and apply again.' }
  return { title: 'We cannot offer a loan right now', body: 'You can still pay for your purchase another way.' }
}

// step 0..4 matches the five simulation stages
export function PhoneMock({ s, r, step, onNext, onRestart }: { s: Scenario; r: Result; step: number; onNext: () => void; onRestart: () => void }) {
  const i = s.inputs
  const sources = ['Your HLB account activity', i.platformIncome ? 'Platform income' : '', i.ecommerceSales ? 'Online shop sales' : '', 'E-wallet activity'].filter(Boolean)
  const checks = ['Identity check', 'Fraud check', 'Credit and cash-flow check', 'Can you afford the payments?']
  const offer = r.offer
  const total = offer ? offer.installment * offer.tenure : 0

  let body: ReactNode
  if (step === 0) {
    body = (
      <>
        <Top title="Pay in instalments" />
        <div className="rounded-lg bg-sky-50 p-3 text-xs text-slate-700">
          <p className="font-semibold text-navy-900">Purchase at partner shop</p>
          <p className="mt-1">Amount: <b>{vnd(s.requested)} VND</b> over <b>{s.tenure} months</b></p>
        </div>
        <p className="mb-1.5 mt-3 text-xs font-semibold text-navy-900">To decide in minutes, we would like to use:</p>
        <ul className="space-y-1.5">
          {sources.map((x) => (
            <li key={x} className="flex items-center justify-between rounded border border-sky-200 px-2.5 py-1.5 text-xs">
              <span>{x}</span><span className="h-4 w-7 rounded-full bg-navy-700 p-0.5"><span className="ml-auto block h-3 w-3 rounded-full bg-white" /></span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-slate-500">You choose what to share. We use it only for this decision.</p>
        <Btn onClick={onNext}>I agree, continue</Btn>
      </>
    )
  } else if (step === 1) {
    const ok = [r.identityVerified, r.fraudLevel !== 'High', r.creditLevel !== 'High', r.affordability !== 'FAIL']
    body = (
      <>
        <Top title="Checking your application" />
        <ul className="space-y-2.5">
          {checks.map((c, k) => (
            <li key={c} className="flex items-center gap-2 text-xs text-slate-700">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white ${r.stopped && k > 0 ? 'bg-slate-300' : ok[k] ? 'bg-ok-600' : 'bg-slate-500'}`}>{r.stopped && k > 0 ? '·' : ok[k] ? '✓' : '!'}</span>
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded bg-sky-50 p-2 text-[11px] text-slate-600">The customer sees simple steps. Fraud and credit scores are never shown on the phone.</p>
        <Btn onClick={onNext}>See my result</Btn>
      </>
    )
  } else if (step === 2) {
    if (r.decision === 'Approve') {
      body = (<><Top title="Good news" /><div className="rounded-xl bg-ok-50 p-4 text-center"><p className="text-3xl text-ok-600">✓</p><p className="mt-1 text-base font-bold text-ok-600">You are approved</p><p className="mt-1 text-xs text-slate-600">Decision in about a few minutes, with no documents to upload.</p></div><Btn onClick={onNext}>See my offer</Btn></>)
    } else if (r.decision === 'Review') {
      body = (<><Top title="We are reviewing" /><div className="rounded-xl bg-slate-100 p-4 text-center"><p className="text-3xl text-slate-500">…</p><p className="mt-1 text-base font-bold text-slate-600">A specialist is looking at your application</p><p className="mt-1 text-xs text-slate-600">We will tell you the result as soon as possible. You do not need to upload anything yet.</p></div><Btn tone="ghost" onClick={onNext}>Continue</Btn></>)
    } else {
      const t = declineText(r)
      body = (<><Top title="Your application" /><div className="rounded-xl bg-hred-50 p-4"><p className="text-sm font-bold text-hred-600">{t.title}</p><p className="mt-1 text-xs text-slate-700">{t.body}</p></div><Btn tone="ghost" onClick={onNext}>Continue</Btn></>)
    }
  } else if (step === 3) {
    if (offer) {
      body = (
        <>
          <Top title={r.decision === 'Approve' ? 'Your offer' : 'Indicative offer'} />
          <div className="rounded-xl bg-sky-50 p-3 text-center">
            <p className="text-[11px] text-slate-500">Loan amount</p>
            <p className="text-2xl font-bold text-navy-900">{vnd(offer.amount)} VND</p>
          </div>
          <dl className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between"><dt className="text-slate-500">Term</dt><dd className="font-semibold">{offer.tenure} months</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Monthly payment</dt><dd className="font-semibold">{vnd(offer.installment)} VND</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Total you pay</dt><dd className="font-semibold">{vnd(total)} VND</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Rate (illustrative)</dt><dd className="font-semibold">{offer.apr}% a year</dd></div>
          </dl>
          <p className="mt-2 text-[10px] text-slate-500">{offer.note}{r.decision === 'Review' ? ' Final offer after review.' : ''}</p>
          <Btn onClick={onNext}>{r.decision === 'Approve' ? 'Accept offer' : 'OK'}</Btn>
        </>
      )
    } else {
      body = (<><Top title="Other options" /><p className="text-xs text-slate-700">No loan offer this time. Pay with another method, or contact us for help.</p><Btn tone="ghost" onClick={onNext}>Continue</Btn></>)
    }
  } else {
    if (r.decision === 'Approve' && offer) {
      body = (<><Top title="All done" /><div className="rounded-xl bg-ok-50 p-4 text-center"><p className="text-3xl text-ok-600">✓</p><p className="mt-1 text-base font-bold text-ok-600">Purchase confirmed</p><p className="mt-1 text-xs text-slate-600">{vnd(offer.amount)} VND is paid to the shop. Your first payment is due next month.</p></div><Btn tone="ghost" onClick={onRestart}>Start again</Btn></>)
    } else if (r.decision === 'Review') {
      body = (<><Top title="Next" /><p className="text-xs text-slate-700">If the officer approves, you will get a message and can accept the offer. Your purchase waits until then.</p><Btn tone="ghost" onClick={onRestart}>Start again</Btn></>)
    } else {
      body = (<><Top title="Next" /><p className="text-xs text-slate-700">No loan was made, and nothing is owed. You can try again later or pay another way.</p><Btn tone="ghost" onClick={onRestart}>Start again</Btn></>)
    }
  }
  return <Frame step={step}>{body}</Frame>
}
