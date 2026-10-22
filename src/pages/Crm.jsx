import { useState } from 'react'
import { Link } from 'react-router'
import { getFollowUps, getOutbox, sendEmail, useLoad } from '../api.js'

const KINDS = { reminder: 'Reminder', noshow: 'No-show', cap: 'PhilHealth cap', labs: 'Labs' }

export default function Crm() {
  const [version, setVersion] = useState(0)
  const [error, setError] = useState('')
  const { data: followUps, loading } = useLoad(getFollowUps, [version])
  const { data: outbox } = useLoad(getOutbox, [version])
  const sent = (f) => outbox?.some((m) => m.patientId === f.patientId && m.kind === f.kind)

  async function send(f) {
    setError('')
    try {
      await sendEmail(f)
      setVersion((v) => v + 1)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>CRM & Reminders</h1>
        <p className="muted">Patients who need a nudge today. Emails go out through Resend once the backend is connected.</p>
      </header>

      {error && <p className="error banner" role="alert">{error}</p>}

      <section className="card">
        <h2>Follow-ups</h2>
        {loading && !followUps ? <p className="muted">Loading…</p> : followUps.length === 0 ? <p className="muted">Nobody needs a follow-up today.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Patient</th><th>Type</th><th>Reason</th><th>Email</th><th /></tr></thead>
              <tbody>
                {followUps.map((f) => (
                  <tr key={f.patientId + f.kind}>
                    <td><Link className="name-link" to={`/app/patients/${f.patientId}`}>{f.patient}</Link></td>
                    <td><span className={'pill ' + f.kind}>{KINDS[f.kind]}</span></td>
                    <td>{f.reason}</td>
                    <td>{f.email || <span className="muted">No email, call instead</span>}</td>
                    <td>
                      {f.email && (sent(f)
                        ? <span className="muted">Sent</span>
                        : <button className="link" onClick={() => send(f)}>Send email</button>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Outbox</h2>
        {!outbox?.length ? <p className="muted">No emails sent this session.</p> : outbox.map((m) => (
          <details key={m.id} className="mail">
            <summary><strong>{m.subject}</strong> <span className="muted">to {m.to} · {new Date(m.sentAt).toLocaleTimeString('en-PH')} · {m.status}</span></summary>
            <pre>{m.body}</pre>
          </details>
        ))}
      </section>
    </>
  )
}
