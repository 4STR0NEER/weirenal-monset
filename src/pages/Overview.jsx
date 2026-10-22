import { Link } from 'react-router'
import { getStats, getTodaySessions, useLoad } from '../api.js'
import { PHILHEALTH_SESSIONS_PER_YEAR } from '../data.js'

export default function Overview() {
  const { data: stats } = useLoad(getStats)
  const { data: sessions, loading } = useLoad(getTodaySessions)
  const today = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <>
      <header className="page-head">
        <h1>Overview</h1>
        <p className="muted">{today}</p>
      </header>

      <div className="stats">
        <Stat label="Sessions today" value={stats?.sessionsToday} />
        <Stat label="Chairs in use" value={stats && `${stats.chairsInUse} / ${stats.chairs}`} />
        <Stat label="Near PhilHealth cap" value={stats?.nearCap} warn={stats?.nearCap > 0} />
        <Stat label="Low-stock items" value={stats?.lowStock} warn={stats?.lowStock > 0} />
      </div>

      <section className="card">
        <h2>Today's sessions</h2>
        {loading ? <p className="muted">Loading…</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>Patient</th><th>Chair</th><th>PhilHealth sessions</th><th>Status</th></tr></thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.patientId}>
                    <td>{s.time}</td>
                    <td><Link className="name-link" to={`/app/patients/${s.patientId}`}>{s.patient}</Link></td>
                    <td>{s.chair}</td>
                    <td className={s.philhealthUsed >= 140 ? 'warn' : ''}>
                      {s.philhealthUsed} / {PHILHEALTH_SESSIONS_PER_YEAR}
                    </td>
                    <td><span className={'pill ' + s.status.replace(' ', '-').toLowerCase()}>{s.status}</span></td>
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

function Stat({ label, value, warn }) {
  return (
    <div className={'card stat' + (warn ? ' warn' : '')}>
      <span className="muted">{label}</span>
      <strong>{value ?? '–'}</strong>
    </div>
  )
}
