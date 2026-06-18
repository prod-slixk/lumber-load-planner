import { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ShedFloorDimensions } from '../../types'
import { calculateShedFloor } from '../../lib/calculations'
import { useLLPStore } from '../../store'
import { UnitInput } from './UnitInput'
import { ChipGroup } from './ChipGroup'
import { ToggleSwitch } from './ToggleSwitch'
import { previewBoxStyle, gridTwoStyle, chipLabelStyle, hintStyle } from './shared'
import { SubmitButton } from './SubmitButton'

const JOIST_OC_OPTIONS = [12, 16, 24] as const

const schema = z.object({
  lengthFt: z.coerce.number({ invalid_type_error: 'Enter a number' }).min(4).max(40),
  widthFt:  z.coerce.number({ invalid_type_error: 'Enter a number' }).min(4).max(40),
  joistSpacingIn: z.coerce
    .number()
    .refine((v): v is 12 | 16 | 24 => JOIST_OC_OPTIONS.includes(v as 12 | 16 | 24), {
      message: 'Choose 12, 16, or 24',
    }),
  useRimJoists: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (dims: ShedFloorDimensions) => void
}

const JOIST_CHIPS = [
  { value: 12, label: '12" OC', sub: 'equipment' },
  { value: 16, label: '16" OC', sub: 'standard' },
  { value: 24, label: '24" OC', sub: 'light storage' },
]

export default function ShedFloorForm({ onSubmit }: Props) {
  const unitMode = useLLPStore((s) => s.unitMode)

  const { handleSubmit, watch, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { joistSpacingIn: 16, useRimJoists: true },
  })

  const values = watch()

  const preview = useMemo(() => {
    const parsed = schema.safeParse(values)
    if (!parsed.success) return null
    try {
      const dims: ShedFloorDimensions = {
        projectType: 'shed-floor',
        ...parsed.data,
        joistSpacingIn: parsed.data.joistSpacingIn as 12 | 16 | 24,
      }
      return calculateShedFloor(dims, 0.10)
    } catch {
      return null
    }
  }, [values])

  function handleValid(data: FormValues) {
    onSubmit({
      projectType: 'shed-floor',
      ...data,
      joistSpacingIn: data.joistSpacingIn as 12 | 16 | 24,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} noValidate>
      {/* Footprint */}
      <div style={gridTwoStyle}>
        <UnitInput name="lengthFt" control={control} label="Length" unitMode={unitMode} minFt={4} maxFt={40} />
        <UnitInput name="widthFt"  control={control} label="Width"  unitMode={unitMode} minFt={4} maxFt={40} />
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
        <p style={hintStyle}>16" OC is standard. 12" OC for tractors or heavy equipment storage.</p>
      </div>

      {/* Rim joists toggle */}
      <Controller
        name="useRimJoists"
        control={control}
        render={({ field }) => (
          <ToggleSwitch
            id="useRimJoists"
            label="Include rim joists"
            hint="Recommended — caps the frame perimeter and ties joists together."
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
            <span style={{ fontSize: '0.9rem', color: 'var(--llp-text-muted)', fontWeight: 500 }}>pieces</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--llp-border)', margin: '0 0.1rem' }}>·</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--llp-text)' }}>
              {preview.totalBoardFeet.toFixed(0)} board feet
            </span>
          </div>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--llp-text-muted)' }}>
            Est. cost: <span style={{ fontWeight: 700, color: 'var(--llp-text)' }}>${preview.estimatedCostMin}–${preview.estimatedCostMax}</span>
          </p>
          {values.widthFt > 8 && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#b45309', fontWeight: 500 }}>
              Span &gt; 8 ft — calculator uses 2×8 joists for this width.
            </p>
          )}
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
