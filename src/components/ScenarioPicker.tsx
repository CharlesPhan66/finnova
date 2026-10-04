import { useMemo } from 'react'
import { SCENARIOS } from '../lib/data'
import { evaluate } from '../lib/engine'
import { useStore } from '../lib/store'

const DOT = { 'Approve': 'bg-ok-600', Review: 'bg-slate-500', Decline: 'bg-hred-600' } as const

export function ScenarioPicker({ compact }: { compact?: boolean }) {
  const { scenario, setScenarioId, th, ec } = useStore()
  const outcomes = useMemo(() => Object.fromEntries(SCENARIOS.map((s) => [s.id, evaluate(s, th, ec).decision])), [th, ec])
  return (
    <div role="radiogroup" aria-label="Customer scenario" className={`grid gap-2 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1'}`}>
      {SCENARIOS.map((s) => {
        const on = s.id === scenario.id
        return (
          <button
            key={s.id}
            role="radio"
            aria-checked={on}
            onClick={() => setScenarioId(s.id)}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${on ? 'border-navy-700 bg-navy-900 text-white shadow' : 'border-sky-200 bg-white hover:border-navy-600'}`}
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${on ? 'bg-white text-navy-900' : 'bg-sky-100 text-navy-800'}`}>{s.id}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold">{s.short}</span>
              {!compact && <span className={`block text-[11px] ${on ? 'text-sky-200' : 'text-slate-500'}`}>{s.blurb}</span>}
            </span>
            <span title={`Proposed engine: ${outcomes[s.id]}`} className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[outcomes[s.id]]}`} />
          </button>
        )
      })}
    </div>
  )
}
