// Central registry of inputs. Every number is classified as exactly one of:
//   CASE FACT        – given in the Business Challenge 2026 case brief
//   TEAM ASSUMPTION  – our adjustable input, not an HLBVN figure
//   SIMULATION       – computed by this prototype from the above

export type Kind = 'case' | 'assumption' | 'sim'
export type Level = 'Low' | 'Medium' | 'High'
export type Decision = 'Approve' | 'Review' | 'Decline'
export type CicState = 'good' | 'thin' | 'none' | 'poor'

export const CASE = {
  minLoan: 1_600_000,
  maxLoan: 90_100_000,
  tenures: [3, 6, 9, 12, 18, 24] as const,
  costPerApp: 380_000,
  tatMinDays: 1.8,
  tatMaxDays: 4.6,
  mix: [
    { key: 'salaried', label: 'Salaried with credit history', share: 35.5 },
    { key: 'salaried-nh', label: 'Salaried, no credit history', share: 20.5 },
    { key: 'gig', label: 'Gig / platform workers', share: 15.0 },
    { key: 'merchant', label: 'Online merchants (MSME)', share: 14.5 },
    { key: 'first', label: 'First-time borrowers', share: 14.5 },
  ],
}

export interface Inputs {
  identityMatch: number
  cic: CicState
  existingDebtMonthly: number
  repayment: 'clean' | 'none' | 'late'
  monthlyIncome: number
  incomeConsistency: number
  recurringShare: number
  expenseRatio: number
  platformIncome: number
  ecommerceSales: number
  ewalletActivity: number
  txPerMonth: number
  deviceRisk: number
  appConsistency: number
  duplicateSignals: number
  dataCompleteness: number
}

export interface Scenario {
  id: string
  name: string
  short: string
  segment: string
  firstTime: boolean
  blurb: string
  requested: number
  tenure: number
  inputs: Inputs
  docs: string
  current: {
    outcome: 'Approve' | 'Likely decline' | 'Refer for documents' | 'Approve (fraud missed)' | 'Decline'
    tatDays: number
    why: string
  }
}

const base: Inputs = {
  identityMatch: 96, cic: 'good', existingDebtMonthly: 0, repayment: 'clean', monthlyIncome: 15_000_000,
  incomeConsistency: 90, recurringShare: 90, expenseRatio: 55, platformIncome: 0, ecommerceSales: 0,
  ewalletActivity: 60, txPerMonth: 60, deviceRisk: 10, appConsistency: 95, duplicateSignals: 0, dataCompleteness: 92,
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'A', name: 'Salaried with credit history', short: 'Salaried + history', segment: 'Salaried with credit history', firstTime: false,
    blurb: 'Stable payroll, clean bureau record, existing bank relationship.',
    requested: 20_000_000, tenure: 12,
    inputs: { ...base, monthlyIncome: 22_000_000, existingDebtMonthly: 2_000_000, identityMatch: 98, incomeConsistency: 95, recurringShare: 96, expenseRatio: 45, ewalletActivity: 70, txPerMonth: 85, deviceRisk: 8, appConsistency: 96, dataCompleteness: 97 },
    docs: 'Payslips + labour contract: complete',
    current: { outcome: 'Approve', tatDays: 1.8, why: 'Documents and bureau record are standard, so manual review works; it is simply slow and costs the full 380K.' },
  },
  {
    id: 'B', name: 'Salaried, no credit history', short: 'Salaried, no history', segment: 'Salaried with no credit history', firstTime: false,
    blurb: 'Regular salary inflows but nothing in the credit bureau.',
    requested: 12_000_000, tenure: 12,
    inputs: { ...base, cic: 'none', repayment: 'none', monthlyIncome: 15_000_000, identityMatch: 96, incomeConsistency: 93, recurringShare: 95, expenseRatio: 45, ewalletActivity: 55, txPerMonth: 55, deviceRisk: 12, appConsistency: 94, dataCompleteness: 90 },
    docs: 'Payslips: complete. Bureau file: empty',
    current: { outcome: 'Likely decline', tatDays: 3.2, why: 'Officer has no bureau history to lean on and the salary stream in the bank account is not part of the document pack.' },
  },
  {
    id: 'C', name: 'Gig / platform worker', short: 'Gig worker', segment: 'Gig / platform workers', firstTime: false,
    blurb: 'Weekly platform payouts, high transaction activity, no payslip.',
    requested: 8_000_000, tenure: 9,
    inputs: { ...base, cic: 'thin', repayment: 'none', monthlyIncome: 12_000_000, existingDebtMonthly: 500_000, identityMatch: 95, incomeConsistency: 80, recurringShare: 88, expenseRatio: 50, platformIncome: 9_500_000, ewalletActivity: 85, txPerMonth: 180, deviceRisk: 15, appConsistency: 93, dataCompleteness: 90 },
    docs: 'No payslip or labour contract: limited',
    current: { outcome: 'Likely decline', tatDays: 4.3, why: 'Income is real but not documented in a form the officer can verify, so the file is slow and usually fails the document test.' },
  },
  {
    id: 'D', name: 'Online merchant', short: 'Online merchant', segment: 'Online merchants (MSME)', firstTime: false,
    blurb: 'Recurring digital sales on marketplaces, seasonal swings.',
    requested: 20_000_000, tenure: 12,
    inputs: { ...base, cic: 'thin', repayment: 'none', monthlyIncome: 38_000_000, existingDebtMonthly: 3_000_000, identityMatch: 94, incomeConsistency: 66, recurringShare: 74, expenseRatio: 62, ecommerceSales: 52_000_000, ewalletActivity: 78, txPerMonth: 240, deviceRisk: 18, appConsistency: 90, dataCompleteness: 86 },
    docs: 'Business registration only; no audited accounts',
    current: { outcome: 'Likely decline', tatDays: 4.6, why: 'Digital sales are not accepted as evidence; the file needs business accounts the merchant does not have.' },
  },
  {
    id: 'E', name: 'First-time digital borrower', short: 'First-time borrower', segment: 'First-time borrowers', firstTime: true,
    blurb: 'No bureau file, light wallet and telecom footprint, high uncertainty.',
    requested: 10_000_000, tenure: 9,
    inputs: { ...base, cic: 'none', repayment: 'none', monthlyIncome: 9_000_000, identityMatch: 93, incomeConsistency: 70, recurringShare: 72, expenseRatio: 58, ewalletActivity: 66, txPerMonth: 45, deviceRisk: 22, appConsistency: 86, dataCompleteness: 74 },
    docs: 'ID only; income unverified',
    current: { outcome: 'Decline', tatDays: 3.9, why: 'No history and no documents: nothing for the officer to underwrite on.' },
  },
  {
    id: 'F', name: 'Fraudulent application', short: 'Suspicious application', segment: 'Salaried with credit history', firstTime: false,
    blurb: 'Looks creditworthy on paper, but device and behaviour signals are wrong.',
    requested: 20_000_000, tenure: 12,
    inputs: { ...base, monthlyIncome: 30_000_000, identityMatch: 90, incomeConsistency: 90, recurringShare: 92, expenseRatio: 45, deviceRisk: 88, appConsistency: 40, duplicateSignals: 3, dataCompleteness: 95 },
    docs: 'Payslips look complete (possibly forged)',
    current: { outcome: 'Approve (fraud missed)', tatDays: 2.4, why: 'The pack looks complete. Device, duplicate-application and behaviour signals are not part of a document review.' },
  },
  {
    id: 'G', name: 'Strong income, poor affordability', short: 'Over-indebted', segment: 'Salaried with credit history', firstTime: false,
    blurb: 'High income but most of it already committed to existing debt.',
    requested: 20_000_000, tenure: 12,
    inputs: { ...base, monthlyIncome: 45_000_000, existingDebtMonthly: 20_000_000, repayment: 'late', identityMatch: 97, incomeConsistency: 92, recurringShare: 94, expenseRatio: 50, deviceRisk: 10, appConsistency: 95, dataCompleteness: 96 },
    docs: 'Complete',
    current: { outcome: 'Decline', tatDays: 2.1, why: 'Declined after review, but the full 380K was already spent to reach a no.' },
  },
  {
    id: 'H', name: 'Missing / inconsistent data', short: 'Missing data', segment: 'Salaried with no credit history', firstTime: false,
    blurb: 'Bureau unavailable, declared income does not match observed inflows.',
    requested: 15_000_000, tenure: 12,
    inputs: { ...base, cic: 'none', repayment: 'none', monthlyIncome: 14_000_000, identityMatch: 90, incomeConsistency: 52, recurringShare: 55, expenseRatio: 60, ewalletActivity: 40, txPerMonth: 30, deviceRisk: 25, appConsistency: 62, dataCompleteness: 58 },
    docs: 'Partial; amounts conflict',
    current: { outcome: 'Refer for documents', tatDays: 4.1, why: 'Officer sends the file back for more documents; many customers drop out while waiting.' },
  },
]

export interface Thresholds {
  confidenceStp: number
  confidenceFloor: number
  pdLowMax: number
  pdMedMax: number
  fraudLowMax: number
  fraudHighMin: number
  identityMin: number
  maxBurden: number
  firstTimeNoStp: boolean
  firstTimeCap: number
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  confidenceStp: 75,
  confidenceFloor: 40,
  pdLowMax: 4,
  pdMedMax: 9,
  fraudLowMax: 30,
  fraudHighMin: 60,
  identityMin: 85,
  maxBurden: 40,
  firstTimeNoStp: true,
  firstTimeCap: 5_000_000,
}

export interface Econ {
  proposedCost: number
  reviewCostPct: number
  proposedMinutes: number
  aprLow: number
  aprMed: number
  funding: number
  lgd: number
}

export const DEFAULT_ECON: Econ = {
  proposedCost: 91_000,
  reviewCostPct: 50,
  proposedMinutes: 5,
  aprLow: 16,
  aprMed: 21,
  funding: 7,
  lgd: 70,
}

export interface AssumptionItem {
  kind: Kind
  label: string
  value: string
  note?: string
}

export const STATIC_ASSUMPTIONS: AssumptionItem[] = [
  { kind: 'case', label: 'Requested financing range', value: '1.6M – 90.1M VND' },
  { kind: 'case', label: 'Available tenures', value: '3 / 6 / 9 / 12 / 18 / 24 months' },
  { kind: 'case', label: 'Internal processing cost benchmark', value: '380,000 VND per application' },
  { kind: 'case', label: 'Decision turnaround (centralized manual review)', value: '1.8 – 4.6 business days' },
  { kind: 'case', label: 'Application mix', value: 'Salaried with history 35.5% · salaried no history 20.5% · gig/platform 15.0% · online merchants 14.5% · first-time borrowers 14.5%' },
]

export const SCORECARD_NOTE = 'Illustrative weights. To be re-estimated on the Round 3 dataset.'
