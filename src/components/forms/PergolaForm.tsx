import { useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { PergolaDimensions } from '../../types'
import { calculatePergola } from '../../lib/calculations'
import { useLLPStore } from '../../store'
import { UnitInput } from './UnitInput'
import { ChipGroup } from './ChipGroup'
import { previewBoxStyle, gridTwoStyle, chipLabelStyle, hintStyle } from './shared'
import { SubmitButton } from './SubmitButton'

const POST_SPACING_OPTIONS = [6, 8, 10] as const
const RAFTER_SPACING_OPTIONS = [12, 16, 24] as const
const POST_SIZE_OPTIONS = ['4x4', '6x6'] as const

const schema = z.object({
  lengthFt: z.coerce.number({ invalid_type_error: 'Enter a number' }).min(6).max(60),
  widthFt: z.coerce.number({ invalid_type_error: 'Enter a number' }).min(6).max(30),
  postHeightFt: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(7, 'Minimum post height is 7 ft')
    .max(14, 'Maximum post height is 14 ft'),
  postSpacingFt: z.coerce
    .number()
    .refine((v): v is 6 | 8 | 10 => POST_SPACING_OPTIONS.includes(v as 6 | 8 | 10), {
      message: 'Choose 6, 8, or 10',
    }),
  postSize: z.enum(POST_SIZE_OPTIONS),
  rafterSpacingIn: z.coerce
    .number()
    .refine((v): v is 12 | 16 | 24 => RAFTER_SPACING_OPTIONS.includes(v as 12 | 16 | 24), {
      message: 'Choose 12, 16, or 24',
    }),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (dims: PergolaDimensions) => void
}

const POST_SPACING_CHIPS = [
  { value: 6,  label: '6 ft', sub: 'heavy structure' },
  { value: 8,  label: '8 ft', sub: 'most common' },
  { value: 10, label: '10 ft' },
]

const POST_SIZE_CHIPS = [
  { value: '4x4', label: '4×4', sub: 'standard' },
  { value: '6x6', label: '6×6', sub: 'large / heavy' },
]

const RAFTER_SPACING_CHIPS = [
  { value: 12, label: '12" OC', sub: 'dense shade' },
  { value: 16, label: '16" OC', sub: 'good shade' },
  { value: 24, label: '24" OC', sub: 'open feel' },
]

export default function PergolaForm({ onSubmit }: Props) {
  const unitMode = useLLPStore((s) => s.unitMode)

  const { handleSubmit, watch, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      postHeightFt: 9,
      postSpacingFt: 8,
      postSize: '4x4',
      rafterSpacingIn: 16,
    },
  })

  const values = watch()

  const preview = useMemo(() => {
    const parsed = schema.safeParse(values)
    if (!parsed.success) return null
    try {
      const dims: PergolaDimensions = {
        projectType: 'pergola',
        ...parsed.data,
        postSpacingFt: parsed.data.postSpacingFt as 6 | 8 | 10,
        postSize: parsed.data.postSize as '4x4' | '6x6',
        rafterSpacingIn: parsed.data.rafterSpacingIn as 12 | 16 | 24,
      }
      return calculatePergola(dims, 0.10)
    } catch {
      return null
    }
  }, [values])

  function handleValid(data: FormValues) {
    onSubmit({
      projectType: 'pergola',
      ...data,
      postSpacingFt: data.postSpacingFt as 6 | 8 | 10,
      postSize: data.postSize as '4x4' | '6x6',
      rafterSpacingIn: data.rafterSpacingIn as 12 | 16 | 24,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} noValidate>
      {/* Footprint */}
      <div style={gridTwoStyle}>
        <UnitInput name="lengthFt"     control={control} label="Length"      unitMode={unitMode} minFt={6}  maxFt={60} />
        <UnitInput name="widthFt"      control={control} label="Width"       unitMode={unitMode} minFt={6}  maxFt={30} />
      </div>

      {/* Post height */}
      <div style={{ marginBottom: '1.25rem' }}>
        <UnitInput name="postHeightFt" control={control} label="Post height" unitMode={unitMode} minFt={7} maxFt={14} />
        <p style={hintStyle}>Measured from grade to the top of the post. 8–9 ft is typical.</p>
      </div>

      {/* Post spacing */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p id="postSpacingFt-label" style={chipLabelStyle}>Post spacing</p>
        <Controller
          name="postSpacingFt"
          control={control}
          render={({ field }) => (
            <ChipGroup
              aria-labelledby="postSpacingFt-label"
              options={POST_SPACING_CHIPS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <p style={hintStyle}>8 ft is the most common. 6 ft for heavier shade structures.</p>
      </div>

      {/* Post size */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p id="postSize-label" style={chipLabelStyle}>Post size</p>
        <Controller
          name="postSize"
          control={control}
          render={({ field }) => (
            <ChipGroup
              aria-labelledby="postSize-label"
              options={POST_SIZE_CHIPS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <p style={hintStyle}>6×6 significantly reduces sway and is often required for freestanding pergolas over 14 ft.</p>
      </div>

      {/* Rafter spacing */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p id="rafterSpacingIn-label" style={chipLabelStyle}>Rafter spacing</p>
        <Controller
          name="rafterSpacingIn"
          control={control}
          render={({ field }) => (
            <ChipGroup
              aria-labelledby="rafterSpacingIn-label"
              options={RAFTER_SPACING_CHIPS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <p style={hintStyle}>16" OC gives good shade. 12" OC for denser coverage or climbing plants.</p>
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
            <span style={{ fontSize: '0.9rem', color: 'var(--llp-text-muted)', fontWeight: 500 }}>pieces</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--llp-border)', margin: '0 0.1rem' }}>·</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--llp-text)' }}>
              {preview.totalBoardFeet.toFixed(0)} board feet
            </span>
          </div>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--llp-text-muted)' }}>
            Est. cost: <span style={{ fontWeight: 700, color: 'var(--llp-text)' }}>${preview.estimatedCostMin}–${preview.estimatedCostMax}</span>
          </p>
          {values.widthFt > 12 && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#b45309', fontWeight: 500 }}>
              Span &gt; 12 ft — calculator uses 2×8 rafters for this width.
            </p>
          )}
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
