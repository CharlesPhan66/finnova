import { CASE, type Decision, type Econ, type Inputs, type Level, type Scenario, type Thresholds } from './data'
import { clamp } from './format'

export interface Overrides {
  cicMissing?: boolean
  cashflow?: 'strong' | 'weak' | null
  identityFail?: boolean
}

export const applyOverrides = (i: Inputs, o: Overrides): Inputs => {
  const n = { ...i }
  if (o.cicMissing) { n.cic = 'none'; n.repayment = 'none'; n.dataCompleteness -= 8 }
  if (o.cashflow === 'strong') { n.incomeConsistency = 92; n.recurringShare = 94; n.expenseRatio = 45 }
  if (o.cashflow === 'weak') { n.incomeConsistency = 45; n.recurringShare = 50; n.expenseRatio = 70; n.dataCompleteness -= 15 }
  if (o.identityFail) n.identityMatch = 55
  n.dataCompleteness = clamp(n.dataCompleteness, 0, 100)
  return n
}

const annuity = (apr: number, months: number): number => {
  const r = apr / 100 / 12
  return r / (1 - Math.pow(1 + r, -months))
}

export interface Rule { label: string; value: string; pass: boolean }
export interface Offer { amount: number; tenure: number; apr: number; installment: number; note: string }

export interface Result {
  identityVerified: boolean
  fraudScore: number
  fraudLevel: Level
  pd: number
  creditLevel: Level
  affordability: 'PASS' | 'REDUCED' | 'FAIL'
  burden: number
  disposable: number
  installment: number
  cicCoverage: number
  cashflowStrength: number
  bothWeak: boolean
  confidence: number
  confidenceLevel: 'High' | 'Medium' | 'Low'
  decision: Decision
  humanReview: boolean
  stopped: boolean
  offer: Offer | null
  positives: string[]
  risks: string[]
  reason: string
  rules: { stp: Rule[]; refer: Rule[]; decline: Rule[] }
}

const CIC_COVER = { good: 90, poor: 85, thin: 40, none: 0 } as const
const CIC_MULT = { good: 0.6, thin: 1.0, none: 1.1, poor: 3.0 } as const
const REPAY_MULT = { clean: 0.8, none: 1.0, late: 2.2 } as const

export function evaluate(s: Scenario, th: Thresholds, ec: Econ, ov: Overrides = {}): Result {
  const i = applyOverrides(s.inputs, ov)
  const amount = s.requested
  const tenure = s.tenure

  // 1. Identity, fraud, credit stay separate scores
  const identityVerified = i.identityMatch >= th.identityMin
  const fraudScore = clamp(
    0.45 * i.deviceRisk + 0.3 * (100 - i.appConsistency) + 0.15 * Math.min(100, i.duplicateSignals * 35) + 0.1 * (100 - i.identityMatch),
    0, 100)
  const fraudLevel: Level = fraudScore >= th.fraudHighMin ? 'High' : fraudScore > th.fraudLowMax ? 'Medium' : 'Low'

  const dti = i.existingDebtMonthly / i.monthlyIncome
  const pdRaw = 3.0
    * CIC_MULT[i.cic]
    * REPAY_MULT[i.repayment]
    * clamp(1 + ((80 - i.incomeConsistency) / 100) * 1.5, 0.7, 2.2)
    * (1 + (75 - i.recurringShare) / 200)
    * (1 + (i.expenseRatio - 60) / 100)
    * (1 + dti * 1.2)
    * (1 + (tenure - 12) / 60)
    * Math.max(0.9, 1 + (amount / i.monthlyIncome - 1) * 0.05)
  const pd = clamp(pdRaw, 0.5, 60)
  const creditLevel: Level = pd <= th.pdLowMax ? 'Low' : pd <= th.pdMedMax ? 'Medium' : 'High'

  // 2. Affordability (hard policy rule, owned by rules not the model)
  const apr = creditLevel === 'Low' ? ec.aprLow : ec.aprMed
  const maxInstallment = i.monthlyIncome * (th.maxBurden / 100) - i.existingDebtMonthly
  const livingCost = i.monthlyIncome * (i.expenseRatio / 100)
  let installment = amount * annuity(apr, tenure)
  let affordability: Result['affordability'] = 'FAIL'
  let offerAmount = amount
  let offerTenure = tenure
  let note = 'Requested amount and tenure fit within the burden limit.'
  const fits = (inst: number) => inst <= maxInstallment && i.monthlyIncome - livingCost - i.existingDebtMonthly - inst >= 0
  if (fits(installment)) {
    affordability = 'PASS'
  } else {
    const longer = CASE.tenures.filter((t) => t > tenure).find((t) => fits(amount * annuity(apr, t)))
    if (longer) {
      affordability = 'PASS'; offerTenure = longer; installment = amount * annuity(apr, longer)
      note = `Tenure extended from ${tenure} to ${longer} months to fit the burden limit.`
    } else {
      const t = 24
      const room = Math.min(maxInstallment, i.monthlyIncome - livingCost - i.existingDebtMonthly)
      const maxP = room > 0 ? room / annuity(apr, t) : 0
      if (maxP >= CASE.minLoan) {
        affordability = 'REDUCED'; offerAmount = Math.floor(maxP / 100_000) * 100_000; offerTenure = t
        installment = offerAmount * annuity(apr, t)
        note = 'Amount reduced to what the customer can afford at 24 months.'
      }
    }
  }
  const burden = ((i.existingDebtMonthly + installment) / i.monthlyIncome) * 100
  const disposable = i.monthlyIncome - livingCost - i.existingDebtMonthly - installment

  // 3. Confidence in the assessment (data coverage, consistency, corroboration)
  const cashflowStrength = clamp(0.5 * i.incomeConsistency + 0.3 * i.recurringShare + 0.2 * (100 - i.expenseRatio), 0, 100)
  const cicCoverage = CIC_COVER[i.cic]
  const coverage = Math.max(cicCoverage, cashflowStrength)
  const penalty = i.cic === 'none' ? 6 : i.cic === 'thin' ? 3 : 0
  const confidence = clamp(0.4 * i.dataCompleteness + 0.25 * i.incomeConsistency + 0.15 * i.appConsistency + 0.2 * coverage - penalty, 0, 100)
  const confidenceLevel = confidence >= th.confidenceStp ? 'High' : confidence >= th.confidenceFloor + 15 ? 'Medium' : 'Low'
  const bothWeak = cicCoverage < 50 && cashflowStrength < 50

  // 4. Policy engine
  const firstTimeBlock = th.firstTimeNoStp && s.firstTime
  const stp: Rule[] = [
    { label: 'Identity verified', value: `match ${i.identityMatch} ≥ ${th.identityMin}`, pass: identityVerified },
    { label: 'Fraud risk Low', value: `${fraudScore.toFixed(0)} ≤ ${th.fraudLowMax}`, pass: fraudLevel === 'Low' },
    { label: 'Affordability pass', value: `burden ${burden.toFixed(0)}% vs limit ${th.maxBurden}%`, pass: affordability !== 'FAIL' },
    { label: 'Credit risk Low', value: `PD ${pd.toFixed(1)}% ≤ ${th.pdLowMax}%`, pass: creditLevel === 'Low' },
    { label: 'Confidence ≥ threshold', value: `${confidence.toFixed(0)} ≥ ${th.confidenceStp}`, pass: confidence >= th.confidenceStp },
  ]
  if (th.firstTimeNoStp) stp.push({ label: 'Hard rule: not a first-time borrower', value: s.firstTime ? 'first-time borrower' : 'has history or exempt', pass: !firstTimeBlock })
  const refer: Rule[] = [
    { label: 'Credit risk Medium', value: `PD ${pd.toFixed(1)}%`, pass: creditLevel === 'Medium' },
    { label: 'Confidence below threshold', value: `${confidence.toFixed(0)} < ${th.confidenceStp}`, pass: confidence < th.confidenceStp },
    { label: 'Fraud risk Medium', value: `${fraudScore.toFixed(0)}`, pass: fraudLevel === 'Medium' },
  ]
  const decline: Rule[] = [
    { label: 'Identity not verified', value: `match ${i.identityMatch}`, pass: !identityVerified },
    { label: 'Fraud risk High', value: `${fraudScore.toFixed(0)} ≥ ${th.fraudHighMin}`, pass: fraudLevel === 'High' },
    { label: 'Affordability fail', value: `burden ${burden.toFixed(0)}%`, pass: affordability === 'FAIL' },
    { label: 'Credit risk High', value: `PD ${pd.toFixed(1)}% > ${th.pdMedMax}%`, pass: creditLevel === 'High' },
    { label: 'Insufficient reliable data', value: `confidence ${confidence.toFixed(0)} < ${th.confidenceFloor}${bothWeak ? ', bureau and cash-flow both weak' : ''}`, pass: bothWeak && confidence < th.confidenceFloor },
  ]

  const stopped = !identityVerified
  let decision: Decision
  if (decline.some((r) => r.pass)) decision = 'Decline'
  else if (stp.every((r) => r.pass)) decision = 'STP Approve'
  else decision = 'Refer'

  // 5. Explanation in plain language
  const positives: string[] = []
  const risks: string[] = []
  if (identityVerified) positives.push('Identity verified'); else risks.push('Identity could not be verified')
  if (fraudLevel === 'Low') positives.push('Low application-fraud risk'); else risks.push(`${fraudLevel} application-fraud risk (device, consistency or duplicate signals)`)
  if (i.incomeConsistency >= 85) positives.push('Stable, consistent monthly inflows'); else if (i.incomeConsistency < 65) risks.push('Inconsistent income pattern')
  if (i.recurringShare >= 85) positives.push('Recurring income dominates inflows')
  if (i.platformIncome > 0 && i.incomeConsistency >= 70) positives.push('Recurring platform payouts observed')
  if (i.ecommerceSales > 0) positives.push('Digital sales history visible')
  if (i.cic === 'good') positives.push('Good bureau record and repayment history')
  if (i.cic === 'none') risks.push('No bureau file: relies on cash-flow evidence')
  if (i.cic === 'thin') risks.push('Limited bureau history')
  if (i.cic === 'poor' || i.repayment === 'late') risks.push('Past late repayment on record')
  if (dti < 0.15) positives.push('Low existing debt burden'); else if (burden > th.maxBurden) risks.push(`Total debt burden ${burden.toFixed(0)}% of income exceeds the ${th.maxBurden}% limit`)
  if (affordability === 'PASS' && disposable > 0) positives.push('Instalment affordable after living costs')
  if (i.dataCompleteness < 70) risks.push('Incomplete application data')
  if (i.appConsistency < 70) risks.push('Declared and observed data do not match')
  if (firstTimeBlock) risks.push('First-time borrower: policy requires human review and a conservative limit')

  let offer: Offer | null = null
  if (decision !== 'Decline') {
    let a = offerAmount
    let n = note
    if (firstTimeBlock || creditLevel === 'Medium') {
      const cap = firstTimeBlock ? th.firstTimeCap : amount * 0.7
      if (a > cap) { a = Math.floor(cap / 100_000) * 100_000; n = firstTimeBlock ? 'Conservative first-time limit applied by policy.' : 'Limit reduced by 30% because credit risk is Medium.' }
    }
    offer = { amount: a, tenure: offerTenure, apr, installment: a * annuity(apr, offerTenure), note: n }
  }

  let reason: string
  if (decision === 'STP Approve') {
    reason = `Approved automatically: identity is verified, fraud risk is low, the instalment is affordable and credit risk is low${i.cic === 'good' ? '.' : ', based on cash-flow behaviour despite limited bureau history.'} Model confidence ${confidence.toFixed(0)} is above the ${th.confidenceStp} threshold.`
  } else if (decision === 'Refer') {
    const why: string[] = []
    if (firstTimeBlock) why.push('policy requires a human decision for first-time borrowers')
    if (creditLevel === 'Medium') why.push('credit risk is medium')
    if (confidence < th.confidenceStp) why.push(`model confidence ${confidence.toFixed(0)} is below the ${th.confidenceStp} threshold`)
    if (fraudLevel === 'Medium') why.push('fraud signals need a second look')
    if (bothWeak) why.push('bureau and cash-flow evidence are both weak, so additional information is requested')
    reason = `Referred to a credit officer because ${why.join(' and ') || 'conditions for straight-through approval are not all met'}. The officer receives the digital evidence pack, the indicative limit and the reasons above.`
  } else {
    const why: string[] = []
    if (!identityVerified) why.push('identity could not be verified, so processing stopped')
    if (fraudLevel === 'High') why.push('application-fraud risk is high (this is a fraud decision, not a credit view)')
    if (affordability === 'FAIL') why.push(`the instalment would take total debt to ${burden.toFixed(0)}% of income, above the ${th.maxBurden}% responsible-lending limit`)
    if (creditLevel === 'High') why.push(`estimated default probability ${pd.toFixed(1)}% is above the ${th.pdMedMax}% policy limit`)
    if (bothWeak && confidence < th.confidenceFloor) why.push('there is not enough reliable data to assess the application; the customer can resubmit with more information')
    reason = `Declined because ${why.join('; ')}.`
  }

  return {
    identityVerified, fraudScore, fraudLevel, pd, creditLevel, affordability, burden, disposable, installment,
    cicCoverage, cashflowStrength, bothWeak, confidence, confidenceLevel, decision,
    humanReview: decision === 'Refer', stopped, offer, positives, risks, reason, rules: { stp, refer, decline },
  }
}

export interface Contribution { revenue: number; funding: number; processing: number; loss: number; net: number }

// Contribution = Revenue - Funding - Processing - Expected credit loss, per application
export function contribution(amount: number, tenure: number, apr: number, funding: number, pdPct: number, lgd: number, processing: number): Contribution {
  const pmt = amount * annuity(apr, tenure)
  const revenue = pmt * tenure - amount
  const avgBal = (amount * (tenure + 1)) / (2 * tenure)
  const fundingCost = avgBal * (funding / 100) * (tenure / 12)
  const loss = amount * (pdPct / 100) * (lgd / 100)
  return { revenue, funding: fundingCost, processing, loss, net: revenue - fundingCost - processing - loss }
}
