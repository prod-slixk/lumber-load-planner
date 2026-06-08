import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

type PanelState = 'idle' | 'sending' | 'sent' | 'error'

export default function AuthPanel() {
  const { user, loading, signIn, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [panelState, setPanelState] = useState<PanelState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [open, setOpen] = useState(false)

  if (loading) return null

  // ── Signed-in avatar ──────────────────────────────────────────────────────
  if (user) {
    const initial = (user.email ?? '?')[0].toUpperCase()
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((o) => !o)}
          title={user.email}
          aria-label="Account menu"
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#2563eb', color: '#fff',
            border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {initial}
        </button>

        {open && (
          <div style={{
            position: 'absolute', right: 0, top: 40, zIndex: 200,
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
            padding: '0.75rem 1rem', minWidth: 220,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: '#555', wordBreak: 'break-all' }}>
              {user.email}
            </p>
            <button
              onClick={async () => { await signOut(); setOpen(false) }}
              style={{
                width: '100%', padding: '0.5rem', borderRadius: 6,
                border: '1.5px solid #fca5a5', background: '#fff',
                color: '#dc2626', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Guest — sign-in button + dropdown ─────────────────────────────────────
  async function handleSend() {
    if (!email.trim()) return
    setPanelState('sending')
    const err = await signIn(email.trim())
    if (err) {
      setErrorMsg(err)
      setPanelState('error')
    } else {
      setPanelState('sent')
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen((o) => !o); setPanelState('idle') }}
        style={{
          padding: '0.3rem 0.75rem', borderRadius: 6, fontSize: '0.82rem',
          border: '1.5px solid #d1d5db', background: '#fff',
          color: '#333', fontWeight: 600, cursor: 'pointer',
        }}
      >
        Sign in
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 40, zIndex: 200,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
          padding: '1rem', width: 260,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }}>
          {panelState === 'sent' ? (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>📬</div>
              <p style={{ margin: '0 0 0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>Check your inbox</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                We sent a magic link to <strong>{email}</strong>. Click it to sign in.
              </p>
            </div>
          ) : (
            <>
              <p style={{ margin: '0 0 0.65rem', fontSize: '0.82rem', color: '#444', fontWeight: 600 }}>
                Sign in to save projects across devices
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  width: '100%', padding: '0.5rem 0.7rem', fontSize: '0.875rem',
                  border: '1.5px solid #d1d5db', borderRadius: 6, outline: 'none',
                  boxSizing: 'border-box', marginBottom: '0.5rem',
                }}
              />
              {panelState === 'error' && (
                <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: '#dc2626' }}>{errorMsg}</p>
              )}
              <button
                onClick={handleSend}
                disabled={panelState === 'sending' || !email.trim()}
                style={{
                  width: '100%', padding: '0.5rem', borderRadius: 6, border: 'none',
                  background: email.trim() ? '#2563eb' : '#c5d5f5',
                  color: '#fff', fontWeight: 700, cursor: email.trim() ? 'pointer' : 'default',
                  fontSize: '0.875rem',
                }}
              >
                {panelState === 'sending' ? 'Sending…' : 'Send magic link'}
              </button>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.74rem', color: '#999', textAlign: 'center' }}>
                No password needed. Guest mode works without signing in.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
