import type { DimensionInputs } from '../types'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TimelinePhase {
  name: string
  minHours: number
  maxHours: number
  description: string
  /** Flag phases that have a mandatory wait (concrete cure, stain dry, etc.) */
  waitNote?: string
}

export type DifficultyLabel =
  | 'Weekend project'
  | 'Long weekend'
  | '2–3 weekends'
  | '4+ weekends'

export interface TimelineEstimate {
  phases: TimelinePhase[]
  totalMinHours: number
  totalMaxHours: number
  /** Assuming 1 weekend = 16 work-hours (Sat + Sun, 8h each) */
  weekendsMin: number
  weekendsMax: number
  difficultyLabel: DifficultyLabel
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Round to nearest 0.5h for cleaner display */
function r(h: number): number {
  return Math.round(h * 2) / 2
}

function difficulty(avgHours: number): DifficultyLabel {
  if (avgHours <= 12) return 'Weekend project'
  if (avgHours <= 24) return 'Long weekend'
  if (avgHours <= 56) return '2–3 weekends'
  return '4+ weekends'
}

function finalize(phases: TimelinePhase[]): TimelineEstimate {
  const rounded = phases.map(p => ({ ...p, minHours: r(p.minHours), maxHours: r(p.maxHours) }))
  const totalMin = rounded.reduce((s, p) => s + p.minHours, 0)
  const totalMax = rounded.reduce((s, p) => s + p.maxHours, 0)
  return {
    phases: rounded,
    totalMinHours: totalMin,
    totalMaxHours: totalMax,
    weekendsMin: Math.ceil(totalMin / 16),
    weekendsMax: Math.ceil(totalMax / 16),
    difficultyLabel: difficulty((totalMin + totalMax) / 2),
  }
}

// ─── Per-project estimators ──────────────────────────────────────────────────

function timelineDeck(dims: Extract<DimensionInputs, { projectType: 'deck' }>): TimelinePhase[] {
  const sqFt = dims.lengthFt * dims.widthFt
  const postCount = (Math.ceil(dims.lengthFt / 8) + 1) * 2
  return [
    {
      name: 'Site prep & layout',
      minHours: 3,
      maxHours: 6,
      description: 'Mark footprint, check for square, locate and mark footing positions.',
    },
    {
      name: 'Footings & posts',
      minHours: postCount * 1.5,
      maxHours: postCount * 2.5,
      description: 'Dig holes, mix and pour concrete, set and brace posts.',
      waitNote: 'Concrete must cure 24–48 h before loading.',
    },
    {
      name: 'Beam & joist framing',
      minHours: Math.max(4, sqFt / 24),
      maxHours: Math.max(7, sqFt / 16),
      description: 'Install beams on post hardware, hang joists, add blocking.',
    },
    {
      name: 'Decking boards',
      minHours: Math.max(3, sqFt / 32),
      maxHours: Math.max(6, sqFt / 22),
      description: 'Lay, space, and fasten decking. Trim overhanging ends.',
    },
    {
      name: 'Finish & seal',
      minHours: Math.max(2, sqFt / 70),
      maxHours: Math.max(4, sqFt / 45),
      description: 'Sand rough spots, apply stain or sealant to all exposed wood.',
      waitNote: 'Allow 24 h dry time before foot traffic.',
    },
  ]
}

function timelineFence(dims: Extract<DimensionInputs, { projectType: 'fence' }>): TimelinePhase[] {
  const postCount = Math.ceil(dims.runLengthFt / dims.postSpacingFt) + 1
  const bayCount = postCount - 1
  const picketCount = Math.floor(
    (dims.runLengthFt * 12) / (dims.picketWidthIn + dims.picketGapIn)
  )
  return [
    {
      name: 'Layout & post holes',
      minHours: Math.max(2, postCount * 0.45),
      maxHours: Math.max(4, postCount * 0.9),
      description: 'String a line, mark post centres every spacing interval, dig or auger holes.',
    },
    {
      name: 'Set posts in concrete',
      minHours: Math.max(2, postCount * 0.35),
      maxHours: Math.max(3, postCount * 0.65),
      description: 'Plumb each post with a level, brace, pour fast-set concrete.',
      waitNote: 'Wait 24 h for concrete to cure before attaching rails.',
    },
    {
      name: 'Rails',
      minHours: Math.max(1, bayCount * dims.railCount * 0.2),
      maxHours: Math.max(2, bayCount * dims.railCount * 0.35),
      description: 'Cut rails to fit between posts, attach with screws or rail brackets.',
    },
    {
      name: 'Pickets',
      minHours: Math.max(2, picketCount * 0.07),
      maxHours: Math.max(4, picketCount * 0.12),
      description: 'Space, align, and fasten pickets using a spacer block for consistency.',
    },
    {
      name: 'Trim & finish',
      minHours: Math.max(1, dims.runLengthFt / 70),
      maxHours: Math.max(2, dims.runLengthFt / 45),
      description: 'Cut post tops to final height, apply paint, stain, or sealant.',
    },
  ]
}

function timelineRaisedBed(dims: Extract<DimensionInputs, { projectType: 'raised-garden-bed' }>): TimelinePhase[] {
  const sqFt = dims.lengthFt * dims.widthFt
  return [
    {
      name: 'Site prep',
      minHours: 1,
      maxHours: 2,
      description: 'Level the ground, mark the footprint, lay optional weed barrier.',
    },
    {
      name: 'Cut & assemble',
      minHours: Math.max(1.5, sqFt * 0.12 + dims.heightIn / 6),
      maxHours: Math.max(3, sqFt * 0.22 + dims.heightIn / 4),
      description: 'Pre-drill corners, stack and screw boards, drive corner stakes for rigidity.',
    },
  ]
}

function timelineFramingWall(dims: Extract<DimensionInputs, { projectType: 'framing-wall' }>): TimelinePhase[] {
  const studCount = Math.floor((dims.lengthFt * 12) / dims.studSpacingIn) + 1 + dims.openings * 4
  return [
    {
      name: 'Layout & snap lines',
      minHours: 1,
      maxHours: 2,
      description: 'Mark plate positions on floor and ceiling. Snap chalk lines.',
    },
    {
      name: 'Cut plates & studs',
      minHours: Math.max(1, studCount * 0.1),
      maxHours: Math.max(2, studCount * 0.18),
      description: 'Gang-cut studs to length. Cut top and bottom plates.',
    },
    {
      name: 'Assemble & raise',
      minHours: Math.max(1, dims.lengthFt * 0.15),
      maxHours: Math.max(2, dims.lengthFt * 0.28),
      description: 'Nail frame flat on the floor, then tilt up and brace plumb.',
    },
    {
      name: 'Headers & blocking',
      minHours: Math.max(0.5, dims.openings * 0.75),
      maxHours: Math.max(1, dims.openings * 1.5),
      description: 'Frame each opening: king studs, jack studs, header, cripple studs.',
    },
  ]
}

function timelineShedFloor(dims: Extract<DimensionInputs, { projectType: 'shed-floor' }>): TimelinePhase[] {
  const sqFt = dims.lengthFt * dims.widthFt
  return [
    {
      name: 'Site prep & levelling',
      minHours: 2,
      maxHours: 4,
      description: 'Clear and level area, set gravel bed or concrete deck blocks.',
    },
    {
      name: 'Rim & joist framing',
      minHours: Math.max(2, sqFt / 28),
      maxHours: Math.max(3.5, sqFt / 18),
      description: 'Assemble rim joist box, install interior joists, add mid-span blocking.',
    },
    {
      name: 'Sheathing',
      minHours: Math.max(1, sqFt / 55),
      maxHours: Math.max(2, sqFt / 38),
      description: 'Lay and fasten pressure-treated plywood or OSB decking panels.',
    },
  ]
}

function timelinePergola(dims: Extract<DimensionInputs, { projectType: 'pergola' }>): TimelinePhase[] {
  const postsPerSide = Math.ceil(dims.lengthFt / dims.postSpacingFt) + 1
  const totalPosts = postsPerSide * 2
  const rafterCount = Math.floor((dims.lengthFt * 12) / dims.rafterSpacingIn) + 1
  return [
    {
      name: 'Layout & post holes',
      minHours: Math.max(3, totalPosts * 0.7),
      maxHours: Math.max(6, totalPosts * 1.2),
      description: 'Set batter boards, string diagonal to confirm square, auger holes to frost depth (36–48 in).',
    },
    {
      name: 'Set & brace posts',
      minHours: Math.max(2, totalPosts * 0.5),
      maxHours: Math.max(4, totalPosts * 1),
      description: 'Plumb posts in fast-set concrete, brace every direction.',
      waitNote: '48 h cure recommended — beams exert significant lateral load.',
    },
    {
      name: 'Beams',
      minHours: 2,
      maxHours: 4,
      description: 'Lift and attach beams to post tops with structural hardware. Requires 2 people minimum.',
    },
    {
      name: 'Rafters',
      minHours: Math.max(2, rafterCount * 0.2),
      maxHours: Math.max(3.5, rafterCount * 0.35),
      description: 'Cut bird-mouths or use hurricane ties, space and fasten rafters across both beams.',
    },
    {
      name: 'Finish & seal',
      minHours: 2,
      maxHours: 4,
      description: 'Sand cut ends, apply penetrating oil or stain to all surfaces before first rain.',
      waitNote: 'Allow 24 h dry time between coats.',
    },
  ]
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function estimateTimeline(dims: DimensionInputs): TimelineEstimate {
  switch (dims.projectType) {
    case 'deck':              return finalize(timelineDeck(dims))
    case 'fence':             return finalize(timelineFence(dims))
    case 'raised-garden-bed': return finalize(timelineRaisedBed(dims))
    case 'framing-wall':      return finalize(timelineFramingWall(dims))
    case 'shed-floor':        return finalize(timelineShedFloor(dims))
    case 'pergola':           return finalize(timelinePergola(dims))
  }
}
