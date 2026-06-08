import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { DeckDimensions } from '../../types'
import { calculateDeck } from '../../lib/calculations'
import { useLLPStore } from '../../store'
import { FormField } from './FormField'
import { UnitInput } from './UnitInput'
import { selectStyle, submitBtnStyle, previewBoxStyle, gridTwoStyle } from './shared'

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

export default function DeckForm({ onSubmit }: Props) {
  const unitMode = useLLPStore((s) => s.unitMode)

  const {
    register,
    handleSubmit,
    watch,
    control,
  } = useForm<FormValues>({
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
      <div style={gridTwoStyle}>
        <UnitInput
          name="lengthFt"
          control={control}
          label="Length"
          unitMode={unitMode}
          minFt={4}
          maxFt={100}
        />
        <UnitInput
          name="widthFt"
          control={control}
          label="Width"
          unitMode={unitMode}
          minFt={4}
          maxFt={100}
        />
      </div>

      <FormField
        id="joistSpacingIn"
        label="Joist spacing"
        hint='16" on-center is standard for most decks. 12" for heavy loads, 24" for lightweight builds.'
      >
        <select id="joistSpacingIn" style={selectStyle} {...register('joistSpacingIn')}>
          <option value={12}>12&quot; on-center</option>
          <option value={16}>16&quot; on-center (standard)</option>
          <option value={24}>24&quot; on-center</option>
        </select>
      </FormField>

      <FormField id="decking" label="Decking direction">
        <select id="decking" style={selectStyle} {...register('decking')}>
          <option value="perpendicular">Perpendicular to house</option>
          <option value="diagonal">Diagonal (45°) — adds ~15% material</option>
        </select>
      </FormField>

      <FormField id="doublePerimeterBeam" label=" ">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
          <input type="checkbox" id="doublePerimeterBeam" {...register('doublePerimeterBeam')} />
          Double perimeter beam
        </label>
      </FormField>

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

      <button type="submit" style={submitBtnStyle}>Generate shopping list →</button>
    </form>
  )
}
