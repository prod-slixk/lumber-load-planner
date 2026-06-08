import type { FramingWallDimensions, WasteFactor, CalculationResult, ShoppingListEntry } from '../../types'
import { calcBoardFeet, shortestBoardFor } from '../../data/lumber'
import { consolidateList, sumCosts, generateShareToken } from './utils'

export function calculateFramingWall(
  dims: FramingWallDimensions,
  wasteFactor: WasteFactor
): CalculationResult {
  const { lengthFt, heightFt, studSpacingIn, openings } = dims
  const wf = wasteFactor
  const entries: ShoppingListEntry[] = []

  // Stud length: 8ft wall → 8ft stud; 9 or 10ft → 10ft stud.
  // Pre-cut 92.625" studs exist for 8ft walls, but 8ft stock is a safe substitute.
  const studLen: number = heightFt <= 8 ? 8 : 10

  // ── 1. Studs ───────────────────────────────────────────────────────────
  // Basic OC stud count + 2 extra per end + 4 per opening (king + jack)
  const basicStuds = Math.floor((lengthFt * 12) / studSpacingIn) + 1
  const openingStuds = openings * 4   // 2 king studs + 2 jack studs
  const studQty = Math.ceil((basicStuds + openingStuds) * (1 + wf))
  entries.push({
    nominalSize: '2x4', length: studLen, quantity: studQty,
    boardFeet: calcBoardFeet('2x4', studLen, studQty),
  })

  // ── 2. Top plates (doubled) ────────────────────────────────────────────
  // Double top plate = 2 full-length runs of 2x4.
  const plateLen = shortestBoardFor('2x4', lengthFt)
  // How many boards cover the full run? (e.g. 24ft wall → 2× 12ft boards)
  const boardsPerRun = Math.ceil((lengthFt * 12) / (plateLen * 12))
  const topPlateQty = Math.ceil(2 * boardsPerRun * (1 + wf))
  entries.push({
    nominalSize: '2x4', length: plateLen, quantity: topPlateQty,
    boardFeet: calcBoardFeet('2x4', plateLen, topPlateQty),
  })

  // ── 3. Bottom plate (single) ───────────────────────────────────────────
  const bottomPlateQty = Math.ceil(boardsPerRun * (1 + wf))
  entries.push({
    nominalSize: '2x4', length: plateLen, quantity: bottomPlateQty,
    boardFeet: calcBoardFeet('2x4', plateLen, bottomPlateQty),
  })

  // ── 4. Headers (2x10, doubled, for door/window openings) ──────────────
  // Standard opening ~36". Header = opening width + 3" for jack studs ≈ 4ft.
  if (openings > 0) {
    const headerLen = shortestBoardFor('2x10', 4)
    const headerQty = openings * 2  // doubled header per opening
    entries.push({
      nominalSize: '2x10', length: headerLen, quantity: headerQty,
      boardFeet: calcBoardFeet('2x10', headerLen, headerQty),
    })
  }

  const shoppingList = consolidateList(entries)
  const totalBoardFeet = shoppingList.reduce((s, e) => s + e.boardFeet, 0)
  const cost = sumCosts(shoppingList)

  return {
    projectType: 'framing-wall', dimensions: dims, wasteFactor,
    shoppingList, cutList: [],
    totalBoardFeet,
    estimatedCostMin: Math.round(cost.min),
    estimatedCostMax: Math.round(cost.max),
    generatedAt: new Date().toISOString(),
    shareToken: generateShareToken({ projectType: 'framing-wall', dimensions: dims, wasteFactor }),
  }
}
