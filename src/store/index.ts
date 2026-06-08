import { create } from 'zustand'
import type {
  ProjectType,
  DimensionInputs,
  CalculationResult,
  WasteFactor,
  UnitMode,
} from '../types'

interface LLPState {
  // ─── State ──────────────────────────────────────────────────────────────
  selectedProjectType: ProjectType | null
  dimensionInputs: DimensionInputs | null
  wasteFactor: WasteFactor
  result: CalculationResult | null
  unitMode: UnitMode

  // ─── Actions ────────────────────────────────────────────────────────────
  setProjectType: (type: ProjectType) => void
  setDimensionInputs: (inputs: DimensionInputs) => void
  setWasteFactor: (factor: WasteFactor) => void
  setResult: (result: CalculationResult) => void
  setUnitMode: (mode: UnitMode) => void
  reset: () => void
}

const initialState = {
  selectedProjectType: null,
  dimensionInputs: null,
  wasteFactor: 0.10 as WasteFactor,
  result: null,
  unitMode: 'ft-decimal' as UnitMode,
}

export const useLLPStore = create<LLPState>((set) => ({
  ...initialState,

  // Changing project type clears downstream state — don't carry stale inputs
  // from a deck config into a fence form.
  setProjectType: (type) =>
    set({ selectedProjectType: type, dimensionInputs: null, result: null }),

  setDimensionInputs: (inputs) => set({ dimensionInputs: inputs }),

  // Changing waste factor should trigger a recalculation — the caller is
  // responsible for re-running the calc engine and calling setResult.
  setWasteFactor: (factor) => set({ wasteFactor: factor }),

  setResult: (result) => set({ result }),

  setUnitMode: (mode) => set({ unitMode: mode }),

  reset: () => set(initialState),
}))
