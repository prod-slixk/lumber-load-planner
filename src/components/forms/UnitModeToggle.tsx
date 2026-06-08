/**
 * UnitModeToggle — three-button segmented control for switching dimension units.
 * Reads/writes `unitMode` in the Zustand store.
 */

import { useLLPStore } from '../../store'
import { UNIT_MODE_LABELS } from '../../types'
import type { UnitMode } from '../../types'

const MODES: UnitMode[] = ['ft-decimal', 'ft-in', 'm']

export function UnitModeToggle() {
  const unitMode = useLLPStore((s) => s.unitMode)
  const setUnitMode = useLLPStore((s) => s.setUnitMode)

  return (
    <fieldset>
      <legend className="sr-only">Dimension units</legend>
      <div
        className="inline-flex rounded-md border border-gray-300 overflow-hidden"
        role="group"
        aria-label="Dimension units"
      >
        {MODES.map((mode) => {
          const active = mode === unitMode
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setUnitMode(mode)}
              aria-pressed={active}
              className={[
                'px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset',
                active
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50',
              ].join(' ')}
            >
              {UNIT_MODE_LABELS[mode]}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
