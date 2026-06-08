/**
 * UnitInput — a dimension field that adapts to the current unitMode.
 *
 * Modes:
 *   ft-decimal  →  single <input> in decimal feet          e.g. "12.5"
 *   ft-in       →  two <input>s: feet (integer) + inches    e.g. "12" + "6"
 *   m           →  single <input> in metres                 e.g. "3.81"
 *
 * The RHF field value is always decimal feet (the unit the calc engine uses).
 * Display-side conversion happens inside this component; only the converted
 * value is written back to the form.
 *
 * key={unitMode} on the outer wrapper is handled by the parent — it remounts
 * this component when unitMode changes, so we re-derive display state fresh
 * from field.value instead of keeping stale intermediate state.
 */

import { useState, useId } from 'react'
import { useController } from 'react-hook-form'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import type { UnitMode } from '../../types'

const FT_TO_M = 0.3048

function ftToM(ft: number): string {
  return (ft * FT_TO_M).toFixed(3).replace(/\.?0+$/, '')
}

function mToFt(m: number): number {
  return m / FT_TO_M
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface UnitInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  name: TName
  control: Control<TFieldValues>
  label: string
  unitMode: UnitMode
  /** Minimum value in feet (used for validation display) */
  minFt?: number
  /** Maximum value in feet */
  maxFt?: number
}

// ─── Inner component (remounted via key on mode change) ─────────────────────

function UnitInputInner<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  unitMode,
  minFt = 1,
  maxFt = 500,
}: UnitInputProps<TFieldValues, TName>) {
  const labelId = useId()
  const errorId = useId()

  const {
    field,
    fieldState: { error },
  } = useController({ name, control })

  const currentFt = typeof field.value === 'number' && !isNaN(field.value) ? field.value : 0

  // Derive display state once on mount (or after remount on mode change)
  const [ftWhole, setFtWhole] = useState<string>(() => {
    if (unitMode !== 'ft-in') return ''
    return currentFt > 0 ? String(Math.floor(currentFt)) : ''
  })
  const [ftInches, setFtInches] = useState<string>(() => {
    if (unitMode !== 'ft-in') return ''
    const inches = Math.round((currentFt - Math.floor(currentFt)) * 12)
    return currentFt > 0 && inches > 0 ? String(inches) : ''
  })
  const [displayVal, setDisplayVal] = useState<string>(() => {
    if (unitMode === 'ft-decimal') return currentFt > 0 ? String(currentFt) : ''
    if (unitMode === 'm') return currentFt > 0 ? ftToM(currentFt) : ''
    return ''
  })

  // ── Commit helpers ──────────────────────────────────────────────────────

  function commitDecimal(raw: string) {
    const parsed = parseFloat(raw)
    field.onChange(isNaN(parsed) ? undefined : parsed)
  }

  function commitMetres(raw: string) {
    const parsed = parseFloat(raw)
    field.onChange(isNaN(parsed) ? undefined : mToFt(parsed))
  }

  function commitFtIn(whole: string, inches: string) {
    const w = parseFloat(whole) || 0
    const i = parseFloat(inches) || 0
    const totalFt = w + i / 12
    field.onChange(totalFt > 0 ? totalFt : undefined)
  }

  // ── Shared input class ──────────────────────────────────────────────────

  const inputClass =
    'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm ' +
    'focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 ' +
    (error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : '')

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div>
      <label id={labelId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        <span className="ml-1 text-xs font-normal text-gray-400">
          {unitMode === 'ft-decimal' && '(ft)'}
          {unitMode === 'ft-in' && '(ft + in)'}
          {unitMode === 'm' && '(m)'}
        </span>
      </label>

      {unitMode === 'ft-in' ? (
        <div className="flex gap-2" role="group" aria-labelledby={labelId}>
          <div className="flex-1">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={maxFt}
              step={1}
              placeholder="ft"
              value={ftWhole}
              aria-label={`${label} feet`}
              aria-describedby={error ? errorId : undefined}
              aria-invalid={!!error}
              className={inputClass}
              onChange={(e) => {
                setFtWhole(e.target.value)
                commitFtIn(e.target.value, ftInches)
              }}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          </div>
          <div className="w-20">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={11}
              step={1}
              placeholder="in"
              value={ftInches}
              aria-label={`${label} inches`}
              aria-describedby={error ? errorId : undefined}
              aria-invalid={!!error}
              className={inputClass}
              onChange={(e) => {
                setFtInches(e.target.value)
                commitFtIn(ftWhole, e.target.value)
              }}
              onBlur={field.onBlur}
            />
          </div>
        </div>
      ) : (
        <input
          type="number"
          inputMode="decimal"
          min={unitMode === 'm' ? (minFt * FT_TO_M).toFixed(3) : minFt}
          max={unitMode === 'm' ? (maxFt * FT_TO_M).toFixed(0) : maxFt}
          step={unitMode === 'm' ? 0.01 : 0.5}
          placeholder={unitMode === 'm' ? '3.66' : '12'}
          value={displayVal}
          aria-labelledby={labelId}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          className={inputClass}
          onChange={(e) => {
            setDisplayVal(e.target.value)
            if (unitMode === 'ft-decimal') commitDecimal(e.target.value)
            else commitMetres(e.target.value)
          }}
          onBlur={field.onBlur}
          ref={field.ref}
        />
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-600">
          {error.message}
        </p>
      )}
    </div>
  )
}

// ─── Public wrapper — applies key prop for remount on mode change ────────────

export function UnitInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: UnitInputProps<TFieldValues, TName>) {
  return <UnitInputInner key={props.unitMode} {...props} />
}
