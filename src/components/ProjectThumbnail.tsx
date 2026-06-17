/**
 * ProjectThumbnail — generates a top-down or elevation SVG schematic
 * for each project type. Pure SVG, no images, scales to container.
 *
 * ViewBox is always 160×100. All coordinates are in those units.
 */
import type { ReactNode } from 'react'
import type { DimensionInputs } from '../types'

const VW = 160
const VH = 100
const PAD = 11

// Hardcoded from the LLP design tokens (CSS vars don't reliably apply to SVG attrs)
const C = {
  blue:      '#004990',
  blueDark:  '#003a70',
  blueLight: '#E8F0F9',
  border:    '#D1D5DB',
  bg:        '#F8FAFC',
  soil:      '#C4A882',
  ground:    '#9CA3AF',
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

interface Box { x: number; y: number; w: number; h: number }

function fitRect(fW: number, fH: number): Box {
  const dW = VW - PAD * 2
  const dH = VH - PAD * 2
  const s  = Math.min(dW / fW, dH / fH)
  const w  = fW * s
  const h  = fH * s
  return { x: PAD + (dW - w) / 2, y: PAD + (dH - h) / 2, w, h }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)))
}

function seq(n: number): number[] {
  return Array.from({ length: Math.max(0, n) }, (_, i) => i)
}

// ─── Per-project renderers ────────────────────────────────────────────────────

function renderDeck(dims: Extract<DimensionInputs, { projectType: 'deck' }>): ReactNode {
  const b = fitRect(dims.lengthFt, dims.widthFt)
  const lineCount = clamp(dims.widthFt * 1.5, 3, 8)
  const step = b.h / (lineCount + 1)
  const postCols = clamp(dims.lengthFt / 8 + 1, 2, 5)
  const postStep = b.w / (postCols - 1)

  return (
    <>
      <rect x={b.x} y={b.y} width={b.w} height={b.h}
        fill={C.blueLight} stroke={C.blue} strokeWidth="1.5" rx="1.5"/>
      {seq(lineCount).map(i => (
        <line key={i}
          x1={b.x + 2} y1={b.y + step * (i + 1)}
          x2={b.x + b.w - 2} y2={b.y + step * (i + 1)}
          stroke={C.blue} strokeWidth="0.7" opacity="0.4"/>
      ))}
      {[0, b.h].flatMap((py, ri) =>
        seq(postCols).map(ci => (
          <circle key={`${ri}-${ci}`}
            cx={b.x + ci * postStep} cy={b.y + py} r="3"
            fill={C.blue} stroke="#fff" strokeWidth="1.2"/>
        ))
      )}
    </>
  )
}

function renderFence(dims: Extract<DimensionInputs, { projectType: 'fence' }>): ReactNode {
  const displayRun = Math.min(dims.runLengthFt, 20)
  const b = fitRect(displayRun, 6)
  const postCount = clamp(displayRun / dims.postSpacingFt + 1, 2, 5)
  const postStep = b.w / (postCount - 1)
  const postW = 4.5
  const bayW = postStep - postW
  const picketPer = clamp(bayW / 3.5, 3, 8)
  const railYs = seq(dims.railCount).map(i =>
    b.y + b.h * 0.15 + (i / Math.max(dims.railCount - 1, 1)) * (b.h * 0.7)
  )

  return (
    <>
      <line x1={b.x - 4} y1={b.y + b.h + 2} x2={b.x + b.w + 4} y2={b.y + b.h + 2}
        stroke={C.ground} strokeWidth="1.5"/>

      {seq(postCount - 1).flatMap(bay =>
        seq(picketPer).map(pi => {
          const px = b.x + bay * postStep + postW / 2 + bayW * (pi + 0.5) / picketPer
          return (
            <rect key={`${bay}-${pi}`}
              x={px - 1.5} y={b.y + 2} width={3} height={b.h - 4}
              fill={C.blueLight} stroke={C.blue} strokeWidth="0.5" rx="0.5"/>
          )
        })
      )}

      {railYs.map((ry, i) => (
        <rect key={i} x={b.x} y={ry - 2} width={b.w} height={4}
          fill={C.blueLight} stroke={C.blue} strokeWidth="0.75"/>
      ))}

      {seq(postCount).map(i => (
        <rect key={i}
          x={b.x + i * postStep - postW / 2} y={b.y}
          width={postW} height={b.h}
          fill={C.blue} rx="0.75"/>
      ))}
    </>
  )
}

function renderRaisedBed(dims: Extract<DimensionInputs, { projectType: 'raised-garden-bed' }>): ReactNode {
  const b = fitRect(dims.lengthFt, dims.widthFt)
  const thick = Math.max(5, Math.min(10, b.h * 0.14))

  return (
    <>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={C.blue} rx="1.5"/>
      <rect x={b.x + thick} y={b.y + thick}
        width={b.w - thick * 2} height={b.h - thick * 2}
        fill={C.soil} rx="0.5"/>
      {[
        [b.x + thick / 2, b.y + thick / 2],
        [b.x + b.w - thick / 2, b.y + thick / 2],
        [b.x + thick / 2, b.y + b.h - thick / 2],
        [b.x + b.w - thick / 2, b.y + b.h - thick / 2],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2" fill="#fff" opacity="0.6"/>
      ))}
    </>
  )
}

function renderFramingWall(dims: Extract<DimensionInputs, { projectType: 'framing-wall' }>): ReactNode {
  const b = fitRect(dims.lengthFt, dims.heightFt)
  const plateH = Math.max(4, b.h * 0.11)
  const studCount = clamp(dims.lengthFt * 12 / dims.studSpacingIn + 1, 3, 12)
  const studStep = b.w / (studCount - 1)
  const studW = 3

  return (
    <>
      <rect x={b.x} y={b.y} width={b.w} height={b.h}
        fill={C.bg} stroke={C.border} strokeWidth="1" rx="1"/>

      {seq(studCount).map(i => (
        <rect key={i}
          x={b.x + i * studStep - studW / 2} y={b.y + plateH * 2}
          width={studW} height={b.h - plateH * 3}
          fill={C.blueLight} stroke={C.blue} strokeWidth="0.75"/>
      ))}

      {/* Top double plate */}
      <rect x={b.x} y={b.y} width={b.w} height={plateH} fill={C.blue} rx="0.5"/>
      <rect x={b.x} y={b.y + plateH} width={b.w} height={plateH} fill={C.blueDark} opacity="0.75" rx="0.5"/>
      {/* Bottom plate */}
      <rect x={b.x} y={b.y + b.h - plateH} width={b.w} height={plateH} fill={C.blue} rx="0.5"/>
    </>
  )
}

function renderShedFloor(dims: Extract<DimensionInputs, { projectType: 'shed-floor' }>): ReactNode {
  const b = fitRect(dims.lengthFt, dims.widthFt)
  const rimW = 4
  const joistCount = clamp(dims.lengthFt * 12 / dims.joistSpacingIn + 1, 3, 10)
  const joistStep = b.w / (joistCount - 1)

  return (
    <>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={C.blueLight} rx="1.5"/>
      {seq(joistCount).map(i => (
        <line key={i}
          x1={b.x + i * joistStep} y1={b.y + rimW}
          x2={b.x + i * joistStep} y2={b.y + b.h - rimW}
          stroke={C.blue} strokeWidth="1.5"/>
      ))}
      <rect x={b.x} y={b.y} width={b.w} height={b.h}
        fill="none" stroke={C.blue} strokeWidth={rimW} rx="1.5"/>
    </>
  )
}

function renderPergola(dims: Extract<DimensionInputs, { projectType: 'pergola' }>): ReactNode {
  const b = fitRect(dims.lengthFt, dims.widthFt)
  const postsPerSide = clamp(dims.lengthFt / dims.postSpacingFt + 1, 2, 6)
  const postStep = b.w / (postsPerSide - 1)
  const postSz = dims.postSize === '6x6' ? 6 : 4.5
  const rafterCount = clamp(dims.lengthFt * 12 / dims.rafterSpacingIn + 1, 4, 14)
  const rafterStep = b.w / (rafterCount - 1)
  const beamY1 = b.y + 4
  const beamY2 = b.y + b.h - 4

  return (
    <>
      <rect x={b.x} y={b.y} width={b.w} height={b.h}
        fill={C.bg} stroke={C.border} strokeWidth="0.75" rx="1"/>

      {/* Rafters */}
      {seq(rafterCount).map(i => (
        <line key={i}
          x1={b.x + i * rafterStep} y1={b.y - 2}
          x2={b.x + i * rafterStep} y2={b.y + b.h + 2}
          stroke={C.blue} strokeWidth="1" opacity="0.4"/>
      ))}

      {/* Beams */}
      <line x1={b.x - 2} y1={beamY1} x2={b.x + b.w + 2} y2={beamY1}
        stroke={C.blue} strokeWidth="4"/>
      <line x1={b.x - 2} y1={beamY2} x2={b.x + b.w + 2} y2={beamY2}
        stroke={C.blue} strokeWidth="4"/>

      {/* Posts */}
      {[beamY1, beamY2].flatMap((py, ri) =>
        seq(postsPerSide).map(ci => (
          <rect key={`${ri}-${ci}`}
            x={b.x + ci * postStep - postSz / 2}
            y={py - postSz / 2}
            width={postSz} height={postSz}
            fill={C.blue} stroke="#fff" strokeWidth="0.75" rx="0.5"/>
        ))
      )}
    </>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

interface Props {
  dims: DimensionInputs
}

export function ProjectThumbnail({ dims }: Props) {
  let inner: ReactNode = null

  switch (dims.projectType) {
    case 'deck':              inner = renderDeck(dims);        break
    case 'fence':             inner = renderFence(dims);       break
    case 'raised-garden-bed': inner = renderRaisedBed(dims);   break
    case 'framing-wall':      inner = renderFramingWall(dims); break
    case 'shed-floor':        inner = renderShedFloor(dims);   break
    case 'pergola':           inner = renderPergola(dims);     break
  }

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <rect width={VW} height={VH} fill={C.bg}/>
      {inner}
    </svg>
  )
}
