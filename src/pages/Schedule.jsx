import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { getSchedule, getPatients, saveBooking, todayISO, addDays, useLoad } from '../api.js'
import { CHAIRS, SHIFTS, ISOLATION_CHAIRS, MACHINES } from '../data.js'

const STATUSES = ['Scheduled', 'On machine', 'Done', 'No-show', 'Cancelled']

export default function Schedule() {
  const [date, setDate] = useState(todayISO)
  const [version, setVersion] = useState(0) // bump to reload after a save
  const [booking, setBooking] = useState(null) // { chair, shift } while the book form is open
  const [error, setError] = useState('')
  const { data, loading } = useLoad(() => getSchedule(date), [date, version])
  const { data: hdPatients } = useLoad(() => getPatients({ modality: 'HD' }))

  const future = date > todayISO()
  const statusOptions = future ? ['Scheduled', 'Cancelled'] : date < todayISO() ? STATUSES.filter((s) => s !== 'On machine') : STATUSES

  async function save(b) {
    setError('')
    try {
      await saveBooking({ date, ...b })
      setBooking(null)
      setVersion((v) => v + 1)
    } catch (err) {
      setError(err.message)
    }
  }

  function onBook(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    save({ patientId: Number(f.get('patientId')), chair: Number(f.get('chair')), shift: f.get('shift') })
  }

  const sessions = data?.sessions ?? []
  const count = (status) => sessions.filter((s) => s.status === status).length

  return (
    <>
      <header className="page-head row-between">
        <div>
          <h1>Scheduler</h1>
          <p className="muted">{new Date(date + 'T00:00').toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="date-nav">
          <button className="btn ghost icon" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day"><ChevronLeft aria-hidden /></button>
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Date" />
          <button className="btn ghost icon" onClick={() => setDate(addDays(date, 1))} aria-label="Next day"><ChevronRight aria-hidden /></button>
          <button className="btn ghost" onClick={() => setDate(todayISO())}>Today</button>
        </div>
      </header>

      {error && <p className="error banner" role="alert">{error}</p>}

      {loading && !data ? <p className="muted">Loading…</p> : data.closed ? (
        <div className="card empty"><h2>Closed</h2><p className="muted">The clinic is closed on Sundays.</p></div>
      ) : (
        <>
          <div className="row">
            {STATUSES.map((s) => <span key={s} className={'pill ' + s.replace(' ', '-').toLowerCase()}>{s}: {count(s)}</span>)}
          </div>

          {booking && (
            <form key={`${booking.chair}-${booking.shift}`} className="card form-inline" onSubmit={onBook}>
              <label>Patient
                <select name="patientId" required defaultValue="">
                  <option value="" disabled>Choose…</option>
                  {hdPatients?.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.schedule} {p.shift})</option>)}
                </select>
              </label>
              <label>Chair
                <select name="chair" defaultValue={booking.chair}>
                  {Array.from({ length: CHAIRS }, (_, i) => <option key={i + 1}>{i + 1}</option>)}
                </select>
              </label>
              <label>Shift
                <select name="shift" defaultValue={booking.shift}>
                  {Object.keys(SHIFTS).map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <button className="btn">Book</button>
              <button type="button" className="btn ghost" onClick={() => setBooking(null)}>Cancel</button>
              <p className="fine full">Booking a patient who already has a session today moves them to this slot.</p>
            </form>
          )}

          <section className="card">
            <div className="table-wrap">
              <table className="sched">
                <thead>
                  <tr><th>Chair</th>{Object.entries(SHIFTS).map(([s, t]) => <th key={s}>{s} · {t}</th>)}</tr>
                </thead>
                <tbody>
                  {Array.from({ length: CHAIRS }, (_, i) => i + 1).map((chair) => (
                    <tr key={chair}>
                      <th scope="row">{chair} <span className="fine">{MACHINES[chair]}</span>{ISOLATION_CHAIRS.includes(chair) && <span className="pill flag">Isolation</span>}</th>
                      {Object.keys(SHIFTS).map((shift) => {
                        const here = sessions.filter((s) => s.chair === chair && s.shift === shift)
                        const free = here.every((s) => s.status === 'Cancelled' || s.status === 'No-show')
                        return (
                          <td key={shift}>
                            {here.map((s) => (
                              <div key={s.patientId} className={'slot ' + s.status.replace(' ', '-').toLowerCase()}>
                                <Link className="name-link" to={`/app/patients/${s.patientId}`}>{s.patient}</Link>
                                <select value={s.status} aria-label={`Status for ${s.patient}`}
                                  onChange={(e) => save({ patientId: s.patientId, chair, shift, status: e.target.value })}>
                                  {statusOptions.map((o) => <option key={o}>{o}</option>)}
                                </select>
                              </div>
                            ))}
                            {free && <button className="slot-add" onClick={() => setBooking({ chair, shift })} aria-label={`Book chair ${chair}, ${shift} shift`}><Plus aria-hidden /> Book</button>}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  )
}
