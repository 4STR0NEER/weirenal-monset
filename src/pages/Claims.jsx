import { useState } from 'react'
import { Download } from 'lucide-react'
import { AnimatedNumber } from '../components/vengeance/animated-number.jsx'
import { getClaims, setClaimStatus, useLoad, peso } from '../api.js'
import { CLAIM_STATUSES } from '../data.js'
import { downloadCSV } from '../csv.js'

export default function Claims() {
  const [status, setStatus] = useState('')
  const [version, setVersion] = useState(0)
  const [error, setError] = useState('')
  const { data: claims, loading } = useLoad(() => getClaims({ status }), [status, version])
  const { data: all } = useLoad(() => getClaims(), [version])

  async function update(id, claim) {
    setError('')
    try {
      await setClaimStatus(id, claim)
      setVersion((v) => v + 1)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <header className="page-head row-between">
        <div>
          <h1>PhilHealth Claims</h1>
          <p className="muted">One claim per billed HD session. Move each one along as PhilHealth processes it.</p>
        </div>
        <button className="btn ghost" disabled={!claims?.length} onClick={() => downloadCSV(`philhealth-claims${status && '-' + status.toLowerCase()}.csv`, claims)}><Download aria-hidden /> Export CSV</button>
      </header>

      <div className="stats">
        {CLAIM_STATUSES.map((s) => {
          const these = all?.filter((c) => c.claim === s) ?? []
          return (
            <button key={s} className={'stat stat-btn' + (status === s ? ' active' : '')} onClick={() => setStatus(status === s ? '' : s)}>
              <span className="muted">{s} ({these.length})</span>
              <strong><AnimatedNumber value={peso(these.reduce((t, c) => t + c.amount, 0))} /></strong>
            </button>
          )
        })}
      </div>

      {error && <p className="error banner" role="alert">{error}</p>}

      <section className="card">
        {loading && !claims ? <p className="muted">Loading…</p> : claims.length === 0 ? <p className="muted">No claims{status && ` marked ${status}`}.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Session</th><th>OR no.</th><th>Patient</th><th>PIN</th><th>Amount</th><th>Age</th><th>Status</th></tr></thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id}>
                    <td>{c.date}</td>
                    <td className="mono">{c.receipt}</td>
                    <td>{c.patient}</td>
                    <td className="mono">{c.philhealthPin}</td>
                    <td>{peso(c.amount)}</td>
                    <td className={c.claim !== 'Paid' && c.ageDays > 30 ? 'warn' : ''}>{c.ageDays}d</td>
                    <td>
                      <select value={c.claim} onChange={(e) => update(c.id, e.target.value)} aria-label={`Claim status for ${c.patient} on ${c.date}`}>
                        {CLAIM_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
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
