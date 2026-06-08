import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AuthPanel from './components/auth/AuthPanel'
import ProjectSelector from './pages/ProjectSelector'
import Configure from './pages/Configure'
import Results from './pages/Results'
import SavedProjects from './pages/SavedProjects'
import LumberGuide from './pages/LumberGuide'

function Nav() {
  const { pathname } = useLocation()
  // Hide nav on configure/results — those pages have their own back buttons
  if (pathname === '/configure' || pathname === '/results') return null

  const linkStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.4rem 0.85rem',
    borderRadius: 6,
    fontSize: '0.875rem',
    fontWeight: 600,
    textDecoration: 'none',
    color: active ? '#2563eb' : '#555',
    background: active ? '#eff6ff' : 'transparent',
    transition: 'all 0.12s',
  })

  return (
    <nav
      aria-label="Main navigation"
      style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '0.6rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
      }}
    >
      <NavLink to="/" style={{ textDecoration: 'none' }}>
        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1a1a1a', letterSpacing: '-0.01em' }}>
          🪵 Lumber Load Planner
        </span>
      </NavLink>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <NavLink to="/" end style={({ isActive }) => linkStyle(isActive)}>Projects</NavLink>
        <NavLink to="/saved" style={({ isActive }) => linkStyle(isActive)}>Saved</NavLink>
        <NavLink to="/guide" style={({ isActive }) => linkStyle(isActive)}>Size Guide</NavLink>
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
        <Route path="/" element={<ProjectSelector />} />
        <Route path="/configure" element={<Configure />} />
        <Route path="/results" element={<Results />} />
        <Route path="/saved" element={<SavedProjects />} />
        <Route path="/guide" element={<LumberGuide />} />
        {/* Catch-all: redirect unknown paths home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
