import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AuthPanel from './components/auth/AuthPanel'
import ProjectSelector from './pages/ProjectSelector'
import Configure from './pages/Configure'
import Results from './pages/Results'
import SavedProjects from './pages/SavedProjects'
import LumberGuide from './pages/LumberGuide'

// ── Lumber board SVG icon ──────────────────────────────────────────
function LumberIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect x="2" y="8" width="20" height="8" rx="2" fill="rgba(255,255,255,0.90)" />
      <rect x="2" y="8" width="20" height="8" rx="2" stroke="rgba(255,255,255,0.40)" strokeWidth="1" />
      <line x1="7"  y1="8" x2="7"  y2="16" stroke="rgba(0,73,144,0.35)" strokeWidth="0.8" />
      <line x1="12" y1="8" x2="12" y2="16" stroke="rgba(0,73,144,0.35)" strokeWidth="0.8" />
      <line x1="17" y1="8" x2="17" y2="16" stroke="rgba(0,73,144,0.35)" strokeWidth="0.8" />
    </svg>
  )
}

function Nav() {
  const { pathname } = useLocation()
  // Hide nav on configure/results — those pages have their own back buttons
  if (pathname === '/configure' || pathname === '/results') return null

  return (
    <nav aria-label="Main navigation" className="llp-nav">
      <NavLink to="/" className="llp-nav-logo">
        <LumberIcon />
        Lumber Load Planner
      </NavLink>

      <div className="llp-nav-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `llp-nav-link${isActive ? ' llp-nav-link-active' : ''}`
          }
        >
          Projects
        </NavLink>
        <NavLink
          to="/saved"
          className={({ isActive }) =>
            `llp-nav-link${isActive ? ' llp-nav-link-active' : ''}`
          }
        >
          Saved
        </NavLink>
        <NavLink
          to="/guide"
          className={({ isActive }) =>
            `llp-nav-link${isActive ? ' llp-nav-link-active' : ''}`
          }
        >
          Size Guide
        </NavLink>
        <AuthPanel />
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Nav />
      <Routes>
        <Route path="/"        element={<ProjectSelector />} />
        <Route path="/configure" element={<Configure />} />
        <Route path="/results"   element={<Results />} />
        <Route path="/saved"     element={<SavedProjects />} />
        <Route path="/guide"     element={<LumberGuide />} />
        {/* Catch-all: redirect unknown paths home */}
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
