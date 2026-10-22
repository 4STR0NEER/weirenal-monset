import { useState } from 'react'
import { getReport, todayISO, useLoad, peso } from '../api.js'
import { downloadCSV } from '../csv.js'

const pct = (profit, revenue) => (revenue ? Math.round((profit / revenue) * 100) + '%' : '–')

export default function Reports() {
  const [month, setMonth] = useState(() => todayISO().slice(0, 7))
  const { data: r, loading } = useLoad(() => getReport(month), [month])

  return (
    <>
      <header className="page-head row-between">
        <div>
          <h1>Reports</h1>
          <p className="muted">Revenue split by payer and the clinic's margin on consumables. Staff and overhead costs arrive with payroll.</p>
        </div>
        <div className="row">
          <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Month" />
          <button className="btn ghost" disabled={!r?.ledger.length} onClick={() => downloadCSV(`ledger-${month}.csv`, r.ledger)}>Export full ledger</button>
        </div>
      </header>

      {loading && !r ? <p className="muted">Loading…</p> : (
        <>
          <div className="stats">
            <Stat label="Sessions billed" value={r.totals.sessions} />
            <Stat label="PhilHealth revenue" value={peso(r.totals.philhealth)} />
            <Stat label="Patient-paid revenue" value={peso(r.totals.patientPaid)} />
            <Stat label="Consumables cost" value={peso(r.totals.cost)} />
            <Stat label="Gross profit" value={peso(r.totals.profit)} sub={pct(r.totals.profit, r.totals.revenue) + ' margin'} />
          </div>

          <section className="card">
            <h2>PhilHealth claims this month</h2>
            <dl className="inline-dl">
              {Object.entries(r.claims).map(([s, v]) => <div key={s}><dt>{s}</dt><dd>{peso(v)}</dd></div>)}
            </dl>
            <p className="fine">Denied claims are left out of revenue and profit.</p>
          </section>

          <Table title="By patient" file={`by-patient-${month}.csv`} rows={r.byPatient}
            cols={[['patient', 'Patient'], ['sessions', 'Sessions'], ['philhealth', 'PhilHealth', peso], ['patientPaid', 'Patient paid', peso], ['cost', 'Cost', peso], ['profit', 'Profit', peso]]} />
          <Table title="By item" file={`by-item-${month}.csv`} rows={r.byItem}
            cols={[['item', 'Item'], ['payer', 'Paid by'], ['qty', 'Qty'], ['revenue', 'Revenue', peso], ['cost', 'Cost', peso], ['profit', 'Profit', peso]]} />
        </>
      )}
    </>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div className="card stat">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
      {sub && <span className="fine">{sub}</span>}
    </div>
  )
}

// cols: [key, header, format?]
function Table({ title, file, rows, cols }) {
  return (
    <section className="card">
      <div className="row-between">
        <h2>{title}</h2>
        <button className="btn ghost" disabled={!rows.length} onClick={() => downloadCSV(file, rows)}>Export CSV</button>
      </div>
      {rows.length === 0 ? <p className="muted">No billed sessions this month.</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr>{cols.map(([k, h]) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>{cols.map(([k, h, f]) => <td key={h}>{f ? f(row[k]) : row[k]}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
