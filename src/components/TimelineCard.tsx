import { useState } from 'react'
import type { TimelineEstimate } from '../lib/timeline'

interface Props {
  estimate: TimelineEstimate
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Weekend project': { bg: '#F0FDF4', text: '#166534', border: '#86EFAC' },
  'Long weekend':    { bg: '#FEFCE8', text: '#854D0E', border: '#FDE047' },
  '2–3 weekends':    { bg: '#FFF7ED', text: '#9A3412', border: '#FDBA74' },
  '4+ weekends':     { bg: '#FEF2F2', text: '#991B1B', border: '#FCA5A5' },
}

function formatHours(min: number, max: number): string {
  if (min === max) return `${min} h`
  return `${min}–${max} h`
}

export function TimelineCard({ estimate }: Props) {
  const [expanded, setExpanded] = useState(false)
  const badge = DIFFICULTY_COLORS[estimate.difficultyLabel] ?? DIFFICULTY_COLORS['Weekend project']

  return (
    <section
      aria-labelledby="timeline-heading"
      style={{
        background: 'var(--llp-surface)',
        border: '1.5px solid var(--llp-border)',
        borderRadius: 'var(--llp-r-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.1rem',
        boxShadow: 'var(--llp-shadow-sm)',
      }}
    >
      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
        <div>
          <h2
            id="timeline-heading"
            style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--llp-text)' }}
          >
            Build timeline
          </h2>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--llp-text-muted)' }}>
            Estimated for one experienced DIYer. Add 20–30% for first-timers.
          </p>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--llp-r-pill)',
            background: badge.bg,
            color: badge.text,
            border: `1px solid ${badge.border}`,
            fontSize: '0.75rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            marginLeft: '0.75rem',
          }}
        >
          {estimate.difficultyLabel}
        </span>
      </div>

      {/* ── Total bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--llp-blue-light)',
          border: '1px solid var(--llp-blue-border, #B8CCE8)',
          borderRadius: 'var(--llp-r-sm)',
          padding: '0.7rem 1rem',
          marginBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Clock icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.25" stroke="var(--llp-blue)" strokeWidth="1.5"/>
            <path d="M8 5v3.5l2 1.5" stroke="var(--llp-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--llp-text)' }}>
            Total estimated time
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--llp-blue)' }}>
            {formatHours(estimate.totalMinHours, estimate.totalMaxHours)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--llp-text-muted)', marginLeft: '0.4rem' }}>
            ({estimate.weekendsMin === estimate.weekendsMax
              ? `${estimate.weekendsMin} weekend${estimate.weekendsMin !== 1 ? 's' : ''}`
              : `${estimate.weekendsMin}–${estimate.weekendsMax} weekends`})
          </span>
        </div>
      </div>

      {/* ── Phase list ── */}
      <div>
        {estimate.phases.map((phase, i) => (
          <div
            key={phase.name}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '0.25rem 0.75rem',
              alignItems: 'start',
              padding: '0.55rem 0',
              borderBottom: i < estimate.phases.length - 1
                ? '1px solid var(--llp-border-light)'
                : 'none',
            }}
          >
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--llp-text)' }}>
                {phase.name}
              </div>
              {expanded && (
                <div style={{ fontSize: '0.78rem', color: 'var(--llp-text-muted)', marginTop: '0.2rem' }}>
                  {phase.description}
                  {phase.waitNote && (
                    <span style={{ display: 'block', color: '#b45309', marginTop: '0.15rem', fontWeight: 600 }}>
                      ⏳ {phase.waitNote}
                    </span>
                  )}
                </div>
              )}
            </div>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--llp-text-muted)',
                whiteSpace: 'nowrap',
                paddingTop: '0.1rem',
              }}
            >
              {formatHours(phase.minHours, phase.maxHours)}
            </span>
          </div>
        ))}
      </div>

      {/* ── Toggle details ── */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={{
          marginTop: '0.75rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--llp-blue)',
          fontSize: '0.8rem',
          fontWeight: 600,
          fontFamily: 'inherit',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {expanded ? 'Hide details' : 'Show phase details'}
      </button>
    </section>
  )
}
