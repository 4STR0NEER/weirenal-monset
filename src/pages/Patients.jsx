import { useState } from 'react'
import { Link } from 'react-router'
import { Search, UserPlus } from 'lucide-react'
import { getPatients, useLoad, age } from '../api.js'
import { PHILHEALTH_SESSIONS_PER_YEAR } from '../data.js'

export default function Patients() {
  const [q, setQ] = useState('')
  const [modality, setModality] = useState('')
  const [schedule, setSchedule] = useState('')
  const { data: patients, loading } = useLoad(() => getPatients({ q, modality, schedule }), [q, modality, schedule])

  return (
    <>
      <header className="page-head row-between">
        <div>
          <h1>Patients</h1>
          <p className="muted">Search by name or PhilHealth PIN.</p>
        </div>
        <Link className="btn" to="new"><UserPlus aria-hidden /> Add patient</Link>
      </header>

      <div className="filters">
        <label className="search"><Search aria-hidden /><input type="search" placeholder="e.g. Ramos, 12-3456" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search patients" /></label>
        <select value={modality} onChange={(e) => setModality(e.target.value)} aria-label="Modality">
          <option value="">All modalities</option>
          <option value="HD">Hemodialysis</option>
          <option value="PD">Peritoneal dialysis</option>
        </select>
        <select value={schedule} onChange={(e) => setSchedule(e.target.value)} aria-label="Schedule">
          <option value="">All schedules</option>
          <option>MWF</option>
          <option>TThS</option>
        </select>
      </div>

      <section className="card">
        {loading && !patients ? <p className="muted">Loading…</p> : patients.length === 0 ? <p className="muted">No patients match.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Age / Sex</th><th>Modality</th><th>Schedule</th><th>Access</th><th>PhilHealth sessions</th><th>Flags</th></tr></thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td><Link className="name-link" to={String(p.id)}>{p.name}</Link></td>
                    <td>{age(p.birthDate)} / {p.sex}</td>
                    <td><span className="pill plain">{p.modality}</span></td>
                    <td>{p.schedule ? `${p.schedule} · ${p.shift}` : '–'}</td>
                    <td>{p.access}</td>
                    <td className={p.philhealthUsed >= 140 ? 'warn' : ''}>
                      {p.philhealthUsed == null ? 'PD Z Benefit' : `${p.philhealthUsed} / ${PHILHEALTH_SESSIONS_PER_YEAR}`}
                    </td>
                    <td><Flags p={p} /></td>
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

// Hepatitis-positive patients need an isolation machine; staff must see it everywhere.
export function Flags({ p }) {
  const flags = [p.hbsag === 'Positive' && 'HBsAg+', p.antiHcv === 'Positive' && 'Anti-HCV+'].filter(Boolean)
  return flags.length ? flags.map((f) => <span key={f} className="pill flag">{f}</span>) : null
}
