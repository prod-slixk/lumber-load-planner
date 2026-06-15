import { useNavigate } from 'react-router-dom'
import { useLLPStore } from '../store'
import { PROJECT_META } from '../types'
import type { ProjectType } from '../types'

export default function ProjectSelector() {
  const navigate = useNavigate()
  const setProjectType = useLLPStore((s) => s.setProjectType)

  function handleSelect(type: ProjectType) {
    setProjectType(type)
    navigate('/configure')
  }

  return (
    <main aria-labelledby="ps-heading">
      {/* ── Hero ── */}
      <div
        style={{
          background: 'var(--llp-blue)',
          borderBottom: '3px solid var(--llp-blue-dark)',
        }}
      >
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '2.75rem 1.5rem 2.5rem' }}>
          <h1
            id="ps-heading"
            style={{
              margin: '0 0 0.5rem',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            What are you building?
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '1.05rem',
              color: 'rgba(255,255,255,0.82)',
              maxWidth: 480,
            }}
          >
            Pick your project type and get a precise lumber shopping list — ready to hand to the associate.
          </p>
        </div>
      </div>

      {/* ── Card grid ── */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '2rem 1.5rem 3.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: '1rem',
          }}
        >
          {Object.values(PROJECT_META).map((meta) => (
            <button
              key={meta.type}
              onClick={() => handleSelect(meta.type)}
              aria-label={`Select project type: ${meta.label}`}
              className="llp-project-card"
            >
              <div
                style={{ fontSize: '2rem', marginBottom: '0.8rem', lineHeight: 1 }}
                aria-hidden="true"
              >
                {meta.icon}
              </div>
              <span
                style={{
                  display: 'block',
                  margin: '0 0 0.35rem',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--llp-text)',
                }}
              >
                {meta.label}
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: 'var(--llp-text-muted)',
                  lineHeight: 1.45,
                }}
              >
                {meta.description}
              </p>

              {/* Lowe's-style arrow indicator */}
              <div
                style={{
                  marginTop: '1.1rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--llp-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
                aria-hidden="true"
              >
                Start planning
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Quick link */}
        <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--llp-text-muted)' }}>
          Already have a project?{' '}
          <a
            href="/saved"
            style={{
              color: 'var(--llp-blue)',
              fontWeight: 600,
              textDecoration: 'none',
              borderBottom: '1px solid var(--llp-blue-light)',
            }}
          >
            View saved projects →
          </a>
        </p>
      </div>
    </main>
  )
}
