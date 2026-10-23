// Self-check for treatment sheets and the water log: node scripts/check-care.mjs
import assert from 'node:assert/strict'
import * as api from '../src/api.js'

const rejects = (p, re) => assert.rejects(p, re)
const today = api.todayISO()
let date = api.addDays(today, -10) // older than the seeded week, so no sheets yet
if (new Date(date + 'T00:00').getDay() === 0) date = api.addDays(date, -1)
const { sessions } = await api.getSchedule(date)
const s = sessions.find((x) => x.status === 'Done')
const pre = { weight: 64, sys: 130, dia: 80, pulse: 76, temp: 36.6, qb: 300, hours: 4, access: 'Good thrill and bruit' }

await rejects(api.addReading(date, s.patientId, { sys: 120, dia: 70, pulse: 80, qb: 300, uf: 1 }), /before-treatment/)
await rejects(api.startTreatment(date, s.patientId, { ...pre, access: 'nope' }), /access/)
await rejects(api.startTreatment(date, s.patientId, { ...pre, sys: 999 }), /systolic/)
await rejects(api.startTreatment(date, s.patientId, { ...pre, weight: '' }), /Fill in weight/)
await api.startTreatment(date, s.patientId, pre)
await rejects(api.startTreatment(date, s.patientId, pre), /already started/)

const r = await api.addReading(date, s.patientId, { sys: 85, dia: 60, pulse: 80, qb: 300, uf: 1.2, photo: 'javascript:alert(1)' })
assert.equal(r.photo, null)
assert.equal(r.source, 'manual')
await rejects(api.addReading(date, s.patientId, { sys: 120, dia: 70, pulse: 80, qb: 300, uf: 0.5 }), /can’t go down/)

let t = await api.getTreatment(date, s.patientId)
assert.ok(t.summary.alerts.includes('Systolic BP'))
assert.equal(t.summary.ufRemoved, 1.2)
await api.finishTreatment(date, s.patientId, { weight: 62, sys: 120, dia: 75, pulse: 78, uf: 2, complications: ['Cramps', 'bogus'] })
t = await api.getTreatment(date, s.patientId)
assert.deepEqual(t.sheet.post.complications, ['Cramps'])
assert.ok(t.summary.finished)
await rejects(api.addReading(date, s.patientId, { sys: 120, dia: 70, pulse: 80, qb: 300, uf: 3 }), /already finished/)

// Water: a failed check stays on the log, the retest becomes the shift's state.
await rejects(api.saveWaterCheck({ date: api.addDays(today, 1), shift: 'AM', chlorine: 0, conductivity: 5, hardness: 0, feedPressure: 40 }), /future/)
const before = (await api.getWaterRoom(date)).shifts.find((x) => x.shift === 'PM').tries
const bad = await api.saveWaterCheck({ date, shift: 'PM', chlorine: 0.2, conductivity: 5, hardness: 0, feedPressure: 40 })
assert.deepEqual(bad.fails, ['Total chlorine'])
await api.saveWaterCheck({ date, shift: 'PM', chlorine: 0.05, conductivity: 5, hardness: 0, feedPressure: 40 })
const room = await api.getWaterRoom(date)
const pm = room.shifts.find((x) => x.shift === 'PM')
assert.equal(pm.check.fails.length, 0)
assert.equal(pm.tries, before + 2)
assert.ok(room.history.some((c) => c.chlorine === 0.2))
assert.ok(room.tasks.find((x) => x.id === 'disinfect').daysLeft < 0) // seeded overdue
await rejects(api.completeWaterTask('culture', { date: today, result: '' }), /Fill in/)
const done = await api.completeWaterTask('culture', { date: today, result: 70 })
assert.equal(done.high, true) // above the action level of 50
assert.equal(done.daysLeft, 30)

const stats = await api.getStats()
assert.ok(Array.isArray(stats.waterDue) && Number.isInteger(stats.readingsDue))
console.log('care checks passed')
