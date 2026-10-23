import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ShieldCheck, HeartPulse, ReceiptText, Stethoscope } from 'lucide-react'
import { login } from '../api.js'
import Logo from '../components/Logo.jsx'

// Demo only: one click per role, landing on the screen that role lives in.
const DEMO = [
  { role: 'admin', label: 'Admin', name: 'Admin', to: '/app/overview', icon: ShieldCheck },
  { role: 'nurse', label: 'Nurse', name: 'Nurse Joy', to: '/app/treatments', icon: HeartPulse },
  { role: 'frontdesk', label: 'Front desk', name: 'Mia', to: '/app/billing', icon: ReceiptText },
  { role: 'doctor', label: 'Doctor', name: 'Dr. Reyes', to: '/app/patients', icon: Stethoscope },
]

export default function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setBusy(true)
    setError('')
    try {
      await login(form.get('email'), form.get('password'))
      navigate('/app')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <main className="auth">
      <form className="card auth-card" onSubmit={onSubmit}>
        <Link to="/" className="logo"><Logo /></Link>
        <div>
          <h1>Staff sign in</h1>
          <p className="muted">Nurses, front desk, doctors and admin.</p>
        </div>
        <label>Email<input name="email" type="email" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <div className="demo">
          <span className="fine">Or try a demo account</span>
          {DEMO.map(({ role, label, name, to, icon: Icon }) => (
            <button key={role} type="button" className="btn ghost" disabled={busy}
              onClick={async () => { setBusy(true); await login(`${role}@demo.weirenal`, 'demo', { name, role }); navigate(to) }}>
              <Icon aria-hidden /> {label}
            </button>
          ))}
        </div>
      </form>
    </main>
  )
}
