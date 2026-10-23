import { useState } from 'react'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { getPayroll, todayISO, useLoad } from '../api.js'
import { downloadCSV } from '../csv.js'
import { Stat } from './Overview.jsx'

const php = (n) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const monthName = (m) => new Date(m + '-01T00:00').toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

export default function Payroll() {
  const [month, setMonth] = useState(() => todayISO().slice(0, 7))
  const [slip, setSlip] = useState(null)
  const { data, error, loading } = useLoad(() => getPayroll(month), [month])

  if (slip) return <Payslip r={slip} month={month} through={data.through} onBack={() => setSlip(null)} />

  function exportCSV() {
    downloadCSV(`payroll-${month}.csv`, data.rows.map((r) => ({
      name: r.name, role: r.role, shifts: r.shifts, absences: r.absences, rate: r.rate, gross: r.gross,
      sss: r.employee.sss, philhealth: r.employee.philhealth, pagibig: r.employee.pagibig, withholding_tax: r.employee.tax, net: r.net,
      employer_sss: r.employer.sss, employer_philhealth: r.employer.philhealth, employer_pagibig: r.employer.pagibig,
    })))
  }

  return (
    <>
      <header className="page-head row-between">
        <div>
          <h1>Payroll</h1>
          <p className="muted">Pay from shifts worked on the duty roster, less SSS, PhilHealth, Pag-IBIG and withholding tax.</p>
        </div>
        <div className="row">
          <input type="month" value={month} max={todayISO().slice(0, 7)} onChange={(e) => e.target.value && setMonth(e.target.value)} aria-label="Month" />
          <button className="btn ghost" disabled={!data?.rows.length} onClick={exportCSV}><Download aria-hidden /> Export CSV</button>
        </div>
      </header>

      {error && <p className="error banner" role="alert">{error.message}</p>}
      {data?.partial && <p className="note">Month to date: shifts worked through {data.through}. Totals grow until the month closes.</p>}

      <div className="stats">
        <Stat label="Gross pay" value={data && php(data.totals.gross)} />
        <Stat label="Employee deductions" value={data && php(data.totals.deductions)} />
        <Stat label="Net pay" value={data && php(data.totals.net)} />
        <Stat label="Employer contributions" value={data && php(data.totals.employer)} />
      </div>

      <section className="card">
        <h2>{monthName(month)}</h2>
        {loading && !data ? <p className="muted">Loading…</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Shifts</th><th>Absent</th><th>Gross</th><th>SSS</th><th>PhilHealth</th><th>Pag-IBIG</th><th>Tax</th><th>Net pay</th><th /></tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.staffId}>
                    <td><strong>{r.name}</strong><span className="fine"> · {r.role}</span></td>
                    <td>{r.shifts} × {php(r.rate)}</td>
                    <td className={r.absences ? 'warn' : ''}>{r.absences || '–'}</td>
                    <td>{php(r.gross)}</td>
                    <td>{php(r.employee.sss)}</td>
                    <td>{php(r.employee.philhealth)}</td>
                    <td>{php(r.employee.pagibig)}</td>
                    <td>{php(r.employee.tax)}</td>
                    <td><strong>{php(r.net)}</strong></td>
                    <td><button className="link" onClick={() => setSlip(r)}>Payslip</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="fine">Rates follow the 2025 SSS, PhilHealth, Pag-IBIG and BIR tables. Have the clinic's accountant confirm them before the first payroll. Doctors on professional fees are paid outside payroll.</p>
      </section>
    </>
  )
}

function Payslip({ r, month, through, onBack }) {
  const line = (label, v) => <><dt>{label}</dt><dd>{php(v)}</dd></>
  return (
    <>
      <div className="row no-print">
        <button className="btn ghost" onClick={onBack}><ArrowLeft aria-hidden /> Back to payroll</button>
        <button className="btn" onClick={() => window.print()}><Printer aria-hidden /> Print payslip</button>
      </div>
      <article className="card receipt">
        <header>
          <strong>WEI Renal Care Clinic · Payslip</strong>
          <span className="muted">{monthName(month)}</span>
        </header>
        <p className="muted">{r.name} · {r.role} · shifts through {through}</p>
        <dl>
          <dt>Shifts worked</dt><dd>{r.shifts} × {php(r.rate)}</dd>
          {line('Gross pay', r.gross)}
        </dl>
        <h3 className="slip-head">Deductions</h3>
        <dl>
          {line('SSS', r.employee.sss)}
          {line('PhilHealth', r.employee.philhealth)}
          {line('Pag-IBIG', r.employee.pagibig)}
          {line('Withholding tax', r.employee.tax)}
          {line('Total deductions', r.deductions)}
        </dl>
        <div className="total"><span>Net pay</span><strong>{php(r.net)}</strong></div>
        <p className="fine">Employer share (not deducted): SSS {php(r.employer.sss)} · PhilHealth {php(r.employer.philhealth)} · Pag-IBIG {php(r.employer.pagibig)}</p>
      </article>
    </>
  )
}
