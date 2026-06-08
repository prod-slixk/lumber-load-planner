import { useState } from 'react'
import { LUMBER_SIZES } from '../data/lumber'

// Common use-cases per nominal size — helps users pick the right board
const COMMON_USES: Record<string, string[]> = {
  '1x4': ['Fence pickets', 'Trim boards', 'Light shelving'],
  '1x6': ['Fence boards', 'Siding', 'Shallow shelving'],
  '1x8': ['Wide trim', 'Paneling', 'Shelving'],
  '2x4': ['Wall studs', 'Blocking', 'Light framing'],
  '2x6': ['Deck joists (short spans)', 'Exterior wall framing', 'Raised bed sides'],
  '2x8': ['Deck joists (standard)', 'Headers', 'Stair stringers'],
  '2x10': ['Deck joists (longer spans)', 'Floor joists', 'Heavy headers'],
  '2x12': ['Stair stringers', 'Deck beams', 'Long-span floor joists'],
  '4x4': ['Fence posts', 'Light deck posts', 'Pergola legs'],
  '4x6': ['Deck beams', 'Pergola rafters'],
  '6x6': ['Heavy deck posts', 'Pergola columns', 'Structural support'],
}

// ─── SVG Cross-Section ─────────────────────────────────────────────────────
// Scale: 9px per inch. viewBox fixed 140×80 — largest board (2x12 = 11.25" wide)
// renders at 101.25px, centred with 19px of horizontal padding.

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

  // Grain lines — 3 evenly spaced vertical stripes inside the board
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
      className="w-full max-w-[140px]"
      style={{ display: 'block' }}
    >
      {/* Board body */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={2}
        fill="#f5deb3"
        stroke="#8b6914"
        strokeWidth={1.5}
      />
      {/* Wood grain lines */}
      {grainLines.map((g, i) => (
        <line
          key={i}
          x1={g.x1}
          y1={g.y1}
          x2={g.x2}
          y2={g.y2}
          stroke="#d4a55a"
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />
      ))}
      {/* Dimension labels */}
      <text
        x={VB_W / 2}
        y={y + h + 13}
        textAnchor="middle"
        fontSize={9}
        fill="#6b7280"
        fontFamily="system-ui, sans-serif"
      >
        {actualWidth}"
      </text>
      <text
        x={x - 6}
        y={y + h / 2 + 3.5}
        textAnchor="middle"
        fontSize={9}
        fill="#6b7280"
        fontFamily="system-ui, sans-serif"
      >
        {actualThickness}"
      </text>
    </svg>
  )
}

// ─── Accordion Item ────────────────────────────────────────────────────────

function SizeCard({ size }: { size: (typeof LUMBER_SIZES)[number] }) {
  const [open, setOpen] = useState(false)
  const uses = COMMON_USES[size.nominal] ?? []

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`guide-${size.nominal}`}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-gray-900 font-mono">
            {size.nominal}
          </span>
          <span className="text-sm text-gray-500">
            {size.nominalThickness}" × {size.nominalWidth}" nominal
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          id={`guide-${size.nominal}`}
          className="border-t border-gray-200 bg-gray-50 px-4 py-4"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* SVG diagram */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <BoardSvg
                actualThickness={size.actualThickness}
                actualWidth={size.actualWidth}
              />
              <p className="text-xs text-gray-400 mt-1">Cross-section (to scale)</p>
            </div>

            {/* Dimensions table + uses */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Actual dimensions
                </h3>
                <table className="text-sm w-full max-w-xs" aria-label={`Dimensions for ${size.nominal}`}>
                  <thead>
                    <tr className="text-left text-gray-500 text-xs">
                      <th className="pb-1 font-medium w-24">Nominal</th>
                      <th className="pb-1 font-medium">Actual</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr>
                      <td className="py-0.5 font-mono">{size.nominalThickness}"</td>
                      <td className="py-0.5 font-mono">{size.actualThickness}"</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-mono">{size.nominalWidth}"</td>
                      <td className="py-0.5 font-mono">{size.actualWidth}"</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {uses.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Common uses
                  </h3>
                  <ul className="space-y-1" aria-label={`Common uses for ${size.nominal}`}>
                    {uses.map((use) => (
                      <li key={use} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5" aria-hidden="true">›</span>
                        {use}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Available lengths
                </h3>
                <p className="text-sm text-gray-700">
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

// ─── Page ──────────────────────────────────────────────────────────────────

export default function LumberGuide() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8" aria-labelledby="guide-heading">
      <header className="mb-8">
        <h1 id="guide-heading" className="text-2xl font-bold text-gray-900 mb-2">
          Lumber Size Guide
        </h1>
        <p className="text-gray-600">
          Lumber is sold by <em>nominal</em> size — the number you ask for at the store. The{' '}
          <em>actual</em> size is smaller after drying and planing. Click any size to see its
          cross-section and typical applications.
        </p>
      </header>

      <section aria-label="Lumber sizes">
        <div className="space-y-2">
          {LUMBER_SIZES.map((size) => (
            <SizeCard key={size.nominal} size={size} />
          ))}
        </div>
      </section>

      <footer className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>Tip:</strong> The calculator already uses actual dimensions for all load
        calculations — you never need to convert manually.
      </footer>
    </main>
  )
}
