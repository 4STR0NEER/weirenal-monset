import { NavLink, Navigate, Outlet, useNavigate } from 'react-router'
import { currentUser, logout } from '../api.js'

// Sidebar + routes come from this list. Building a module = add its page in main.jsx
// and drop its blurb (only unbuilt modules have one).
export const MODULES = [
  { path: 'overview', label: 'Overview', phase: 1 },
  { path: 'patients', label: 'Patients', phase: 2 },
  { path: 'schedule', label: 'Scheduler', phase: 3 },
  { path: 'billing', label: 'POS & Billing', phase: 4 },
  { path: 'philhealth', label: 'PhilHealth Claims', phase: 4 },
  { path: 'inventory', label: 'Inventory', phase: 1 },
  { path: 'crm', label: 'CRM & Reminders', phase: 5 },
  { path: 'reports', label: 'Reports & Exports', phase: 5 },
  { path: 'payroll', label: 'Payroll', phase: 6, blurb: 'Staff records, shifts worked, pay computation with SSS, PhilHealth, Pag-IBIG and withholding tax, payslips.' },
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
              {m.blurb && <span className="soon">P{m.phase}</span>}
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
