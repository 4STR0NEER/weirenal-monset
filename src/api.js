// The only door to data. Every screen calls these functions, so plugging in a
// backend means rewriting these bodies as fetch() calls; components don't change.
import { useEffect, useState } from 'react'
import { packages, inventory, patients, bookings, SHIFTS, DAYS, ISOLATION_CHAIRS, CHAIRS } from './data.js'

const mock = (value) => new Promise((r) => setTimeout(() => r(structuredClone(value)), 150))
const fail = (msg) => Promise.reject(new Error(msg))

export const getPackages = () => mock(packages)

export const todayISO = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local time
const weekday = (date) => new Date(date + 'T00:00').getDay()

// ponytail: status guessed from the clock when nobody set one. Real version: nurses check
// patients on/off the machine and that's stored.
function autoStatus(date, shift, hours) {
  const start = new Date(`${date}T${SHIFTS[shift]}`)
  const now = Date.now()
  if (now < start) return 'Scheduled'
  return now < +start + (hours ?? 4) * 3600e3 ? 'On machine' : 'Done'
}

// Server would do this join: recurring slots + per-date bookings + patient fields.
function daySessions(date) {
  const day = patients
    .filter((p) => p.modality === 'HD' && DAYS[p.schedule]?.includes(weekday(date)))
    .map((p) => ({ date, patientId: p.id, chair: p.chair, shift: p.shift, status: null }))
  for (const b of bookings.filter((b) => b.date === date)) {
    const i = day.findIndex((s) => s.patientId === b.patientId)
    if (i >= 0) day[i] = { ...day[i], ...b }
    else day.push({ status: null, ...b })
  }
  return day
    .map((s) => {
      const p = patients.find((p) => p.id === s.patientId)
      return { ...s, patient: p.name, philhealthUsed: p.philhealthUsed, hbsag: p.hbsag, time: SHIFTS[s.shift],
        status: s.status ?? autoStatus(date, s.shift, p.hours) }
    })
    .sort((a, b) => a.time.localeCompare(b.time) || a.chair - b.chair)
}

const freesChair = (s) => s.status === 'Cancelled' || s.status === 'No-show'

export const getTodaySessions = () => mock(daySessions(todayISO()))

export const getSchedule = (date) => mock({ date, closed: weekday(date) === 0, sessions: daySessions(date) })

// Book, move (same patient, new chair/shift), or set status for one patient on one date.
export function saveBooking({ date, patientId, chair, shift, status = null }) {
  const p = patients.find((p) => p.id === Number(patientId))
  if (!p || p.modality !== 'HD') return fail('Pick a hemodialysis patient.')
  if (weekday(date) === 0) return fail('The clinic is closed on Sundays.')
  if (!SHIFTS[shift] || !(chair >= 1 && chair <= CHAIRS)) return fail('Pick a valid chair and shift.')
  const b = { date, patientId: p.id, chair: Number(chair), shift, status }
  if (!freesChair(b)) {
    if ((p.hbsag === 'Positive') !== ISOLATION_CHAIRS.includes(b.chair))
      return fail(p.hbsag === 'Positive' ? `${p.name} is HBsAg-positive and must use an isolation chair.` : `Chair ${b.chair} is reserved for HBsAg-positive patients.`)
    const taken = daySessions(date).find((s) => s.patientId !== p.id && s.chair === b.chair && s.shift === shift && !freesChair(s))
    if (taken) return fail(`Chair ${b.chair} (${shift}) is already taken by ${taken.patient}.`)
  }
  const i = bookings.findIndex((x) => x.date === date && x.patientId === p.id)
  if (i >= 0) bookings[i] = b
  else bookings.push(b)
  return mock(b)
}

export function getPatients({ q = '', modality = '', schedule = '' } = {}) {
  const term = q.trim().toLowerCase()
  return mock(patients.filter((p) =>
    (!modality || p.modality === modality) &&
    (!schedule || p.schedule === schedule) &&
    (!term || p.name.toLowerCase().includes(term) || p.philhealthPin.includes(term))))
}

export function getPatient(id) {
  const p = patients.find((p) => p.id === Number(id))
  if (!p) return fail('Patient not found.')
  return mock({ ...p, noShows: bookings.filter((b) => b.patientId === p.id && b.status === 'No-show').map((b) => b.date) })
}

// ponytail: in-memory, lost on refresh. Real version: POST /patients or PUT /patients/:id.
export function savePatient(data) {
  if (!data.name?.trim()) return fail('Name is required.')
  delete data.noShows // derived, not stored
  if (data.modality === 'PD') Object.assign(data, { schedule: '', shift: '', chair: null, dialyzer: '', bloodFlow: null, hours: null })
  else {
    if ((data.hbsag === 'Positive') !== ISOLATION_CHAIRS.includes(data.chair))
      return fail(data.hbsag === 'Positive' ? 'HBsAg-positive patients need an isolation chair.' : `Chair ${data.chair} is reserved for HBsAg-positive patients.`)
    const clash = patients.find((o) => o.id !== data.id && o.modality === 'HD' && o.schedule === data.schedule && o.shift === data.shift && o.chair === data.chair)
    if (clash) return fail(`Chair ${data.chair} (${data.schedule} ${data.shift}) is already ${clash.name}'s regular slot.`)
  }
  const i = patients.findIndex((p) => p.id === data.id)
  const used = (prev) => (data.modality === 'PD' ? null : prev ?? 0) // HD session counter only
  if (i >= 0) {
    patients[i] = { ...patients[i], ...data, philhealthUsed: used(patients[i].philhealthUsed) }
    return mock(patients[i])
  }
  const p = { labs: [], ...data, philhealthUsed: used(null), id: Math.max(0, ...patients.map((p) => p.id)) + 1 }
  patients.push(p)
  return mock(p)
}

export function getInventory({ q = '', category = '' } = {}) {
  const term = q.trim().toLowerCase()
  return mock(inventory.filter((i) =>
    (!category || i.category === category) &&
    (!term || i.name.toLowerCase().includes(term) || i.sku.toLowerCase().includes(term))))
}

export function getStats() {
  const today = daySessions(todayISO()).filter((s) => !freesChair(s))
  return mock({
    sessionsToday: today.length,
    chairsInUse: today.filter((s) => s.status === 'On machine').length,
    chairs: CHAIRS,
    lowStock: inventory.filter((i) => i.stock <= i.reorderAt).length,
    nearCap: today.filter((s) => s.philhealthUsed >= 140).length,
  })
}

// ponytail: mock auth, any non-empty email/password passes and the user lives in
// sessionStorage. Real version: POST /auth/login, httpOnly session cookie, roles from server.
export async function login(email, password) {
  if (!email.trim() || !password) throw new Error('Enter your email and password.')
  const user = { email, name: email.split('@')[0], role: 'staff' }
  sessionStorage.setItem('user', JSON.stringify(user))
  return mock(user)
}

export function currentUser() {
  try { return JSON.parse(sessionStorage.getItem('user')) } catch { return null }
}

export const logout = () => sessionStorage.removeItem('user')

// Loads async data into a component. Re-runs when deps change, ignores stale responses.
export function useLoad(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  useEffect(() => {
    let live = true
    setState((s) => ({ ...s, loading: true }))
    fn().then(
      (data) => live && setState({ data, error: null, loading: false }),
      (error) => live && setState({ data: null, error, loading: false }))
    return () => { live = false }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  return state
}

export const peso = (n) => '₱' + n.toLocaleString('en-PH')

export function age(birthDate) {
  const b = new Date(birthDate), now = new Date()
  return now.getFullYear() - b.getFullYear() - (now < new Date(now.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0)
}
