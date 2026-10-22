import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import {
  LayoutDashboard, Users, CalendarDays, ReceiptText, FileCheck2, Package, Mail, ChartColumn, Wallet, LogOut,
} from 'lucide-react'
import { currentUser, logout } from '../api.js'
import Logo from '../components/Logo.jsx'

// Sidebar + routes come from this list. Building a module = add its page in main.jsx
// and drop its blurb (only unbuilt modules have one).
export const MODULES = [
  { path: 'overview', label: 'Overview', phase: 1, group: 'Care', icon: LayoutDashboard },
  { path: 'patients', label: 'Patients', phase: 2, group: 'Care', icon: Users },
  { path: 'schedule', label: 'Scheduler', phase: 3, group: 'Care', icon: CalendarDays },
  { path: 'billing', label: 'POS & Billing', phase: 4, group: 'Money', icon: ReceiptText },
  { path: 'philhealth', label: 'PhilHealth Claims', phase: 4, group: 'Money', icon: FileCheck2 },
  { path: 'reports', label: 'Reports & Exports', phase: 5, group: 'Money', icon: ChartColumn },
  { path: 'inventory', label: 'Inventory', phase: 1, group: 'Operations', icon: Package },
  { path: 'crm', label: 'CRM & Reminders', phase: 5, group: 'Operations', icon: Mail },
  { path: 'payroll', label: 'Payroll', phase: 6, group: 'Operations', icon: Wallet, blurb: 'Staff records, shifts worked, pay computation with SSS, PhilHealth, Pag-IBIG and withholding tax, payslips.' },
]

const GROUPS = [...new Set(MODULES.map((m) => m.group))]

export default function AppShell() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = currentUser()
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="shell">
      <aside className="sidebar">
        <span className="logo"><Logo /></span>
        {GROUPS.map((g) => (
          <nav key={g} className="nav-group" aria-label={g}>
            <span>{g}</span>
            {MODULES.filter((m) => m.group === g).map(({ path, label, icon: Icon, blurb, phase }) => (
              <NavLink key={path} to={path}>
                <Icon aria-hidden />
                {label}
                {blurb && <span className="soon">Soon</span>}
                {blurb && <span className="sr-only">(phase {phase})</span>}
              </NavLink>
            ))}
          </nav>
        ))}
        <div className="me">
          <span className="avatar" aria-hidden>{user.name.slice(0, 2)}</span>
          <span>{user.name}</span>
          <button className="btn ghost icon" aria-label="Sign out" onClick={() => { logout(); navigate('/login') }}>
            <LogOut aria-hidden />
          </button>
        </div>
      </aside>
      <main className="content">
        {/* keyed so each page gets one short entrance; same-page updates don't replay it */}
        <div className="page" key={pathname.split('/').slice(0, 3).join('/')}><Outlet /></div>
      </main>
    </div>
  )
}
