import { useState } from 'react'
import { AssumptionsDrawer } from './components/AssumptionsDrawer'
import { StoreProvider, useStore, type ScreenId } from './lib/store'

import { Hero } from './screens/Hero'
import { CurrentProcess } from './screens/CurrentProcess'
import { Scenarios } from './screens/Scenarios'
import { Impact } from './screens/Impact'

const NAV: { id: ScreenId; label: string; sub: string }[] = [
  { id: 'overview', label: 'Today vs Proposed', sub: 'The mechanism and the cost of the current process' },
  { id: 'scenarios', label: 'Customer scenarios', sub: 'Eight customers, current vs proposed, with the phone view' },
  { id: 'impact', label: 'Impact & economics', sub: 'Cost, approval, loss and profit with adjustable assumptions' },
]

const DEMO: { screen: ScreenId; scenario?: string; anchor?: string; title: string; say: string }[] = [
  { screen: 'overview', title: '1. The mechanism', say: 'Same customer, two journeys. Today: documents, manual checks, 1.8–4.6 days, 380K. Proposed: consent, digital data, engine, near-real-time.' },
  { screen: 'overview', anchor: 'current-process', title: '2. Why today is costly', say: 'Tap the 2M chip. The fixed 380K is a large share of principal, and a gig worker has little a document review can use.' },
  { screen: 'scenarios', scenario: 'C', title: '3. Gig worker, both ways', say: 'Tap through the phone at your own pace. Current treatment likely declines; proposed uses platform cash-flow and approves automatically.' },
  { screen: 'impact', title: '4. Economics', say: 'Cost per application and profit, current vs proposed. Move the cost slider to show sensitivity.' },
  { screen: 'scenarios', scenario: 'F', title: '5. Risky customer', say: 'Credit looks fine but fraud signals are high: Decline. The solution is not "approve more people".' },
]

function Overview() {
  return (
    <div>
      <Hero />
      <div id="current-process" className="mt-12 scroll-mt-20 border-t-4 border-sky-200 pt-8">
        <CurrentProcess />
      </div>
    </div>
  )
}

function Shell() {
  const { screen, setScreen, setDrawer, setScenarioId } = useStore()
  const [demo, setDemo] = useState<number | null>(null)
  const [menu, setMenu] = useState(false)

  const go = (i: number) => {
    const s = DEMO[i]
    setDemo(i)
    if (s.scenario) setScenarioId(s.scenario)
    setScreen(s.screen)
    window.scrollTo({ top: 0 })
    if (s.anchor) window.setTimeout(() => document.getElementById(s.anchor!)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }
  const nav = (id: ScreenId) => { setScreen(id); setMenu(false); window.scrollTo({ top: 0 }) }
  const Active = { overview: Overview, scenarios: Scenarios, impact: Impact }[screen]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-navy-900 text-white shadow">
        <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
          <button className="rounded bg-white/10 px-2 py-1 text-sm lg:hidden" onClick={() => setMenu(!menu)} aria-label="Toggle menu" aria-expanded={menu}>☰</button>
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white p-1">
              <img src={`${import.meta.env.BASE_URL}hlb-logo-icon.png`} alt="Hong Leong Bank" className="h-full w-full object-contain" />
            </span>
            <div className="min-w-0 leading-tight">
              <h1 className="text-xs font-semibold sm:text-base"><span className="sm:hidden">Underwriting Simulation</span><span className="hidden sm:inline">Point-of-Purchase Underwriting Simulation</span></h1>
              <p className="text-[10px] text-sky-200 sm:text-[11px]"><span className="sm:hidden">By Team Finnova</span><span className="hidden sm:inline">By Team Finnova · Business Challenge 2026 · HLBVN case · simulated data only, not HLBVN results</span></p>
            </div>
          </div>
          <div className="ml-auto flex shrink-0 gap-1.5 sm:gap-2">
            <button onClick={() => (demo === null ? go(0) : setDemo(null))} className={`rounded px-2 py-1.5 text-xs font-semibold sm:px-3 ${demo === null ? 'bg-white/10 hover:bg-white/20' : 'bg-white text-navy-900'}`}>
              {demo === null ? <><span className="sm:hidden">Demo</span><span className="hidden sm:inline">Demo guide</span></> : <><span className="sm:hidden">Exit</span><span className="hidden sm:inline">Exit demo</span></>}
            </button>
            <button onClick={() => setDrawer(true)} className="rounded bg-hred-600 px-2 py-1.5 text-xs font-semibold hover:bg-hred-700 sm:px-3">Assumptions</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        <nav className={`${menu ? 'block' : 'hidden'} fixed inset-x-0 top-[52px] z-20 max-h-[70vh] overflow-y-auto border-b border-sky-200 bg-white p-2 shadow lg:sticky lg:top-[52px] lg:block lg:h-[calc(100vh-52px)] lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r lg:shadow-none`} aria-label="Screens">
          {NAV.map((n, i) => (
            <button key={n.id} onClick={() => nav(n.id)} aria-current={screen === n.id ? 'page' : undefined}
              className={`mb-1 flex w-full items-start gap-2 rounded-md px-3 py-2.5 text-left text-sm ${screen === n.id ? 'bg-navy-900 font-semibold text-white' : 'text-slate-700 hover:bg-sky-100'}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${screen === n.id ? 'bg-white text-navy-900' : 'bg-sky-100 text-navy-800'}`}>{i + 1}</span>
              <span><span className="block">{n.label}</span><span className={`block text-[11px] font-normal leading-snug ${screen === n.id ? 'text-sky-200' : 'text-slate-500'}`}>{n.sub}</span></span>
            </button>
          ))}
          <p className="mt-3 px-3 text-[11px] leading-snug text-slate-400">The Assumptions register is always one click away in the header.</p>
          <img src={`${import.meta.env.BASE_URL}hlb-logo-vertical.png`} alt="Hong Leong Bank" className="mx-auto mt-6 hidden w-28 lg:block" />
        </nav>
        <main className={`min-w-0 flex-1 px-4 py-5 sm:px-6 ${demo !== null ? 'pb-40' : 'pb-10'}`}>
          <Active />
          <footer className="mt-10 border-t border-sky-200 pt-4 text-[11px] text-slate-500">
            By Team Finnova. Prototype for the Business Challenge 2026. All customers, numbers and outputs are simulated locally in your browser unless labelled CASE FACT. Not an HLBVN system, policy or result.
          </footer>
        </main>
      </div>

      {demo !== null && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-hred-600 bg-navy-950 text-white shadow-2xl">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1 basis-80">
              <p className="text-xs font-semibold text-sky-300">Demo step {demo + 1} of {DEMO.length} · {DEMO[demo].title}</p>
              <p className="text-sm">{DEMO[demo].say}</p>
            </div>
            <div className="flex gap-2">
              <button disabled={demo === 0} onClick={() => go(demo - 1)} className="rounded bg-white/10 px-3 py-1.5 text-sm disabled:opacity-40">Back</button>
              <button disabled={demo === DEMO.length - 1} onClick={() => go(demo + 1)} className="rounded bg-white px-3 py-1.5 text-sm font-semibold text-navy-900 disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}
      <AssumptionsDrawer />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
