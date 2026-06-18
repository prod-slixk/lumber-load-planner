import type { DimensionInputs } from '../types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type WarningSeverity = 'info' | 'caution' | 'warning'

export interface SmartWarning {
  severity: WarningSeverity
  title: string
  body: string
}

// ─── Per-project warning generators ──────────────────────────────────────────

function warnDeck(
  dims: Extract<DimensionInputs, { projectType: 'deck' }>
): SmartWarning[] {
  const out: SmartWarning[] = []
  const sqFt = dims.lengthFt * dims.widthFt

  if (sqFt >= 200) {
    out.push({
      severity: 'caution',
      title: 'Building permit likely required',
      body: `At ${Math.round(sqFt)} sq ft this deck typically triggers a permit in most U.S. jurisdictions. Verify with your local authority before purchasing materials.`,
    })
  }

  if (dims.joistSpacingIn === 24 && dims.widthFt > 10) {
    out.push({
      severity: 'warning',
      title: 'Span exceeds 24″ joist spacing limit',
      body: 'IRC tables allow 2×8 joists at 24″ o.c. up to roughly 10 ft. Beyond that, reduce to 16″ spacing or upsize to 2×10 joists to avoid deflection.',
    })
  }

  if (dims.widthFt > 16 && !dims.doublePerimeterBeam) {
    out.push({
      severity: 'caution',
      title: 'Single beam on a wide span',
      body: 'Spans over 16 ft benefit from a doubled perimeter beam (2×10 or 2×12) to resist seasonal deflection. Most inspectors require it for spans this wide.',
    })
  }

  if (dims.decking === 'diagonal') {
    out.push({
      severity: 'info',
      title: 'Diagonal decking cuts',
      body: 'Diagonal boards generate 15–20% more off-cuts per row. Your waste factor covers this — lay out a test row first to confirm your cut angle before committing.',
    })
  }

  return out
}

function warnFence(
  dims: Extract<DimensionInputs, { projectType: 'fence' }>
): SmartWarning[] {
  const out: SmartWarning[] = []

  if (dims.runLengthFt > 150) {
    out.push({
      severity: 'info',
      title: 'Long run — plan for access gates',
      body: 'Runs over 150 ft benefit from a gate break every 50–75 ft for equipment and pedestrian access. Add gate hardware to your shopping list.',
    })
  }

  if (dims.postSpacingFt === 8 && dims.railCount === 2) {
    out.push({
      severity: 'caution',
      title: 'Rail sag risk at 8 ft spacing',
      body: 'Two horizontal rails spanning 8 ft can sag noticeably mid-span, especially in humid climates. Add a third rail or reduce post spacing to 6 ft.',
    })
  }

  if (dims.picketGapIn < 0.5) {
    out.push({
      severity: 'info',
      title: 'Very tight picket gap',
      body: 'Gaps under ½″ are difficult to keep consistent across a long run. Cut a dedicated spacer block to the exact gap dimension for repeatable results.',
    })
  }

  return out
}

function warnRaisedBed(
  dims: Extract<DimensionInputs, { projectType: 'raised-garden-bed' }>
): SmartWarning[] {
  const out: SmartWarning[] = []

  if (dims.widthFt > 4) {
    out.push({
      severity: 'caution',
      title: 'Bed too wide to reach across',
      body: `At ${dims.widthFt} ft wide you'll need to step inside to tend the center — which compacts soil. Consider two narrower beds with a walking path between them.`,
    })
  }

  if (dims.heightIn < 8) {
    out.push({
      severity: 'info',
      title: 'Shallow root depth',
      body: 'Most vegetables and herbs need 12–18″ of root room. At this height, till and amend the native soil below the bed to give roots somewhere to go.',
    })
  }

  if (dims.heightIn > 24) {
    out.push({
      severity: 'caution',
      title: 'High bed — reinforce against bowing',
      body: 'Beds taller than 24″ put serious outward pressure on the boards. Drive 2×4 or 4×4 stakes into the ground at each corner and at mid-length on long sides.',
    })
  }

  if (dims.lengthFt > 8) {
    out.push({
      severity: 'info',
      title: 'Mid-span support recommended',
      body: `Long boards over 8 ft bow outward as soil settles. Add a vertical stake or interior cross-brace at the midpoint of each long side (roughly at ${Math.round(dims.lengthFt / 2)} ft).`,
    })
  }

  return out
}

function warnFramingWall(
  dims: Extract<DimensionInputs, { projectType: 'framing-wall' }>
): SmartWarning[] {
  const out: SmartWarning[] = []

  if (dims.studSpacingIn === 24) {
    out.push({
      severity: 'warning',
      title: '24″ spacing is non-load-bearing only',
      body: 'IRC R602.3 restricts 24″ o.c. stud walls to interior partition walls that carry no floor or roof loads. Exterior walls and load-bearing walls require 16″ spacing.',
    })
  }

  if (dims.heightFt > 9) {
    out.push({
      severity: 'caution',
      title: 'Fire blocking required',
      body: `Walls taller than 9 ft require a horizontal 2×4 fire block installed mid-height between every pair of studs (IRC R302.11). Plan for roughly ${Math.ceil((dims.lengthFt * 12) / dims.studSpacingIn)} extra blocks.`,
    })
  }

  if (dims.openings > 2) {
    out.push({
      severity: 'info',
      title: 'Multiple openings — verify header sizes',
      body: 'Each opening needs a properly sized header. A doubled 2×4 works for spans up to 4 ft in non-load-bearing walls; load-bearing walls need engineered headers sized to the span and load.',
    })
  }

  return out
}

function warnShedFloor(
  dims: Extract<DimensionInputs, { projectType: 'shed-floor' }>
): SmartWarning[] {
  const out: SmartWarning[] = []
  const sqFt = dims.lengthFt * dims.widthFt

  if (sqFt >= 144) {
    out.push({
      severity: 'caution',
      title: 'Permit threshold — check local zoning',
      body: `At ${Math.round(sqFt)} sq ft, this shed may require a building permit and must meet setback distances from property lines. Check with your municipality before pouring footings.`,
    })
  }

  if (dims.joistSpacingIn === 24) {
    out.push({
      severity: 'caution',
      title: '24″ spacing requires thicker sheathing',
      body: 'At 24″ o.c., standard ½″ OSB will flex noticeably under foot traffic or stored equipment. Use ¾″ tongue-and-groove plywood or AdvanTech panels instead.',
    })
  }

  if (dims.widthFt > 14) {
    out.push({
      severity: 'caution',
      title: 'Long joist span — consider mid-span beam',
      body: `A ${dims.widthFt} ft span approaches the practical limit for a single joist run. Adding a center beam (beam + post or concrete block) cuts deflection in half and reduces the joist size you need.`,
    })
  }

  return out
}

function warnPergola(
  dims: Extract<DimensionInputs, { projectType: 'pergola' }>
): SmartWarning[] {
  const out: SmartWarning[] = []

  if (dims.widthFt > 16) {
    out.push({
      severity: 'caution',
      title: 'Engineer review may be required',
      body: `Spans over 16 ft (yours is ${dims.widthFt} ft) typically require a structural engineer's letter for permit approval in most jurisdictions. Budget time and cost for that review.`,
    })
  } else if (dims.widthFt > 12) {
    out.push({
      severity: 'info',
      title: 'Wide span — watch for rafter bounce',
      body: `This design uses 2×8 rafters across ${dims.widthFt} ft. If you plan to hang shade fabric or train heavy climbing plants, add a purlin or intermediate beam to prevent mid-span flex.`,
    })
  }

  if (dims.postHeightFt > 10) {
    out.push({
      severity: 'caution',
      title: 'Tall posts need deep footings',
      body: `Posts ${dims.postHeightFt} ft above grade should be embedded at least ${Math.ceil(dims.postHeightFt / 3)} ft in concrete (⅓ of total post length) to resist wind uplift and lateral movement.`,
    })
  }

  if (dims.postSize === '4x4' && dims.widthFt > 14) {
    out.push({
      severity: 'caution',
      title: '4×4 posts may be undersized for this span',
      body: `For spans over 14 ft, 4×4 posts have limited lateral resistance. Upgrading to 6×6 posts significantly reduces sway and is typically required by code for freestanding pergolas.`,
    })
  }

  return out
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getWarnings(dims: DimensionInputs): SmartWarning[] {
  switch (dims.projectType) {
    case 'deck':              return warnDeck(dims)
    case 'fence':             return warnFence(dims)
    case 'raised-garden-bed': return warnRaisedBed(dims)
    case 'framing-wall':      return warnFramingWall(dims)
    case 'shed-floor':        return warnShedFloor(dims)
    case 'pergola':           return warnPergola(dims)
  }
}
