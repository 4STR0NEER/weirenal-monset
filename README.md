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
| 3 | Scheduler | Chairs × shifts (MWF / TThS), recurring sessions, no-shows |
| 4 | POS & Billing + PhilHealth Claims | Per-session billing, PhilHealth deduction, 156-session counter, claim status |
| 5 | CRM & Reminders + Reports | Follow-ups, automated emails via Resend (server-side only), reports |
| 6 | Patient portal | Patients sign in online to view their own records: schedule, labs, PhilHealth sessions left, receipts. Needs the real backend first; the server must limit each patient to their own record |

Inventory grows from lookup to stock-in/stock-out once billing consumes supplies (phase 4).

## PhilHealth rates used

- Hemodialysis: ₱6,350/session, up to 156 sessions/year (Circular 2024-0023)
- PD Z Benefit (adult CAPD): ₱389,640–₱510,140/year (Circular 2024-0036)
- PD exit-site/peritonitis: ₱7,300/episode, max 4/year

Verify against the current circulars at philhealth.gov.ph before launch.
