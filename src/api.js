// The only door to data. Every screen calls these functions, so plugging in a
// backend means rewriting these bodies as fetch() calls; components don't change.
import { useEffect, useState } from 'react'
import {
  packages, inventory, patients, bookings, SHIFTS, DAYS, ISOLATION_CHAIRS, CHAIRS,
  SESSION_KIT, ADDONS, SELF_PAY_RATE, CLAIM_STATUSES, PHILHEALTH_SESSIONS_PER_YEAR,
} from './data.js'

const mock = (value) => new Promise((r) => setTimeout(() => r(structuredClone(value)), 150))
const fail = (msg) => Promise.reject(new Error(msg))

export const getPackages = () => mock(packages)

export const todayISO = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local time
const weekday = (date) => new Date(date + 'T00:00').getDay()
export function addDays(date, days) {
  const d = new Date(date + 'T00:00')
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-CA')
}
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 864e5)

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

// ---- Billing ledger ----
// Every bill writes lines { payer, item, sku, qty, unitPrice, unitCost }. Revenue, PhilHealth
// receivables and profit are sums over these lines; nothing else is stored.
// unitCost = consumables only. Staff and overhead come from payroll/expenses later.
const ledger = []
let lastReceipt = 1000
export const PAY_METHODS = ['Cash', 'GCash', 'Card']
const HD_RATE = packages.find((p) => p.id === 'hd').rate
const stockItem = (sku) => inventory.find((i) => i.sku === sku)
const kitFor = (p) => [p.dialyzer?.includes('F10') ? 'DLZ-F10' : 'DLZ-F8', ...SESSION_KIT]
const isBilled = (date, patientId) => ledger.some((l) => l.date === date && l.patientId === patientId && l.session)
const sum = (lines, f = (l) => l.qty * l.unitPrice) => lines.reduce((t, l) => t + f(l), 0)
const cost = (l) => l.qty * l.unitCost
// Denied PhilHealth claims earned nothing; they're reported separately, not as revenue.
const earned = (l) => l.claim !== 'Denied'

function sessionLines(p, addOns) {
  const unitCost = sum(kitFor(p).map((sku) => ({ qty: 1, unitPrice: stockItem(sku).unitCost })))
  const lines = [p.philhealthUsed < PHILHEALTH_SESSIONS_PER_YEAR
    ? { payer: 'PhilHealth', item: 'HD session package', qty: 1, unitPrice: HD_RATE, unitCost, session: true, claim: 'Pending' }
    : { payer: 'Patient', item: 'HD session (self-pay)', qty: 1, unitPrice: SELF_PAY_RATE, unitCost, session: true }]
  for (const { id, qty } of addOns) {
    const a = ADDONS.find((a) => a.id === id)
    lines.push({ payer: 'Patient', item: a.name, sku: a.sku, qty, unitPrice: a.price, unitCost: a.sku ? stockItem(a.sku).unitCost : a.cost })
  }
  return lines
}

function writeBill(p, date, lines, method) {
  const receipt = `OR-${++lastReceipt}`
  lines.forEach((l, i) => ledger.push({ ...l, id: `${receipt}-${i + 1}`, receipt, date, patientId: p.id, method }))
  return receipt
}

export function getBilling(date) {
  return mock({
    toBill: daySessions(date).filter((s) => s.status === 'Done' && !isBilled(date, s.patientId)),
    receipts: [...new Set(ledger.filter((l) => l.date === date).map((l) => l.receipt))].map(receiptOf).reverse(),
    addOns: ADDONS,
  })
}

function receiptOf(no) {
  const lines = ledger.filter((l) => l.receipt === no)
  const p = patients.find((p) => p.id === lines[0].patientId)
  return { no, date: lines[0].date, method: lines[0].method, patient: p.name, philhealthPin: p.philhealthPin, lines,
    philhealth: sum(lines.filter((l) => l.payer === 'PhilHealth')), patientPays: sum(lines.filter((l) => l.payer === 'Patient')) }
}

// Bills one finished session: package line (PhilHealth, or self-pay past the cap) + patient-paid add-ons.
// Takes the session kit and add-ons out of inventory.
export function billSession({ date, patientId, addOns = [], method = 'Cash' }) {
  const p = patients.find((p) => p.id === Number(patientId))
  if (!p) return fail('Patient not found.')
  if (!daySessions(date).some((s) => s.patientId === p.id && s.status === 'Done')) return fail(`${p.name} has no finished session on ${date}.`)
  if (isBilled(date, p.id)) return fail(`${p.name}'s session on ${date} is already billed.`)
  if (!PAY_METHODS.includes(method)) return fail('Pick a payment method.')
  addOns = addOns.filter((a) => a.qty > 0)
  if (addOns.some((a) => !ADDONS.some((x) => x.id === a.id) || !Number.isInteger(a.qty) || a.qty > 20)) return fail('Check the add-on quantities.')

  const lines = sessionLines(p, addOns)
  const need = {}
  for (const sku of kitFor(p)) need[sku] = (need[sku] ?? 0) + 1
  for (const l of lines) if (l.sku) need[l.sku] = (need[l.sku] ?? 0) + l.qty
  const short = Object.entries(need).find(([sku, qty]) => stockItem(sku).stock < qty)
  if (short) return fail(`Not enough ${stockItem(short[0]).name} in stock (${stockItem(short[0]).stock} left). Update inventory first.`)

  for (const [sku, qty] of Object.entries(need)) stockItem(sku).stock -= qty
  if (lines[0].payer === 'PhilHealth') p.philhealthUsed++
  return mock(receiptOf(writeBill(p, date, lines, method)))
}

// ---- PhilHealth claims ----
export function getClaims({ status = '' } = {}) {
  const today = todayISO()
  return mock(ledger
    .filter((l) => l.payer === 'PhilHealth' && (!status || l.claim === status))
    .map((l) => {
      const p = patients.find((p) => p.id === l.patientId)
      return { id: l.id, date: l.date, receipt: l.receipt, patient: p.name, philhealthPin: p.philhealthPin, amount: l.qty * l.unitPrice, claim: l.claim, ageDays: daysBetween(l.date, today) }
    })
    .sort((a, b) => b.date.localeCompare(a.date)))
}

export function setClaimStatus(id, claim) {
  const l = ledger.find((l) => l.id === id && l.payer === 'PhilHealth')
  if (!l || !CLAIM_STATUSES.includes(claim)) return fail('Unknown claim or status.')
  l.claim = claim
  return mock(l)
}

// ---- Reports ----
function group(lines, key) {
  const out = {}
  for (const l of lines) (out[key(l)] ??= []).push(l)
  return Object.entries(out)
}

const money = (lines) => {
  const ok = lines.filter(earned)
  const philhealth = sum(ok.filter((l) => l.payer === 'PhilHealth'))
  const patientPaid = sum(ok.filter((l) => l.payer === 'Patient'))
  const c = sum(ok, cost)
  return { philhealth, patientPaid, revenue: philhealth + patientPaid, cost: c, profit: philhealth + patientPaid - c }
}

export function getReport(month) {
  const lines = ledger.filter((l) => l.date.startsWith(month))
  const name = (id) => patients.find((p) => p.id === id).name
  const claims = Object.fromEntries(CLAIM_STATUSES.map((s) => [s, sum(lines.filter((l) => l.claim === s))]))
  return mock({
    month,
    totals: { ...money(lines), sessions: lines.filter((l) => l.session).length },
    claims,
    byPatient: group(lines, (l) => l.patientId)
      .map(([id, ls]) => ({ patient: name(Number(id)), sessions: ls.filter((l) => l.session).length, ...money(ls) }))
      .sort((a, b) => b.revenue - a.revenue),
    byItem: group(lines, (l) => `${l.item}|${l.payer}`)
      .map(([, ls]) => ({ item: ls[0].item, payer: ls[0].payer, qty: sum(ls, (l) => l.qty), ...money(ls) }))
      .sort((a, b) => b.revenue - a.revenue),
    ledger: lines.map((l) => ({ date: l.date, receipt: l.receipt, patient: name(l.patientId), payer: l.payer, item: l.item,
      qty: l.qty, unitPrice: l.unitPrice, unitCost: l.unitCost, total: l.qty * l.unitPrice, claim: l.claim ?? '', method: l.method })),
  })
}

// ---- CRM: follow-ups + email ----
function followUps() {
  const today = todayISO(), tomorrow = addDays(today, 1)
  const out = []
  const add = (p, kind, reason) => out.push({ patientId: p.id, patient: p.name, email: p.email, kind, reason })
  const byId = (id) => patients.find((p) => p.id === id)
  for (const s of daySessions(tomorrow).filter((s) => !freesChair(s))) add(byId(s.patientId), 'reminder', `Session tomorrow ${s.time}, chair ${s.chair}`)
  for (const b of bookings.filter((b) => b.status === 'No-show' && daysBetween(b.date, today) <= 14 && b.date <= today)) add(byId(b.patientId), 'noshow', `Missed session on ${b.date}`)
  for (const p of patients.filter((p) => p.philhealthUsed >= 140)) add(p, 'cap', `${PHILHEALTH_SESSIONS_PER_YEAR - p.philhealthUsed} PhilHealth sessions left`)
  for (const p of patients) {
    const l = p.labs[0]
    if (l && (l.hgb < 10 || l.potassium > 5.5 || l.albumin < 3.5 || l.ktv < 1.2)) add(p, 'labs', `Labs out of range (${l.date})`)
  }
  return out
}

export const getFollowUps = () => mock(followUps())

// Emails never include lab values or diagnoses; patients see details in person (or the portal later).
function emailFor(p, kind) {
  const first = p.name.split(' ')[0]
  const sign = '\n\nWEI Renal Care Clinic'
  const s = daySessions(addDays(todayISO(), 1)).find((s) => s.patientId === p.id)
  return {
    reminder: ['Reminder: your dialysis session tomorrow', `Hi ${first}, this is a reminder of your session tomorrow at ${s?.time}. Please arrive 15 minutes early.`],
    noshow: ['We missed you at your dialysis session', `Hi ${first}, we missed you at your last session. Please call us so we can rebook you as soon as possible.`],
    cap: ['Your PhilHealth dialysis sessions', `Hi ${first}, you have ${PHILHEALTH_SESSIONS_PER_YEAR - p.philhealthUsed} PhilHealth-covered sessions left this year. Our billing team can walk you through your options.`],
    labs: ['Please see us about your latest results', `Hi ${first}, your doctor would like to discuss your latest lab results at your next session.`],
  }[kind].map((t, i) => (i ? t + sign : t))
}

const outbox = []

// ponytail: mock send. Real version: POST /api/emails; the server sends with Resend using
// RESEND_API_KEY. Never call Resend from the browser, the key would leak.
export function sendEmail({ patientId, kind }) {
  const p = patients.find((p) => p.id === Number(patientId))
  if (!p?.email) return fail('This patient has no email address on file.')
  if (!followUps().some((f) => f.patientId === p.id && f.kind === kind)) return fail('No follow-up of that kind for this patient.')
  const [subject, body] = emailFor(p, kind)
  const msg = { id: outbox.length + 1, patientId: p.id, kind, to: p.email, patient: p.name, subject, body, sentAt: new Date().toISOString(), status: 'Sent (mock)' }
  outbox.unshift(msg)
  return mock(msg)
}

export const getOutbox = () => mock(outbox)

// Demo history: bill the last 30 days of finished sessions. Not part of the real API.
;(function seedLedger() {
  const today = todayISO()
  for (let d = addDays(today, -30); d < today; d = addDays(d, 1)) {
    for (const s of daySessions(d).filter((s) => s.status === 'Done')) {
      const p = patients.find((p) => p.id === s.patientId)
      const addOns = []
      if (p.labs[0]?.hgb < 10.5 && weekday(d) <= 2) addOns.push({ id: 'epo-extra', qty: 1 })
      if (d.endsWith('-01') || d.endsWith('-02')) addOns.push({ id: 'labs', qty: 1 })
      if (p.id % 3 === 0 && weekday(d) === 1) addOns.push({ id: 'iron', qty: 1 })
      const lines = sessionLines(p, addOns)
      const age = daysBetween(d, today)
      if (lines[0].claim) lines[0].claim = age > 21 ? 'Paid' : age > 10 ? 'Submitted' : 'Pending'
      writeBill(p, d, lines, PAY_METHODS[p.id % 3])
    }
  }
})()

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
