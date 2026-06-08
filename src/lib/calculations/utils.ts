import type { ShoppingListEntry } from '../../types'
import { calcBoardFeet, PRICE_PER_BOARD_FOOT } from '../../data/lumber'

/**
 * Merge shopping list entries with the same nominalSize and length.
 * When multiple components use the same board (e.g. joists and rim joists
 * both being 2x8x12), they fold into one line so the customer grabs one stack.
 */
export function consolidateList(entries: ShoppingListEntry[]): ShoppingListEntry[] {
  const map = new Map<string, ShoppingListEntry>()

  for (const entry of entries) {
    const key = `${entry.nominalSize}-${entry.length}`
    const existing = map.get(key)
    if (existing) {
      const newQty = existing.quantity + entry.quantity
      map.set(key, {
        ...existing,
        quantity: newQty,
        boardFeet: calcBoardFeet(entry.nominalSize, entry.length, newQty),
      })
    } else {
      map.set(key, { ...entry })
    }
  }

  // Sort by nominal size then length for consistent output
  return Array.from(map.values()).sort((a, b) => {
    if (a.nominalSize !== b.nominalSize) return a.nominalSize.localeCompare(b.nominalSize)
    return a.length - b.length
  })
}

/**
 * Sum min/max cost across a shopping list.
 */
export function sumCosts(list: ShoppingListEntry[]): { min: number; max: number } {
  return list.reduce(
    (acc, entry) => {
      const price = PRICE_PER_BOARD_FOOT[entry.nominalSize] ?? { min: 0.70, max: 1.00 }
      return {
        min: acc.min + entry.boardFeet * price.min,
        max: acc.max + entry.boardFeet * price.max,
      }
    },
    { min: 0, max: 0 }
  )
}

/**
 * Encode project state for URL sharing. Safe for environments without btoa.
 */
export function generateShareToken(data: unknown): string {
  try {
    return btoa(JSON.stringify(data))
  } catch {
    return ''
  }
}
