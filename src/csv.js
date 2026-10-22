// CSV opens in Excel and Google Sheets; no library needed.
// Text starting with = + - @ is prefixed with ' so Excel won't run it as a formula.
const cell = (v) => {
  let s = v == null ? '' : String(v)
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
}

export function toCSV(rows) {
  if (!rows.length) return ''
  const keys = Object.keys(rows[0])
  return [keys, ...rows.map((r) => keys.map((k) => r[k]))].map((r) => r.map(cell).join(',')).join('\r\n')
}

export function downloadCSV(filename, rows) {
  // BOM so Excel reads ₱ and ñ as UTF-8
  const url = URL.createObjectURL(new Blob(['﻿' + toCSV(rows)], { type: 'text/csv;charset=utf-8' }))
  Object.assign(document.createElement('a'), { href: url, download: filename }).click()
  URL.revokeObjectURL(url)
}
