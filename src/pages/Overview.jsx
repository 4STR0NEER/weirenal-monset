import { Link } from 'react-router'
import { PackageOpen, ShieldAlert, FileClock, CircleCheck, Droplets, Clock } from 'lucide-react'
import { getStats, getTodaySessions, currentUser, useLoad, todayISO } from '../api.js'
import { PHILHEALTH_SESSIONS_PER_YEAR } from '../data.js'
import { AnimatedNumber } from '../components/vengeance/animated-number.jsx'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function Overview() {
  const { data: stats } = useLoad(getStats)
  const { data: sessions, loading } = useLoad(getTodaySessions)
  const today = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <>
      <header className="page-head">
        <h1>{greeting()}, {currentUser()?.name}</h1>
        <p className="muted">{today}</p>
      </header>

      <div className="stats">
        <Stat label="Sessions today" value={stats?.sessionsToday} />
        <Stat label="On machine now" value={stats && `${stats.chairsInUse}/${stats.chairs}`} />
        <Stat label="Near PhilHealth cap" value={stats?.nearCap} warn={stats?.nearCap > 0} />
        <Stat label="Low-stock items" value={stats?.lowStock} warn={stats?.lowStock > 0} />
      </div>

      <div className="overview-grid">
        <section className="card">
          <h2>Today’s sessions</h2>
          {loading ? <p className="muted">Loading…</p> : sessions.length === 0 ? <p className="muted">No sessions today.</p> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Time</th><th>Patient</th><th>Chair</th><th>PhilHealth</th><th>Status</th></tr></thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.patientId}>
                      <td>{s.time}</td>
                      <td><Link className="name-link" to={`/app/patients/${s.patientId}`}>{s.patient}</Link></td>
                      <td>{s.chair}</td>
                      <td className={s.philhealthUsed >= 140 ? 'warn' : ''}>{s.philhealthUsed} / {PHILHEALTH_SESSIONS_PER_YEAR}</td>
                      <td><Link to={`/app/treatments/${todayISO()}/${s.patientId}`} className={'pill ' + s.status.replace(' ', '-').toLowerCase()}>{s.status}</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Needs attention</h2>
          <div className="attention">
            {stats?.waterDue.length > 0 && <Item to="/app/water" icon={Droplets} title={`Water check due: ${stats.waterDue.join(', ')} shift`} sub="Log it before patients go on" />}
            {stats?.readingsDue > 0 && <Item to="/app/treatments" icon={Clock} title={`${stats.readingsDue} machine readings due`} sub="Over an hour since the last one" />}
            {stats?.nearCap > 0 && <Item to="/app/crm" icon={ShieldAlert} title={`${stats.nearCap} near the 156-session cap`} sub="Talk to them about the rest of the year" />}
            {stats?.lowStock > 0 && <Item to="/app/inventory" icon={PackageOpen} title={`${stats.lowStock} items to reorder`} sub="At or below reorder level" />}
            <Item to="/app/philhealth" icon={FileClock} title="Pending PhilHealth claims" sub="Submit this week’s sessions" />
            {stats && !stats.nearCap && !stats.lowStock && !stats.waterDue.length && !stats.readingsDue && <Item to="/app/schedule" icon={CircleCheck} calm title="All clear" sub="Nothing urgent today" />}
          </div>
        </section>
      </div>
    </>
  )
}

export function Stat({ label, value, warn }) {
  return (
    <div className={'stat' + (warn ? ' warn' : '')}>
      <span className="muted">{label}</span>
      <strong>{value == null ? '–' : <AnimatedNumber value={value} />}</strong>
    </div>
  )
}

function Item({ to, icon: Icon, title, sub, calm }) {
  return (
    <Link to={to}>
      <span className={'ico' + (calm ? ' calm' : '')}><Icon aria-hidden /></span>
      <span><strong>{title}</strong><small>{sub}</small></span>
    </Link>
  )
}
