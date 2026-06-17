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
import { ProjectThumbnail } from '../components/ProjectThumbnail'

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
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        animation: 'llp-fadeIn 150ms ease both',
      }}
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={headingId}
        style={{
          background: '#fff',
          borderRadius: 'var(--llp-r-lg)',
          padding: '1.5rem',
          width: '100%',
          maxWidth: 380,
          boxShadow: 'var(--llp-shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={headingId} style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--llp-text)' }}>
          Delete &ldquo;{projectName}&rdquo;?
        </h2>
        <p style={{ color: 'var(--llp-text-muted)', fontSize: '0.9rem', margin: '0 0 1.25rem' }}>
          {isCloud
            ? 'This will remove it from your account on all devices.'
            : "This can't be undone. The project will be removed from this device."}
        </p>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: 'var(--llp-r-sm)',
              border: 'none',
              background: 'var(--llp-red)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              transition: 'background var(--llp-t-sm) var(--llp-ease)',
            }}
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: 'var(--llp-r-sm)',
              border: '1.5px solid var(--llp-border)',
              background: '#fff',
              color: 'var(--llp-text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
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

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main
        style={{
          maxWidth: 620,
          margin: '0 auto',
          padding: '5rem 1.25rem',
          textAlign: 'center',
          color: 'var(--llp-text-muted)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid var(--llp-blue-light)',
            borderTopColor: 'var(--llp-blue)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem',
          }}
          aria-hidden="true"
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>Loading projects…</p>
      </main>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────

  if (projects.length === 0) {
    return (
      <main
        style={{
          maxWidth: 620,
          margin: '0 auto',
          padding: '5rem 1.25rem',
          textAlign: 'center',
        }}
        className="llp-page-enter"
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--llp-blue-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
          aria-hidden="true"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="8" width="24" height="20" rx="2" stroke="var(--llp-blue)" strokeWidth="2"/>
            <path d="M10 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke="var(--llp-blue)" strokeWidth="2"/>
            <path d="M10 16h12M10 21h8" stroke="var(--llp-blue)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 800, color: 'var(--llp-text)' }}>
          No saved projects yet
        </h1>
        <p style={{ color: 'var(--llp-text-muted)', marginBottom: '2rem', maxWidth: 320, margin: '0 auto 2rem' }}>
          Run a calculation and hit &ldquo;Save project&rdquo; to build your library.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 1.75rem',
            borderRadius: 'var(--llp-r-sm)',
            border: 'none',
            background: 'var(--llp-blue)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            transition: 'background var(--llp-t-sm) var(--llp-ease)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--llp-blue-dark)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--llp-blue)' }}
        >
          Start a project
        </button>
      </main>
    )
  }

  // ── Projects list ──────────────────────────────────────────────────────────

  return (
    <main
      aria-labelledby="saved-heading"
      className="llp-page-enter"
      style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.25rem 3rem' }}
    >
      <header style={{ marginBottom: '1.75rem' }}>
        <h1
          id="saved-heading"
          style={{
            margin: '0 0 0.3rem',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--llp-text)',
            letterSpacing: '-0.02em',
          }}
        >
          Saved projects
        </h1>
        <p style={{ margin: 0, color: 'var(--llp-text-muted)', fontSize: '0.9rem' }}>
          {projects.length} {projects.length === 1 ? 'project' : 'projects'}{' '}
          {user ? 'synced to your account.' : 'stored locally on this device.'}
        </p>
      </header>

      <ol style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0, margin: 0 }}>
        {projects.map((project) => {
          const totalBoards = project.result.shoppingList.reduce((s, e) => s + e.quantity, 0)
          const purchasedCount = project.purchasedItems.length
          const totalItems = project.result.shoppingList.length
          const allPurchased = purchasedCount === totalItems && totalItems > 0
          const projectLabel = project.result.projectType
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())

          return (
            <li
              key={project.id}
              style={{
                background: 'var(--llp-surface)',
                border: '1.5px solid var(--llp-border)',
                borderRadius: 'var(--llp-r-lg)',
                padding: '1.25rem 1.5rem',
                boxShadow: 'var(--llp-shadow-sm)',
              }}
            >
              {/* Project header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                  gap: '0.9rem',
                }}
              >
                {/* SVG thumbnail */}
                <div
                  aria-hidden="true"
                  style={{
                    width: 120,
                    height: 75,
                    flexShrink: 0,
                    borderRadius: 'var(--llp-r-sm)',
                    overflow: 'hidden',
                    border: '1px solid var(--llp-border)',
                    background: '#F8FAFC',
                  }}
                >
                  <ProjectThumbnail dims={project.result.dimensions} />
                </div>

                {/* Name + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2
                    style={{
                      margin: '0 0 0.15rem',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--llp-text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {project.name}
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--llp-text-muted)' }}>
                    {projectLabel} ·{' '}
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button
                    onClick={() => handleOpen(project)}
                    aria-label={`View ${project.name}`}
                    style={{
                      padding: '0.38rem 0.85rem',
                      borderRadius: 'var(--llp-r-sm)',
                      fontSize: '0.8rem',
                      border: '1.5px solid var(--llp-blue)',
                      background: 'var(--llp-blue)',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background var(--llp-t-sm) var(--llp-ease)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--llp-blue-dark)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--llp-blue)' }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: project.id, name: project.name })}
                    aria-label={`Delete ${project.name}`}
                    style={{
                      padding: '0.38rem 0.85rem',
                      borderRadius: 'var(--llp-r-sm)',
                      fontSize: '0.8rem',
                      border: '1.5px solid var(--llp-border)',
                      background: '#fff',
                      color: 'var(--llp-text-muted)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'border-color var(--llp-t-sm) var(--llp-ease), color var(--llp-t-sm) var(--llp-ease)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--llp-red)'
                      e.currentTarget.style.color = 'var(--llp-red)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--llp-border)'
                      e.currentTarget.style.color = 'var(--llp-text-muted)'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  marginBottom: '0.9rem',
                  fontSize: '0.82rem',
                  color: 'var(--llp-text-muted)',
                  flexWrap: 'wrap',
                }}
              >
                <span>
                  <strong style={{ color: 'var(--llp-text)', fontWeight: 700 }}>{totalBoards}</strong> pieces
                </span>
                <span>
                  <strong style={{ color: 'var(--llp-text)', fontWeight: 700 }}>
                    {project.result.totalBoardFeet.toFixed(0)}
                  </strong>{' '}
                  bd ft
                </span>
                <span>
                  <strong style={{ color: 'var(--llp-text)', fontWeight: 700 }}>
                    ${project.result.estimatedCostMin}–${project.result.estimatedCostMax}
                  </strong>
                </span>
                {purchasedCount > 0 && (
                  <span style={{ color: allPurchased ? 'var(--llp-green)' : 'var(--llp-blue)', fontWeight: 700 }}>
                    {purchasedCount}/{totalItems} purchased
                    {allPurchased && ' ✓'}
                  </span>
                )}
              </div>

              {/* Shopping list with purchase checkboxes */}
              <ul
                style={{
                  borderTop: '1px solid var(--llp-border-light)',
                  paddingTop: '0.6rem',
                  listStyle: 'none',
                  padding: '0.6rem 0 0',
                  margin: 0,
                }}
                aria-label={`Shopping list for ${project.name}`}
              >
                {project.result.shoppingList.map((entry, i) => {
                  const key = `${entry.nominalSize}-${entry.length}`
                  const purchased = project.purchasedItems.includes(key)
                  const itemLabel = `${entry.quantity} ${entry.nominalSize} × ${entry.length}ft`
                  return (
                    <li key={i} style={{ padding: '0.22rem 0' }}>
                      <button
                        type="button"
                        onClick={() => togglePurchased(project.id, key)}
                        aria-pressed={purchased}
                        aria-label={`${itemLabel} — ${purchased ? 'purchased, click to unmark' : 'click to mark as purchased'}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          padding: '0.15rem 0',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'inherit',
                          opacity: purchased ? 0.45 : 1,
                          transition: 'opacity var(--llp-t-sm) var(--llp-ease)',
                        }}
                      >
                        {/* Custom checkbox */}
                        <span
                          aria-hidden="true"
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: `2px solid ${purchased ? 'var(--llp-green)' : 'var(--llp-border)'}`,
                            background: purchased ? 'var(--llp-green)' : '#fff',
                            transition: 'all var(--llp-t-sm) var(--llp-ease)',
                          }}
                        >
                          {purchased && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2.5 2.5 4-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </span>
                        <span
                          style={{
                            fontSize: '0.86rem',
                            color: 'var(--llp-text)',
                            textDecoration: purchased ? 'line-through' : 'none',
                          }}
                        >
                          <strong style={{ fontWeight: 700 }}>{entry.quantity}×</strong>{' '}
                          {entry.nominalSize} × {entry.length}ft
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
