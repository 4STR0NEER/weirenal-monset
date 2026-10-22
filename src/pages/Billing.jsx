import { useState } from 'react'
import { getBilling, billSession, todayISO, useLoad, peso, PAY_METHODS } from '../api.js'
import { PHILHEALTH_SESSIONS_PER_YEAR, SELF_PAY_RATE } from '../data.js'

export default function Billing() {
  const [date, setDate] = useState(todayISO)
  const [version, setVersion] = useState(0)
  const [selected, setSelected] = useState(null) // session being checked out
  const [receipt, setReceipt] = useState(null)
  const { data, loading } = useLoad(() => getBilling(date), [date, version])

  if (receipt) return <Receipt r={receipt} onDone={() => { setReceipt(null); setSelected(null); setVersion((v) => v + 1) }} />

  return (
    <>
      <header className="page-head row-between">
        <div>
          <h1>POS & Billing</h1>
          <p className="muted">Bill finished sessions. PhilHealth covers the package; add-ons are paid by the patient.</p>
        </div>
        <input type="date" value={date} max={todayISO()} onChange={(e) => e.target.value && (setDate(e.target.value), setSelected(null))} aria-label="Date" />
      </header>

      {loading && !data ? <p className="muted">Loading…</p> : (
        <div className="split">
          <section className="card">
            <h2>Sessions to bill</h2>
            {data.toBill.length === 0 ? <p className="muted">Nothing left to bill for this date.</p> : (
              <ul className="pick-list">
                {data.toBill.map((s) => (
                  <li key={s.patientId}>
                    <button className={selected?.patientId === s.patientId ? 'active' : ''} onClick={() => setSelected(s)}>
                      <strong>{s.patient}</strong>
                      <span className="muted">{s.shift} · chair {s.chair} · {s.philhealthUsed}/{PHILHEALTH_SESSIONS_PER_YEAR}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {selected
            ? <Checkout key={selected.patientId} date={date} s={selected} addOns={data.addOns} onBilled={setReceipt} />
            : <section className="card empty"><p className="muted">Pick a session to start a bill.</p></section>}
        </div>
      )}

      {data?.receipts.length > 0 && (
        <section className="card">
          <h2>Receipts on this date</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>OR no.</th><th>Patient</th><th>PhilHealth</th><th>Patient paid</th><th>Method</th><th /></tr></thead>
              <tbody>
                {data.receipts.map((r) => (
                  <tr key={r.no}>
                    <td className="mono">{r.no}</td><td>{r.patient}</td><td>{peso(r.philhealth)}</td><td>{peso(r.patientPays)}</td><td>{r.method}</td>
                    <td><button className="link" onClick={() => setReceipt(r)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}

function Checkout({ date, s, addOns, onBilled }) {
  const [qty, setQty] = useState({})
  const [method, setMethod] = useState(PAY_METHODS[0])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const covered = s.philhealthUsed < PHILHEALTH_SESSIONS_PER_YEAR
  const extras = addOns.reduce((t, a) => t + (qty[a.id] || 0) * a.price, 0)

  async function submit() {
    setBusy(true)
    setError('')
    try {
      onBilled(await billSession({ date, patientId: s.patientId, method, addOns: Object.entries(qty).map(([id, q]) => ({ id, qty: q })) }))
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <section className="card checkout">
      <h2>{s.patient}</h2>
      <div className={'line-item ' + (covered ? 'covered' : '')}>
        <span>{covered ? 'HD session package' : 'HD session (self-pay)'}</span>
        <strong>{covered ? 'PhilHealth' : 'Patient'}</strong>
      </div>
      {!covered && <p className="note">PhilHealth's {PHILHEALTH_SESSIONS_PER_YEAR} sessions are used up; this session is self-pay.</p>}

      <h3>Add-ons (patient pays)</h3>
      {addOns.map((a) => (
        <label key={a.id} className="addon">
          <span>{a.name} <span className="muted">{peso(a.price)}</span></span>
          <input type="number" min="0" max="20" value={qty[a.id] ?? 0} onChange={(e) => setQty({ ...qty, [a.id]: Math.max(0, Math.min(20, parseInt(e.target.value) || 0)) })} />
        </label>
      ))}

      <label>Payment method
        <select value={method} onChange={(e) => setMethod(e.target.value)}>{PAY_METHODS.map((m) => <option key={m}>{m}</option>)}</select>
      </label>

      <div className="total">
        <span>Patient pays</span>
        <strong>{peso(extras + (covered ? 0 : SELF_PAY_RATE))}</strong>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn" disabled={busy} onClick={submit}>{busy ? 'Billing…' : 'Complete bill'}</button>
    </section>
  )
}

function Receipt({ r, onDone }) {
  return (
    <>
      <div className="row no-print">
        <button className="btn ghost" onClick={onDone}>← Back to billing</button>
        <button className="btn" onClick={() => window.print()}>Print receipt</button>
      </div>
      <article className="card receipt">
        <header>
          <strong>WEI Renal Care Clinic</strong>
          <span className="mono">{r.no}</span>
        </header>
        <p className="muted">{r.date} · {r.patient} · PIN {r.philhealthPin} · {r.method}</p>
        <table>
          <thead><tr><th>Item</th><th>Qty</th><th>Paid by</th><th>Amount</th></tr></thead>
          <tbody>
            {r.lines.map((l) => <tr key={l.id}><td>{l.item}</td><td>{l.qty}</td><td>{l.payer}</td><td>{peso(l.qty * l.unitPrice)}</td></tr>)}
          </tbody>
        </table>
        <dl>
          <dt>Covered by PhilHealth</dt><dd>{peso(r.philhealth)}</dd>
          <dt>Patient paid</dt><dd><strong>{peso(r.patientPays)}</strong></dd>
        </dl>
      </article>
    </>
  )
}
