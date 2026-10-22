// The only door to data. Every screen calls these functions, so plugging in a
// backend means rewriting these bodies as fetch() calls; components don't change.
import { useEffect, useState } from 'react'
import { packages, inventory, sessionsToday, patients, CHAIRS } from './data.js'

const mock = (value) => new Promise((r) => setTimeout(() => r(structuredClone(value)), 150))

export const getPackages = () => mock(packages)

// Server would do this join; sessions only store patientId.
const withPatient = (s) => {
  const p = patients.find((p) => p.id === s.patientId)
  return { ...s, patient: p.name, philhealthUsed: p.philhealthUsed }
}

export const getTodaySessions = () => mock(sessionsToday.map(withPatient))

export function getPatients({ q = '', modality = '', schedule = '' } = {}) {
  const term = q.trim().toLowerCase()
  return mock(patients.filter((p) =>
    (!modality || p.modality === modality) &&
    (!schedule || p.schedule === schedule) &&
    (!term || p.name.toLowerCase().includes(term) || p.philhealthPin.includes(term))))
}

export function getPatient(id) {
  const p = patients.find((p) => p.id === Number(id))
  return p ? mock(p) : Promise.reject(new Error('Patient not found.'))
}

// ponytail: in-memory, lost on refresh. Real version: POST /patients or PUT /patients/:id.
export function savePatient(data) {
  if (!data.name?.trim()) return Promise.reject(new Error('Name is required.'))
  if (data.modality === 'PD') Object.assign(data, { schedule: '', shift: '', dialyzer: '', bloodFlow: null, hours: null })
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

export const getStats = () => mock({
  sessionsToday: sessionsToday.length,
  chairsInUse: sessionsToday.filter((s) => s.status === 'On machine').length,
  chairs: CHAIRS,
  lowStock: inventory.filter((i) => i.stock <= i.reorderAt).length,
  nearCap: sessionsToday.map(withPatient).filter((s) => s.philhealthUsed >= 140).length,
})

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
