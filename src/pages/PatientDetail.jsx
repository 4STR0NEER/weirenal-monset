import { Link, useParams } from 'react-router'
import { getPatient, useLoad, age, peso } from '../api.js'
import { packages, PHILHEALTH_SESSIONS_PER_YEAR } from '../data.js'
import { Flags } from './Patients.jsx'

const HD_RATE = packages.find((p) => p.id === 'hd').rate

export default function PatientDetail() {
  const { id } = useParams()
  const { data: p, error, loading } = useLoad(() => getPatient(id), [id])

  if (error) return <div className="card empty"><p>{error.message}</p><Link to="..">Back to patients</Link></div>
  if (loading || !p) return <p className="muted">Loading…</p>

  const remaining = p.philhealthUsed == null ? null : PHILHEALTH_SESSIONS_PER_YEAR - p.philhealthUsed

  return (
    <>
      <Link className="back" to="/app/patients">← Patients</Link>
      <header className="page-head row-between">
        <div>
          <h1>{p.name} <Flags p={p} /></h1>
          <p className="muted">{age(p.birthDate)} yrs · {p.sex === 'M' ? 'Male' : 'Female'} · {p.diagnosis}</p>
        </div>
        <Link className="btn ghost" to="edit">Edit</Link>
      </header>

      {p.notes && <p className="note">{p.notes}</p>}

      <div className="detail-grid">
        <section className="card">
          <h2>PhilHealth</h2>
          <dl>
            <dt>PIN</dt><dd className="mono">{p.philhealthPin}</dd>
            <dt>Membership</dt><dd>{p.membership}</dd>
            {remaining == null ? (
              <><dt>Package</dt><dd>PD Z Benefit</dd></>
            ) : (
              <>
                <dt>Sessions this year</dt>
                <dd>
                  {p.philhealthUsed} / {PHILHEALTH_SESSIONS_PER_YEAR}
                  <meter min="0" max={PHILHEALTH_SESSIONS_PER_YEAR} high="140" optimum="0" value={p.philhealthUsed} />
                </dd>
                <dt>Remaining</dt><dd className={remaining <= 16 ? 'warn' : ''}>{remaining} sessions ({peso(remaining * HD_RATE)})</dd>
              </>
            )}
          </dl>
        </section>

        <section className="card">
          <h2>Dialysis prescription</h2>
          <dl>
            <dt>Modality</dt><dd>{p.modality === 'HD' ? 'Hemodialysis' : 'Peritoneal dialysis'}</dd>
            {p.modality === 'HD' && <>
              <dt>Schedule</dt><dd>{p.schedule} · {p.shift} shift · chair {p.chair}</dd>
              <dt>No-shows</dt><dd className={p.noShows.length ? 'warn' : ''}>{p.noShows.length ? `${p.noShows.length} (last: ${p.noShows.at(-1)})` : 'None'}</dd>
              <dt>Dialyzer</dt><dd>{p.dialyzer}</dd>
              <dt>Blood flow</dt><dd>{p.bloodFlow} mL/min · {p.hours} hrs</dd>
            </>}
            <dt>Access</dt><dd>{p.access}</dd>
            <dt>Dry weight</dt><dd>{p.dryWeight} kg</dd>
            <dt>HBsAg / Anti-HCV</dt><dd>{p.hbsag} / {p.antiHcv}</dd>
          </dl>
        </section>

        <section className="card">
          <h2>Contact</h2>
          <dl>
            <dt>Phone</dt><dd>{p.phone}</dd>
            <dt>Email</dt><dd>{p.email || '–'}</dd>
            <dt>Emergency</dt><dd>{p.emergencyContact}</dd>
          </dl>
        </section>
      </div>

      <section className="card">
        <h2>Monthly labs</h2>
        {p.labs.length === 0 ? <p className="muted">No labs recorded yet.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Hgb (g/dL)</th><th>Potassium (mmol/L)</th><th>Albumin (g/dL)</th><th>Kt/V</th></tr></thead>
              <tbody>
                {p.labs.map((l) => (
                  <tr key={l.date}>
                    <td>{l.date}</td>
                    <td className={l.hgb < 10 ? 'warn' : ''}>{l.hgb}</td>
                    <td className={l.potassium > 5.5 ? 'warn' : ''}>{l.potassium}</td>
                    <td className={l.albumin < 3.5 ? 'warn' : ''}>{l.albumin}</td>
                    <td className={l.ktv < 1.2 ? 'warn' : ''}>{l.ktv}</td>
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
