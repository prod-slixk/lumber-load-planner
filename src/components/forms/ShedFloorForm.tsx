import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ShedFloorDimensions } from '../../types'
import { calculateShedFloor } from '../../lib/calculations'
import { useLLPStore } from '../../store'
import { UnitInput } from './UnitInput'
import { inputStyle, checkboxRowStyle, submitBtnStyle, previewBoxStyle, gridTwoStyle } from './shared'

const JOIST_OC_OPTIONS = [12, 16, 24] as const

const schema = z.object({
  lengthFt: z.coerce.number({ invalid_type_error: 'Enter a number' }).min(4).max(40),
  widthFt: z.coerce.number({ invalid_type_error: 'Enter a number' }).min(4).max(40),
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

export default function ShedFloorForm({ onSubmit }: Props) {
  const unitMode = useLLPStore((s) => s.unitMode)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors: _errors },
  } = useForm<FormValues>({
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
      <div style={gridTwoStyle}>
        <UnitInput
          name="lengthFt"
          control={control}
          label="Length"
          unitMode={unitMode}
          minFt={4}
          maxFt={40}
        />
        <UnitInput
          name="widthFt"
          control={control}
          label="Width"
          unitMode={unitMode}
          minFt={4}
          maxFt={40}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="joistSpacingIn" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>
          Joist spacing (in OC)
        </label>
        <select id="joistSpacingIn" style={inputStyle} {...register('joistSpacingIn')}>
          {JOIST_OC_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}&quot; OC</option>
          ))}
        </select>
        <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.25rem' }}>
          16&quot; OC is standard. 12&quot; OC for heavier loads (tractors, equipment storage).
        </p>
      </div>

      <div style={checkboxRowStyle}>
        <input id="useRimJoists" type="checkbox" {...register('useRimJoists')} />
        <label htmlFor="useRimJoists" style={{ cursor: 'pointer' }}>
          Include rim joists <span style={{ color: '#888', fontSize: '0.82rem' }}>(recommended — caps the frame perimeter)</span>
        </label>
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
          {values.widthFt > 8 && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#b45309' }}>
              ⚠ Span &gt; 8 ft — using 2×8 joists for this width.
            </p>
          )}
        </div>
      )}

      <button type="submit" style={submitBtnStyle}>Generate shopping list →</button>
    </form>
  )
}
