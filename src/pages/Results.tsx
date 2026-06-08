import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLLPStore } from '../store'
import { calculateProject } from '../lib/calculations'
import { saveProject as saveToSupabase } from '../lib/projects'
import { useAuth } from '../context/AuthContext'
import type { WasteFactor, ShoppingListEntry } from '../types'
import { WASTE_FACTOR_LABELS } from '../types'

const WASTE_OPTIONS: WasteFactor[] = [0.05, 0.10, 0.15]

// ─── Share URL helpers ───────────────────────────────────────────────────────

function encodeSharePayload(payload: unknown): string {
  try { return btoa(JSON.stringify(payload)) } catch { return '' }
}

function decodeSharePayload(token: string): unknown | null {
  try { return JSON.parse(atob(token)) } catch { return null }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ShoppingRow({ entry }: { entry: ShoppingListEntry }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.65rem 0',
      borderBottom: '1px solid #f0f0f0',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{
          display: 'inline-block',
          minWidth: 36,
          fontWeight: 700,
          fontSize: '1.1rem',
          color: '#1a1a1a',
        }}>
          {entry.quantity}×
        </span>
        <span style={{ fontSize: '0.975rem', color: '#222' }}>
          {entry.nominalSize} × {entry.length}ft
        </span>
      </div>
      <span style={{ fontSize: '0.82rem', color: '#888', whiteSpace: 'nowrap' }}>
        {entry.boardFeet.toFixed(1)} bd ft
      </span>
    </div>
  )
}

// ─── Save modal ───────────────────────────────────────────────────────────────

interface SaveModalProps {
  user: { email?: string } | null
  saveName: string
  saving: boolean
  saveError: string
  onNameChange: (v: string) => void
  onSave: () => void
  onClose: () => void
}

function SaveModal({ user, saveName, saving, saveError, onNameChange, onSave, onClose }: SaveModalProps) {
  const headingId = 'save-modal-heading'
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Trap focus and handle Escape
  useEffect(() => {
    firstInputRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        style={{
          background: '#fff', borderRadius: 14, padding: '1.75rem', width: '100%', maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={headingId} style={{ margin: '0 0 0.3rem', fontSize: '1.1rem' }}>Name this project</h2>
        <p style={{ margin: '0 0 0.85rem', fontSize: '0.8rem', color: '#888' }}>
          {user
            ? `Saving to your account (${user.email}).`
            : 'Saving locally on this device. Sign in to sync across devices.'}
        </p>
        <input
          ref={firstInputRef}
          placeholder='e.g. "Backyard deck 2026"'
          value={saveName}
          aria-label="Project name"
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          style={{
            width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.95rem',
            border: '1.5px solid #d1d5db', borderRadius: 8, outline: 'none',
            boxSizing: 'border-box', marginBottom: '0.6rem',
          }}
        />
        {saveError && (
          <p role="alert" style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#dc2626' }}>{saveError}</p>
        )}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={onSave}
            disabled={!saveName.trim() || saving}
            style={{
              flex: 1, padding: '0.65rem', borderRadius: 8, border: 'none',
              background: saveName.trim() && !saving ? '#2563eb' : '#c5d5f5',
              color: '#fff', fontWeight: 700, cursor: saveName.trim() && !saving ? 'pointer' : 'default',
              fontSize: '0.9rem',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '0.65rem', borderRadius: 8,
              border: '1.5px solid #d1d5db', background: '#fff',
              color: '#555', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Results() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { result, dimensionInputs, wasteFactor, setResult, setWasteFactor, setDimensionInputs, setProjectType, reset } = useLLPStore()

  const [copyFeedback, setCopyFeedback] = useState(false)
  const [saveModal, setSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // ── Restore from share URL ──────────────────────────────────────────────────
  useEffect(() => {
    const token = searchParams.get('s')
    if (!token) return
    const payload = decodeSharePayload(token) as {
      projectType?: string
      dimensions?: unknown
      wasteFactor?: number
    } | null
    if (!payload || !payload.dimensions || !payload.projectType) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dims = payload.dimensions as any
      const wf = (payload.wasteFactor ?? 0.10) as WasteFactor
      setProjectType(dims.projectType)
      setDimensionInputs(dims)
      setWasteFactor(wf)
      setResult(calculateProject(dims, wf))
    } catch {
      // malformed token — ignore
    }
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Guard — nothing to show
  if (!result || !dimensionInputs) {
    navigate('/', { replace: true })
    return null
  }

  // ── Live waste recalculation ─────────────────────────────────────────────────
  function handleWasteChange(wf: WasteFactor) {
    setWasteFactor(wf)
    const newResult = calculateProject(dimensionInputs!, wf)
    setResult(newResult)
  }

  // ── Share ────────────────────────────────────────────────────────────────────
  function handleShare() {
    const payload = encodeSharePayload({
      projectType: result!.projectType,
      dimensions: dimensionInputs,
      wasteFactor,
    })
    const url = `${window.location.origin}/results?s=${payload}`
    navigator.clipboard.writeText(url).then(() => {
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
    })
  }

  // ── Save ──────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!saveName.trim()) return
    setSaving(true)
    setSaveError('')

    if (user) {
      const saved = await saveToSupabase(saveName.trim(), result!, user.id)
      setSaving(false)
      if (!saved) {
        setSaveError('Could not save to your account. Try again.')
        return
      }
    } else {
      const existing = JSON.parse(localStorage.getItem('llp_saved') ?? '[]')
      existing.unshift({
        id: crypto.randomUUID(),
        name: saveName.trim(),
        result,
        purchasedItems: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      localStorage.setItem('llp_saved', JSON.stringify(existing))
      setSaving(false)
    }

    setSaveModal(false)
    setSaveName('')
  }

  const totalBoards = useMemo(
    () => result.shoppingList.reduce((s, e) => s + e.quantity, 0),
    [result]
  )

  const projectLabel = result.projectType
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <main
      aria-labelledby="results-heading"
      style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}
    >
      {/* Header */}
      <header style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/configure')}
          aria-label="Back to configure"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '0.875rem', padding: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          ← Back to configure
        </button>
        <h1 id="results-heading" style={{ margin: '0 0 0.2rem', fontSize: '1.6rem', fontWeight: 700 }}>{projectLabel}</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
          Generated {new Date(result.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </header>

      {/* Waste factor toggle */}
      <section aria-label="Waste factor" style={{
        background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 8,
        padding: '0.85rem 1rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
      }}>
        <span id="waste-label" style={{ fontSize: '0.85rem', color: '#444', fontWeight: 600, whiteSpace: 'nowrap' }}>Waste:</span>
        <div role="group" aria-labelledby="waste-label" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {WASTE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleWasteChange(opt)}
              aria-pressed={wasteFactor === opt}
              style={{
                padding: '0.3rem 0.75rem', borderRadius: 999, fontSize: '0.82rem', fontWeight: 600,
                cursor: 'pointer',
                border: wasteFactor === opt ? '2px solid #2563eb' : '2px solid #d1d5db',
                background: wasteFactor === opt ? '#eff6ff' : '#fff',
                color: wasteFactor === opt ? '#1d4ed8' : '#555',
                transition: 'all 0.12s',
              }}
            >
              {WASTE_FACTOR_LABELS[opt]}
            </button>
          ))}
        </div>
      </section>

      {/* Summary bar */}
      <section aria-label="Project summary" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { label: 'Total pieces', value: `${totalBoards}` },
          { label: 'Board feet', value: result.totalBoardFeet.toFixed(0) },
          { label: 'Est. cost', value: `$${result.estimatedCostMin}–$${result.estimatedCostMax}` },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
            padding: '0.85rem 1rem', textAlign: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1a1a1a' }} aria-label={`${label}: ${value}`}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.15rem' }} aria-hidden="true">{label}</div>
          </div>
        ))}
      </section>

      {/* Shopping list */}
      <section aria-labelledby="shopping-list-heading" style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
        padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <h2 id="shopping-list-heading" style={{ margin: '0 0 0.1rem', fontSize: '1rem', fontWeight: 700 }}>Shopping list</h2>
        <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#888' }}>
          Take this list to the register — quantities already include your waste factor.
        </p>
        {result.shoppingList.map((entry, i) => (
          <ShoppingRow key={i} entry={entry} />
        ))}
      </section>

      {/* Notes */}
      <aside style={{
        background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
        padding: '0.9rem 1.1rem', marginBottom: '1.5rem', fontSize: '0.84rem', color: '#78350f',
      }}>
        <strong>Remember:</strong> Lumber dimensions are nominal. A 2×4 is actually 1½&quot; × 3½&quot; — your cuts will be based on actual dimensions. Ask an associate for pressure-treated lumber if this is a ground-contact or outdoor project.
      </aside>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleShare}
          aria-label={copyFeedback ? 'Share link copied to clipboard' : 'Copy share link to clipboard'}
          aria-live="polite"
          style={{
            flex: 1, minWidth: 140, padding: '0.7rem 1.2rem', borderRadius: 8,
            border: '2px solid #2563eb', background: copyFeedback ? '#2563eb' : '#fff',
            color: copyFeedback ? '#fff' : '#2563eb', fontWeight: 600, cursor: 'pointer',
            fontSize: '0.9rem', transition: 'all 0.15s',
          }}
        >
          {copyFeedback ? '✓ Link copied!' : '🔗 Share list'}
        </button>

        <button
          onClick={() => { setSaveModal(true); setSaveError('') }}
          style={{
            flex: 1, minWidth: 140, padding: '0.7rem 1.2rem', borderRadius: 8,
            border: '2px solid #059669', background: '#fff',
            color: '#059669', fontWeight: 600, cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          💾 Save project
        </button>

        <button
          onClick={() => { reset(); navigate('/') }}
          style={{
            flex: 1, minWidth: 140, padding: '0.7rem 1.2rem', borderRadius: 8,
            border: '2px solid #d1d5db', background: '#fff',
            color: '#555', fontWeight: 600, cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          ↺ Start over
        </button>
      </div>

      {/* Save modal */}
      {saveModal && (
        <SaveModal
          user={user}
          saveName={saveName}
          saving={saving}
          saveError={saveError}
          onNameChange={setSaveName}
          onSave={handleSave}
          onClose={() => setSaveModal(false)}
        />
      )}
    </main>
  )
}
