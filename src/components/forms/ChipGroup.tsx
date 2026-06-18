import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChipOption {
  value: string | number
  label: string
  /** Small subtext line rendered below the main label */
  sub?: string
}

interface ChipGroupProps {
  options: ChipOption[]
  value: string | number | undefined
  onChange: (v: string | number) => void
  /** aria-labelledby — point at the visible <p id="xxx"> label above the group */
  'aria-labelledby'?: string
  /** aria-label — alternative when no visible label element exists */
  'aria-label'?: string
}

// ─── Individual chip button ───────────────────────────────────────────────────

interface ChipBtnProps {
  label: string
  sub?: string
  isActive: boolean
  onClick: () => void
}

function ChipBtn({ label, sub, isActive, onClick }: ChipBtnProps) {
  const [hover, setHover] = useState(false)

  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: sub ? '0.45rem 1rem 0.5rem' : '0.5rem 1rem',
        minHeight: 44,
        minWidth: 72,
        borderRadius: 8,
        border: `2px solid ${
          isActive ? 'var(--llp-blue)' : hover ? '#94a3b8' : 'var(--llp-border)'
        }`,
        background: isActive
          ? 'var(--llp-blue)'
          : hover
          ? 'var(--llp-surface, #F8FAFC)'
          : '#fff',
        color: isActive ? '#fff' : 'var(--llp-text)',
        fontSize: '0.875rem',
        fontWeight: isActive ? 700 : 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
        transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {label}
      {sub && (
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 400,
            marginTop: 2,
            opacity: isActive ? 0.78 : 0.55,
          }}
        >
          {sub}
        </span>
      )}
    </button>
  )
}

// ─── Group container ──────────────────────────────────────────────────────────

export function ChipGroup({ options, value, onChange, ...aria }: ChipGroupProps) {
  return (
    <div
      role="group"
      aria-label={aria['aria-label']}
      aria-labelledby={aria['aria-labelledby']}
      style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
    >
      {options.map((opt) => (
        <ChipBtn
          key={String(opt.value)}
          label={opt.label}
          sub={opt.sub}
          isActive={String(opt.value) === String(value)}
          onClick={() => onChange(opt.value)}
        />
      ))}
    </div>
  )
}
