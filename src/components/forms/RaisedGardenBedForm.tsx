import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { RaisedGardenBedDimensions } from '../../types'
import { calculateRaisedBed } from '../../lib/calculations'
import { useLLPStore } from '../../store'
import { FormField } from './FormField'
import { UnitInput } from './UnitInput'
import { inputStyle, selectStyle, previewBoxStyle, gridTwoStyle } from './shared'
import { SubmitButton } from './SubmitButton'

const BOARD_SIZES = ['2x6', '2x8', '2x10', '2x12'] as const

const schema = z.object({
  lengthFt: z.coerce.number({ invalid_type_error: 'Enter a number' }).min(1).max(50),
  widthFt: z.coerce.number({ invalid_type_error: 'Enter a number' }).min(1).max(50),
  heightIn: z.coerce
    .number({ invalid_type_error: 'Enter a number' })
    .min(5.5, 'Minimum height is 5.5" (one 2×6 board)')
    .max(72, 'Maximum 72 in'),
  boardSize: z.enum(BOARD_SIZES),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (dims: RaisedGardenBedDimensions) => void
}

export default function RaisedGardenBedForm({ onSubmit }: Props) {
  const unitMode = useLLPStore((s) => s.unitMode)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { heightIn: 11, boardSize: '2x6' },
  })

  const values = watch()

  const preview = useMemo(() => {
    const parsed = schema.safeParse(values)
    if (!parsed.success) return null
    try {
      return calculateRaisedBed({ projectType: 'raised-garden-bed', ...parsed.data }, 0.10)
    } catch {
      return null
    }
  }, [values])

  function handleValid(data: FormValues) {
    onSubmit({ projectType: 'raised-garden-bed', ...data })
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} noValidate>
      <div style={gridTwoStyle}>
        <UnitInput
          name="lengthFt"
          control={control}
          label="Length"
          unitMode={unitMode}
          minFt={1}
          maxFt={50}
        />
        <UnitInput
          name="widthFt"
          control={control}
          label="Width"
          unitMode={unitMode}
          minFt={1}
          maxFt={50}
        />
      </div>

      <div style={gridTwoStyle}>
        {/* heightIn stays in inches — board height is always expressed in inches */}
        <FormField id="heightIn" label="Height (in)" error={errors.heightIn?.message}
          hint="11&quot; = 2 rows of 2×6. 23&quot; = 4 rows.">
          <input id="heightIn" type="number" step="1" placeholder="11" style={inputStyle} {...register('heightIn')} />
        </FormField>
        <FormField id="boardSize" label="Board size" error={errors.boardSize?.message}
          hint="2×6 is most common for raised beds.">
          <select id="boardSize" style={selectStyle} {...register('boardSize')}>
            {BOARD_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
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
