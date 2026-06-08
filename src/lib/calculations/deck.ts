import type { DeckDimensions, WasteFactor, CalculationResult, ShoppingListEntry } from '../../types'
import { calcBoardFeet, shortestBoardFor } from '../../data/lumber'
import { consolidateList, sumCosts, generateShareToken } from './utils'

/**
 * Simplified span table for joist sizing.
 * In practice, this depends on species and grade — a contractor would
 * reference the actual span tables. This is a safe default for SPF lumber.
 */
function joistSizeForSpan(spanFt: number): string {
  if (spanFt <= 12) return '2x8'
  if (spanFt <= 16) return '2x10'
  return '2x12'
}

export function calculateDeck(dims: DeckDimensions, wasteFactor: WasteFactor): CalculationResult {
  const { lengthFt, widthFt, joistSpacingIn, doublePerimeterBeam, decking } = dims
  const wf = wasteFactor
  const entries: ShoppingListEntry[] = []

  // ── 1. Decking boards (2x6) ────────────────────────────────────────────
  // Decking runs perpendicular to joists across the width of the deck.
  // 2x6 actual width = 5.5". Standard gap = 1/4".
  const deckActualWidthIn = 5.5
  const deckGapIn = 0.25
  const runsNeeded = Math.ceil((widthFt * 12) / (deckActualWidthIn + deckGapIn))
  // Diagonal decking means each board runs longer (hypotenuse), adding ~15%
  const diagonalFactor = decking === 'diagonal' ? 1.15 : 1.0
  const deckQty = Math.ceil(runsNeeded * diagonalFactor * (1 + wf))
  const deckLen = shortestBoardFor('2x6', lengthFt)
  entries.push({
    nominalSize: '2x6', length: deckLen, quantity: deckQty,
    boardFeet: calcBoardFeet('2x6', deckLen, deckQty),
  })

  // ── 2. Joists ──────────────────────────────────────────────────────────
  // floor(widthFt*12 / spacing) gives number of spaces; +1 for the far joist.
  const jSize = joistSizeForSpan(lengthFt)
  const joistQtyBase = Math.floor((widthFt * 12) / joistSpacingIn) + 1
  const joistQty = Math.ceil(joistQtyBase * (1 + wf))
  const joistLen = shortestBoardFor(jSize, lengthFt)
  entries.push({
    nominalSize: jSize, length: joistLen, quantity: joistQty,
    boardFeet: calcBoardFeet(jSize, joistLen, joistQty),
  })

  // ── 3. Rim / band joists (same size as joists) ─────────────────────────
  // 2 long rim joists run the full length; 2 headers cap the ends at width.
  const longRimLen = shortestBoardFor(jSize, lengthFt)
  const shortRimLen = shortestBoardFor(jSize, widthFt)
  entries.push({ nominalSize: jSize, length: longRimLen, quantity: 2, boardFeet: calcBoardFeet(jSize, longRimLen, 2) })
  entries.push({ nominalSize: jSize, length: shortRimLen, quantity: 2, boardFeet: calcBoardFeet(jSize, shortRimLen, 2) })

  // ── 4. Beam (2x10, doubled) ────────────────────────────────────────────
  // Standard build: 1 center beam = 2 boards side-by-side.
  // doublePerimeterBeam: add 2 perimeter beams (4 more boards).
  const beamLen = shortestBoardFor('2x10', lengthFt)
  const beamQty = doublePerimeterBeam ? 6 : 2
  entries.push({ nominalSize: '2x10', length: beamLen, quantity: beamQty, boardFeet: calcBoardFeet('2x10', beamLen, beamQty) })

  const shoppingList = consolidateList(entries)
  const totalBoardFeet = shoppingList.reduce((s, e) => s + e.boardFeet, 0)
  const cost = sumCosts(shoppingList)

  return {
    projectType: 'deck', dimensions: dims, wasteFactor,
    shoppingList, cutList: [],
    totalBoardFeet,
    estimatedCostMin: Math.round(cost.min),
    estimatedCostMax: Math.round(cost.max),
    generatedAt: new Date().toISOString(),
    shareToken: generateShareToken({ projectType: 'deck', dimensions: dims, wasteFactor }),
  }
}
