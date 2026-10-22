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

export const inventory = [
  { sku: 'DLZ-F8', name: 'Dialyzer F8 HPS', category: 'Dialyzers', stock: 42, unit: 'pc', reorderAt: 60, expiry: '2027-08-01' },
  { sku: 'DLZ-F10', name: 'Dialyzer F10 HPS', category: 'Dialyzers', stock: 118, unit: 'pc', reorderAt: 60, expiry: '2027-11-15' },
  { sku: 'BLD-AV', name: 'AV Bloodline Set', category: 'Bloodlines', stock: 160, unit: 'set', reorderAt: 80, expiry: '2028-02-01' },
  { sku: 'FST-16', name: 'AV Fistula Needle 16G', category: 'Needles', stock: 64, unit: 'pair', reorderAt: 100, expiry: '2028-05-30' },
  { sku: 'FST-15', name: 'AV Fistula Needle 15G', category: 'Needles', stock: 210, unit: 'pair', reorderAt: 100, expiry: '2028-05-30' },
  { sku: 'ACD-A', name: 'Acid Concentrate (Part A) 5L', category: 'Concentrates', stock: 90, unit: 'gal', reorderAt: 40, expiry: '2027-03-20' },
  { sku: 'BIC-B', name: 'Bicarbonate Cartridge', category: 'Concentrates', stock: 25, unit: 'pc', reorderAt: 40, expiry: '2027-01-10' },
  { sku: 'MED-HEP', name: 'Heparin 5,000 IU/mL', category: 'Medicines', stock: 75, unit: 'vial', reorderAt: 30, expiry: '2026-12-31' },
  { sku: 'MED-EPO', name: 'Epoetin Alfa 4,000 IU', category: 'Medicines', stock: 18, unit: 'pfs', reorderAt: 40, expiry: '2027-04-15' },
  { sku: 'MED-IRS', name: 'Iron Sucrose 100mg', category: 'Medicines', stock: 52, unit: 'amp', reorderAt: 25, expiry: '2027-06-30' },
  { sku: 'PD-15', name: 'PD Solution 1.5% 2L', category: 'PD Supplies', stock: 300, unit: 'bag', reorderAt: 200, expiry: '2027-09-01' },
  { sku: 'KIT-HD', name: 'HD Starter Kit', category: 'Supplies', stock: 140, unit: 'kit', reorderAt: 80, expiry: '2028-01-01' },
]

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
    philhealthPin: '14-112200334-5', membership: 'Member', diagnosis: 'CKD 5 — chronic glomerulonephritis', schedule: 'TThS', shift: 'PM', chair: 5, access: 'AV fistula, right forearm', dryWeight: 72, philhealthUsed: 44 }),
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
