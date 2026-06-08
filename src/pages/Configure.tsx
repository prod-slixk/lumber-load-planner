import { useNavigate } from 'react-router-dom'
import { useLLPStore } from '../store'
import { calculateProject } from '../lib/calculations'
import { PROJECT_META, WASTE_FACTOR_LABELS } from '../types'
import type { DimensionInputs, WasteFactor } from '../types'
import DeckForm from '../components/forms/DeckForm'
import FenceForm from '../components/forms/FenceForm'
import RaisedGardenBedForm from '../components/forms/RaisedGardenBedForm'
import FramingWallForm from '../components/forms/FramingWallForm'
import ShedFloorForm from '../components/forms/ShedFloorForm'
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

  const formMap: Record<string, JSX.Element> = {
    deck: <DeckForm onSubmit={handleSubmit} />,
    fence: <FenceForm onSubmit={handleSubmit} />,
    'raised-garden-bed': <RaisedGardenBedForm onSubmit={handleSubmit} />,
    'framing-wall': <FramingWallForm onSubmit={handleSubmit} />,
    'shed-floor': <ShedFloorForm onSubmit={handleSubmit} />,
  }

  return (
    <main
      aria-labelledby="configure-heading"
      style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}
    >
      {/* Back link */}
      <button
        onClick={() => navigate('/')}
        aria-label="Back to all projects"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#555',
          fontSize: '0.875rem',
          padding: '0 0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}
      >
        ← All projects
      </button>

      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }} aria-hidden="true">{meta.icon}</div>
        <h1 id="configure-heading" style={{ margin: '0 0 0.3rem', fontSize: '1.6rem', fontWeight: 700 }}>
          {meta.label}
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '0.925rem' }}>{meta.description}</p>
      </header>

      {/* Toolbar: waste factor + unit mode toggle */}
      <section
        aria-label="Calculation options"
        style={{
          background: '#f8f9fa',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Waste factor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: '#444', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Waste:
          </span>
          {WASTE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setWasteFactor(opt)}
              aria-pressed={wasteFactor === opt}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: 999,
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: wasteFactor === opt ? '2px solid #2563eb' : '2px solid #d1d5db',
                background: wasteFactor === opt ? '#eff6ff' : '#fff',
                color: wasteFactor === opt ? '#1d4ed8' : '#555',
                transition: 'all 0.12s',
              }}
            >
              {WASTE_FACTOR_LABELS[opt]}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: '#d1d5db', flexShrink: 0 }} aria-hidden="true" />

        {/* Unit mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#444', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Units:
          </span>
          <UnitModeToggle />
        </div>
      </section>

      {/* Form card */}
      <section
        aria-label={`${meta.label} configuration`}
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '1.5rem',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}
      >
        {formMap[selectedProjectType]}
      </section>
    </main>
  )
}
