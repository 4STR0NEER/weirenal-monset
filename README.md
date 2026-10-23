# WEI Renal Care Clinic — POS / CRM / Scheduler / Patient DB

Mock-up for a dialysis center. No database yet; all data is fake.

```
npm install
npm run dev
```

## Design

Calm clinical, documented in `DESIGN.md`; product context in `PRODUCT.md`. Plain CSS tokens in `src/styles.css`, Motion for component animation, Lucide icons, Tailwind v4 utilities only for the copied Kokonut UI / VengeanceUI components (MIT).

## How the backend plugs in

Every screen reads data through `src/api.js`. `src/data.js` holds the mock records and doubles as the
shape contract. To go live, rewrite the function bodies in `api.js` as `fetch()` calls; pages don't change.
Auth is mocked in `login()` (any email/password works) — replace with a server session (httpOnly cookie).

Patient data falls under the Data Privacy Act (RA 10173): real records need server-side auth, roles,
and an audit log before any patient goes into the system.

## MVP modules

| Phase | Module | Scope |
|---|---|---|
| 1 ✅ | Landing + Auth + Dashboard shell | Public page with PhilHealth packages, staff sign-in, sidebar, overview, inventory lookup |
| 2 ✅ | Patients | Searchable list, profile (PhilHealth sessions left, prescription, access, hepatitis flags, labs), add/edit form |
| 3 ✅ | Scheduler | Daily chair × shift grid, recurring MWF / TThS slots, book / move / make-up sessions, status (done, no-show, cancelled), isolation-chair and double-booking checks |
| 3b ✅ | Treatment floor + sheets | 12-chair board per shift (machine model, UF progress, reading due, out-of-range alerts). Per-session sheet: before (weight, BP, access, heparin, UF goal), machine readings during, after (weight, complications). Finishing a sheet marks the session Done for billing. Printable |
| 3b ✅ | Machine readings (semi-manual) | Nurse copies the Fresenius screen into a form prefilled from the last reading, optional photo of the screen. Stored as `{ source: 'manual' }`; automatic capture (scoped at the site visit) writes the same shape |
| 3b ✅ | Water room | Check before every shift (chlorine, RO conductivity, hardness, feed pressure) with live pass/fail; failed checks and retests all kept; scheduled cultures, endotoxin, disinfection, filters with due dates; CSV export for inspections |
| 4 ✅ | POS & Billing + PhilHealth Claims | Per-session ledger split by payer: PhilHealth package vs. patient-paid add-on items, each line with cost and price so the clinic's margin is recorded. Receipts, 156-session counter, claim status. Billing consumes inventory (stock-out) |
| 5 ✅ | Reports, Exports, CRM | Analytics: PhilHealth vs. out-of-pocket revenue, profit per patient / item / month, claims aging, stock usage. Export any table to CSV (opens in Excel). Follow-ups + automated emails via Resend (server-side only) |
| — | Roles | Nurse, front desk, admin, doctor: each sees only their modules (doctors: patient profiles and labs; admin: everything). Arrives with real auth |
| — | Lab inbox | Labs email results; Resend inbound → server parses the email/PDF → matches patient by PhilHealth PIN + name + birth date → staff confirm in a review queue → appended to the patient's labs. Never auto-written without review |
| 6 ✅ | Staff, duty roster, payroll | Staff records with PRC license expiry warnings. Duty roster: regular days + shift per person, mark absent, add extra shifts, nurse-to-patient check per shift. Payroll by month from shifts worked: SSS, PhilHealth, Pag-IBIG, BIR withholding (employee and employer shares), printable payslips, CSV export |
| 7 | Patient portal | Patients sign in online to view their own records: schedule, labs, PhilHealth sessions left, receipts. Needs the real backend first; the server must limit each patient to their own record |

Bookkeeping rule: every session produces ledger lines `{ payer: 'PhilHealth' | 'Patient', item, qty, unitPrice, unitCost }`.
Revenue, PhilHealth receivables and profit are all sums over those lines, so reports and exports in phase 5 need no extra data.

## PhilHealth rates used

- Hemodialysis: ₱6,350/session, up to 156 sessions/year (Circular 2024-0023)
- PD Z Benefit (adult CAPD): ₱389,640–₱510,140/year (Circular 2024-0036)
- PD exit-site/peritonitis: ₱7,300/episode, max 4/year

Verify against the current circulars at philhealth.gov.ph before launch.

## Placeholders to replace with the clinic's real numbers

- `inventory[].unitCost`, `ADDONS` prices/costs and `SELF_PAY_RATE` in `src/data.js`
- `VITAL_LIMITS`, `MAX_GAIN_PCT`, `READING_EVERY_MIN`: medical director signs off
- `WATER_LIMITS`, `WATER_TASKS`: confirm with the clinic's water system and DOH requirements
- `MACHINES`: which chairs have the two 5008S units
- `staff[].rate`, `PATIENTS_PER_NURSE`, `PAYROLL_RATES` (2025 tables): the clinic's accountant confirms; semi-monthly cutoffs, overtime, holiday pay and 13th month once we know how they pay today
- Profit is gross margin on consumables only; staff and overhead arrive with payroll (phase 6)
- Peritoneal dialysis (Z Benefit) billing is not in the POS yet; HD sessions only
