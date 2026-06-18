import { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { FenceDimensions } from '../../types'
import { calculateFence } from '../../lib/calculations'
import { useLLPStore } from '../../store'
import { FormField } from './FormField'
import { UnitInput } from './UnitInput'
import { ChipGroup } from './ChipGroup'
import { inputStyle, previewBoxStyle, gridTwoStyle, chipLabelStyle, hintStyle } from './shared'
import { SubmitButton } from './SubmitButton'

const schema = z.object({
  runLengthFt: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(1, 'Minimum 1 ft')
    .max(1000, 'Maximum 1000 ft'),
  postSpacingFt: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(4, 'Minimum 4 ft')
    .max(10, 'Maximum 10 ft'),
  railCount: z.coerce
    .number()
    .refine((v): v is 2 | 3 => [2, 3].includes(v), 'Select rail count'),
  picketWidthIn: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(2, 'Minimum 2 in')
    .max(8, 'Maximum 8 in'),
  picketGapIn: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(0, 'Cannot be negative')
    .max(4, 'Maximum 4 in'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (dims: FenceDimensions) => void
}

const RAIL_CHIPS = [
  { value: 2, label: '2 rails', sub: 'standard' },
  { value: 3, label: '3 rails', sub: 'tall / heavy' },
]

const PICKET_WIDTH_CHIPS = [
  { value: 3.5, label: '3.5"', sub: '1×4 dog-ear' },
  { value: 5.5, label: '5.5"', sub: '1×6 privacy' },
]

export default function FenceForm({ onSubmit }: Props) {
  const unitMode = useLLPStore((s) => s.unitMode)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { postSpacingFt: 8, railCount: 2, picketWidthIn: 3.5, picketGapIn: 0.5 },
  })

  const values = watch()

  const preview = useMemo(() => {
    const parsed = schema.safeParse(values)
    if (!parsed.success) return null
    try {
      return calculateFence(
        { projectType: 'fence', ...parsed.data, railCount: parsed.data.railCount as 2 | 3 },
        0.10
      )
    } catch {
      return null
    }
  }, [values])

  function handleValid(data: FormValues) {
    onSubmit({
      projectType: 'fence',
      runLengthFt: data.runLengthFt,
      postSpacingFt: data.postSpacingFt,
      railCount: data.railCount as 2 | 3,
      picketWidthIn: data.picketWidthIn,
      picketGapIn: data.picketGapIn,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} noValidate>
      {/* Run length */}
      <div style={{ marginBottom: '1.25rem' }}>
        <UnitInput
          name="runLengthFt"
          control={control}
          label="Total run length"
          unitMode={unitMode}
          minFt={1}
          maxFt={1000}
        />
        <p style={hintStyle}>Measure the full linear footage of the fence line, corner to corner.</p>
      </div>

      {/* Post spacing + rail count */}
      <div style={gridTwoStyle}>
        <div style={{ marginBottom: '1.25rem' }}>
          <UnitInput
            name="postSpacingFt"
            control={control}
            label="Post spacing"
            unitMode={unitMode}
            minFt={4}
            maxFt={10}
          />
          <p style={hintStyle}>6 ft is common; 8 ft reduces post count.</p>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <p id="railCount-label" style={chipLabelStyle}>Rails per bay</p>
          <Controller
            name="railCount"
            control={control}
            render={({ field }) => (
              <ChipGroup
                aria-labelledby="railCount-label"
                options={RAIL_CHIPS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.railCount && (
            <p role="alert" aria-live="polite" style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#dc2626', fontWeight: 500 }}>
              {errors.railCount.message}
            </p>
          )}
        </div>
      </div>

      {/* Picket width + gap */}
      <div style={gridTwoStyle}>
        <div style={{ marginBottom: '1.25rem' }}>
          <p id="picketWidthIn-label" style={chipLabelStyle}>Picket width</p>
          <Controller
            name="picketWidthIn"
            control={control}
            render={({ field }) => (
              <ChipGroup
                aria-labelledby="picketWidthIn-label"
                options={PICKET_WIDTH_CHIPS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.picketWidthIn && (
            <p role="alert" aria-live="polite" style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#dc2626', fontWeight: 500 }}>
              {errors.picketWidthIn.message}
            </p>
          )}
        </div>

        <FormField id="picketGapIn" label="Gap between pickets (in)" error={errors.picketGapIn?.message}>
          <input
            id="picketGapIn"
            type="number"
            step="0.25"
            placeholder="0.5"
            style={inputStyle}
            {...register('picketGapIn')}
          />
        </FormField>
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
