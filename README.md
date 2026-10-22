# WEI Renal Care Clinic — POS / CRM / Scheduler / Patient DB

Mock-up for a dialysis center. No database yet; all data is fake.

```
npm install
npm run dev
```

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
| 4 | POS & Billing + PhilHealth Claims | Per-session ledger split by payer: PhilHealth package vs. patient-paid add-on items, each line with cost and price so the clinic's margin is recorded. Receipts, 156-session counter, claim status. Billing consumes inventory (stock-out) |
| 5 | Reports, Exports, CRM | Analytics: PhilHealth vs. out-of-pocket revenue, profit per patient / item / month, claims aging, stock usage. Export any table to CSV (opens in Excel). Follow-ups + automated emails via Resend (server-side only) |
| 6 | Payroll | Staff records, shifts worked (from the scheduler), pay with SSS / PhilHealth / Pag-IBIG / withholding tax, payslips, export |
| 7 | Patient portal | Patients sign in online to view their own records: schedule, labs, PhilHealth sessions left, receipts. Needs the real backend first; the server must limit each patient to their own record |

Bookkeeping rule for phase 4: every session produces ledger lines `{ payer: 'PhilHealth' | 'Patient', item, qty, unitPrice, unitCost }`.
Revenue, PhilHealth receivables and profit are all sums over those lines, so reports and exports in phase 5 need no extra data.

## PhilHealth rates used

- Hemodialysis: ₱6,350/session, up to 156 sessions/year (Circular 2024-0023)
- PD Z Benefit (adult CAPD): ₱389,640–₱510,140/year (Circular 2024-0036)
- PD exit-site/peritonitis: ₱7,300/episode, max 4/year

Verify against the current circulars at philhealth.gov.ph before launch.
