import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, TriangleAlert, UserX, Undo2 } from 'lucide-react'
import { getRoster, saveDuty, todayISO, addDays, useLoad, useSubmit } from '../api.js'
import { NURSE_ROLES, PATIENTS_PER_NURSE } from '../data.js'

export default function Roster() {
  const [date, setDate] = useState(todayISO)
  const [version, setVersion] = useState(0)
  const [adding, setAdding] = useState(null) // shift getting an extra person
  const [error, setError] = useState('')
  const reload = () => setVersion((v) => v + 1)
  const { data, loading } = useLoad(() => getRoster(date), [date, version])

  async function change(d) {
    setError('')
    try {
      await saveDuty({ date, ...d })
      reload()
    } catch (err) {
      setError(err.message)
    }
  }

  const go = (d) => { setDate(d); setAdding(null); setError('') }
  const short = data?.shifts.filter((x) => x.short) ?? []

  return (
    <>
      <header className="page-head row-between">
        <div>
          <h1>Duty roster</h1>
          <p className="muted">{new Date(date + 'T00:00').toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="date-nav">
          <button className="btn ghost icon" onClick={() => go(addDays(date, -1))} aria-label="Previous day"><ChevronLeft aria-hidden /></button>
          <input type="date" value={date} onChange={(e) => e.target.value && go(e.target.value)} aria-label="Date" />
          <button className="btn ghost icon" onClick={() => go(addDays(date, 1))} aria-label="Next day"><ChevronRight aria-hidden /></button>
          <button className="btn ghost" onClick={() => go(todayISO())}>Today</button>
        </div>
      </header>

      {error && <p className="error banner" role="alert">{error}</p>}
      {short.length > 0 && (
        <p className="error banner" role="alert">
          <TriangleAlert aria-hidden />Short of nurses on the {short.map((x) => x.shift).join(' and ')} shift. The target is one nurse for every {PATIENTS_PER_NURSE} patients.
        </p>
      )}

      {loading && !data ? <p className="muted">Loading…</p> : data.closed ? (
        <div className="card empty"><h2>Closed</h2><p className="muted">The clinic is closed on Sundays.</p></div>
      ) : (
        <div className="shift-checks">
          {data.shifts.map((x) => (
            <section key={x.shift} className="card shift-check">
              <header>
                <strong>{x.shift} · {x.time}</strong>
                <span className={'pill ' + (x.short ? 'flag' : 'done')}>{x.nurses} nurse{x.nurses === 1 ? '' : 's'} · {x.patients} patients</span>
              </header>
              <ul className="duty">
                {x.staff.map((p) => (
                  <li key={p.staffId} className={p.status === 'Absent' ? 'absent' : ''}>
                    <span>
                      <strong>{p.name}</strong>
                      <small>{p.role}{p.status !== 'On duty' && ` · ${p.status === 'Extra' ? 'Extra shift' : 'Absent'}`}</small>
                    </span>
                    {p.status === 'On duty'
                      ? <button className="btn ghost icon" onClick={() => change({ staffId: p.staffId, status: 'Absent' })} aria-label={`Mark ${p.name} absent`} title="Mark absent"><UserX aria-hidden /></button>
                      : <button className="btn ghost icon" onClick={() => change({ staffId: p.staffId, status: null })} aria-label={p.status === 'Absent' ? `Put ${p.name} back on duty` : `Remove ${p.name}'s extra shift`} title="Undo"><Undo2 aria-hidden /></button>}
                  </li>
                ))}
              </ul>
              {adding === x.shift
                ? <AddExtra shift={x.shift} available={data.available} onCancel={() => setAdding(null)} onSave={(staffId) => change({ staffId, shift: x.shift, status: 'Extra' }).then(() => setAdding(null))} />
                : data.available.length > 0 && <button className="slot-add" onClick={() => setAdding(x.shift)}><Plus aria-hidden /> Add extra shift</button>}
            </section>
          ))}
        </div>
      )}
    </>
  )
}

function AddExtra({ available, onCancel, onSave }) {
  const nursesFirst = [...available].sort((a, b) => NURSE_ROLES.includes(b.role) - NURSE_ROLES.includes(a.role))
  const { onSubmit, busy } = useSubmit((f) => onSave(Number(new FormData(f).get('staffId'))), () => {})
  return (
    <form className="form-inline" onSubmit={onSubmit}>
      <label>Who
        <select name="staffId" required defaultValue="">
          <option value="" disabled>Choose…</option>
          {nursesFirst.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
        </select>
      </label>
      <button className="btn" disabled={busy}>Add</button>
      <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
    </form>
  )
}
