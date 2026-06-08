import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { FramingWallDimensions } from '../../types'
import { calculateFramingWall } from '../../lib/calculations'
import { useLLPStore } from '../../store'
import { FormField } from './FormField'
import { UnitInput } from './UnitInput'
import { inputStyle, submitBtnStyle, previewBoxStyle, gridTwoStyle } from './shared'

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
    defaultValues: {
      heightFt: 8,
      studSpacingIn: 16,
      openings: 0,
    },
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
      <div style={gridTwoStyle}>
        <UnitInput
          name="lengthFt"
          control={control}
          label="Wall length"
          unitMode={unitMode}
          minFt={1}
          maxFt={200}
        />
        <div>
          <UnitInput
            name="heightFt"
            control={control}
            label="Wall height"
            unitMode={unitMode}
            minFt={7}
            maxFt={20}
          />
          <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.25rem' }}>
            Standard is 8 ft. Pre-cut studs at 92⅝&quot; target 8&apos;1&quot; finished.
          </p>
        </div>
      </div>

      <div style={gridTwoStyle}>
        <FormField id="studSpacingIn" label="Stud spacing (in OC)" error={errors.studSpacingIn?.message}>
          <select id="studSpacingIn" style={inputStyle} {...register('studSpacingIn')}>
            {OC_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}&quot; OC</option>
            ))}
          </select>
        </FormField>
        <FormField id="openings" label="Door / window openings" error={errors.openings?.message}
          hint="Each opening gets 2 jack studs + 2×10 header.">
          <input id="openings" type="number" step="1" min="0" placeholder="0" style={inputStyle} {...register('openings')} />
        </FormField>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 1rem' }}>
        Always uses double top plate (standard for load-bearing walls).
      </p>

      {preview && (
        <div style={previewBoxStyle}>
          <p style={{ margin: '0 0 0.3rem', fontSize: '0.75rem', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Live estimate</p>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            {preview.shoppingList.reduce((s, e) => s + e.quantity, 0)} pieces &nbsp;·&nbsp; {preview.totalBoardFeet.toFixed(0)} board feet
          </p>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#555' }}>
            ~${preview.estimatedCostMin}–${preview.estimatedCostMax} estimated
          </p>
        </div>
      )}

      <button type="submit" style={submitBtnStyle}>Generate shopping list →</button>
    </form>
  )
}
