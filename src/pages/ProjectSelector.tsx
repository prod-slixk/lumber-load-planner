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
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>Lumber Load Planner</h1>
        <p style={{ margin: 0, color: '#555', fontSize: '1.05rem' }}>
          Pick your project type and get an exact shopping list for the lumber desk.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {Object.values(PROJECT_META).map((meta) => (
          <button
            key={meta.type}
            onClick={() => handleSelect(meta.type)}
            aria-label={`Select project type: ${meta.label}`}
            style={{
              padding: '1.5rem',
              textAlign: 'left',
              border: '1.5px solid #ddd',
              borderRadius: '10px',
              background: '#fff',
              cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#ddd'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{meta.icon}</div>
            <span
              style={{
                display: 'block',
                margin: '0 0 0.35rem',
                fontSize: '1.05rem',
                fontWeight: 600,
              }}
            >
              {meta.label}
            </span>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#666', lineHeight: 1.4 }}>
              {meta.description}
            </p>
          </button>
        ))}
      </div>

      <nav style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
        <a href="/saved" style={{ color: '#2563eb' }}>View saved projects →</a>
      </nav>
    </main>
  )
}
