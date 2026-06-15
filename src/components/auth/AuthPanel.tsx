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

  // ── Signed-in: avatar + dropdown ─────────────────────────────────
  if (user) {
    const initial = (user.email ?? '?')[0].toUpperCase()
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((o) => !o)}
          title={user.email}
          aria-label="Account menu"
          aria-expanded={open}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.5)',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '0.4rem',
            transition: 'background var(--llp-t-sm) var(--llp-ease)',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.30)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
        >
          {initial}
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 40,
              zIndex: 300,
              background: '#fff',
              border: '1.5px solid var(--llp-border)',
              borderRadius: 'var(--llp-r-md)',
              padding: '0.85rem 1rem',
              minWidth: 230,
              boxShadow: 'var(--llp-shadow-lg)',
              animation: 'llp-fadeInUp 150ms var(--llp-ease-spring) both',
            }}
          >
            <p
              style={{
                margin: '0 0 0.75rem',
                fontSize: '0.82rem',
                color: 'var(--llp-text-muted)',
                wordBreak: 'break-all',
              }}
            >
              {user.email}
            </p>
            <button
              onClick={async () => { await signOut(); setOpen(false) }}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--llp-r-sm)',
                border: '1.5px solid var(--llp-red-border)',
                background: '#fff',
                color: 'var(--llp-red)',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                transition: 'background var(--llp-t-sm) var(--llp-ease)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--llp-red-light)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Guest: sign-in button + dropdown ─────────────────────────────

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
    <div style={{ position: 'relative', marginLeft: '0.4rem' }}>
      <button
        onClick={() => { setOpen((o) => !o); setPanelState('idle') }}
        aria-expanded={open}
        style={{
          padding: '0.32rem 0.85rem',
          borderRadius: 'var(--llp-r-sm)',
          fontSize: '0.82rem',
          border: '1.5px solid rgba(255,255,255,0.5)',
          background: 'rgba(255,255,255,0.12)',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background var(--llp-t-sm) var(--llp-ease)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
      >
        Sign in
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 42,
            zIndex: 300,
            background: '#fff',
            border: '1.5px solid var(--llp-border)',
            borderRadius: 'var(--llp-r-md)',
            padding: '1rem',
            width: 270,
            boxShadow: 'var(--llp-shadow-lg)',
            animation: 'llp-fadeInUp 150ms var(--llp-ease-spring) both',
          }}
        >
          {panelState === 'sent' ? (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--llp-green-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                }}
                aria-hidden="true"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M2 6.5L11 12.5l9-6" stroke="var(--llp-green)" strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="2" y="4" width="18" height="14" rx="2" stroke="var(--llp-green)" strokeWidth="1.5"/>
                </svg>
              </div>
              <p style={{ margin: '0 0 0.35rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--llp-text)' }}>
                Check your inbox
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--llp-text-muted)' }}>
                Magic link sent to <strong>{email}</strong>.
              </p>
            </div>
          ) : (
            <>
              <p style={{ margin: '0 0 0.65rem', fontSize: '0.84rem', color: 'var(--llp-text)', fontWeight: 700 }}>
                Sign in to sync projects
              </p>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.78rem', color: 'var(--llp-text-muted)' }}>
                No password needed — we&apos;ll email you a magic link.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                aria-label="Email address"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  fontSize: '0.875rem',
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
                onBlur={(e)  => { e.target.style.borderColor = 'var(--llp-border)' }}
              />
              {panelState === 'error' && (
                <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: 'var(--llp-red)' }}>
                  {errorMsg}
                </p>
              )}
              <button
                onClick={handleSend}
                disabled={panelState === 'sending' || !email.trim()}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: 'var(--llp-r-sm)',
                  border: 'none',
                  background: email.trim() && panelState !== 'sending'
                    ? 'var(--llp-blue)'
                    : 'var(--llp-blue-light)',
                  color: email.trim() && panelState !== 'sending'
                    ? '#fff'
                    : 'var(--llp-text-muted)',
                  fontWeight: 700,
                  cursor: email.trim() && panelState !== 'sending' ? 'pointer' : 'default',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  transition: 'background var(--llp-t-sm) var(--llp-ease)',
                }}
              >
                {panelState === 'sending' ? 'Sending…' : 'Send magic link'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
