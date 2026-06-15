import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLLPStore } from '../store'
import { calculateProject } from '../lib/calculations'
import { saveProject as saveToSupabase } from '../lib/projects'
import { useAuth } from '../context/AuthContext'
import type { WasteFactor, ShoppingListEntry } from '../types'
import { WASTE_FACTOR_LABELS } from '../types'

const WASTE_OPTIONS: WasteFactor[] = [0.05, 0.10, 0.15]

// ─── Share URL helpers ──────────────────────────────────────────────────────

function encodeSharePayload(payload: unknown): string {
  try { return btoa(JSON.stringify(payload)) } catch { return '' }
}

function decodeSharePayload(token: string): unknown | null {
  try { return JSON.parse(atob(token)) } catch { return null }
}

// ─── Shopping row ───────────────────────────────────────────────────────────

function ShoppingRow({ entry }: { entry: ShoppingListEntry }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.7rem 0',
        borderBottom: '1px solid var(--llp-border-light)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span
          style={{
            display: 'inline-block',
            minWidth: 36,
            fontWeight: 800,
            fontSize: '1.1rem',
            color: 'var(--llp-blue)',
          }}
        >
          {entry.quantity}×
        </span>
        <span style={{ fontSize: '0.975rem', color: 'var(--llp-text)', fontWeight: 500 }}>
          {entry.nominalSize} × {entry.length}ft
        </span>
      </div>
      <span style={{ fontSize: '0.82rem', color: 'var(--llp-text-muted)', whiteSpace: 'nowrap' }}>
        {entry.boardFeet.toFixed(1)} bd ft
      </span>
    </div>
  )
}

// ─── Save modal ─────────────────────────────────────────────────────────────

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
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        animation: 'llp-fadeIn 150ms ease both',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        style={{
          background: '#fff',
          borderRadius: 'var(--llp-r-lg)',
          padding: '1.75rem',
          width: '100%',
          maxWidth: 420,
          boxShadow: 'var(--llp-shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={headingId} style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 700 }}>
          Name this project
        </h2>
        <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--llp-text-muted)' }}>
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
            width: '100%',
            padding: '0.65rem 0.9rem',
            fontSize: '0.95rem',
            border: '1.5px solid var(--llp-border)',
            borderRadius: 'var(--llp-r-sm)',
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: '0.5rem',
            fontFamily: 'inherit',
            color: 'var(--llp-text)',
            transition: 'border-color var(--llp-t-sm) var(--llp-ease)',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--llp-blue)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--llp-border)' }}
        />
        {saveError && (
          <p role="alert" style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--llp-red)' }}>
            {saveError}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={onSave}
            disabled={!saveName.trim() || saving}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: 'var(--llp-r-sm)',
              border: 'none',
              background: saveName.trim() && !saving ? 'var(--llp-blue)' : 'var(--llp-blue-light)',
              color: saveName.trim() && !saving ? '#fff' : 'var(--llp-text-muted)',
              fontWeight: 700,
              cursor: saveName.trim() && !saving ? 'pointer' : 'default',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              transition: 'background var(--llp-t-sm) var(--llp-ease)',
            }}
          >
            {saving ? 'Saving…' : 'Save project'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: 'var(--llp-r-sm)',
              border: '1.5px solid var(--llp-border)',
              background: '#fff',
              color: 'var(--llp-text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function Results() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const {
    result, dimensionInputs, wasteFactor,
    setResult, setWasteFactor, setDimensionInputs, setProjectType, reset,
  } = useLLPStore()

  const [copyFeedback, setCopyFeedback] = useState(false)
  const [saveModal, setSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // ── Restore from share URL ──────────────────────────────────────
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

  // Must be before early return — Rules of Hooks
  const totalBoards = useMemo(
    () => result?.shoppingList.reduce((s, e) => s + e.quantity, 0) ?? 0,
    [result]
  )

  if (!result || !dimensionInputs) {
    navigate('/', { replace: true })
    return null
  }

  function handleWasteChange(wf: WasteFactor) {
    setWasteFactor(wf)
    const newResult = calculateProject(dimensionInputs!, wf)
    setResult(newResult)
  }

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

  const projectLabel = result.projectType
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  // ─────────────────────────────────────────────────────────────────

  return (
    <main
      aria-labelledby="results-heading"
      className="llp-page-enter"
      style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.25rem 3rem' }}
    >
      {/* ── Header ── */}
      <header style={{ marginBottom: '1.75rem' }}>
        <button
          onClick={() => navigate('/configure')}
          aria-label="Back to configure"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--llp-text-muted)',
            fontSize: '0.875rem',
            padding: '0 0 1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            transition: 'color var(--llp-t-sm) var(--llp-ease)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--llp-blue)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--llp-text-muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to configure
        </button>

        <h1
          id="results-heading"
          style={{
            margin: '0 0 0.2rem',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--llp-text)',
            letterSpacing: '-0.02em',
          }}
        >
          {projectLabel}
        </h1>
        <p style={{ margin: 0, color: 'var(--llp-text-muted)', fontSize: '0.875rem' }}>
          Generated{' '}
          {new Date(result.generatedAt).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          })}
        </p>
      </header>

      {/* ── Waste factor toggle ── */}
      <section
        aria-label="Waste factor"
        style={{
          background: 'var(--llp-surface)',
          border: '1.5px solid var(--llp-border)',
          borderRadius: 'var(--llp-r-md)',
          padding: '0.85rem 1.1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <span
          id="waste-label"
          style={{ fontSize: '0.84rem', color: 'var(--llp-text)', fontWeight: 700, whiteSpace: 'nowrap' }}
        >
          Waste factor:
        </span>
        <div role="group" aria-labelledby="waste-label" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {WASTE_OPTIONS.map((opt) => {
            const active = wasteFactor === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleWasteChange(opt)}
                aria-pressed={active}
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: 'var(--llp-r-pill)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: active ? '2px solid var(--llp-blue)' : '2px solid var(--llp-border)',
                  background: active ? 'var(--llp-blue)' : '#fff',
                  color: active ? '#fff' : 'var(--llp-text-muted)',
                  transition: 'all var(--llp-t-sm) var(--llp-ease)',
                  fontFamily: 'inherit',
                }}
              >
                {WASTE_FACTOR_LABELS[opt]}
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Summary stats ── */}
      <section
        aria-label="Project summary"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        {[
          { label: 'Total pieces', value: `${totalBoards}` },
          { label: 'Board feet',   value: result.totalBoardFeet.toFixed(0) },
          { label: 'Est. cost',    value: `$${result.estimatedCostMin}–$${result.estimatedCostMax}` },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: 'var(--llp-surface)',
              border: '1.5px solid var(--llp-border)',
              borderTop: '3px solid var(--llp-blue)',
              borderRadius: 'var(--llp-r-md)',
              padding: '1rem',
              textAlign: 'center',
              boxShadow: 'var(--llp-shadow-xs)',
            }}
          >
            <div
              style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--llp-text)', lineHeight: 1.1 }}
              aria-label={`${label}: ${value}`}
            >
              {value}
            </div>
            <div
              style={{ fontSize: '0.74rem', color: 'var(--llp-text-muted)', marginTop: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}
              aria-hidden="true"
            >
              {label}
            </div>
          </div>
        ))}
      </section>

      {/* ── Shopping list ── */}
      <section
        aria-labelledby="shopping-list-heading"
        style={{
          background: 'var(--llp-surface)',
          border: '1.5px solid var(--llp-border)',
          borderRadius: 'var(--llp-r-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.1rem',
          boxShadow: 'var(--llp-shadow-sm)',
        }}
      >
        <h2
          id="shopping-list-heading"
          style={{
            margin: '0 0 0.1rem',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--llp-text)',
          }}
        >
          Shopping list
        </h2>
        <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: 'var(--llp-text-muted)' }}>
          Quantities already include your waste factor — take this to the register.
        </p>
        {result.shoppingList.map((entry, i) => (
          <ShoppingRow key={i} entry={entry} />
        ))}
      </section>

      {/* ── Tip callout ── */}
      <aside
        style={{
          background: 'var(--llp-orange-light)',
          border: '1px solid var(--llp-orange-border)',
          borderLeft: '4px solid var(--llp-orange)',
          borderRadius: 'var(--llp-r-md)',
          padding: '0.9rem 1.1rem',
          marginBottom: '1.75rem',
          fontSize: '0.84rem',
          color: 'var(--llp-text)',
        }}
      >
        <strong style={{ color: 'var(--llp-orange)' }}>Heads up:</strong>{' '}
        Lumber dimensions are nominal. A 2×4 is actually 1½″ × 3½″ — cuts use actual dimensions.
        Ask an associate for pressure-treated if this is an outdoor or ground-contact project.
      </aside>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Share */}
        <button
          onClick={handleShare}
          aria-label={copyFeedback ? 'Share link copied to clipboard' : 'Copy share link to clipboard'}
          aria-live="polite"
          style={{
            flex: 1,
            minWidth: 140,
            padding: '0.75rem 1.2rem',
            borderRadius: 'var(--llp-r-sm)',
            border: '2px solid var(--llp-blue)',
            background: copyFeedback ? 'var(--llp-blue)' : '#fff',
            color: copyFeedback ? '#fff' : 'var(--llp-blue)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            transition: 'all var(--llp-t-sm) var(--llp-ease)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M9 2.5A2.5 2.5 0 1 1 12.5 6a2.5 2.5 0 0 1 0-5zm0 0L5.5 4.75M9 12.5A2.5 2.5 0 1 1 12.5 9a2.5 2.5 0 0 1 0 5zm0 0L5.5 10.25M3 7.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          {copyFeedback ? 'Link copied!' : 'Share list'}
        </button>

        {/* Save */}
        <button
          onClick={() => { setSaveModal(true); setSaveError('') }}
          style={{
            flex: 1,
            minWidth: 140,
            padding: '0.75rem 1.2rem',
            borderRadius: 'var(--llp-r-sm)',
            border: '2px solid var(--llp-green)',
            background: '#fff',
            color: 'var(--llp-green)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 3a1 1 0 0 1 1-1h6l3 3v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3zm4 7.5v-3m0 0h2m-2 0H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Save project
        </button>

        {/* Start over */}
        <button
          onClick={() => { reset(); navigate('/') }}
          style={{
            flex: 1,
            minWidth: 140,
            padding: '0.75rem 1.2rem',
            borderRadius: 'var(--llp-r-sm)',
            border: '2px solid var(--llp-border)',
            background: '#fff',
            color: 'var(--llp-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7A5 5 0 0 1 12 7M2 7l2.5-2.5M2 7l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          New plan
        </button>
      </div>

      {/* ── Save modal ── */}
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
