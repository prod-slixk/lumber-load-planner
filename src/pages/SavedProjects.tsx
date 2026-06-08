import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLLPStore } from '../store'
import { useAuth } from '../context/AuthContext'
import {
  loadProjects,
  updatePurchasedItems as syncPurchased,
  deleteProject as deleteFromSupabase,
} from '../lib/projects'
import type { SavedProject } from '../types'

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadLocal(): SavedProject[] {
  try { return JSON.parse(localStorage.getItem('llp_saved') ?? '[]') } catch { return [] }
}

function persistLocal(projects: SavedProject[]) {
  localStorage.setItem('llp_saved', JSON.stringify(projects))
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

interface DeleteDialogProps {
  projectName: string
  isCloud: boolean
  onConfirm: () => void
  onCancel: () => void
}

function DeleteDialog({ projectName, isCloud, onConfirm, onCancel }: DeleteDialogProps) {
  const headingId = 'delete-dialog-heading'
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirmBtnRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={headingId}
        style={{
          background: '#fff', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 360,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={headingId} style={{ margin: '0 0 0.5rem', fontSize: '1.05rem' }}>
          Delete &ldquo;{projectName}&rdquo;?
        </h2>
        <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1.2rem' }}>
          {isCloud
            ? 'This will remove it from your account on all devices.'
            : "This can't be undone. The project will be removed from this device."}
        </p>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            style={{
              flex: 1, padding: '0.65rem', borderRadius: 8, border: 'none',
              background: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.65rem', borderRadius: 8,
              border: '1.5px solid #d1d5db', background: '#fff',
              color: '#555', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SavedProjects() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setProjectType, setDimensionInputs, setWasteFactor, setResult } = useLLPStore()

  const [projects, setProjects] = useState<SavedProject[]>([])
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      if (user) {
        setLoading(true)
        const remote = await loadProjects()
        setProjects(remote)
        setLoading(false)
      } else {
        setProjects(loadLocal())
      }
    }
    load()
  }, [user])

  function handleOpen(project: SavedProject) {
    const dims = project.result.dimensions
    setProjectType(dims.projectType)
    setDimensionInputs(dims)
    setWasteFactor(project.result.wasteFactor)
    setResult(project.result)
    navigate('/results')
  }

  async function handleDelete(id: string) {
    if (user) {
      await deleteFromSupabase(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } else {
      const updated = projects.filter((p) => p.id !== id)
      setProjects(updated)
      persistLocal(updated)
    }
    setDeleteTarget(null)
  }

  async function togglePurchased(projectId: string, itemKey: string) {
    const updated = projects.map((p) => {
      if (p.id !== projectId) return p
      const has = p.purchasedItems.includes(itemKey)
      return {
        ...p,
        purchasedItems: has
          ? p.purchasedItems.filter((k) => k !== itemKey)
          : [...p.purchasedItems, itemKey],
        updatedAt: new Date().toISOString(),
      }
    })
    setProjects(updated)

    if (user) {
      const target = updated.find((p) => p.id === projectId)
      if (target) await syncPurchased(projectId, target.purchasedItems)
    } else {
      persistLocal(updated)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main style={{ maxWidth: 580, margin: '0 auto', padding: '4rem 1rem', textAlign: 'center', color: '#888' }}>
        <p>Loading projects…</p>
      </main>
    )
  }

  if (projects.length === 0) {
    return (
      <main style={{ maxWidth: 580, margin: '0 auto', padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">📋</div>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 700 }}>No saved projects yet</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Run a calculation and hit &quot;Save project&quot; to build your library.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.7rem 1.4rem', borderRadius: 8, border: 'none',
            background: '#2563eb', color: '#fff', fontWeight: 700,
            cursor: 'pointer', fontSize: '0.95rem',
          }}
        >
          Start a project →
        </button>
      </main>
    )
  }

  return (
    <main
      aria-labelledby="saved-heading"
      style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}
    >
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 id="saved-heading" style={{ margin: '0 0 0.3rem', fontSize: '1.6rem', fontWeight: 700 }}>
          Saved projects
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
          {projects.length} {projects.length === 1 ? 'project' : 'projects'}{' '}
          {user ? 'synced to your account.' : 'stored locally on this device.'}
        </p>
      </header>

      <ol style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0, margin: 0 }}>
        {projects.map((project) => {
          const totalBoards = project.result.shoppingList.reduce((s, e) => s + e.quantity, 0)
          const purchasedCount = project.purchasedItems.length
          const totalItems = project.result.shoppingList.length
          const projectLabel = project.result.projectType
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())

          return (
            <li
              key={project.id}
              style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                padding: '1.25rem 1.5rem',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              }}
            >
              {/* Project header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.15rem', fontSize: '1rem', fontWeight: 700 }}>{project.name}</h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>
                    {projectLabel} · {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpen(project)}
                    aria-label={`View ${project.name}`}
                    style={{
                      padding: '0.35rem 0.75rem', borderRadius: 6, fontSize: '0.8rem',
                      border: '1.5px solid #2563eb', background: '#eff6ff',
                      color: '#2563eb', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: project.id, name: project.name })}
                    aria-label={`Delete ${project.name}`}
                    style={{
                      padding: '0.35rem 0.75rem', borderRadius: 6, fontSize: '0.8rem',
                      border: '1.5px solid #fca5a5', background: '#fff',
                      color: '#dc2626', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '0.85rem', fontSize: '0.82rem', color: '#555' }}>
                <span><strong style={{ color: '#1a1a1a' }}>{totalBoards}</strong> pieces</span>
                <span><strong style={{ color: '#1a1a1a' }}>{project.result.totalBoardFeet.toFixed(0)}</strong> bd ft</span>
                <span><strong style={{ color: '#1a1a1a' }}>${project.result.estimatedCostMin}–${project.result.estimatedCostMax}</strong></span>
                {purchasedCount > 0 && (
                  <span style={{ color: '#059669', fontWeight: 600 }}>
                    {purchasedCount}/{totalItems} purchased
                  </span>
                )}
              </div>

              {/* Shopping list with purchased toggles */}
              <ul
                style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.6rem', listStyle: 'none', padding: '0.6rem 0 0', margin: 0 }}
                aria-label={`Shopping list for ${project.name}`}
              >
                {project.result.shoppingList.map((entry, i) => {
                  const key = `${entry.nominalSize}-${entry.length}`
                  const purchased = project.purchasedItems.includes(key)
                  const itemLabel = `${entry.quantity} ${entry.nominalSize} × ${entry.length}ft`
                  return (
                    <li key={i} style={{ padding: '0.25rem 0' }}>
                      <button
                        type="button"
                        onClick={() => togglePurchased(project.id, key)}
                        aria-pressed={purchased}
                        aria-label={`${itemLabel} — ${purchased ? 'purchased, click to unmark' : 'click to mark as purchased'}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                          width: '100%', background: 'none', border: 'none',
                          padding: '0.2rem 0', cursor: 'pointer', textAlign: 'left',
                          opacity: purchased ? 0.45 : 1, transition: 'opacity 0.15s',
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: 18, height: 18, borderRadius: 4, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            border: `2px solid ${purchased ? '#059669' : '#d1d5db'}`,
                            background: purchased ? '#059669' : '#fff',
                            transition: 'all 0.12s',
                          }}
                        >
                          {purchased && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
                        </span>
                        <span style={{
                          fontSize: '0.86rem', color: '#333',
                          textDecoration: purchased ? 'line-through' : 'none',
                        }}>
                          <strong>{entry.quantity}×</strong> {entry.nominalSize} × {entry.length}ft
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ol>

      {deleteTarget && (
        <DeleteDialog
          projectName={deleteTarget.name}
          isCloud={!!user}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </main>
  )
}
