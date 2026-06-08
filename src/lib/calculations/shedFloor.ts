import type { ShedFloorDimensions, WasteFactor, CalculationResult, ShoppingListEntry } from '../../types'
import { calcBoardFeet, shortestBoardFor } from '../../data/lumber'
import { consolidateList, sumCosts, generateShareToken } from './utils'

export function calculateShedFloor(
  dims: ShedFloorDimensions,
  wasteFactor: WasteFactor
): CalculationResult {
  const { lengthFt, widthFt, joistSpacingIn, useRimJoists } = dims
  const wf = wasteFactor
  const entries: ShoppingListEntry[] = []

  // Joist size by span. Shed floors should use pressure-treated lumber.
  // This calculator assumes the customer knows to ask for PT at the desk.
  const jSize = widthFt <= 8 ? '2x6' : '2x8'

  // Joists run the width (shorter dimension spans between the beams/sills).
  // Count of joists = spaces + 1, where spaces = floor(length / spacing)
  const joistQtyBase = Math.floor((lengthFt * 12) / joistSpacingIn) + 1
  const joistQty = Math.ceil(joistQtyBase * (1 + wf))
  const joistLen = shortestBoardFor(jSize, widthFt)
  entries.push({
    nominalSize: jSize, length: joistLen, quantity: joistQty,
    boardFeet: calcBoardFeet(jSize, joistLen, joistQty),
  })

  // ── Rim joists ─────────────────────────────────────────────────────────
  if (useRimJoists) {
    // 2 long rim joists parallel to the length
    const longRimLen = shortestBoardFor(jSize, lengthFt)
    entries.push({
      nominalSize: jSize, length: longRimLen, quantity: 2,
      boardFeet: calcBoardFeet(jSize, longRimLen, 2),
    })
    // 2 header boards at the ends (same length as joists)
    entries.push({
      nominalSize: jSize, length: joistLen, quantity: 2,
      boardFeet: calcBoardFeet(jSize, joistLen, 2),
    })
  }

  // ── Mid-span blocking (spans > 8ft need blocking at mid-span) ──────────
  if (widthFt > 8) {
    // One block per joist space, cut from short pieces
    const blockQtyBase = joistQtyBase - 1
    const blockLen = shortestBoardFor(jSize, 2)  // blocks are short cuts
    const blockQty = Math.ceil(blockQtyBase * (1 + wf))
    entries.push({
      nominalSize: jSize, length: blockLen, quantity: blockQty,
      boardFeet: calcBoardFeet(jSize, blockLen, blockQty),
    })
  }

  const shoppingList = consolidateList(entries)
  const totalBoardFeet = shoppingList.reduce((s, e) => s + e.boardFeet, 0)
  const cost = sumCosts(shoppingList)

  return {
    projectType: 'shed-floor', dimensions: dims, wasteFactor,
    shoppingList, cutList: [],
    totalBoardFeet,
    estimatedCostMin: Math.round(cost.min),
    estimatedCostMax: Math.round(cost.max),
    generatedAt: new Date().toISOString(),
    shareToken: generateShareToken({ projectType: 'shed-floor', dimensions: dims, wasteFactor }),
  }
}
