import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  id: string
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * iOS-style toggle switch.
 * Uses a visually-hidden native checkbox for full keyboard + screen reader a11y.
 * The wrapping <label> makes the entire card area clickable.
 */
export function ToggleSwitch({ id, label, hint, checked, onChange }: ToggleSwitchProps) {
  const [hover, setHover] = useState(false)

  return (
    <label
      htmlFor={id}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        padding: '0.85rem 1rem',
        marginBottom: '1.25rem',
        borderRadius: 10,
        border: checked
          ? '1.5px solid var(--llp-blue-border, #B8CCE8)'
          : `1.5px solid ${hover ? '#94a3b8' : 'var(--llp-border)'}`,
        background: checked
          ? 'var(--llp-blue-light)'
          : hover
          ? 'var(--llp-surface, #F8FAFC)'
          : '#fff',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Visually hidden native checkbox — provides keyboard/focus/screen reader semantics */}
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      />

      {/* Visual track + knob — aria-hidden since the checkbox carries semantics */}
      <div
        aria-hidden="true"
        style={{
          position: 'relative',
          flexShrink: 0,
          width: 44,
          height: 26,
          borderRadius: 13,
          background: checked ? 'var(--llp-blue)' : '#D1D5DB',
          marginTop: 1,
          transition: 'background 150ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 21 : 3,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
            transition: 'left 150ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--llp-text)',
            lineHeight: 1.4,
          }}
        >
          {label}
        </span>
        {hint && (
          <span
            style={{
              display: 'block',
              marginTop: 2,
              fontSize: '0.78rem',
              color: 'var(--llp-text-muted)',
              lineHeight: 1.45,
            }}
          >
            {hint}
          </span>
        )}
      </div>
    </label>
  )
}
