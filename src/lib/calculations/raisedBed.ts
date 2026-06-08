import type { RaisedGardenBedDimensions, WasteFactor, CalculationResult, ShoppingListEntry } from '../../types'
import { calcBoardFeet, getLumberSize, shortestBoardFor } from '../../data/lumber'
import { consolidateList, sumCosts, generateShareToken } from './utils'

export function calculateRaisedBed(
  dims: RaisedGardenBedDimensions,
  wasteFactor: WasteFactor
): CalculationResult {
  const { lengthFt, widthFt, heightIn, boardSize } = dims
  const wf = wasteFactor
  const entries: ShoppingListEntry[] = []

  const boardActualWidthIn = getLumberSize(boardSize).actualWidth
  // Boards stack horizontally. How many rows reach the target height?
  const rows = Math.ceil(heightIn / boardActualWidthIn)

  // ── 1. Long side boards (x2 sides × rows) ─────────────────────────────
  const longLen = shortestBoardFor(boardSize, lengthFt)
  const longQty = Math.ceil(2 * rows * (1 + wf))
  entries.push({
    nominalSize: boardSize, length: longLen, quantity: longQty,
    boardFeet: calcBoardFeet(boardSize, longLen, longQty),
  })

  // ── 2. Short side boards (x2 sides × rows) ────────────────────────────
  // Short sides sit inside the long sides, so they're widthFt - 2×board thickness.
  // For calculation purposes we buy widthFt boards and cut them to fit.
  const shortLen = shortestBoardFor(boardSize, widthFt)
  const shortQty = Math.ceil(2 * rows * (1 + wf))
  entries.push({
    nominalSize: boardSize, length: shortLen, quantity: shortQty,
    boardFeet: calcBoardFeet(boardSize, shortLen, shortQty),
  })

  // ── 3. Corner posts (4x4, cut to bed height + below-grade stake) ───────
  // Each corner post is cut to heightIn + 6" for the ground stake.
  const postHeightFt = Math.ceil((heightIn + 6) / 12)
  const postLen = shortestBoardFor('4x4', postHeightFt)
  entries.push({
    nominalSize: '4x4', length: postLen, quantity: 4,
    boardFeet: calcBoardFeet('4x4', postLen, 4),
  })

  const shoppingList = consolidateList(entries)
  const totalBoardFeet = shoppingList.reduce((s, e) => s + e.boardFeet, 0)
  const cost = sumCosts(shoppingList)

  return {
    projectType: 'raised-garden-bed', dimensions: dims, wasteFactor,
    shoppingList, cutList: [],
    totalBoardFeet,
    estimatedCostMin: Math.round(cost.min),
    estimatedCostMax: Math.round(cost.max),
    generatedAt: new Date().toISOString(),
    shareToken: generateShareToken({ projectType: 'raised-garden-bed', dimensions: dims, wasteFactor }),
  }
}
