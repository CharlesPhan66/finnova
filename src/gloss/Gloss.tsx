/** @jsxImportSource react */
import { Fragment, type ReactNode } from 'react'

export const GLOSSARY: Record<string, string> = {
  CIC: "Credit Information Centre, Vietnam's credit bureau. It shows a person's past loans and repayments.",
  STP: 'Straight-through processing: decided automatically, with no person involved.',
  TAT: 'Turnaround time: how long it takes to reach a decision.',
  PD: 'Probability of default: the chance that the customer stops repaying.',
  LGD: 'Loss given default: the share of the amount owed that we do not get back after a default.',
  EAD: 'Exposure at default: the amount still owed if the customer defaults.',
  EL: 'Expected loss = PD × LGD × EAD. The average loss we expect on a loan.',
  NPL: 'Non-performing loans: badly overdue loans, as a share of all loans.',
  PSI: 'Population stability index: shows how much data or scores have shifted. Higher means more change.',
  APR: 'Annual percentage rate: the yearly interest rate.',
  MSME: 'Micro, small and medium enterprises: small businesses.',
  VND: 'Vietnamese dong.',
  HLBVN: 'Hong Leong Bank Vietnam.',
  HLB: 'Hong Leong Bank.',
  ID: 'Identity document, for example a national ID card.',
}
const AMOUNT = 'K = thousand · M = million · B = billion (amounts in VND).'

const PATTERN = /\b(CIC|STP|TAT|PD|LGD|EAD|EL|NPL|PSI|APR|MSME|VND|HLBVN|HLB|ID)\b|(\d(?:[\d.,]*\d)?)(K|M|B)\b/g

function Abbr({ label, tip }: { label: string; tip: string }) {
  return (
    <span className="tip relative cursor-help underline decoration-dotted decoration-slate-400 underline-offset-2" tabIndex={0}>
      {label}
      <span role="tooltip" className="tip-pop">{tip}</span>
    </span>
  )
}

export function Gloss({ text }: { text: string }): ReactNode {
  const out: ReactNode[] = []
  let last = 0
  let k = 0
  for (const m of text.matchAll(PATTERN)) {
    const at = m.index ?? 0
    if (at > last) out.push(text.slice(last, at))
    if (m[1]) out.push(<Abbr key={k++} label={m[1]} tip={GLOSSARY[m[1]]} />)
    else out.push(<Fragment key={k++}>{m[2]}<Abbr label={m[3]} tip={AMOUNT} /></Fragment>)
    last = at + m[0].length
  }
  if (!out.length) return text
  if (last < text.length) out.push(text.slice(last))
  return <span>{out}</span>
}
