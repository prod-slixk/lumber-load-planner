import { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { FramingWallDimensions } from '../../types'
import { calculateFramingWall } from '../../lib/calculations'
import { useLLPStore } from '../../store'
import { FormField } from './FormField'
import { UnitInput } from './UnitInput'
import { ChipGroup } from './ChipGroup'
import { inputStyle, previewBoxStyle, gridTwoStyle, chipLabelStyle, hintStyle } from './shared'
import { SubmitButton } from './SubmitButton'

const OC_OPTIONS = [12, 16, 24] as const

const schema = z.object({
  lengthFt: z.coerce.number({ invalid_type_error: 'Enter a number' }).min(1).max(200),
  heightFt: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(7, 'Minimum 7 ft')
    .max(20, 'Maximum 20 ft'),
  studSpacingIn: z.coerce
    .number()
    .refine((v): v is 12 | 16 | 24 => OC_OPTIONS.includes(v as 12 | 16 | 24), {
      message: 'Choose 12, 16, or 24',
    }),
  openings: z.coerce.number({ invalid_type_error: 'Enter a number' }).min(0).max(20),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (dims: FramingWallDimensions) => void
}

const STUD_SPACING_CHIPS = [
  { value: 12, label: '12" OC' },
  { value: 16, label: '16" OC', sub: 'standard' },
  { value: 24, label: '24" OC', sub: 'non-load-bearing' },
]

export default function FramingWallForm({ onSubmit }: Props) {
  const unitMode = useLLPStore((s) => s.unitMode)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { heightFt: 8, studSpacingIn: 16, openings: 0 },
  })

  const values = watch()

  const preview = useMemo(() => {
    const parsed = schema.safeParse(values)
    if (!parsed.success) return null
    try {
      const dims: FramingWallDimensions = {
        projectType: 'framing-wall',
        ...parsed.data,
        studSpacingIn: parsed.data.studSpacingIn as 12 | 16 | 24,
      }
      return calculateFramingWall(dims, 0.10)
    } catch {
      return null
    }
  }, [values])

  function handleValid(data: FormValues) {
    onSubmit({
      projectType: 'framing-wall',
      ...data,
      studSpacingIn: data.studSpacingIn as 12 | 16 | 24,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} noValidate>
      {/* Wall dimensions */}
      <div style={gridTwoStyle}>
        <UnitInput name="lengthFt" control={control} label="Wall length" unitMode={unitMode} minFt={1} maxFt={200} />
        <div style={{ marginBottom: '1.25rem' }}>
          <UnitInput name="heightFt" control={control} label="Wall height" unitMode={unitMode} minFt={7} maxFt={20} />
          <p style={hintStyle}>Standard is 8 ft. Pre-cut studs at 92⅝" target 8'1" finished.</p>
        </div>
      </div>

      {/* Stud spacing */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p id="studSpacingIn-label" style={chipLabelStyle}>Stud spacing</p>
        <Controller
          name="studSpacingIn"
          control={control}
          render={({ field }) => (
            <ChipGroup
              aria-labelledby="studSpacingIn-label"
              options={STUD_SPACING_CHIPS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <p style={hintStyle}>16" OC is standard for load-bearing walls. 24" OC for interior partitions only.</p>
        {errors.studSpacingIn && (
          <p role="alert" aria-live="polite" style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#dc2626', fontWeight: 500 }}>
            {errors.studSpacingIn.message}
          </p>
        )}
      </div>

      {/* Openings */}
      <FormField
        id="openings"
        label="Door / window openings"
        error={errors.openings?.message}
        hint="Each opening gets 2 jack studs + a 2×10 header."
      >
        <input
          id="openings"
          type="number"
          step="1"
          min="0"
          placeholder="0"
          style={inputStyle}
          {...register('openings')}
        />
      </FormField>

      <p style={{ ...hintStyle, margin: '0 0 1rem', color: '#6b7280' }}>
        Always uses double top plate — standard for load-bearing walls.
      </p>

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
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
