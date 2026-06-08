import type { LumberSize } from '../types'

/**
 * Standard lumber sizes with nominal vs. actual dimensions.
 * Source: AWC (American Wood Council) standard softwood lumber sizes.
 *
 * The gap between nominal and actual is the single most common point of
 * confusion for first-time buyers. A 2x4 is 1.5" x 3.5". Always.
 */
export const LUMBER_SIZES: readonly LumberSize[] = [
  {
    nominal: '1x4',
    nominalThickness: 1, nominalWidth: 4,
    actualThickness: 0.75, actualWidth: 3.5,
    availableLengths: [8, 10, 12, 16],
  },
  {
    nominal: '1x6',
    nominalThickness: 1, nominalWidth: 6,
    actualThickness: 0.75, actualWidth: 5.5,
    availableLengths: [8, 10, 12, 16],
  },
  {
    nominal: '1x8',
    nominalThickness: 1, nominalWidth: 8,
    actualThickness: 0.75, actualWidth: 7.25,
    availableLengths: [8, 10, 12, 16],
  },
  {
    nominal: '2x4',
    nominalThickness: 2, nominalWidth: 4,
    actualThickness: 1.5, actualWidth: 3.5,
    availableLengths: [8, 10, 12, 16],
  },
  {
    nominal: '2x6',
    nominalThickness: 2, nominalWidth: 6,
    actualThickness: 1.5, actualWidth: 5.5,
    availableLengths: [8, 10, 12, 16],
  },
  {
    nominal: '2x8',
    nominalThickness: 2, nominalWidth: 8,
    actualThickness: 1.5, actualWidth: 7.25,
    availableLengths: [8, 10, 12, 16],
  },
  {
    nominal: '2x10',
    nominalThickness: 2, nominalWidth: 10,
    actualThickness: 1.5, actualWidth: 9.25,
    availableLengths: [8, 10, 12, 16],
  },
  {
    nominal: '2x12',
    nominalThickness: 2, nominalWidth: 12,
    actualThickness: 1.5, actualWidth: 11.25,
    availableLengths: [8, 10, 12, 16],
  },
  {
    nominal: '4x4',
    nominalThickness: 4, nominalWidth: 4,
    actualThickness: 3.5, actualWidth: 3.5,
    availableLengths: [8, 10, 12, 16],
  },
  {
    nominal: '4x6',
    nominalThickness: 4, nominalWidth: 6,
    actualThickness: 3.5, actualWidth: 5.5,
    availableLengths: [8, 10, 12, 16],
  },
  {
    nominal: '6x6',
    nominalThickness: 6, nominalWidth: 6,
    actualThickness: 5.5, actualWidth: 5.5,
    availableLengths: [8, 10, 12, 16],
  },
] as const

// Fast lookup by nominal size string
export const LUMBER_SIZE_MAP = new Map<string, LumberSize>(
  LUMBER_SIZES.map((s) => [s.nominal, s])
)

/**
 * Returns the LumberSize for a given nominal string.
 * Throws if the size isn't in our reference table — better to fail loud
 * than silently produce a wrong shopping list.
 */
export function getLumberSize(nominal: string): LumberSize {
  const size = LUMBER_SIZE_MAP.get(nominal)
  if (!size) throw new Error(`Unknown lumber size: "${nominal}". Check LUMBER_SIZES reference data.`)
  return size
}

/**
 * Board feet = (nominalThickness × nominalWidth × lengthFt) / 12
 *
 * Board feet always use NOMINAL dimensions — that's how lumber is priced and
 * ordered. Never use actual dimensions here or your customer will buy short.
 */
export function calcBoardFeet(nominal: string, lengthFt: number, quantity = 1): number {
  const size = getLumberSize(nominal)
  return (size.nominalThickness * size.nominalWidth * lengthFt * quantity) / 12
}

/**
 * Returns the shortest standard board length that covers the required cut.
 * Always picks from the size's availableLengths list. If nothing fits,
 * returns the longest available (edge case: very long single pieces).
 */
export function shortestBoardFor(nominalSize: string, requiredLengthFt: number): number {
  const size = getLumberSize(nominalSize)
  const match = [...size.availableLengths].find((l) => l >= requiredLengthFt)
  return match ?? size.availableLengths[size.availableLengths.length - 1]
}

/**
 * Average retail price per board foot by nominal size (USD, 2025 average).
 * Used for the cost estimate range on the Results screen.
 * These are rough regional averages — real prices vary by location and grade.
 */
export const PRICE_PER_BOARD_FOOT: Record<string, { min: number; max: number }> = {
  '1x4':  { min: 0.90, max: 1.20 },
  '1x6':  { min: 0.85, max: 1.15 },
  '1x8':  { min: 0.80, max: 1.10 },
  '2x4':  { min: 0.55, max: 0.80 },
  '2x6':  { min: 0.60, max: 0.85 },
  '2x8':  { min: 0.65, max: 0.90 },
  '2x10': { min: 0.70, max: 0.95 },
  '2x12': { min: 0.75, max: 1.00 },
  '4x4':  { min: 1.10, max: 1.50 },
  '4x6':  { min: 1.20, max: 1.65 },
  '6x6':  { min: 1.40, max: 1.90 },
}

/**
 * Estimate total cost range for a given board foot count and nominal size.
 */
export function estimateCost(
  nominal: string,
  totalBoardFeet: number
): { min: number; max: number } {
  const prices = PRICE_PER_BOARD_FOOT[nominal] ?? { min: 0.70, max: 1.00 }
  return {
    min: Math.ceil(totalBoardFeet * prices.min * 100) / 100,
    max: Math.ceil(totalBoardFeet * prices.max * 100) / 100,
  }
}
