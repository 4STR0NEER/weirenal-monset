// Mock records. Shapes here are the contract the real API should return.
// All patients are fictional.

// Rates per PhilHealth Circulars 2024-0023 (HD) and 2024-0036 (PD Z Benefit).
// Verify against the current circulars before showing to patients.
export const packages = [
  {
    id: 'hd',
    name: 'Hemodialysis Package',
    for: 'CKD Stage 5 members and dependents',
    rate: 6350,
    unit: 'per session',
    cap: 'Up to 156 sessions a year (₱990,600)',
    includes: ['Dialyzer, bloodlines and dialysis kit', 'Anticoagulation and anemia medicines', 'Routine laboratory tests', 'Facility and professional fees'],
    featured: true,
  },
  {
    id: 'pd',
    name: 'Peritoneal Dialysis Z Benefit',
    for: 'Adults on CAPD at home',
    rate: 389640,
    rateMax: 510140,
    unit: 'per year',
    cap: 'Depends on daily PD solution volume',
    includes: ['PD solutions and supplies', 'Monitoring and consults', 'Training for home dialysis'],
  },
  {
    id: 'pd-care',
    name: 'PD Exit-site & Peritonitis Care',
    for: 'Members enrolled in the PD Z Benefit',
    rate: 7300,
    unit: 'per episode',
    cap: 'Up to 4 episodes a year (₱29,200)',
    includes: ['Treatment of exit-site infection', 'Peritonitis management'],
  },
]

// PLACEHOLDER unitCost values (₱, clinic's purchase cost). Replace with the clinic's real figures.
export const inventory = [
  { sku: 'DLZ-F8', name: 'Dialyzer F8 HPS', category: 'Dialyzers', stock: 42, unit: 'pc', reorderAt: 60, expiry: '2027-08-01', unitCost: 650 },
  { sku: 'DLZ-F10', name: 'Dialyzer F10 HPS', category: 'Dialyzers', stock: 118, unit: 'pc', reorderAt: 60, expiry: '2027-11-15', unitCost: 750 },
  { sku: 'BLD-AV', name: 'AV Bloodline Set', category: 'Bloodlines', stock: 160, unit: 'set', reorderAt: 80, expiry: '2028-02-01', unitCost: 320 },
  { sku: 'FST-16', name: 'AV Fistula Needle 16G', category: 'Needles', stock: 64, unit: 'pair', reorderAt: 100, expiry: '2028-05-30', unitCost: 140 },
  { sku: 'FST-15', name: 'AV Fistula Needle 15G', category: 'Needles', stock: 210, unit: 'pair', reorderAt: 100, expiry: '2028-05-30', unitCost: 140 },
  { sku: 'ACD-A', name: 'Acid Concentrate (Part A) 5L', category: 'Concentrates', stock: 90, unit: 'gal', reorderAt: 40, expiry: '2027-03-20', unitCost: 380 },
  { sku: 'BIC-B', name: 'Bicarbonate Cartridge', category: 'Concentrates', stock: 25, unit: 'pc', reorderAt: 40, expiry: '2027-01-10', unitCost: 450 },
  { sku: 'MED-HEP', name: 'Heparin 5,000 IU/mL', category: 'Medicines', stock: 75, unit: 'vial', reorderAt: 30, expiry: '2026-12-31', unitCost: 180 },
  { sku: 'MED-EPO', name: 'Epoetin Alfa 4,000 IU', category: 'Medicines', stock: 48, unit: 'pfs', reorderAt: 60, expiry: '2027-04-15', unitCost: 900 },
  { sku: 'MED-IRS', name: 'Iron Sucrose 100mg', category: 'Medicines', stock: 52, unit: 'amp', reorderAt: 25, expiry: '2027-06-30', unitCost: 350 },
  { sku: 'PD-15', name: 'PD Solution 1.5% 2L', category: 'PD Supplies', stock: 300, unit: 'bag', reorderAt: 200, expiry: '2027-09-01', unitCost: 280 },
  { sku: 'KIT-HD', name: 'HD Starter Kit', category: 'Supplies', stock: 140, unit: 'kit', reorderAt: 80, expiry: '2028-01-01', unitCost: 120 },
]

// Supplies every HD session uses, covered by the package. The dialyzer is picked per patient.
export const SESSION_KIT = ['BLD-AV', 'FST-15', 'ACD-A', 'BIC-B', 'MED-HEP', 'MED-EPO', 'KIT-HD']

// Patient-paid extras. PLACEHOLDER prices and costs, confirm with the clinic.
// `sku` items also come out of inventory; the rest are services (cost = what the clinic pays out).
export const ADDONS = [
  { id: 'epo-extra', name: 'Extra Epoetin 4,000 IU', sku: 'MED-EPO', price: 1500 },
  { id: 'iron', name: 'Iron Sucrose 100mg', sku: 'MED-IRS', price: 750 },
  { id: 'labs', name: 'Extra lab panel (CBC, electrolytes)', cost: 400, price: 900 },
  { id: 'hep', name: 'Hepatitis profile', cost: 600, price: 1200 },
]

export const SELF_PAY_RATE = 4500 // PLACEHOLDER: session price once PhilHealth's 156 are used up
export const CLAIM_STATUSES = ['Pending', 'Submitted', 'Paid', 'Denied']

// philhealthUsed = HD sessions claimed this calendar year (null for PD patients).
const hd = (o) => ({ modality: 'HD', dialyzer: 'F8 HPS', bloodFlow: 300, hours: 4, hbsag: 'Negative', antiHcv: 'Negative', notes: '', labs: [], ...o })

export const patients = [
  hd({ id: 1, name: 'Ramon Dela Cruz', birthDate: '1961-03-14', sex: 'M', phone: '0917 555 0101', email: 'ramon.dc@example.com', emergencyContact: 'Ana Dela Cruz (wife) 0917 555 0102',
    philhealthPin: '12-345678901-2', membership: 'Member', diagnosis: 'CKD 5 — diabetic nephropathy', schedule: 'MWF', shift: 'AM', chair: 1, access: 'AV fistula, left forearm', dryWeight: 62.5, philhealthUsed: 88,
    labs: [{ date: '2026-10-01', hgb: 10.8, potassium: 5.1, albumin: 3.8, ktv: 1.4 }, { date: '2026-09-01', hgb: 10.2, potassium: 5.4, albumin: 3.7, ktv: 1.3 }] }),
  hd({ id: 2, name: 'Liza Manalo', birthDate: '1958-07-22', sex: 'F', phone: '0918 555 0201', email: 'liza.manalo@example.com', emergencyContact: 'Paolo Manalo (son) 0918 555 0202',
    philhealthPin: '19-876543210-5', membership: 'Dependent', diagnosis: 'CKD 5 — hypertensive nephrosclerosis', schedule: 'MWF', shift: 'AM', chair: 2, access: 'AV graft, right upper arm', dryWeight: 54, philhealthUsed: 142,
    labs: [{ date: '2026-10-01', hgb: 9.6, potassium: 5.8, albumin: 3.4, ktv: 1.2 }] }),
  hd({ id: 3, name: 'Teodoro Ramos', birthDate: '1970-11-05', sex: 'M', phone: '0919 555 0301', email: '', emergencyContact: 'Rosa Ramos (sister) 0919 555 0302',
    philhealthPin: '03-112233445-6', membership: 'Member', diagnosis: 'CKD 5 — chronic glomerulonephritis', schedule: 'MWF', shift: 'AM', chair: 3, access: 'Tunneled catheter, right IJ', dryWeight: 70, philhealthUsed: 31,
    notes: 'Fistula maturing; plan to switch access in December.',
    labs: [{ date: '2026-10-01', hgb: 11.2, potassium: 4.7, albumin: 4.0, ktv: 1.5 }] }),
  hd({ id: 4, name: 'Cecilia Bautista', birthDate: '1955-02-18', sex: 'F', phone: '0920 555 0401', email: 'cbautista@example.com', emergencyContact: 'Mario Bautista (husband) 0920 555 0402',
    philhealthPin: '08-998877665-4', membership: 'Senior citizen', diagnosis: 'CKD 5 — diabetic nephropathy', schedule: 'MWF', shift: 'Mid', chair: 1, access: 'AV fistula, left upper arm', dryWeight: 58, philhealthUsed: 120 }),
  hd({ id: 5, name: 'Arnel Villanueva', birthDate: '1968-09-30', sex: 'M', phone: '0921 555 0501', email: 'arnel.v@example.com', emergencyContact: 'Joy Villanueva (wife) 0921 555 0502',
    philhealthPin: '11-443322110-9', membership: 'Member', diagnosis: 'CKD 5 — polycystic kidney disease', schedule: 'MWF', shift: 'Mid', chair: 4, access: 'AV fistula, right forearm', dryWeight: 75, philhealthUsed: 154,
    hbsag: 'Positive', notes: 'Isolation machine (chair 4) only.',
    labs: [{ date: '2026-10-01', hgb: 10.1, potassium: 5.0, albumin: 3.6, ktv: 1.3 }] }),
  hd({ id: 6, name: 'Maricel Santos', birthDate: '1982-05-12', sex: 'F', phone: '0922 555 0601', email: 'maricel.s@example.com', emergencyContact: 'Ben Santos (brother) 0922 555 0602',
    philhealthPin: '15-667788990-1', membership: 'Member', diagnosis: 'CKD 5 — lupus nephritis', schedule: 'MWF', shift: 'PM', chair: 2, access: 'AV fistula, left forearm', dryWeight: 49, philhealthUsed: 12 }),
  hd({ id: 7, name: 'Joel Mendoza', birthDate: '1964-12-01', sex: 'M', phone: '0923 555 0701', email: '', emergencyContact: 'Liza Mendoza (daughter) 0923 555 0702',
    philhealthPin: '02-554433221-7', membership: 'Member', diagnosis: 'CKD 5 — diabetic nephropathy', schedule: 'MWF', shift: 'PM', chair: 3, access: 'AV fistula, left forearm', dryWeight: 68, philhealthUsed: 97 }),
  hd({ id: 8, name: 'Grace Lim', birthDate: '1975-04-09', sex: 'F', phone: '0924 555 0801', email: 'grace.lim@example.com', emergencyContact: 'Henry Lim (husband) 0924 555 0802',
    philhealthPin: '13-221100998-3', membership: 'Member', diagnosis: 'CKD 5 — IgA nephropathy', schedule: 'TThS', shift: 'AM', chair: 1, access: 'AV fistula, left forearm', dryWeight: 55.5, philhealthUsed: 60 }),
  { id: 9, name: 'Nestor Aquino', birthDate: '1972-08-17', sex: 'M', phone: '0925 555 0901', email: 'nestor.a@example.com', emergencyContact: 'Carla Aquino (wife) 0925 555 0902',
    philhealthPin: '07-123987456-0', membership: 'Member', diagnosis: 'CKD 5 — hypertensive nephrosclerosis', modality: 'PD', schedule: '', shift: '', chair: null, access: 'PD catheter',
    dryWeight: 66, dialyzer: '', bloodFlow: null, hours: null, hbsag: 'Negative', antiHcv: 'Negative', philhealthUsed: null,
    notes: 'CAPD, 4 exchanges a day. Monthly clinic review.', labs: [] },
  hd({ id: 10, name: 'Rodelio Garcia', birthDate: '1959-06-25', sex: 'M', phone: '0926 555 1001', email: '', emergencyContact: 'Nora Garcia (wife) 0926 555 1002',
    philhealthPin: '05-334455667-8', membership: 'Senior citizen', diagnosis: 'CKD 5 — diabetic nephropathy', schedule: 'TThS', shift: 'AM', chair: 2, access: 'AV fistula, left forearm', dryWeight: 64, philhealthUsed: 133 }),
  hd({ id: 11, name: 'Josefina Cruz', birthDate: '1963-01-11', sex: 'F', phone: '0927 555 1101', email: 'josie.cruz@example.com', emergencyContact: 'Dan Cruz (son) 0927 555 1102',
    philhealthPin: '09-778899001-2', membership: 'Member', diagnosis: 'CKD 5 — hypertensive nephrosclerosis', schedule: 'TThS', shift: 'Mid', chair: 3, access: 'AV graft, left upper arm', dryWeight: 57, philhealthUsed: 75 }),
  hd({ id: 12, name: 'Eduardo Reyes', birthDate: '1977-10-03', sex: 'M', phone: '0928 555 1201', email: 'ed.reyes@example.com', emergencyContact: 'Mila Reyes (wife) 0928 555 1202',
    philhealthPin: '14-112200334-5', membership: 'Member', diagnosis: 'CKD 5 — chronic glomerulonephritis', schedule: 'TThS', shift: 'PM', chair: 11, access: 'AV fistula, right forearm', dryWeight: 72, philhealthUsed: 44 }),
]

// Daily schedule = each HD patient's recurring slot (schedule + shift + chair),
// with these per-date exceptions applied: moves, make-ups, no-shows, cancellations.
export const bookings = [
  { date: '2026-10-12', patientId: 7, status: 'No-show' },
  { date: '2026-10-19', patientId: 7, status: 'No-show' },
  { date: '2026-10-21', patientId: 6, status: 'Cancelled' },
]

export const SHIFTS = { AM: '06:00', Mid: '10:30', PM: '15:00' }
export const DAYS = { MWF: [1, 3, 5], TThS: [2, 4, 6] } // Date#getDay(); Sunday closed
export const ISOLATION_CHAIRS = [4] // HBsAg-positive patients only
export const CHAIRS = 12
export const PHILHEALTH_SESSIONS_PER_YEAR = 156

// Ten Fresenius 4008S and two premium 5008S (discovery form Q25).
// PLACEHOLDER: which chairs have the 5008S, confirm at the site visit.
export const MACHINES = Object.fromEntries(Array.from({ length: CHAIRS }, (_, i) => [i + 1, i < 10 ? '4008S' : '5008S']))

// Treatment sheet alert limits. PLACEHOLDER: every number needs the medical director's sign-off.
export const VITAL_LIMITS = {
  sys: { label: 'Systolic BP', min: 90, max: 180 },
  dia: { label: 'Diastolic BP', max: 100 },
  pulse: { label: 'Pulse', min: 50, max: 120 },
  temp: { label: 'Temperature', max: 37.8 },
  vp: { label: 'Venous pressure', max: 250 },
  ap: { label: 'Arterial pressure', min: -250 },
  tmp: { label: 'TMP', max: 300 },
  cond: { label: 'Conductivity', min: 13.5, max: 14.5 },
}
export const MAX_GAIN_PCT = 4 // weight above dry weight, % of dry weight
export const READING_EVERY_MIN = 60
export const ACCESS_CHECKS = ['Good thrill and bruit', 'Weak thrill or bruit', 'Signs of infection', 'Catheter site clean', 'Catheter site red or draining']
export const COMPLICATIONS = ['Hypotension', 'Cramps', 'Nausea or vomiting', 'Headache', 'Chest pain', 'Fever or chills', 'Access bleeding', 'Clotted lines']

// Water room. PLACEHOLDER limits, typical for dialysis water (ISO 23500 / AAMI);
// confirm against the clinic's water system and DOH requirements.
export const WATER_LIMITS = {
  chlorine: { label: 'Total chlorine', unit: 'mg/L', max: 0.1 },
  conductivity: { label: 'RO product conductivity', unit: 'µS/cm', max: 20 },
  hardness: { label: 'Softener hardness', unit: 'gpg', max: 1 },
  feedPressure: { label: 'Feed pressure', unit: 'psi', min: 30, max: 60 },
}
export const WATER_TASKS = [
  { id: 'culture', name: 'Bacterial culture', every: 30, unit: 'CFU/mL', action: 50, max: 100 },
  { id: 'endotoxin', name: 'Endotoxin test', every: 30, unit: 'EU/mL', action: 0.125, max: 0.25 },
  { id: 'disinfect', name: 'RO and loop disinfection', every: 30 },
  { id: 'sediment', name: 'Sediment filter change', every: 30 },
  { id: 'carbon', name: 'Carbon tank replacement', every: 180 },
  { id: 'chemical', name: 'Full chemical analysis', every: 365 },
]

// ---- Staff ----
// days uses STAFF_DAYS keys; rate = pay per shift worked (null = paid outside payroll, e.g. professional fees).
// All staff except the medical director (named on the discovery form) are fictional. PLACEHOLDER rates.
export const STAFF_ROLES = ['Head nurse', 'Nurse', 'Nephrologist', 'Dialysis technician', 'Front desk', 'Patient care aide']
export const STAFF_DAYS = { ...DAYS, MonSat: [1, 2, 3, 4, 5, 6] }
export const NURSE_ROLES = ['Head nurse', 'Nurse']
export const PATIENTS_PER_NURSE = 4 // PLACEHOLDER: confirm the DOH staffing ratio for HD units

export const staff = [
  { id: 1, name: 'Joy Navarro', role: 'Head nurse', phone: '0917 555 2101', days: 'MonSat', shift: 'AM', rate: 1800, license: '0712345', licenseExpiry: '2027-03-15' },
  { id: 2, name: 'Carlo Mendez', role: 'Nurse', phone: '0917 555 2102', days: 'MWF', shift: 'AM', rate: 1400, license: '0723456', licenseExpiry: '2027-08-30' },
  { id: 3, name: 'Ana Villareal', role: 'Nurse', phone: '0917 555 2103', days: 'TThS', shift: 'AM', rate: 1400, license: '0734567', licenseExpiry: '2028-01-20' },
  { id: 4, name: 'Paolo Lim', role: 'Nurse', phone: '0917 555 2104', days: 'MWF', shift: 'Mid', rate: 1400, license: '0745678', licenseExpiry: '2027-05-11' },
  { id: 5, name: 'Grace Uy', role: 'Nurse', phone: '0917 555 2105', days: 'TThS', shift: 'Mid', rate: 1400, license: '0756789', licenseExpiry: '2026-12-01' },
  { id: 6, name: 'Mark Tan', role: 'Nurse', phone: '0917 555 2106', days: 'MWF', shift: 'PM', rate: 1400, license: '0767890', licenseExpiry: '2027-10-05' },
  { id: 7, name: 'Rhea Santos', role: 'Nurse', phone: '0917 555 2107', days: 'TThS', shift: 'PM', rate: 1400, license: '0778901', licenseExpiry: '2026-10-10' },
  { id: 8, name: 'Ramil Ocampo', role: 'Dialysis technician', phone: '0917 555 2108', days: 'MonSat', shift: 'AM', rate: 1200, license: '', licenseExpiry: '' },
  { id: 9, name: 'Mia Dizon', role: 'Front desk', phone: '0917 555 2109', days: 'MonSat', shift: 'AM', rate: 900, license: '', licenseExpiry: '' },
  { id: 10, name: 'Lea Garcia', role: 'Front desk', phone: '0917 555 2110', days: 'MonSat', shift: 'PM', rate: 900, license: '', licenseExpiry: '' },
  { id: 11, name: 'Ben Flores', role: 'Patient care aide', phone: '0917 555 2111', days: 'MonSat', shift: 'Mid', rate: 800, license: '', licenseExpiry: '' },
  { id: 12, name: 'Dr. Alexander U. Tan', role: 'Nephrologist', phone: '', days: 'MonSat', shift: 'AM', rate: null, license: '0098765', licenseExpiry: '2028-06-30' },
  { id: 13, name: 'Dr. Paula Reyes', role: 'Nephrologist', phone: '', days: 'MWF', shift: 'PM', rate: null, license: '0109876', licenseExpiry: '2027-02-14' },
]

// Monthly payroll deductions, Philippines. PLACEHOLDER: 2025 schedules; the clinic's accountant
// confirms the current SSS, PhilHealth, Pag-IBIG and BIR tables before anyone is paid.
export const PAYROLL_RATES = {
  sss: { employee: 0.05, employer: 0.10, minMSC: 5000, maxMSC: 35000, step: 500, ec: [15000, 10, 30] }, // ec: [MSC cutoff, below, at/above]
  philhealth: { rate: 0.05, floor: 10000, ceiling: 100000 }, // split 50/50
  pagibig: { employee: 0.02, employeeLow: 0.01, lowUpTo: 1500, employer: 0.02, maxBase: 10000 },
  // BIR monthly withholding (TRAIN, 2023+): [over, base tax, rate on the excess]
  tax: [[0, 0, 0], [20833, 0, 0.15], [33333, 1875, 0.2], [66667, 8541.8, 0.25], [166667, 33541.8, 0.3], [666667, 183541.8, 0.35]],
}
