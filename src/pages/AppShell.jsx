import { NavLink, Navigate, Outlet, useNavigate } from 'react-router'
import { currentUser, logout } from '../api.js'

// Sidebar + routes come from this list. Building a module = add its page in main.jsx.
export const MODULES = [
  { path: 'overview', label: 'Overview', phase: 1 },
  { path: 'patients', label: 'Patients', phase: 2, blurb: 'Patient database: demographics, PhilHealth PIN, dialysis prescription, vascular access, lab history.' },
  { path: 'schedule', label: 'Scheduler', phase: 3, blurb: 'Chair and shift booking (MWF / TThS), recurring sessions, no-show tracking.' },
  { path: 'billing', label: 'POS & Billing', phase: 4, blurb: 'Per-session billing, PhilHealth deduction, out-of-pocket items, official receipts.' },
  { path: 'philhealth', label: 'PhilHealth Claims', phase: 4, blurb: 'Session counter against the 156/year cap, claim forms, claim status tracking.' },
  { path: 'inventory', label: 'Inventory', phase: 1 },
  { path: 'crm', label: 'CRM & Reminders', phase: 5, blurb: 'Patient follow-ups and automatic session reminders by email (Resend).' },
  { path: 'reports', label: 'Reports', phase: 5, blurb: 'Sessions, revenue, claims and stock usage over time.' },
]

export default function AppShell() {
  const navigate = useNavigate()
  const user = currentUser()
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="shell">
      <aside className="sidebar">
        <span className="logo"><span className="logo-mark" aria-hidden>W</span>WEI Renal</span>
        <nav>
          {MODULES.map((m) => (
            <NavLink key={m.path} to={m.path}>
              {m.label}
              {m.phase > 1 && <span className="soon">P{m.phase}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="me">
          <span>{user.name}</span>
          <button className="link" onClick={() => { logout(); navigate('/login') }}>Sign out</button>
        </div>
      </aside>
      <main className="content"><Outlet /></main>
    </div>
  )
}
