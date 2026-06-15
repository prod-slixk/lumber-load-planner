import { useState } from 'react'
import { LUMBER_SIZES } from '../data/lumber'

// Common use-cases per nominal size
const COMMON_USES: Record<string, string[]> = {
  '1x4':  ['Fence pickets', 'Trim boards', 'Light shelving'],
  '1x6':  ['Fence boards', 'Siding', 'Shallow shelving'],
  '1x8':  ['Wide trim', 'Paneling', 'Shelving'],
  '2x4':  ['Wall studs', 'Blocking', 'Light framing'],
  '2x6':  ['Deck joists (short spans)', 'Exterior wall framing', 'Raised bed sides'],
  '2x8':  ['Deck joists (standard)', 'Headers', 'Stair stringers'],
  '2x10': ['Deck joists (longer spans)', 'Floor joists', 'Heavy headers'],
  '2x12': ['Stair stringers', 'Deck beams', 'Long-span floor joists'],
  '4x4':  ['Fence posts', 'Light deck posts', 'Pergola legs'],
  '4x6':  ['Deck beams', 'Pergola rafters'],
  '6x6':  ['Heavy deck posts', 'Pergola columns', 'Structural support'],
}

// ─── SVG Cross-Section ────────────────────────────────────────────────────────

function BoardSvg({
  actualThickness,
  actualWidth,
}: {
  actualThickness: number
  actualWidth: number
}) {
  const PX_PER_INCH = 9
  const VB_W = 140
  const VB_H = 80

  const w = actualWidth * PX_PER_INCH
  const h = actualThickness * PX_PER_INCH
  const x = (VB_W - w) / 2
  const y = (VB_H - h) / 2

  const grainSpacing = w / 4
  const grainLines = [1, 2, 3].map((i) => ({
    x1: x + grainSpacing * i,
    y1: y + 2,
    x2: x + grainSpacing * i,
    y2: y + h - 2,
  }))

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', maxWidth: 140 }}
    >
      {/* Board body */}
      <rect
        x={x} y={y} width={w} height={h} rx={2}
        fill="#F5E6C8"
        stroke="#A0782A"
        strokeWidth={1.5}
      />
      {/* Wood grain */}
      {grainLines.map((g, i) => (
        <line
          key={i}
          x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}
          stroke="#D4A860"
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />
      ))}
      {/* Width label */}
      <text
        x={VB_W / 2}
        y={y + h + 13}
        textAnchor="middle"
        fontSize={9}
        fill="#6B7685"
        fontFamily="system-ui, sans-serif"
      >
        {actualWidth}&quot;
      </text>
      {/* Thickness label */}
      <text
        x={x - 6}
        y={y + h / 2 + 3.5}
        textAnchor="middle"
        fontSize={9}
        fill="#6B7685"
        fontFamily="system-ui, sans-serif"
      >
        {actualThickness}&quot;
      </text>
    </svg>
  )
}

// ─── Accordion Item ───────────────────────────────────────────────────────────

function SizeCard({ size }: { size: (typeof LUMBER_SIZES)[number] }) {
  const [open, setOpen] = useState(false)
  const uses = COMMON_USES[size.nominal] ?? []

  return (
    <div
      style={{
        border: '1.5px solid var(--llp-border)',
        borderRadius: 'var(--llp-r-md)',
        overflow: 'hidden',
        background: 'var(--llp-surface)',
      }}
    >
      {/* Accordion trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`guide-${size.nominal}`}
        className="llp-accordion-btn"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span
            style={{
              fontSize: '0.975rem',
              fontWeight: 700,
              color: open ? 'var(--llp-blue-dark)' : 'var(--llp-text)',
              fontFamily: 'ui-monospace, "Cascadia Code", Consolas, monospace',
              letterSpacing: '0.01em',
            }}
          >
            {size.nominal}
          </span>
          <span style={{ fontSize: '0.84rem', color: 'var(--llp-text-muted)' }}>
            {size.nominalThickness}&quot; × {size.nominalWidth}&quot; nominal
          </span>
        </div>
        {/* Chevron SVG */}
        <svg
          className="llp-accordion-chevron"
          fill="none"
          viewBox="0 0 18 18"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.5 6.75 9 11.25l4.5-4.5"
          />
        </svg>
      </button>

      {/* Accordion panel */}
      {open && (
        <div id={`guide-${size.nominal}`} className="llp-accordion-panel">
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '1.75rem',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            {/* SVG diagram */}
            <div
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                minWidth: 140,
              }}
            >
              <BoardSvg
                actualThickness={size.actualThickness}
                actualWidth={size.actualWidth}
              />
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--llp-text-hint)' }}>
                Cross-section (to scale)
              </p>
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Dimensions table */}
              <div>
                <h3
                  style={{
                    margin: '0 0 0.5rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--llp-blue)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}
                >
                  Actual dimensions
                </h3>
                <table
                  style={{ fontSize: '0.875rem', width: '100%', maxWidth: 260, borderCollapse: 'collapse' }}
                  aria-label={`Dimensions for ${size.nominal}`}
                >
                  <thead>
                    <tr>
                      <th style={{ padding: '0 0 0.3rem', fontWeight: 600, color: 'var(--llp-text-muted)', fontSize: '0.75rem', textAlign: 'left', width: 100 }}>
                        Nominal
                      </th>
                      <th style={{ padding: '0 0 0.3rem', fontWeight: 600, color: 'var(--llp-text-muted)', fontSize: '0.75rem', textAlign: 'left' }}>
                        Actual
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.2rem 0', fontFamily: 'ui-monospace, Consolas, monospace', color: 'var(--llp-text)' }}>
                        {size.nominalThickness}&quot;
                      </td>
                      <td style={{ padding: '0.2rem 0', fontFamily: 'ui-monospace, Consolas, monospace', color: 'var(--llp-text)', fontWeight: 700 }}>
                        {size.actualThickness}&quot;
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.2rem 0', fontFamily: 'ui-monospace, Consolas, monospace', color: 'var(--llp-text)' }}>
                        {size.nominalWidth}&quot;
                      </td>
                      <td style={{ padding: '0.2rem 0', fontFamily: 'ui-monospace, Consolas, monospace', color: 'var(--llp-text)', fontWeight: 700 }}>
                        {size.actualWidth}&quot;
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Common uses */}
              {uses.length > 0 && (
                <div>
                  <h3
                    style={{
                      margin: '0 0 0.5rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--llp-blue)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                    }}
                  >
                    Common uses
                  </h3>
                  <ul
                    style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
                    aria-label={`Common uses for ${size.nominal}`}
                  >
                    {uses.map((use) => (
                      <li
                        key={use}
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--llp-text)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                        }}
                      >
                        <span style={{ color: 'var(--llp-blue)', fontWeight: 700, marginTop: '0.1em', flexShrink: 0 }} aria-hidden="true">›</span>
                        {use}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Available lengths */}
              <div>
                <h3
                  style={{
                    margin: '0 0 0.4rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--llp-blue)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}
                >
                  Available lengths
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--llp-text)' }}>
                  {size.availableLengths.map((l) => `${l}'`).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LumberGuide() {
  return (
    <main
      aria-labelledby="guide-heading"
      className="llp-page-enter"
      style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.25rem 3rem' }}
    >
      <header style={{ marginBottom: '2rem' }}>
        <h1
          id="guide-heading"
          style={{
            margin: '0 0 0.5rem',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--llp-text)',
            letterSpacing: '-0.02em',
          }}
        >
          Lumber Size Guide
        </h1>
        <p style={{ margin: 0, color: 'var(--llp-text-muted)', fontSize: '0.95rem', maxWidth: 520, lineHeight: 1.55 }}>
          Lumber is sold by <em>nominal</em> size — what you ask for at the store. The{' '}
          <em>actual</em> size is smaller after drying and planing. Select any size to see its
          cross-section and typical applications.
        </p>
      </header>

      {/* Accordion list */}
      <section aria-label="Lumber sizes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {LUMBER_SIZES.map((size) => (
            <SizeCard key={size.nominal} size={size} />
          ))}
        </div>
      </section>

      {/* Tip footer */}
      <footer
        style={{
          marginTop: '2rem',
          padding: '1rem 1.1rem',
          background: 'var(--llp-orange-light)',
          border: '1px solid var(--llp-orange-border)',
          borderLeft: '4px solid var(--llp-orange)',
          borderRadius: 'var(--llp-r-md)',
          fontSize: '0.875rem',
          color: 'var(--llp-text)',
        }}
      >
        <strong style={{ color: 'var(--llp-orange)' }}>Pro tip:</strong>{' '}
        The calculator already uses actual dimensions for all load calculations — you never need
        to convert manually.
      </footer>
    </main>
  )
}
