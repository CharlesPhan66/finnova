import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_ECON, DEFAULT_THRESHOLDS, SCENARIOS, type Econ, type Scenario, type Thresholds } from './data'
import { evaluate, type Overrides, type Result } from './engine'

export type ScreenId = 'overview' | 'scenarios' | 'impact'

interface Store {
  screen: ScreenId
  setScreen: (s: ScreenId) => void
  scenario: Scenario
  setScenarioId: (id: string) => void
  th: Thresholds
  setTh: (t: Thresholds) => void
  ec: Econ
  setEc: (e: Econ) => void
  ov: Overrides
  setOv: (o: Overrides) => void
  result: Result
  drawer: boolean
  setDrawer: (b: boolean) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>('overview')
  const [scenarioId, setScenarioId] = useState('C')
  const [th, setTh] = useState<Thresholds>(DEFAULT_THRESHOLDS)
  const [ec, setEc] = useState<Econ>(DEFAULT_ECON)
  const [ov, setOv] = useState<Overrides>({})
  const [drawer, setDrawer] = useState(false)
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]
  const result = useMemo(() => evaluate(scenario, th, ec, ov), [scenario, th, ec, ov])
  const value: Store = {
    screen, setScreen, scenario,
    setScenarioId: (id) => { setScenarioId(id); setOv({}) },
    th, setTh, ec, setEc, ov, setOv, result, drawer, setDrawer,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const v = useContext(Ctx)
  if (!v) throw new Error('StoreProvider missing')
  return v
}
