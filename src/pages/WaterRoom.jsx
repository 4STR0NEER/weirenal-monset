import { Fragment, useState } from 'react'
import { TriangleAlert, Download, Plus } from 'lucide-react'
import { getWaterRoom, saveWaterCheck, completeWaterTask, breaches, todayISO, useLoad, useSubmit } from '../api.js'
import { WATER_LIMITS } from '../data.js'
import { downloadCSV } from '../csv.js'

const clock = (iso) => new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
const limitText = (l) => (l.min != null ? `${l.min}–${l.max} ${l.unit}` : `max ${l.max} ${l.unit}`)
const LIMIT_KEYS = Object.keys(WATER_LIMITS)

export default function WaterRoom() {
  const [date, setDate] = useState(todayISO)
  const [version, setVersion] = useState(0)
  const [logging, setLogging] = useState(null) // shift whose check form is open
  const reload = () => setVersion((v) => v + 1)
  const { data, loading } = useLoad(() => getWaterRoom(date), [date, version])
  const failed = data?.shifts.filter((x) => x.check?.fails.length) ?? []

  function exportCSV() {
    downloadCSV(`water-log-${date}.csv`, data.history.map((c) => ({
      date: c.date, shift: c.shift, time: clock(c.at),
      ...Object.fromEntries(LIMIT_KEYS.map((k) => [`${WATER_LIMITS[k].label} (${WATER_LIMITS[k].unit})`, c[k]])),
      result: c.fails.length ? 'Failed' : 'Passed', by: c.by, notes: c.notes,
    })))
  }

  return (
    <>
      <header className="page-head row-between">
        <div>
          <h1>Water room</h1>
          <p className="muted">Test the water before every shift. No treatments start on a failed check.</p>
        </div>
        <div className="row">
          <input type="date" value={date} max={todayISO()} onChange={(e) => e.target.value && (setDate(e.target.value), setLogging(null))} aria-label="Date" />
          <button className="btn ghost" disabled={!data?.history.length} onClick={exportCSV}><Download aria-hidden /> Export log</button>
        </div>
      </header>

      {failed.length > 0 && (
        <p className="error banner" role="alert">
          <TriangleAlert aria-hidden />
          {failed.map((x) => `${x.shift}: ${x.check.fails.join(', ')}`).join(' · ')} out of limit. Hold treatments until a retest passes.
        </p>
      )}

      {loading && !data ? <p className="muted">Loading…</p> : data.closed ? (
        <div className="card empty"><h2>Closed</h2><p className="muted">The clinic is closed on Sundays.</p></div>
      ) : (
        <div className="shift-checks">
          {data.shifts.map((x) => <ShiftCheck key={x.shift} x={x} onLog={() => setLogging(x.shift)} />)}
        </div>
      )}

      {logging && <CheckForm key={logging} date={date} shift={logging} onCancel={() => setLogging(null)} onSaved={() => { setLogging(null); reload() }} />}
      {data && <Tasks tasks={data.tasks} onDone={reload} />}
      {data && <History rows={data.history} />}
    </>
  )
}

function ShiftCheck({ x, onLog }) {
  const c = x.check
  return (
    <section className="card shift-check">
      <header>
        <strong>Before {x.shift} · {x.time}</strong>
        {c ? <span className={'pill ' + (c.fails.length ? 'flag' : 'done')}>{c.fails.length ? 'Failed' : 'Passed'}</span>
          : <span className="pill scheduled">Not logged</span>}
      </header>
      {c ? (
        <dl>
          {LIMIT_KEYS.map((k) => (
            <Fragment key={k}>
              <dt>{WATER_LIMITS[k].label}</dt>
              <dd className={breaches(c, { [k]: WATER_LIMITS[k] }).length ? 'warn' : ''}>{c[k]} {WATER_LIMITS[k].unit}</dd>
            </Fragment>
          ))}
          <dt>Checked by</dt><dd>{c.by}, {clock(c.at)}{x.tries > 1 && ` (test ${x.tries})`}</dd>
        </dl>
      ) : <p className="muted">Log it before the first patient goes on.</p>}
      {(!c || c.fails.length > 0) && <button className="btn ghost" onClick={onLog}><Plus aria-hidden /> {c ? 'Log retest' : 'Log check'}</button>}
    </section>
  )
}

function CheckForm({ date, shift, onCancel, onSaved }) {
  const [values, setValues] = useState({})
  const { onSubmit, error, busy } = useSubmit((f) => saveWaterCheck({ date, shift, ...values, notes: new FormData(f).get('notes') }), onSaved)
  const typed = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '').map(([k, v]) => [k, Number(v)]))
  const bad = breaches(typed, WATER_LIMITS)

  return (
    <form className="card form" onSubmit={onSubmit}>
      <h2>Water check before {shift} shift</h2>
      <fieldset>
        {LIMIT_KEYS.map((k) => {
          const l = WATER_LIMITS[k], out = bad.includes(k)
          return (
            <label key={k}>{l.label} ({l.unit})
              <input type="number" step="any" inputMode="decimal" required value={values[k] ?? ''} className={out ? 'bad' : ''} aria-invalid={out}
                onChange={(e) => setValues({ ...values, [k]: e.target.value })} />
              <small className={out ? 'error' : 'fine'}>{out ? 'Out of limit' : 'Limit'}: {limitText(l)}</small>
            </label>
          )
        })}
      </fieldset>
      <label>Notes<input name="notes" maxLength={300} placeholder={bad.length ? 'What was done, e.g. replaced carbon cartridge' : 'Optional'} /></label>
      {bad.length > 0 && <p className="note"><TriangleAlert aria-hidden />Save it anyway. Failed checks stay on the log; fix the cause, then log a retest.</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="row">
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save check'}</button>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

function Tasks({ tasks, onDone }) {
  const [doing, setDoing] = useState(null)
  const task = tasks.find((t) => t.id === doing)
  return (
    <section className="card">
      <h2>Scheduled tests and maintenance</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Task</th><th>Every</th><th>Last done</th><th>Result</th><th>Next due</th><th /></tr></thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.every} days</td>
                <td>{t.last?.date ?? 'Never'}</td>
                <td className={t.high ? 'warn' : ''}>
                  {t.last?.result != null ? `${t.last.result} ${t.unit}` : '–'}
                  {t.unit && <span className="fine"> · action {t.action}, max {t.max}</span>}
                </td>
                <td>
                  <span className={'pill ' + (t.daysLeft < 0 ? 'flag' : t.daysLeft <= 7 ? 'low' : 'scheduled')}>
                    {t.daysLeft < 0 ? `${-t.daysLeft} days overdue` : t.daysLeft === 0 ? 'Due today' : `In ${t.daysLeft} days`}
                  </span>
                </td>
                <td><button className="link" onClick={() => setDoing(t.id)}>Mark done</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {task && <TaskForm key={task.id} t={task} onCancel={() => setDoing(null)} onSaved={() => { setDoing(null); onDone() }} />}
    </section>
  )
}

function TaskForm({ t, onCancel, onSaved }) {
  const { onSubmit, error, busy } = useSubmit((f) => completeWaterTask(t.id, Object.fromEntries(new FormData(f))), onSaved)
  return (
    <form className="form-inline task-form" onSubmit={onSubmit}>
      <strong className="full">{t.name}</strong>
      <label>Date done<input name="date" type="date" max={todayISO()} defaultValue={todayISO()} required /></label>
      {t.unit && <label>Result ({t.unit})<input name="result" type="number" step="any" required /></label>}
      <button className="btn" disabled={busy}>Save</button>
      <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
      {error && <p className="error full" role="alert">{error}</p>}
    </form>
  )
}

function History({ rows }) {
  return (
    <section className="card">
      <h2>Log, last 14 days</h2>
      {rows.length === 0 ? <p className="muted">No checks logged.</p> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Shift</th><th>Time</th>{LIMIT_KEYS.map((k) => <th key={k}>{WATER_LIMITS[k].label}</th>)}<th>Result</th><th>By</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.date + c.shift + c.at}>
                  <td>{c.date}</td><td>{c.shift}</td><td>{clock(c.at)}</td>
                  {LIMIT_KEYS.map((k) => <td key={k} className={breaches(c, { [k]: WATER_LIMITS[k] }).length ? 'warn' : ''}>{c[k]}</td>)}
                  <td><span className={'pill ' + (c.fails.length ? 'flag' : 'done')}>{c.fails.length ? 'Failed' : 'Passed'}</span></td>
                  <td>{c.by}</td>
                  <td className="wrap">{c.notes || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
