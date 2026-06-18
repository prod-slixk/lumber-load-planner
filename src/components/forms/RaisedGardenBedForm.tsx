import { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { RaisedGardenBedDimensions } from '../../types'
import { calculateRaisedBed } from '../../lib/calculations'
import { useLLPStore } from '../../store'
import { FormField } from './FormField'
import { UnitInput } from './UnitInput'
import { ChipGroup } from './ChipGroup'
import { inputStyle, previewBoxStyle, gridTwoStyle, chipLabelStyle, hintStyle } from './shared'
import { SubmitButton } from './SubmitButton'

const BOARD_SIZES = ['2x6', '2x8', '2x10', '2x12'] as const

const schema = z.object({
  lengthFt: z.coerce.number({ invalid_type_error: 'Enter a number' }).min(1).max(50),
  widthFt:  z.coerce.number({ invalid_type_error: 'Enter a number' }).min(1).max(50),
  heightIn: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(5.5, 'Minimum height is 5.5" (one 2×6 board)')
    .max(72, 'Maximum 72 in'),
  boardSize: z.enum(BOARD_SIZES),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (dims: RaisedGardenBedDimensions) => void
}

const BOARD_SIZE_CHIPS = [
  { value: '2x6',  label: '2×6',  sub: 'most common' },
  { value: '2x8',  label: '2×8' },
  { value: '2x10', label: '2×10' },
  { value: '2x12', label: '2×12', sub: 'tall wall' },
]

export default function RaisedGardenBedForm({ onSubmit }: Props) {
  const unitMode = useLLPStore((s) => s.unitMode)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { heightIn: 11, boardSize: '2x6' },
  })

  const values = watch()

  const preview = useMemo(() => {
    const parsed = schema.safeParse(values)
    if (!parsed.success) return null
    try {
      return calculateRaisedBed({ projectType: 'raised-garden-bed', ...parsed.data }, 0.10)
    } catch {
      return null
    }
  }, [values])

  function handleValid(data: FormValues) {
    onSubmit({ projectType: 'raised-garden-bed', ...data })
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} noValidate>
      {/* Footprint */}
      <div style={gridTwoStyle}>
        <UnitInput name="lengthFt" control={control} label="Length" unitMode={unitMode} minFt={1} maxFt={50} />
        <UnitInput name="widthFt"  control={control} label="Width"  unitMode={unitMode} minFt={1} maxFt={50} />
      </div>

      {/* Height */}
      <FormField id="heightIn" label="Height (in)" error={errors.heightIn?.message}
        hint='11" = 2 rows of 2×6. 23" = 4 rows. Most vegetables need 12–18".'>
        <input
          id="heightIn"
          type="number"
          step="1"
          placeholder="11"
          style={inputStyle}
          {...register('heightIn')}
        />
      </FormField>

      {/* Board size */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p id="boardSize-label" style={chipLabelStyle}>Board size</p>
        <Controller
          name="boardSize"
          control={control}
          render={({ field }) => (
            <ChipGroup
              aria-labelledby="boardSize-label"
              options={BOARD_SIZE_CHIPS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <p style={hintStyle}>2×6 is standard. Go wider for taller beds or heavier wood.</p>
        {errors.boardSize && (
          <p role="alert" aria-live="polite" style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#dc2626', fontWeight: 500 }}>
            {errors.boardSize.message}
          </p>
        )}
      </div>

      {/* Live estimate */}
      {preview && (
        <div style={previewBoxStyle}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--llp-blue)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--llp-blue)', display: 'inline-block', flexShrink: 0 }} />
            Live estimate
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--llp-text)', lineHeight: 1 }}>
              {preview.shoppingList.reduce((s, e) => s + e.quantity, 0)}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--llp-text-muted)', fontWeight: 500 }}>boards</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--llp-border)', margin: '0 0.1rem' }}>·</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--llp-text)' }}>
              {preview.totalBoardFeet.toFixed(0)} board feet
            </span>
          </div>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--llp-text-muted)' }}>
            Est. cost: <span style={{ fontWeight: 700, color: 'var(--llp-text)' }}>${preview.estimatedCostMin}–${preview.estimatedCostMax}</span>
          </p>
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
