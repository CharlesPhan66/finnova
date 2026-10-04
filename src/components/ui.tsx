import type { ReactNode } from 'react'
import type { Decision, Kind, Level } from '../lib/data'

const KIND_STYLE: Record<Kind, { label: string; cls: string }> = {
  case: { label: 'CASE FACT', cls: 'bg-navy-900 text-white' },
  assumption: { label: 'TEAM ASSUMPTION', cls: 'bg-warn-50 text-warn-600 ring-1 ring-warn-600/30' },
  sim: { label: 'SIMULATION', cls: 'bg-sky-100 text-navy-700 ring-1 ring-navy-700/20' },
}

export function Tag({ kind, text }: { kind: Kind; text?: string }) {
  const k = KIND_STYLE[kind]
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${k.cls}`}>
      {text ?? k.label}
    </span>
  )
}

export function Tip({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <span className="tip relative inline-flex items-center gap-1" tabIndex={0}>
      {children}
      <span aria-hidden className="inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full bg-sky-200 text-[9px] font-bold text-navy-800">i</span>
      <span role="tooltip" className="tip-pop">{text}</span>
    </span>
  )
}

export function Card({ title, sub, right, children, className = '' }: { title?: ReactNode; sub?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card p-4 ${className}`}>
      {(title || right) && (
        <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            {title && <h3 className="text-sm font-semibold text-navy-900">{title}</h3>}
            {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  )
}

export function ScreenHeader({ n, title, question, children }: { n: number; title: string; question: string; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-sky-200 pb-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-hred-600">Screen {n}</p>
        <h2 className="text-xl font-semibold text-navy-900 sm:text-2xl">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">{question}</p>
      </div>
      {children}
    </div>
  )
}

const DEC: Record<Decision, string> = {
  'Approve': 'bg-ok-600 text-white',
  Review: 'bg-warn-600 text-white',
  Decline: 'bg-hred-600 text-white',
}
export function DecisionBadge({ d, big }: { d: Decision; big?: boolean }) {
  const label = d === 'Approve' ? 'APPROVE' : d === 'Review' ? 'REVIEW' : 'DECLINE'
  return <span className={`inline-block rounded-md font-semibold tracking-wide ${DEC[d]} ${big ? 'px-4 py-2 text-base' : 'px-2.5 py-1 text-xs'}`}>{label}</span>
}

export function LevelBadge({ level, invert }: { level: Level; invert?: boolean }) {
  const good = invert ? level === 'High' : level === 'Low'
  const mid = level === 'Medium'
  const cls = mid ? 'bg-warn-50 text-warn-600' : good ? 'bg-ok-50 text-ok-600' : 'bg-hred-50 text-hred-600'
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cls}`}>{level.toUpperCase()}</span>
}

export function StatusPill({ ok, yes = 'PASS', no = 'FAIL' }: { ok: boolean; yes?: string; no?: string }) {
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${ok ? 'bg-ok-50 text-ok-600' : 'bg-hred-50 text-hred-600'}`}>{ok ? yes : no}</span>
}

export function Gauge({ value, label, lo, hi, invert = false, display }: { value: number; label: string; lo: number; hi: number; invert?: boolean; display?: string }) {
  // value 0..100; lo/hi are band edges (low<=lo green, >hi red; inverted for confidence)
  const v = Math.max(0, Math.min(100, value))
  const ang = Math.PI * (1 - v / 100)
  const x = 60 + 44 * Math.cos(ang)
  const y = 62 - 44 * Math.sin(ang)
  const good = invert ? v >= hi : v <= lo
  const bad = invert ? v < lo : v > hi
  const color = good ? '#12805c' : bad ? '#c8102e' : '#b7791f'
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 74" className="w-32" role="img" aria-label={`${label} ${display ?? v.toFixed(0)}`}>
        <path d="M16 62 A44 44 0 0 1 104 62" fill="none" stroke="#e4eefa" strokeWidth="10" strokeLinecap="round" />
        <path d="M16 62 A44 44 0 0 1 104 62" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" pathLength={100} strokeDasharray={`${v} 100`} style={{ transition: 'stroke-dasharray .6s ease' }} />
        <circle cx={x} cy={y} r="4" fill="#0a2a5c" style={{ transition: 'all .6s ease' }} />
        <text x="60" y="58" textAnchor="middle" className="fill-navy-900" fontSize="17" fontWeight="700">{display ?? v.toFixed(0)}</text>
      </svg>
      <span className="-mt-1 text-xs font-medium text-slate-600">{label}</span>
    </div>
  )
}

export function Slider({ label, tip, value, min, max, step, onChange, fmt, kind = 'assumption' }: { label: string; tip?: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; fmt: (n: number) => string; kind?: Kind }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between gap-2 text-xs font-medium text-slate-700">
        <span className="flex items-center gap-1.5">{tip ? <Tip text={tip}>{label}</Tip> : label}<Tag kind={kind} /></span>
        <span className="font-semibold tabular-nums text-navy-900">{fmt(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

export function Metric({ label, value, tip, tag, tone = 'navy', sub }: { label: string; value: ReactNode; tip?: string; tag?: Kind; tone?: 'navy' | 'red' | 'green' | 'amber'; sub?: ReactNode }) {
  const c = { navy: 'text-navy-900', red: 'text-hred-600', green: 'text-ok-600', amber: 'text-warn-600' }[tone]
  return (
    <div className="rounded-lg bg-sky-50 p-3">
      <div className="mb-1 flex items-center justify-between gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {tip ? <Tip text={tip}>{label}</Tip> : label}
        {tag && <Tag kind={tag} />}
      </div>
      <div className={`text-xl font-semibold tabular-nums ${c}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  )
}

export function Bar({ value, color = '#1f5bb8' }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
      <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color, transition: 'width .5s ease' }} />
    </div>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-slate-600">{children}</p>
}
