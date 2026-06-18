import type { SmartWarning, WarningSeverity } from '../lib/warnings'

// ─── Severity palette (no CSS vars — same reason as ProjectThumbnail) ─────────

const SEVERITY_STYLES: Record<
  WarningSeverity,
  { bg: string; border: string; accent: string; icon: string; label: string }
> = {
  info: {
    bg:     '#EFF6FF',
    border: '#BFDBFE',
    accent: '#1D4ED8',
    icon:   'ℹ',
    label:  'Info',
  },
  caution: {
    bg:     '#FFFBEB',
    border: '#FDE68A',
    accent: '#B45309',
    icon:   '⚠',
    label:  'Caution',
  },
  warning: {
    bg:     '#FFF7ED',
    border: '#FDBA74',
    accent: '#C2410C',
    icon:   '⛔',
    label:  'Warning',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  warnings: SmartWarning[]
}

export function WarningsCard({ warnings }: Props) {
  if (warnings.length === 0) return null

  return (
    <section
      aria-label="Smart Warnings"
      style={{
        marginBottom: '1.1rem',
        border: '1px solid var(--llp-border)',
        borderRadius: 'var(--llp-r)',
        overflow: 'hidden',
        background: 'var(--llp-surface)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.65rem 1rem',
          borderBottom: '1px solid var(--llp-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
        }}
      >
        <span style={{ fontSize: '0.85rem' }}>🔔</span>
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.82rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--llp-text-muted)',
          }}
        >
          Before You Build
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--llp-text-muted)',
            background: 'var(--llp-border)',
            borderRadius: '999px',
            padding: '0.1em 0.55em',
          }}
        >
          {warnings.length}
        </span>
      </div>

      {/* Warning rows */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {warnings.map((w, i) => {
          const s = SEVERITY_STYLES[w.severity]
          return (
            <li
              key={i}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: s.bg,
                borderLeft: `4px solid ${s.accent}`,
                borderBottom:
                  i < warnings.length - 1 ? '1px solid var(--llp-border)' : 'none',
              }}
            >
              {/* Icon */}
              <span
                aria-label={s.label}
                role="img"
                style={{
                  flexShrink: 0,
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  color: s.accent,
                }}
              >
                {s.icon}
              </span>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: '0 0 0.2rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: s.accent,
                    lineHeight: 1.35,
                  }}
                >
                  {w.title}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    color: 'var(--llp-text)',
                    lineHeight: 1.55,
                  }}
                >
                  {w.body}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
