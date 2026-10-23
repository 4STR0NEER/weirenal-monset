import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Printer, TriangleAlert, Camera, Plus, CircleCheck, ReceiptText } from 'lucide-react'
import { getTreatment, startTreatment, addReading, finishTreatment, breaches, todayISO, useLoad, useSubmit } from '../api.js'
import { ACCESS_CHECKS, COMPLICATIONS, VITAL_LIMITS, MAX_GAIN_PCT, READING_EVERY_MIN } from '../data.js'
import { Flags } from './Patients.jsx'
import { Stat } from './Overview.jsx'

const clock = (iso) => new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
const fields = (form) => Object.fromEntries(new FormData(form))
const off = (r, ...keys) => (keys.some((k) => breaches(r, VITAL_LIMITS).includes(k)) ? 'warn' : '')

export default function TreatmentSheet() {
  const { date, patientId } = useParams()
  const [version, setVersion] = useState(0)
  const reload = () => setVersion((v) => v + 1)
  const { data, error } = useLoad(() => getTreatment(date, patientId), [date, patientId, version])

  if (error) return <div className="card empty"><p>{error.message}</p><Link to="/app/treatments">Back to the treatment floor</Link></div>
  if (!data) return <p className="muted">Loading…</p>

  const { patient: p, session: s, machine, sheet, summary: sum } = data
  const longDate = new Date(date + 'T00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <>
      <Link className="back no-print" to="/app/treatments"><ArrowLeft aria-hidden /> Treatment floor</Link>
      <header className="page-head row-between">
        <div>
          <h1>{p.name} <Flags p={p} /></h1>
          <p className="muted">Treatment sheet · {longDate} · {s.shift} shift, {s.time} · Chair {s.chair}, Fresenius {machine}</p>
        </div>
        <div className="row no-print">
          <span className={'pill ' + s.status.replace(' ', '-').toLowerCase()}>{s.status}</span>
          <Link className="btn ghost" to={`/app/patients/${p.id}`}>Profile</Link>
          <button className="btn ghost" onClick={() => window.print()}><Printer aria-hidden /> Print sheet</button>
        </div>
      </header>

      {sum.alerts.length > 0 && (
        <p className="error banner" role="alert"><TriangleAlert aria-hidden />Out of range: {sum.alerts.join(', ')}. Check the patient and tell the nephrologist on duty.</p>
      )}

      <div className="stats">
        <Stat label="Dry weight" value={`${p.dryWeight} kg`} />
        <Stat label="Before weight" value={sheet && `${sheet.pre.weight} kg`} />
        <Stat label="Gain" value={sum.gain == null ? null : `${sum.gain} kg`} warn={sum.alerts.includes('Weight gain')} />
        <Stat label="UF removed" value={sum.started ? `${sum.ufRemoved}/${sum.ufGoal} L` : null} />
        <Stat label="Readings" value={sum.started ? sum.readings : null} warn={sum.due} />
      </div>

      <Before date={date} p={p} pre={sheet?.pre} onDone={reload} />
      {sheet && <During date={date} p={p} chair={s.chair} machine={machine} sheet={sheet} due={sum.due} onDone={reload} />}
      {sheet && <After date={date} p={p} sheet={sheet} onDone={reload} />}
    </>
  )
}

function Before({ date, p, pre, onDone }) {
  const [weight, setWeight] = useState('')
  const { onSubmit, error, busy } = useSubmit((f) => startTreatment(date, p.id, fields(f)), onDone)
  const gain = weight ? Math.round((weight - p.dryWeight) * 10) / 10 : null

  return (
    <section className="card">
      <h2 className="step"><span className="step-no">1</span>Before treatment</h2>
      {pre ? (
        <dl>
          <dt>Weight</dt><dd>{pre.weight} kg</dd>
          <dt>BP · pulse</dt><dd><span className={off(pre, 'sys', 'dia')}>{pre.sys}/{pre.dia}</span> · <span className={off(pre, 'pulse')}>{pre.pulse} bpm</span></dd>
          <dt>Temperature</dt><dd className={off(pre, 'temp')}>{pre.temp} °C</dd>
          <dt>Access</dt><dd>{pre.access}</dd>
          <dt>Prescription</dt><dd>{pre.dialyzer} · {pre.qb} mL/min · {pre.hours} hrs</dd>
          <dt>Heparin</dt><dd>{pre.heparinBolus ?? '–'} IU bolus · {pre.heparinRate ?? '–'} IU/hr</dd>
          <dt>UF goal</dt><dd>{pre.ufGoal} L</dd>
          <dt>Checked by</dt><dd>{pre.by}, {clock(pre.at)}</dd>
        </dl>
      ) : date > todayISO() ? <p className="muted">Opens on the session day.</p> : (
        <form className="form" onSubmit={onSubmit}>
          <fieldset>
            <label>Weight (kg)<input name="weight" type="number" step="0.1" inputMode="decimal" required value={weight} onChange={(e) => setWeight(e.target.value)} /></label>
            <label>Systolic BP<input name="sys" type="number" inputMode="numeric" required /></label>
            <label>Diastolic BP<input name="dia" type="number" inputMode="numeric" required /></label>
            <label>Pulse (bpm)<input name="pulse" type="number" inputMode="numeric" required /></label>
            <label>Temperature (°C)<input name="temp" type="number" step="0.1" inputMode="decimal" required /></label>
          </fieldset>
          {gain != null && (
            <p className={gain > (p.dryWeight * MAX_GAIN_PCT) / 100 ? 'note' : 'muted'}>
              {gain} kg above dry weight ({p.dryWeight} kg){gain > (p.dryWeight * MAX_GAIN_PCT) / 100 && `, more than ${MAX_GAIN_PCT}%`}.
            </p>
          )}
          <fieldset>
            <label>Access check
              <select name="access" required defaultValue="">
                <option value="" disabled>Choose…</option>
                {ACCESS_CHECKS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>
            <label>Dialyzer<input name="dialyzer" defaultValue={p.dialyzer} /></label>
            <label>Blood flow (mL/min)<input name="qb" type="number" defaultValue={p.bloodFlow} required /></label>
            <label>Duration (hrs)<input name="hours" type="number" step="0.5" defaultValue={p.hours} required /></label>
            <label>Heparin bolus (IU)<input name="heparinBolus" type="number" /></label>
            <label>Heparin per hour (IU)<input name="heparinRate" type="number" /></label>
            <label>UF goal (L)<input name="ufGoal" type="number" step="0.1" placeholder={gain > 0 ? `${gain} (weight gain)` : ''} /></label>
          </fieldset>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="row">
            <button className="btn" disabled={busy}>{busy ? 'Starting…' : 'Start treatment'}</button>
            <span className="fine">Marks the patient on machine.</span>
          </div>
        </form>
      )}
    </section>
  )
}

function During({ date, p, chair, machine, sheet, due, onDone }) {
  const [open, setOpen] = useState(false)
  const [photo, setPhoto] = useState('')
  const close = () => { setOpen(false); setPhoto('') }
  const { onSubmit, error, busy } = useSubmit((f) => addReading(date, p.id, { ...fields(f), photo }), () => { close(); onDone() })
  const prev = sheet.readings.at(-1) ?? { qb: sheet.pre.qb, qd: 500, cond: 14, uf: 0 }
  const td = (r, k) => <td className={off(r, k)}>{r[k] ?? '–'}</td>

  return (
    <section className="card">
      <div className="row-between">
        <h2 className="step"><span className="step-no">2</span>During treatment</h2>
        {!sheet.post && !open && <button className="btn no-print" onClick={() => setOpen(true)}><Plus aria-hidden /> Log machine reading</button>}
      </div>
      {due && !open && <p className="note">More than {READING_EVERY_MIN} minutes since the last reading.</p>}

      {open && (
        <form className="machine-panel no-print" onSubmit={onSubmit}>
          <div className="row-between">
            <strong>Fresenius {machine} · chair {chair}</strong>
            <span className="pill plain">Machine link: manual entry</span>
          </div>
          <p className="fine">Copy the numbers on the machine screen. Fields start at the last reading, so change only what moved.</p>
          <div className="readout">
            <label>Blood flow<input name="qb" type="number" defaultValue={prev.qb} required /><small>mL/min</small></label>
            <label>Dialysate flow<input name="qd" type="number" defaultValue={prev.qd} /><small>mL/min</small></label>
            <label>Venous pressure<input name="vp" type="number" defaultValue={prev.vp} /><small>mmHg</small></label>
            <label>Arterial pressure<input name="ap" type="number" defaultValue={prev.ap} /><small>mmHg</small></label>
            <label>TMP<input name="tmp" type="number" defaultValue={prev.tmp} /><small>mmHg</small></label>
            <label>UF removed<input name="uf" type="number" step="0.01" defaultValue={prev.uf} required /><small>L</small></label>
            <label>Conductivity<input name="cond" type="number" step="0.1" defaultValue={prev.cond} /><small>mS/cm</small></label>
          </div>
          <div className="readout">
            <label>Systolic BP<input name="sys" type="number" inputMode="numeric" required /><small>mmHg</small></label>
            <label>Diastolic BP<input name="dia" type="number" inputMode="numeric" required /><small>mmHg</small></label>
            <label>Pulse<input name="pulse" type="number" inputMode="numeric" required /><small>bpm</small></label>
          </div>
          <div className="photo-row">
            <label className="btn ghost photo-btn">
              <Camera aria-hidden /> {photo ? 'Retake photo' : 'Photo of the screen'}
              <input type="file" accept="image/*" capture="environment" className="sr-only"
                onChange={(e) => { const f = e.target.files[0]; setPhoto(f ? URL.createObjectURL(f) : '') }} />
            </label>
            {photo ? <img className="shot" src={photo} alt="Machine screen" /> : <span className="fine">Optional. Kept with the reading as proof.</span>}
          </div>
          <label>Note<input name="note" maxLength={300} placeholder="Optional, e.g. UF paused, saline given" /></label>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="row">
            <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save reading'}</button>
            <button type="button" className="btn ghost" onClick={close}>Cancel</button>
          </div>
        </form>
      )}

      {sheet.readings.length === 0 ? <p className="muted">No readings yet. Log one every {READING_EVERY_MIN} minutes.</p> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Time</th><th>BP</th><th>Pulse</th><th>Qb</th><th>Qd</th><th>VP</th><th>AP</th><th>TMP</th><th>UF (L)</th><th>Cond.</th><th>Entered by</th><th>Note</th></tr>
            </thead>
            <tbody>
              {sheet.readings.map((r) => (
                <tr key={r.at}>
                  <td>{clock(r.at)}</td>
                  <td className={off(r, 'sys', 'dia')}>{r.sys}/{r.dia}</td>
                  {td(r, 'pulse')}{td(r, 'qb')}{td(r, 'qd')}{td(r, 'vp')}{td(r, 'ap')}{td(r, 'tmp')}{td(r, 'uf')}{td(r, 'cond')}
                  <td>{r.by}{r.photo && <> · <a href={r.photo} target="_blank" rel="noreferrer">photo</a></>}</td>
                  <td className="wrap">{r.note || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function After({ date, p, sheet, onDone }) {
  const { onSubmit, error, busy } = useSubmit(
    (f) => finishTreatment(date, p.id, { ...fields(f), complications: new FormData(f).getAll('complications') }), onDone)
  const post = sheet.post

  return (
    <section className="card">
      <h2 className="step"><span className="step-no">3</span>After treatment</h2>
      {post ? (
        <div className="row-between">
          <dl>
            <dt>Weight</dt><dd>{post.weight} kg ({Math.round((sheet.pre.weight - post.weight) * 10) / 10} kg off)</dd>
            <dt>BP · pulse</dt><dd><span className={off(post, 'sys', 'dia')}>{post.sys}/{post.dia}</span> · <span className={off(post, 'pulse')}>{post.pulse} bpm</span></dd>
            <dt>UF removed</dt><dd>{post.uf} L of {sheet.pre.ufGoal} L</dd>
            <dt>Complications</dt><dd className={post.complications.length ? 'warn' : ''}>{post.complications.join(', ') || 'None'}</dd>
            {post.notes && <><dt>Notes</dt><dd>{post.notes}</dd></>}
            <dt>Checked by</dt><dd>{post.by}, {clock(post.at)}</dd>
          </dl>
          <Link className="btn ghost no-print" to="/app/billing"><ReceiptText aria-hidden /> Go to billing</Link>
        </div>
      ) : (
        <form className="form" onSubmit={onSubmit}>
          <fieldset>
            <label>Weight (kg)<input name="weight" type="number" step="0.1" inputMode="decimal" required /></label>
            <label>Systolic BP<input name="sys" type="number" inputMode="numeric" required /></label>
            <label>Diastolic BP<input name="dia" type="number" inputMode="numeric" required /></label>
            <label>Pulse (bpm)<input name="pulse" type="number" inputMode="numeric" required /></label>
            <label>UF removed (L)<input name="uf" type="number" step="0.01" defaultValue={sheet.readings.at(-1)?.uf} required /></label>
          </fieldset>
          <fieldset className="checks">
            <legend>Complications</legend>
            {COMPLICATIONS.map((c) => <label key={c} className="check"><input type="checkbox" name="complications" value={c} />{c}</label>)}
          </fieldset>
          <label>Notes<textarea name="notes" rows={3} maxLength={1000} /></label>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="row">
            <button className="btn" disabled={busy}><CircleCheck aria-hidden /> {busy ? 'Finishing…' : 'Finish treatment'}</button>
            <span className="fine">Marks the session done and sends it to billing.</span>
          </div>
        </form>
      )}
    </section>
  )
}
