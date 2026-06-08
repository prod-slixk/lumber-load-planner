import type { FenceDimensions, WasteFactor, CalculationResult, ShoppingListEntry } from '../../types'
import { calcBoardFeet, shortestBoardFor } from '../../data/lumber'
import { consolidateList, sumCosts, generateShareToken } from './utils'

export function calculateFence(dims: FenceDimensions, wasteFactor: WasteFactor): CalculationResult {
  const { runLengthFt, postSpacingFt, railCount, picketWidthIn, picketGapIn } = dims
  const wf = wasteFactor
  const entries: ShoppingListEntry[] = []

  // Number of bays (spaces between posts). Partial bays still need posts.
  const bays = Math.ceil(runLengthFt / postSpacingFt)
  const posts = bays + 1  // one post per bay boundary + the far end post

  // ── 1. Posts (4x4 x 8ft) ──────────────────────────────────────────────
  // 8ft post gives ~6ft above grade with 2ft in the ground.
  // Standard rule: bury 1/3 of total post length.
  const postQty = Math.ceil(posts * (1 + wf))
  entries.push({
    nominalSize: '4x4', length: 8, quantity: postQty,
    boardFeet: calcBoardFeet('4x4', 8, postQty),
  })

  // ── 2. Rails (2x4) ────────────────────────────────────────────────────
  // One rail per bay per rail row. Rails span between posts.
  const railLen = shortestBoardFor('2x4', postSpacingFt)
  const railQty = Math.ceil(bays * railCount * (1 + wf))
  entries.push({
    nominalSize: '2x4', length: railLen, quantity: railQty,
    boardFeet: calcBoardFeet('2x4', railLen, railQty),
  })

  // ── 3. Pickets (1x4 or 1x6 @ 6ft) ────────────────────────────────────
  // Determine nominal size from actual width (3.5" = 1x4, 5.5" = 1x6)
  const picketNominal = picketWidthIn <= 3.5 ? '1x4' : '1x6'
  const picketLen = 6  // 6ft pickets are standard stock

  // Bay width available for pickets = post spacing minus one post's actual width (3.5")
  const bayWidthIn = postSpacingFt * 12 - 3.5
  const picketsPerBay = Math.floor(bayWidthIn / (picketWidthIn + picketGapIn))
  const picketQty = Math.ceil(picketsPerBay * bays * (1 + wf))
  entries.push({
    nominalSize: picketNominal, length: picketLen, quantity: picketQty,
    boardFeet: calcBoardFeet(picketNominal, picketLen, picketQty),
  })

  const shoppingList = consolidateList(entries)
  const totalBoardFeet = shoppingList.reduce((s, e) => s + e.boardFeet, 0)
  const cost = sumCosts(shoppingList)

  return {
    projectType: 'fence', dimensions: dims, wasteFactor,
    shoppingList, cutList: [],
    totalBoardFeet,
    estimatedCostMin: Math.round(cost.min),
    estimatedCostMax: Math.round(cost.max),
    generatedAt: new Date().toISOString(),
    shareToken: generateShareToken({ projectType: 'fence', dimensions: dims, wasteFactor }),
  }
}
