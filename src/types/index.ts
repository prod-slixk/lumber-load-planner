// ─── Unit Mode ─────────────────────────────────────────────────────────────

/** How the user wants to enter dimension values in the Configure forms. */
export type UnitMode = 'ft-decimal' | 'ft-in' | 'm'

export const UNIT_MODE_LABELS: Record<UnitMode, string> = {
  'ft-decimal': 'ft',
  'ft-in': 'ft + in',
  'm': 'm',
}

// ─── Project Types ─────────────────────────────────────────────────────────

export type ProjectType =
  | 'deck'
  | 'fence'
  | 'raised-garden-bed'
  | 'framing-wall'
  | 'shed-floor'

// ─── Lumber Reference Types ────────────────────────────────────────────────

export interface LumberSize {
  readonly nominal: string
  readonly nominalThickness: number  // inches — the number you say at the store
  readonly nominalWidth: number      // inches — the number you say at the store
  readonly actualThickness: number   // inches — what you actually get
  readonly actualWidth: number       // inches — what you actually get
  readonly availableLengths: readonly number[]  // feet (e.g. [8, 10, 12, 16])
}

// ─── Cut List ──────────────────────────────────────────────────────────────

export interface CutListItem {
  boardIndex: number      // which entry in the shopping list this cut comes from
  nominalSize: string     // e.g. "2x6"
  boardLength: number     // source board length in feet
  cutLength: number       // required cut length in inches
  quantity: number        // number of identical cuts
  label: string           // human label, e.g. "Deck joist"
}

// ─── Shopping List ─────────────────────────────────────────────────────────

export interface ShoppingListEntry {
  nominalSize: string     // e.g. "2x6"
  length: number          // board length in feet
  quantity: number        // how many boards to buy
  boardFeet: number       // total board feet for this line item
}

// ─── Waste Factor ──────────────────────────────────────────────────────────

export type WasteFactor = 0.05 | 0.10 | 0.15

export const WASTE_FACTOR_LABELS: Record<WasteFactor, string> = {
  0.05: 'Precision cuts (5%)',
  0.10: 'Standard (10%)',
  0.15: 'Rough cuts (15%)',
}

// ─── Dimension Configs — discriminated union by project type ───────────────

export interface DeckDimensions {
  projectType: 'deck'
  lengthFt: number
  widthFt: number
  joistSpacingIn: 12 | 16 | 24
  doublePerimeterBeam: boolean
  decking: 'perpendicular' | 'diagonal'
}

export interface FenceDimensions {
  projectType: 'fence'
  runLengthFt: number
  postSpacingFt: number       // typically 6 or 8
  railCount: 2 | 3
  picketWidthIn: number       // 3.5 = 1x4 actual, 5.5 = 1x6 actual
  picketGapIn: number
}

export interface RaisedGardenBedDimensions {
  projectType: 'raised-garden-bed'
  lengthFt: number
  widthFt: number
  heightIn: number
  boardSize: '2x6' | '2x8' | '2x10' | '2x12'
}

export interface FramingWallDimensions {
  projectType: 'framing-wall'
  lengthFt: number
  heightFt: number              // calc uses ≤8 threshold; 7–20 valid
  studSpacingIn: 12 | 16 | 24
  openings: number              // door/window openings that break stud runs
}

export interface ShedFloorDimensions {
  projectType: 'shed-floor'
  lengthFt: number
  widthFt: number
  joistSpacingIn: 12 | 16 | 24
  useRimJoists: boolean
}

export type DimensionInputs =
  | DeckDimensions
  | FenceDimensions
  | RaisedGardenBedDimensions
  | FramingWallDimensions
  | ShedFloorDimensions

// ─── Calculation Result ────────────────────────────────────────────────────

export interface CalculationResult {
  projectType: ProjectType
  dimensions: DimensionInputs
  wasteFactor: WasteFactor
  shoppingList: ShoppingListEntry[]
  cutList: CutListItem[]
  totalBoardFeet: number
  estimatedCostMin: number
  estimatedCostMax: number
  generatedAt: string         // ISO timestamp
  shareToken: string          // base64-encoded state for URL sharing
}

// ─── Saved Project ─────────────────────────────────────────────────────────

export interface SavedProject {
  id: string
  name: string
  result: CalculationResult
  purchasedItems: string[]    // keys of ShoppingListEntry lines marked purchased
  createdAt: string
  updatedAt: string
}

// ─── Project Metadata ──────────────────────────────────────────────────────

export interface ProjectMeta {
  type: ProjectType
  label: string
  description: string
  icon: string
}

export const PROJECT_META: Record<ProjectType, ProjectMeta> = {
  deck: {
    type: 'deck',
    label: 'Deck',
    description: 'Outdoor deck with joists, beams, and decking boards',
    icon: '🪵',
  },
  fence: {
    type: 'fence',
    label: 'Fence',
    description: 'Wood picket fence with posts, rails, and pickets',
    icon: '🏡',
  },
  'raised-garden-bed': {
    type: 'raised-garden-bed',
    label: 'Raised Garden Bed',
    description: 'Rectangular raised bed with stacked boards',
    icon: '🌱',
  },
  'framing-wall': {
    type: 'framing-wall',
    label: 'Framing Wall',
    description: 'Interior or exterior stud wall with top and bottom plates',
    icon: '🏗️',
  },
  'shed-floor': {
    type: 'shed-floor',
    label: 'Shed Floor',
    description: 'Pressure-treated floor frame for a shed or outbuilding',
    icon: '🏚️',
  },
}
