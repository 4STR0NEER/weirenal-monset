import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { TriangleAlert, Clock, CircleCheck, ClipboardList } from 'lucide-react'
import { getFloor, todayISO, useLoad } from '../api.js'
import { CHAIRS, SHIFTS, MACHINES, ISOLATION_CHAIRS } from '../data.js'
import { Stat } from './Overview.jsx'

const currentShift = () => {
  const now = new Date().toTimeString().slice(0, 5)
  return Object.entries(SHIFTS).filter(([, start]) => start <= now).at(-1)?.[0] ?? Object.keys(SHIFTS)[0]
}
const ago = (iso) => Math.round((Date.now() - new Date(iso)) / 6e4)
const active = (s) => s.status !== 'Cancelled' && s.status !== 'No-show'

export default function Treatments() {
  const [date, setDate] = useState(todayISO)
  const [shift, setShift] = useState(currentShift)
  const [tick, setTick] = useState(0) // refresh every minute so "reading due" stays honest
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60e3)
    return () => clearInterval(id)
  }, [])
  const { data, loading } = useLoad(() => getFloor(date), [date, tick])
  const sessions = (data ?? []).filter(active)
  const count = (f) => sessions.filter(f).length

  return (
    <>
      <header className="page-head row-between">
        <div>
          <h1>Treatment floor</h1>
          <p className="muted">Every chair at a glance. Open a patient to fill in their treatment sheet.</p>
        </div>
        <input type="date" value={date} max={todayISO()} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Date" />
      </header>

      <div className="stats">
        <Stat label="On machine" value={data && count((s) => s.status === 'On machine')} />
        <Stat label="Readings due" value={data && count((s) => s.due)} warn={count((s) => s.due) > 0} />
        <Stat label="Out-of-range alerts" value={data && count((s) => s.alerts.length)} warn={count((s) => s.alerts.length) > 0} />
        <Stat label="Sheets complete" value={data && `${count((s) => s.finished)}/${sessions.length}`} />
      </div>

      <div className="seg" role="group" aria-label="Shift">
        {Object.entries(SHIFTS).map(([s, time]) => (
          <button key={s} aria-pressed={s === shift} onClick={() => setShift(s)}>
            {s} · {time} <span className="seg-count">{sessions.filter((x) => x.shift === s).length}</span>
          </button>
        ))}
      </div>

      {loading && !data ? <p className="muted">Loading…</p> : (
        <div className="floor">
          {Array.from({ length: CHAIRS }, (_, i) => i + 1).map((chair) => (
            <Chair key={chair} chair={chair} date={date} s={sessions.find((s) => s.shift === shift && s.chair === chair)} />
          ))}
        </div>
      )}
    </>
  )
}

function Chair({ chair, date, s }) {
  const head = (
    <span className="chair-head">
      <strong>Chair {chair}</strong>
      {ISOLATION_CHAIRS.includes(chair) && <span className="pill flag">Isolation</span>}
      <span className="muted">{MACHINES[chair]}</span>
    </span>
  )
  if (!s) return <div className="chair free">{head}<span className="muted">Free</span></div>

  const [Icon, text, tone] = s.alerts.length ? [TriangleAlert, s.alerts.join(', '), 'danger']
    : s.preMissing ? [ClipboardList, 'Before-treatment check not done', 'warn']
    : s.due ? [Clock, `Reading due, last one ${ago(s.lastAt)} min ago`, 'warn']
    : s.postMissing ? [ClipboardList, 'After-treatment check not done', 'warn']
    : s.finished ? [CircleCheck, 'Sheet complete', 'ok']
    : s.started ? [Clock, `Last reading ${ago(s.lastAt)} min ago`, '']
    : [Clock, `Starts ${s.time}`, '']

  return (
    <Link className={'chair ' + tone} to={`${date}/${s.patientId}`}>
      {head}
      <span className="chair-name">{s.patient}</span>
      <span className={'pill ' + s.status.replace(' ', '-').toLowerCase()}>{s.status}</span>
      {s.started && (
        <span className="uf">
          UF {s.ufRemoved} of {s.ufGoal} L
          <span className="meter" role="presentation"><i style={{ width: `${s.ufGoal ? Math.min(100, (s.ufRemoved / s.ufGoal) * 100) : 0}%` }} /></span>
        </span>
      )}
      <span className={'chair-foot ' + tone}><Icon aria-hidden />{text}</span>
    </Link>
  )
}
