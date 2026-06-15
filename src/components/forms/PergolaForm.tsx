import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { PergolaDimensions } from '../../types'
import { calculatePergola } from '../../lib/calculations'
import { useLLPStore } from '../../store'
import { UnitInput } from './UnitInput'
import { inputStyle, previewBoxStyle, gridTwoStyle } from './shared'
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

export default function PergolaForm({ onSubmit }: Props) {
  const unitMode = useLLPStore((s) => s.unitMode)

  const {
    register,
    handleSubmit,
    watch,
    control,
  } = useForm<FormValues>({
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
        <UnitInput
          name="lengthFt"
          control={control}
          label="Length"
          unitMode={unitMode}
          minFt={6}
          maxFt={60}
        />
        <UnitInput
          name="widthFt"
          control={control}
          label="Width"
          unitMode={unitMode}
          minFt={6}
          maxFt={30}
        />
      </div>

      {/* Post height */}
      <div style={{ marginBottom: '1.25rem' }}>
        <UnitInput
          name="postHeightFt"
          control={control}
          label="Post height"
          unitMode={unitMode}
          minFt={7}
          maxFt={14}
        />
        <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.25rem' }}>
          Measured from grade to the top of the post. 8–9 ft is typical.
        </p>
      </div>

      {/* Post spacing + size */}
      <div style={gridTwoStyle}>
        <div>
          <label htmlFor="postSpacingFt" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1A2533', marginBottom: '0.25rem', letterSpacing: '0.01em' }}>
            Post spacing
          </label>
          <select id="postSpacingFt" style={inputStyle} {...register('postSpacingFt')}>
            {POST_SPACING_OPTIONS.map((o) => (
              <option key={o} value={o}>{o} ft OC</option>
            ))}
          </select>
          <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.25rem' }}>
            8 ft is the most common. 6 ft for heavier shade structures.
          </p>
        </div>

        <div>
          <label htmlFor="postSize" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1A2533', marginBottom: '0.25rem', letterSpacing: '0.01em' }}>
            Post size
          </label>
          <select id="postSize" style={inputStyle} {...register('postSize')}>
            <option value="4x4">4×4 — standard pergola</option>
            <option value="6x6">6×6 — large / heavy structure</option>
          </select>
        </div>
      </div>

      {/* Rafter spacing */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="rafterSpacingIn" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1A2533', marginBottom: '0.25rem', letterSpacing: '0.01em' }}>
          Rafter spacing
        </label>
        <select id="rafterSpacingIn" style={inputStyle} {...register('rafterSpacingIn')}>
          {RAFTER_SPACING_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}&quot; OC</option>
          ))}
        </select>
        <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.25rem' }}>
          16&quot; OC gives good shade. 12&quot; OC for denser coverage or climbing plants.
        </p>
      </div>

      {preview && (
        <div style={previewBoxStyle}>
          <p style={{ margin: '0 0 0.3rem', fontSize: '0.75rem', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Live estimate</p>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            {preview.shoppingList.reduce((s, e) => s + e.quantity, 0)} pieces &nbsp;·&nbsp; {preview.totalBoardFeet.toFixed(0)} board feet
          </p>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#555' }}>
            ~${preview.estimatedCostMin}–${preview.estimatedCostMax} estimated
          </p>
          {values.widthFt > 12 && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#b45309' }}>
              ⚠ Span &gt; 12 ft — using 2×8 rafters for this width.
            </p>
          )}
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
