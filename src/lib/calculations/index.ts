import { calculateDeck } from './deck'
import { calculateFence } from './fence'
import { calculateRaisedBed } from './raisedBed'
import { calculateFramingWall } from './framingWall'
import { calculateShedFloor } from './shedFloor'
import type { DimensionInputs, WasteFactor, CalculationResult } from '../../types'

/**
 * Unified entry point. The switch is exhaustive — TypeScript will error
 * if a new ProjectType is added without a matching calculation function.
 */
export function calculateProject(
  dims: DimensionInputs,
  wasteFactor: WasteFactor
): CalculationResult {
  switch (dims.projectType) {
    case 'deck':               return calculateDeck(dims, wasteFactor)
    case 'fence':              return calculateFence(dims, wasteFactor)
    case 'raised-garden-bed':  return calculateRaisedBed(dims, wasteFactor)
    case 'framing-wall':       return calculateFramingWall(dims, wasteFactor)
    case 'shed-floor':         return calculateShedFloor(dims, wasteFactor)
  }
}

export {
  calculateDeck,
  calculateFence,
  calculateRaisedBed,
  calculateFramingWall,
  calculateShedFloor,
}
