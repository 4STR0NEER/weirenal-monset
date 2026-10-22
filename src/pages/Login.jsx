import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { login } from '../api.js'

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
        <Link to="/" className="logo"><span className="logo-mark" aria-hidden>W</span>WEI Renal Care</Link>
        <h1>Staff sign in</h1>
        <label>Email<input name="email" type="email" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="fine">Mock mode: any email and password works.</p>
      </form>
    </main>
  )
}
