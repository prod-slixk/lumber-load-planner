import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { FenceDimensions } from '../../types'
import { calculateFence } from '../../lib/calculations'
import { useLLPStore } from '../../store'
import { FormField } from './FormField'
import { UnitInput } from './UnitInput'
import { inputStyle, selectStyle, previewBoxStyle, gridTwoStyle } from './shared'
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
      <UnitInput
        name="runLengthFt"
        control={control}
        label="Total run length"
        unitMode={unitMode}
        minFt={1}
        maxFt={1000}
      />
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '-0.5rem', marginBottom: '1rem' }}>
        Measure the full linear footage of the fence line, corner to corner.
      </p>

      <div style={gridTwoStyle}>
        <div>
          <UnitInput
            name="postSpacingFt"
            control={control}
            label="Post spacing"
            unitMode={unitMode}
            minFt={4}
            maxFt={10}
          />
          <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.25rem' }}>
            6 ft is common; 8 ft reduces post count.
          </p>
        </div>
        <FormField id="railCount" label="Rails per bay" error={errors.railCount?.message}>
          <select id="railCount" style={selectStyle} {...register('railCount')}>
            <option value={2}>2 rails (standard)</option>
            <option value={3}>3 rails (tall fence / extra support)</option>
          </select>
        </FormField>
      </div>

      <div style={gridTwoStyle}>
        <FormField id="picketWidthIn" label="Picket width (in)" error={errors.picketWidthIn?.message}
          hint='3.5&quot; = 1×4 actual. 5.5&quot; = 1×6 actual.'>
          <select id="picketWidthIn" style={selectStyle} {...register('picketWidthIn')}>
            <option value={3.5}>3.5&quot; — 1×4 (dog-ear)</option>
            <option value={5.5}>5.5&quot; — 1×6 (privacy)</option>
          </select>
        </FormField>
        <FormField id="picketGapIn" label="Gap between pickets (in)" error={errors.picketGapIn?.message}>
          <input id="picketGapIn" type="number" step="0.25" placeholder="0.5" style={inputStyle} {...register('picketGapIn')} />
        </FormField>
      </div>

      {preview && (
        <div style={previewBoxStyle}>
          <p style={{ margin: '0 0 0.3rem', fontSize: '0.75rem', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Live estimate</p>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
            {preview.shoppingList.reduce((s, e) => s + e.quantity, 0)} boards &nbsp;·&nbsp; {preview.totalBoardFeet.toFixed(0)} board feet
          </p>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#555' }}>
            ~${preview.estimatedCostMin}–${preview.estimatedCostMax} estimated
          </p>
        </div>
      )}

      <SubmitButton />
    </form>
  )
}
