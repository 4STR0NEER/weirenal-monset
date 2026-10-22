# Product

WEI Renal Care Clinic: a dialysis center's own system. Public landing page + staff app (patients, scheduler, POS/billing, PhilHealth claims, inventory, CRM, reports; payroll and a patient portal later).

## Platform
web (Vite + React SPA). Mock data today; every screen reads through `src/api.js` so a backend drops in.

## Users
- Nurses at chairside: tablets, quick session-status updates during shifts.
- Front desk / billing: desktop, all day. POS, claims, scheduling.
- Owner / admin: laptop or phone. Overview, reports, profit.
- Doctors: patient profiles and labs.
- Later: patients themselves (portal), viewing only their own record.

## Product purpose
Run a dialysis center around PhilHealth: track the 156 covered HD sessions per patient, bill each session split by payer (PhilHealth package vs. patient-paid add-ons), know the clinic's margin, and keep every chair filled safely.

## Positioning
PhilHealth coverage is the main selling point to patients: "Dialysis, fully covered."

## Operating context
Bright clinic, daytime light, long shifts (06:00–19:00). Staff glance at screens between patients; mistakes cost money (claims) or safety (hepatitis isolation chair, wrong patient).

## Capabilities and constraints
- PhilHealth HD package ₱6,350/session, 156 sessions/year (Circular 2024-0023). PD Z Benefit per Circular 2024-0036.
- Patient data is sensitive (Data Privacy Act RA 10173): no lab values or diagnoses in emails.
- Planned: Resend email (server-side), inbound lab-result emails matched to patients with staff review, role-based access (nurse, front desk, admin, doctor).

## Brand commitments
Light blue gradient + white (temporary until the client's brand lands). Direction chosen by the client: calm clinical — airy, serene, readable.

## Product principles
- Money and safety facts are always visible where the decision happens (sessions left, payer, isolation chair).
- Calm over clever: motion is quiet, short, and never in the way of a repeated task.
- Plain language, Philippine context (₱, PhilHealth PIN, GCash).

## Accessibility & inclusion
WCAG AA contrast, keyboard reachable, visible focus, reduced-motion respected, works at tablet and phone widths. Many patients are seniors: landing copy large and plain.
