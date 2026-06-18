import { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { DeckDimensions } from '../../types'
import { calculateDeck } from '../../lib/calculations'
import { useLLPStore } from '../../store'
import { UnitInput } from './UnitInput'
import { ChipGroup } from './ChipGroup'
import { ToggleSwitch } from './ToggleSwitch'
import { previewBoxStyle, gridTwoStyle, chipLabelStyle, hintStyle } from './shared'
import { SubmitButton } from './SubmitButton'

const schema = z.object({
  lengthFt: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(4, 'Minimum 4 ft')
    .max(100, 'Maximum 100 ft'),
  widthFt: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(4, 'Minimum 4 ft')
    .max(100, 'Maximum 100 ft'),
  joistSpacingIn: z.coerce
    .number()
    .refine((v): v is 12 | 16 | 24 => [12, 16, 24].includes(v), 'Select a spacing'),
  doublePerimeterBeam: z.boolean(),
  decking: z.enum(['perpendicular', 'diagonal']),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (dims: DeckDimensions) => void
}

const JOIST_CHIPS = [
  { value: 12, label: '12" OC', sub: 'heavy loads' },
  { value: 16, label: '16" OC', sub: 'standard' },
  { value: 24, label: '24" OC', sub: 'lightweight' },
]

const DECKING_CHIPS = [
  { value: 'perpendicular', label: 'Perpendicular' },
  { value: 'diagonal', label: 'Diagonal 45°', sub: '+15% material' },
]

export default function DeckForm({ onSubmit }: Props) {
  const unitMode = useLLPStore((s) => s.unitMode)

  const { handleSubmit, watch, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { joistSpacingIn: 16, doublePerimeterBeam: false, decking: 'perpendicular' },
  })

  const values = watch()

  const preview = useMemo(() => {
    const parsed = schema.safeParse(values)
    if (!parsed.success) return null
    try {
      const { joistSpacingIn, ...rest } = parsed.data
      return calculateDeck({ projectType: 'deck', joistSpacingIn: joistSpacingIn as 12 | 16 | 24, ...rest }, 0.10)
    } catch {
      return null
    }
  }, [values])

  function handleValid(data: FormValues) {
    onSubmit({
      projectType: 'deck',
      lengthFt: data.lengthFt,
      widthFt: data.widthFt,
      joistSpacingIn: data.joistSpacingIn as 12 | 16 | 24,
      doublePerimeterBeam: data.doublePerimeterBeam,
      decking: data.decking,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} noValidate>
      {/* Footprint */}
      <div style={gridTwoStyle}>
        <UnitInput name="lengthFt" control={control} label="Length" unitMode={unitMode} minFt={4} maxFt={100} />
        <UnitInput name="widthFt"  control={control} label="Width"  unitMode={unitMode} minFt={4} maxFt={100} />
      </div>

      {/* Joist spacing */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p id="joistSpacingIn-label" style={chipLabelStyle}>Joist spacing</p>
        <Controller
          name="joistSpacingIn"
          control={control}
          render={({ field }) => (
            <ChipGroup
              aria-labelledby="joistSpacingIn-label"
              options={JOIST_CHIPS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <p style={hintStyle}>16" on-center is standard. 12" for heavy loads, 24" for lightweight builds.</p>
      </div>

      {/* Decking direction */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p id="decking-label" style={chipLabelStyle}>Decking direction</p>
        <Controller
          name="decking"
          control={control}
          render={({ field }) => (
            <ChipGroup
              aria-labelledby="decking-label"
              options={DECKING_CHIPS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      {/* Double perimeter beam toggle */}
      <Controller
        name="doublePerimeterBeam"
        control={control}
        render={({ field }) => (
          <ToggleSwitch
            id="doublePerimeterBeam"
            label="Double perimeter beam"
            hint="Recommended for spans over 16 ft — pairs two beams for extra rigidity."
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

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
