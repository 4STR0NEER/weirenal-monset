import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getPatient, savePatient, useLoad } from '../api.js'

const NUMBERS = ['dryWeight', 'bloodFlow', 'hours']

// One form for add (/patients/new) and edit (/patients/:id/edit).
export default function PatientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: p, loading } = useLoad(() => (id ? getPatient(id) : Promise.resolve({ modality: 'HD' })), [id])
  const [modality, setModality] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading || !p) return <p className="muted">Loading…</p>
  const mod = modality ?? p.modality

  async function onSubmit(e) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    for (const k of NUMBERS) data[k] = data[k] ? Number(data[k]) : null
    setBusy(true)
    setError('')
    try {
      const saved = await savePatient(id ? { ...data, id: Number(id) } : data)
      navigate(`/app/patients/${saved.id}`)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <>
      <Link className="back" to={id ? `/app/patients/${id}` : '/app/patients'}>← Back</Link>
      <header className="page-head"><h1>{id ? `Edit ${p.name}` : 'Add patient'}</h1></header>

      <form className="card form" onSubmit={onSubmit}>
        <fieldset>
          <legend>Personal</legend>
          <label>Full name<input name="name" defaultValue={p.name} required /></label>
          <label>Birth date<input name="birthDate" type="date" defaultValue={p.birthDate} required /></label>
          <label>Sex
            <select name="sex" defaultValue={p.sex} required><option value="">–</option><option value="M">Male</option><option value="F">Female</option></select>
          </label>
          <label>Phone<input name="phone" type="tel" defaultValue={p.phone} required /></label>
          <label>Email<input name="email" type="email" defaultValue={p.email} /></label>
          <label>Emergency contact<input name="emergencyContact" defaultValue={p.emergencyContact} placeholder="Name (relation) phone" /></label>
        </fieldset>

        <fieldset>
          <legend>PhilHealth</legend>
          <label>PIN<input name="philhealthPin" defaultValue={p.philhealthPin} required pattern="\d{2}-\d{9}-\d" placeholder="12-345678901-2" title="Format: 12-345678901-2" /></label>
          <label>Membership
            <select name="membership" defaultValue={p.membership}>
              <option>Member</option><option>Dependent</option><option>Senior citizen</option><option>Indigent</option>
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Dialysis</legend>
          <label>Diagnosis<input name="diagnosis" defaultValue={p.diagnosis ?? 'CKD 5 — '} required /></label>
          <label>Modality
            <select name="modality" value={mod} onChange={(e) => setModality(e.target.value)}>
              <option value="HD">Hemodialysis</option><option value="PD">Peritoneal dialysis</option>
            </select>
          </label>
          {mod === 'HD' && <>
            <label>Schedule
              <select name="schedule" defaultValue={p.schedule}><option>MWF</option><option>TThS</option></select>
            </label>
            <label>Shift
              <select name="shift" defaultValue={p.shift}><option>AM</option><option>Mid</option><option>PM</option></select>
            </label>
            <label>Dialyzer<input name="dialyzer" defaultValue={p.dialyzer ?? 'F8 HPS'} /></label>
            <label>Blood flow (mL/min)<input name="bloodFlow" type="number" min="100" max="500" defaultValue={p.bloodFlow ?? 300} /></label>
            <label>Hours per session<input name="hours" type="number" min="2" max="6" step="0.5" defaultValue={p.hours ?? 4} /></label>
          </>}
          <label>Access<input name="access" defaultValue={p.access} placeholder="e.g. AV fistula, left forearm" required /></label>
          <label>Dry weight (kg)<input name="dryWeight" type="number" min="20" max="250" step="0.1" defaultValue={p.dryWeight} /></label>
          <label>HBsAg
            <select name="hbsag" defaultValue={p.hbsag}><option>Negative</option><option>Positive</option><option>Pending</option></select>
          </label>
          <label>Anti-HCV
            <select name="antiHcv" defaultValue={p.antiHcv}><option>Negative</option><option>Positive</option><option>Pending</option></select>
          </label>
        </fieldset>

        <label className="full">Notes<textarea name="notes" rows="3" defaultValue={p.notes} /></label>

        {error && <p className="error" role="alert">{error}</p>}
        <div className="row">
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save patient'}</button>
          <Link className="btn ghost" to={id ? `/app/patients/${id}` : '/app/patients'}>Cancel</Link>
        </div>
      </form>
    </>
  )
}
