import { useNavigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useLLPStore } from '../store'
import { calculateProject } from '../lib/calculations'
import { PROJECT_META, WASTE_FACTOR_LABELS } from '../types'
import type { DimensionInputs, WasteFactor } from '../types'
import DeckForm from '../components/forms/DeckForm'
import FenceForm from '../components/forms/FenceForm'
import RaisedGardenBedForm from '../components/forms/RaisedGardenBedForm'
import FramingWallForm from '../components/forms/FramingWallForm'
import ShedFloorForm from '../components/forms/ShedFloorForm'
import PergolaForm from '../components/forms/PergolaForm'
import { UnitModeToggle } from '../components/forms/UnitModeToggle'

const WASTE_OPTIONS: WasteFactor[] = [0.05, 0.10, 0.15]

export default function Configure() {
  const navigate = useNavigate()
  const { selectedProjectType, wasteFactor, setWasteFactor, setDimensionInputs, setResult } = useLLPStore()

  if (!selectedProjectType) {
    navigate('/', { replace: true })
    return null
  }

  const meta = PROJECT_META[selectedProjectType]

  function handleSubmit(dims: DimensionInputs) {
    setDimensionInputs(dims)
    const result = calculateProject(dims, wasteFactor)
    setResult(result)
    navigate('/results')
  }

  const formMap: Record<string, ReactElement> = {
    deck:              <DeckForm onSubmit={handleSubmit} />,
    fence:             <FenceForm onSubmit={handleSubmit} />,
    'raised-garden-bed': <RaisedGardenBedForm onSubmit={handleSubmit} />,
    'framing-wall':    <FramingWallForm onSubmit={handleSubmit} />,
    'shed-floor':      <ShedFloorForm onSubmit={handleSubmit} />,
    pergola:           <PergolaForm onSubmit={handleSubmit} />,
  }

  return (
    <main
      aria-labelledby="configure-heading"
      className="llp-page-enter"
      style={{ maxWidth: 660, margin: '0 auto', padding: '2rem 1.25rem 3rem' }}
    >
      {/* ── Back link ── */}
      <button
        onClick={() => navigate('/')}
        aria-label="Back to all projects"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--llp-text-muted)',
          fontSize: '0.875rem',
          padding: '0 0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontWeight: 600,
          transition: 'color var(--llp-t-sm) var(--llp-ease)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--llp-blue)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--llp-text-muted)' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        All projects
      </button>

      {/* ── Page header ── */}
      <header style={{ marginBottom: '1.75rem' }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: 'var(--llp-blue-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            marginBottom: '0.85rem',
          }}
          aria-hidden="true"
        >
          {meta.icon}
        </div>
        <h1
          id="configure-heading"
          style={{
            margin: '0 0 0.3rem',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--llp-text)',
            letterSpacing: '-0.02em',
          }}
        >
          {meta.label}
        </h1>
        <p style={{ margin: 0, color: 'var(--llp-text-muted)', fontSize: '0.925rem' }}>
          {meta.description}
        </p>
      </header>

      {/* ── Options toolbar ── */}
      <section
        aria-label="Calculation options"
        style={{
          background: 'var(--llp-surface)',
          border: '1.5px solid var(--llp-border)',
          borderRadius: 'var(--llp-r-md)',
          padding: '0.85rem 1.1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Waste factor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--llp-text)', fontWeight: 700, whiteSpace: 'nowrap' }}>
            Waste factor:
          </span>
          {WASTE_OPTIONS.map((opt) => {
            const active = wasteFactor === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setWasteFactor(opt)}
                aria-pressed={active}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: 'var(--llp-r-pill)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: active ? '2px solid var(--llp-blue)' : '2px solid var(--llp-border)',
                  background: active ? 'var(--llp-blue)' : '#fff',
                  color: active ? '#fff' : 'var(--llp-text-muted)',
                  transition: 'all var(--llp-t-sm) var(--llp-ease)',
                }}
              >
                {WASTE_FACTOR_LABELS[opt]}
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div
          style={{ width: 1, height: 24, background: 'var(--llp-border)', flexShrink: 0 }}
          aria-hidden="true"
        />

        {/* Unit mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.84rem', color: 'var(--llp-text)', fontWeight: 700, whiteSpace: 'nowrap' }}>
            Units:
          </span>
          <UnitModeToggle />
        </div>
      </section>

      {/* ── Form card ── */}
      <section
        aria-label={`${meta.label} configuration`}
        style={{
          background: 'var(--llp-surface)',
          border: '1.5px solid var(--llp-border)',
          borderRadius: 'var(--llp-r-lg)',
          padding: '1.5rem 1.5rem 1.75rem',
          boxShadow: 'var(--llp-shadow-sm)',
        }}
      >
        {formMap[selectedProjectType]}
      </section>
    </main>
  )
}
