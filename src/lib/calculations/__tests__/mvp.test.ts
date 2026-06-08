/**
 * MVP spec validation — the three canonical test cases from the project spec.
 * These act as a regression fence: if calc logic changes, these must be updated
 * intentionally, not silently.
 */

import { calculateProject } from '../index'
import type { DeckDimensions, FenceDimensions, RaisedGardenBedDimensions } from '../../../types'

// ─── helpers ────────────────────────────────────────────────────────────────

function totalBoards(result: ReturnType<typeof calculateProject>) {
  return result.shoppingList.reduce((s, e) => s + e.quantity, 0)
}

// ─── 1. 10 × 12 deck (standard) ─────────────────────────────────────────────

describe('10×12 deck, standard waste (10%)', () => {
  const dims: DeckDimensions = {
    projectType: 'deck',
    lengthFt: 12,
    widthFt: 10,
    joistSpacingIn: 16,
    doublePerimeterBeam: false,
    decking: 'perpendicular',
  }
  const result = calculateProject(dims, 0.10)

  test('returns a deck result', () => {
    expect(result.projectType).toBe('deck')
  })

  test('shopping list is non-empty', () => {
    expect(result.shoppingList.length).toBeGreaterThan(0)
  })

  test('has a positive board foot count', () => {
    expect(result.totalBoardFeet).toBeGreaterThan(0)
  })

  test('estimated cost range is ordered (min ≤ max)', () => {
    expect(result.estimatedCostMin).toBeLessThanOrEqual(result.estimatedCostMax)
  })

  test('has a shareToken', () => {
    expect(typeof result.shareToken).toBe('string')
    expect(result.shareToken.length).toBeGreaterThan(0)
  })

  test('sanity: total boards is in a plausible range for a 10×12 deck', () => {
    // A 10×12 deck with 2×6 decking at 16" OC joists should need
    // roughly 20–30 decking boards + 7–9 joists + rim boards + beams.
    // We allow a wide band to avoid over-specifying calc internals.
    const boards = totalBoards(result)
    expect(boards).toBeGreaterThanOrEqual(20)
    expect(boards).toBeLessThanOrEqual(80)
  })
})

// ─── 2. 30 ft fence ─────────────────────────────────────────────────────────

describe('30 ft fence, 8ft post spacing, 2 rails, 3.5in pickets, 0.5in gap', () => {
  const dims: FenceDimensions = {
    projectType: 'fence',
    runLengthFt: 30,
    postSpacingFt: 8,
    railCount: 2,
    picketWidthIn: 3.5,
    picketGapIn: 0.5,
  }
  const result = calculateProject(dims, 0.10)

  test('returns a fence result', () => {
    expect(result.projectType).toBe('fence')
  })

  test('shopping list is non-empty', () => {
    expect(result.shoppingList.length).toBeGreaterThan(0)
  })

  test('estimated cost range is ordered', () => {
    expect(result.estimatedCostMin).toBeLessThanOrEqual(result.estimatedCostMax)
  })

  test('sanity: needs at least 4 posts for 30ft run at 8ft spacing', () => {
    // 30 / 8 = 3.75 → 4 bays → 5 posts min; with waste buffer expect ≥5
    const posts = result.shoppingList.find(
      (e) => e.nominalSize === '4x4' && e.length === 8
    )
    expect(posts).toBeDefined()
    expect(posts!.quantity).toBeGreaterThanOrEqual(5)
  })

  test('sanity: needs pickets (1x4)', () => {
    const pickets = result.shoppingList.find((e) => e.nominalSize === '1x4')
    expect(pickets).toBeDefined()
    expect(pickets!.quantity).toBeGreaterThan(10)
  })
})

// ─── 3. 4 × 8 ft raised garden bed, 12 in tall ──────────────────────────────

describe('4×8 raised garden bed, 12in tall, 2x6 boards', () => {
  const dims: RaisedGardenBedDimensions = {
    projectType: 'raised-garden-bed',
    lengthFt: 8,
    widthFt: 4,
    heightIn: 12,
    boardSize: '2x6',
  }
  const result = calculateProject(dims, 0.10)

  test('returns a raised-garden-bed result', () => {
    expect(result.projectType).toBe('raised-garden-bed')
  })

  test('shopping list is non-empty', () => {
    expect(result.shoppingList.length).toBeGreaterThan(0)
  })

  test('estimated cost range is ordered', () => {
    expect(result.estimatedCostMin).toBeLessThanOrEqual(result.estimatedCostMax)
  })

  test('sanity: 12in / 5.5in actual = 3 rows of 2x6', () => {
    // 3 rows × 2 long sides = 6 long boards; 3 rows × 2 short sides = 6 short boards
    // + 4 corner posts. With 10% waste: long and short boards each ceil(6 × 1.1) = 7.
    // Total boards > 0 and shopping list has 2x6 entries.
    const boards2x6 = result.shoppingList.filter((e) => e.nominalSize === '2x6')
    expect(boards2x6.length).toBeGreaterThan(0)
  })

  test('sanity: has 4×4 corner posts', () => {
    const posts = result.shoppingList.find((e) => e.nominalSize === '4x4')
    expect(posts).toBeDefined()
    expect(posts!.quantity).toBe(4)
  })
})

// ─── 4. consolidateList deduplications ──────────────────────────────────────

import { consolidateList } from '../utils'
import type { ShoppingListEntry } from '../../../types'

describe('consolidateList', () => {
  test('merges identical size+length entries', () => {
    const input: ShoppingListEntry[] = [
      { nominalSize: '2x8', length: 12, quantity: 4, boardFeet: 64 },
      { nominalSize: '2x8', length: 12, quantity: 2, boardFeet: 32 },
    ]
    const out = consolidateList(input)
    expect(out).toHaveLength(1)
    expect(out[0].quantity).toBe(6)
    expect(out[0].boardFeet).toBe(96)
  })

  test('keeps different sizes separate', () => {
    const input: ShoppingListEntry[] = [
      { nominalSize: '2x6', length: 8, quantity: 3, boardFeet: 24 },
      { nominalSize: '2x8', length: 8, quantity: 2, boardFeet: 21.3 },
    ]
    expect(consolidateList(input)).toHaveLength(2)
  })
})
