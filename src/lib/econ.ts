import { CASE, type Econ, type Scenario } from './data'
import { contribution, type Contribution, type Result } from './engine'

export interface ScenarioEcon {
  current: Contribution & { note: string; booked: boolean }
  proposed: Contribution & { note: string; booked: boolean }
}

const zero = (processing: number): Contribution => ({ revenue: 0, funding: 0, processing, loss: 0, net: -processing })

// Per-application economics for one synthetic customer, current vs proposed treatment.
export function scenarioEcon(s: Scenario, r: Result, ec: Econ): ScenarioEcon {
  const cur = CASE.costPerApp
  let current: ScenarioEcon['current']
  if (s.current.outcome === 'Approve') {
    current = { ...contribution(s.requested, s.tenure, r.creditLevel === 'Low' ? ec.aprLow : ec.aprMed, ec.funding, r.pd, ec.lgd, cur), note: 'Approved after review at requested terms.', booked: true }
  } else if (s.current.outcome === 'Approve (fraud missed)') {
    const c = contribution(s.requested, s.tenure, ec.aprLow, ec.funding, 0, ec.lgd, cur)
    const loss = s.requested
    current = { ...c, loss, net: -loss - cur, note: 'Exposure if forged documents pass the manual check: full principal assumed lost.', booked: true }
  } else {
    current = { ...zero(cur), note: s.current.outcome === 'Refer for documents' ? 'Sent back for documents; customer assumed to drop out. Cost still incurred.' : 'No loan booked. The full review cost is spent anyway.', booked: false }
  }

  const refCost = cur * (ec.referralCostPct / 100)
  let proposed: ScenarioEcon['proposed']
  if (r.decision === 'STP Approve' && r.offer) {
    proposed = { ...contribution(r.offer.amount, r.offer.tenure, r.offer.apr, ec.funding, r.pd, ec.lgd, ec.proposedCost), note: 'Booked straight through at the engine offer.', booked: true }
  } else if (r.decision === 'Refer' && r.offer) {
    proposed = { ...contribution(r.offer.amount, r.offer.tenure, r.offer.apr, ec.funding, r.pd, ec.lgd, ec.proposedCost + refCost), note: 'Shown as if the officer approves the indicative offer. Includes a reduced-cost referral review.', booked: true }
  } else {
    proposed = { ...zero(ec.proposedCost), note: 'Declined early at automated cost; no credit loss taken.', booked: false }
  }
  return { current, proposed }
}
