/**
 * UnitModeToggle — segmented control for switching dimension units.
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
    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
      <legend className="sr-only">Dimension units</legend>
      <div
        role="group"
        aria-label="Dimension units"
        style={{
          display: 'inline-flex',
          border: '1.5px solid var(--llp-border)',
          borderRadius: 'var(--llp-r-sm)',
          overflow: 'hidden',
        }}
      >
        {MODES.map((mode, i) => {
          const active = mode === unitMode
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setUnitMode(mode)}
              aria-pressed={active}
              style={{
                padding: '0.3rem 0.7rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                border: 'none',
                borderLeft: i > 0 ? '1.5px solid var(--llp-border)' : 'none',
                background: active ? 'var(--llp-blue)' : '#fff',
                color: active ? '#fff' : 'var(--llp-text-muted)',
                transition: 'background var(--llp-t-sm) var(--llp-ease), color var(--llp-t-sm) var(--llp-ease)',
                minWidth: 52,
              }}
            >
              {UNIT_MODE_LABELS[mode]}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
