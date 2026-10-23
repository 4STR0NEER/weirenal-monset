import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Search, UserPlus } from 'lucide-react'
import { getStaff, getStaffMember, saveStaff, useLoad, useSubmit, peso } from '../api.js'
import { STAFF_ROLES, STAFF_DAYS, SHIFTS, NURSE_ROLES } from '../data.js'
import { Stat } from './Overview.jsx'

const DAY_LABELS = { MWF: 'Mon, Wed, Fri', TThS: 'Tue, Thu, Sat', MonSat: 'Mon to Sat' }

export function License({ s }) {
  if (!s.license) return <span className="muted">–</span>
  const st = s.licenseState
  return (
    <span className="row">
      <span className="mono">{s.license}</span>
      {st && <span className={'pill ' + (st.state === 'valid' ? 'done' : st.state === 'expiring' ? 'low' : 'flag')}>
        {st.state === 'valid' ? `Valid to ${s.licenseExpiry}` : st.state === 'expiring' ? `Expires in ${st.days} days` : 'Expired'}
      </span>}
    </span>
  )
}

export default function Staff() {
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const { data, loading } = useLoad(getStaff)
  const term = q.trim().toLowerCase()
  const list = (data ?? []).filter((s) => (!role || s.role === role) && (!term || s.name.toLowerCase().includes(term)))
  const count = (f) => data?.filter(f).length

  return (
    <>
      <header className="page-head row-between">
        <div>
          <h1>Staff</h1>
          <p className="muted">Regular duty, pay rate and PRC license for everyone on the team.</p>
        </div>
        <Link className="btn" to="new"><UserPlus aria-hidden /> Add staff</Link>
      </header>

      <div className="stats">
        <Stat label="Team" value={count(() => true)} />
        <Stat label="Nurses" value={count((s) => NURSE_ROLES.includes(s.role))} />
        <Stat label="Licenses to renew" value={count((s) => ['expiring', 'expired'].includes(s.licenseState?.state))}
          warn={count((s) => ['expiring', 'expired'].includes(s.licenseState?.state)) > 0} />
      </div>

      <div className="filters">
        <label className="search"><Search aria-hidden /><input type="search" placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search staff" /></label>
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
          <option value="">All roles</option>
          {STAFF_ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      <section className="card">
        {loading && !data ? <p className="muted">Loading…</p> : list.length === 0 ? <p className="muted">No staff match.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Role</th><th>Regular duty</th><th>Rate per shift</th><th>PRC license</th><th>Phone</th></tr></thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id}>
                    <td><Link className="name-link" to={`${s.id}/edit`}>{s.name}</Link></td>
                    <td>{s.role}</td>
                    <td>{DAY_LABELS[s.days]} · {s.shift}</td>
                    <td>{s.rate == null ? <span className="muted">Professional fee</span> : peso(s.rate)}</td>
                    <td><License s={s} /></td>
                    <td>{s.phone || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

// One form for add (/staff/new) and edit (/staff/:id/edit).
export function StaffForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: s } = useLoad(() => (id ? getStaffMember(id) : Promise.resolve({ role: 'Nurse', days: 'MWF', shift: 'AM' })), [id])
  const { onSubmit, error, busy } = useSubmit(
    (f) => saveStaff({ ...Object.fromEntries(new FormData(f)), id: id && Number(id) }), () => navigate('/app/staff'))

  if (!s) return <p className="muted">Loading…</p>
  return (
    <>
      <Link className="back" to="/app/staff"><ArrowLeft aria-hidden /> Staff</Link>
      <header className="page-head"><h1>{id ? `Edit ${s.name}` : 'Add staff'}</h1></header>

      <form className="card form" onSubmit={onSubmit}>
        <fieldset>
          <legend>Person</legend>
          <label>Full name<input name="name" defaultValue={s.name} required /></label>
          <label>Role
            <select name="role" defaultValue={s.role}>{STAFF_ROLES.map((r) => <option key={r}>{r}</option>)}</select>
          </label>
          <label>Phone<input name="phone" type="tel" defaultValue={s.phone} /></label>
        </fieldset>
        <fieldset>
          <legend>Regular duty and pay</legend>
          <label>Days
            <select name="days" defaultValue={s.days}>{Object.keys(STAFF_DAYS).map((d) => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}</select>
          </label>
          <label>Shift
            <select name="shift" defaultValue={s.shift}>{Object.entries(SHIFTS).map(([k, t]) => <option key={k} value={k}>{k} · {t}</option>)}</select>
          </label>
          <label>Rate per shift (₱)<input name="rate" type="number" min="0" defaultValue={s.rate ?? ''} /><small>Leave blank if paid outside payroll (professional fee).</small></label>
        </fieldset>
        <fieldset>
          <legend>PRC license</legend>
          <label>License number<input name="license" defaultValue={s.license} /><small>Required for nurses.</small></label>
          <label>Valid until<input name="licenseExpiry" type="date" defaultValue={s.licenseExpiry} /></label>
        </fieldset>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="row">
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          <Link className="btn ghost" to="/app/staff">Cancel</Link>
        </div>
      </form>
    </>
  )
}
