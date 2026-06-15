import type { PergolaDimensions, WasteFactor, CalculationResult, ShoppingListEntry } from '../../types'
import { calcBoardFeet, shortestBoardFor } from '../../data/lumber'
import { consolidateList, sumCosts, generateShareToken } from './utils'

/**
 * Pergola material calculator.
 *
 * Structure overview:
 *   Posts  — two rows running along the length; one post at each end + one
 *            per postSpacingFt interval. Post size is user-selected (4×4 or 6×6).
 *   Beams  — 2 beams (one per post row) running the full length, sitting on
 *            top of the posts. Always 2×8.
 *   Rafters — run perpendicular, spanning the width + 1 ft overhang each side.
 *             Spaced on-center per user selection (12 / 16 / 24 in).
 *             Size: 2×6 when widthFt ≤ 12, 2×8 otherwise.
 */
export function calculatePergola(
  dims: PergolaDimensions,
  wasteFactor: WasteFactor
): CalculationResult {
  const { lengthFt, widthFt, postHeightFt, postSpacingFt, postSize, rafterSpacingIn } = dims
  const wf = wasteFactor
  const entries: ShoppingListEntry[] = []

  // ── 1. Posts ─────────────────────────────────────────────────────────────
  // One row of posts along each long side (2 rows total).
  // Posts per side: one at each end + one per spacing interval between.
  const postsPerSide = Math.ceil(lengthFt / postSpacingFt) + 1
  const totalPosts = postsPerSide * 2
  const postQty = Math.ceil(totalPosts * (1 + wf))
  const postLen = shortestBoardFor(postSize, postHeightFt)
  entries.push({
    nominalSize: postSize,
    length: postLen,
    quantity: postQty,
    boardFeet: calcBoardFeet(postSize, postLen, postQty),
  })

  // ── 2. Beams ─────────────────────────────────────────────────────────────
  // 2 beams, each running the full length of the pergola on top of one post row.
  // Beams are always 2×8 (adequate for spans up to 10 ft and decorative loads).
  const beamLen = shortestBoardFor('2x8', lengthFt)
  // Each beam may need multiple boards spliced over posts — boards needed per beam:
  const boardsPerBeam = Math.ceil(lengthFt / beamLen)
  const totalBeamBoards = boardsPerBeam * 2  // 2 beams
  const beamQty = Math.ceil(totalBeamBoards * (1 + wf))
  entries.push({
    nominalSize: '2x8',
    length: beamLen,
    quantity: beamQty,
    boardFeet: calcBoardFeet('2x8', beamLen, beamQty),
  })

  // ── 3. Rafters ───────────────────────────────────────────────────────────
  // Rafters span the width plus 1 ft overhang on each end = widthFt + 2.
  // Count: one rafter per spacing interval + 1 (fence-post math along length).
  const rafterSpanFt = widthFt + 2
  const rafterSize = widthFt <= 12 ? '2x6' : '2x8'
  const rafterLen = shortestBoardFor(rafterSize, rafterSpanFt)
  const rafterCountBase = Math.floor((lengthFt * 12) / rafterSpacingIn) + 1
  const rafterQty = Math.ceil(rafterCountBase * (1 + wf))
  entries.push({
    nominalSize: rafterSize,
    length: rafterLen,
    quantity: rafterQty,
    boardFeet: calcBoardFeet(rafterSize, rafterLen, rafterQty),
  })

  const shoppingList = consolidateList(entries)
  const totalBoardFeet = shoppingList.reduce((s, e) => s + e.boardFeet, 0)
  const cost = sumCosts(shoppingList)

  return {
    projectType: 'pergola',
    dimensions: dims,
    wasteFactor,
    shoppingList,
    cutList: [],
    totalBoardFeet,
    estimatedCostMin: Math.round(cost.min),
    estimatedCostMax: Math.round(cost.max),
    generatedAt: new Date().toISOString(),
    shareToken: generateShareToken({ projectType: 'pergola', dimensions: dims, wasteFactor }),
  }
}
