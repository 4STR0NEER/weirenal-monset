// Self-check for staff, duty roster and payroll: node scripts/check-team.mjs
import assert from 'node:assert/strict'
import * as api from '../src/api.js'

// Deductions, hand-computed from the 2025 tables in PAYROLL_RATES.
let c = api.contributions(20000) // MSC 20,000
assert.deepEqual(c.employee, { sss: 1000, philhealth: 500, pagibig: 200, tax: 0 })
assert.equal(c.net, 18300)
c = api.contributions(40000) // MSC capped at 35,000; taxable 37,050 -> 1,875 + 20% of 3,717
assert.deepEqual(c.employee, { sss: 1750, philhealth: 1000, pagibig: 200, tax: 2618.4 })
assert.equal(c.net, 34431.6)
assert.equal(c.employer.sss, 3530) // 10% of 35,000 + 30 EC
c = api.contributions(8000) // PhilHealth floor 10,000; SSS EC 10 below 15,000
assert.equal(c.employee.philhealth, 250)
assert.equal(c.employer.sss, 810)
assert.equal(api.contributions(0).net, 0)

// Roster: absent / back on duty / extra shift.
let date = api.addDays(api.todayISO(), -7)
while (![1, 3, 5].includes(new Date(date + 'T00:00').getDay())) date = api.addDays(date, -1) // a MWF day
const shiftOf = async (id) => (await api.getRoster(date)).shifts.flatMap((x) => x.staff).find((p) => p.staffId === id)
assert.equal((await shiftOf(2)).status, 'On duty') // Carlo, MWF AM
await api.saveDuty({ date, staffId: 2, status: 'Absent' })
assert.equal((await shiftOf(2)).status, 'Absent')
await api.saveDuty({ date, staffId: 2, status: null })
assert.equal((await shiftOf(2)).status, 'On duty')
await assert.rejects(api.saveDuty({ date, staffId: 2, shift: 'PM', status: 'Extra' }), /already on duty/)
await api.saveDuty({ date, staffId: 3, shift: 'PM', status: 'Extra' }) // Ana works TThS
assert.equal((await shiftOf(3)).shift, 'PM')
await api.saveDuty({ date, staffId: 3, status: 'Absent' }) // cancels the extra shift
assert.equal(await shiftOf(3), undefined)
await assert.rejects(api.saveDuty({ date, staffId: 3, status: 'Absent' }), /isn't on duty/)

// Payroll counts worked shifts only, and an absence moves one shift off pay.
const month = date.slice(0, 7)
const carlo = async () => (await api.getPayroll(month)).rows.find((r) => r.staffId === 2)
const before = await carlo()
await api.saveDuty({ date, staffId: 2, status: 'Absent' })
const after = await carlo()
assert.equal(after.shifts, before.shifts - 1)
assert.equal(after.gross, after.shifts * 1400)
assert.ok(!(await api.getPayroll(month)).rows.some((r) => r.role === 'Nephrologist')) // professional fees

// Staff validation.
await assert.rejects(api.saveStaff({ name: 'X', role: 'Nurse', days: 'MWF', shift: 'AM', license: '' }), /PRC license/)
await assert.rejects(api.saveStaff({ name: 'X', role: 'Chef', days: 'MWF', shift: 'AM' }), /role/)
const s = await api.saveStaff({ name: 'New Aide', role: 'Patient care aide', days: 'MonSat', shift: 'PM', rate: '750' })
assert.equal(s.rate, 750)
console.log('team checks passed')
