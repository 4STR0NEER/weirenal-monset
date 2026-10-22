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
    philhealthPin: '12-345678901-2', membership: 'Member', diagnosis: 'CKD 5 — diabetic nephropathy', schedule: 'MWF', shift: 'AM', access: 'AV fistula, left forearm', dryWeight: 62.5, philhealthUsed: 88,
    labs: [{ date: '2026-10-01', hgb: 10.8, potassium: 5.1, albumin: 3.8, ktv: 1.4 }, { date: '2026-09-01', hgb: 10.2, potassium: 5.4, albumin: 3.7, ktv: 1.3 }] }),
  hd({ id: 2, name: 'Liza Manalo', birthDate: '1958-07-22', sex: 'F', phone: '0918 555 0201', email: 'liza.manalo@example.com', emergencyContact: 'Paolo Manalo (son) 0918 555 0202',
    philhealthPin: '19-876543210-5', membership: 'Dependent', diagnosis: 'CKD 5 — hypertensive nephrosclerosis', schedule: 'MWF', shift: 'AM', access: 'AV graft, right upper arm', dryWeight: 54, philhealthUsed: 142,
    labs: [{ date: '2026-10-01', hgb: 9.6, potassium: 5.8, albumin: 3.4, ktv: 1.2 }] }),
  hd({ id: 3, name: 'Teodoro Ramos', birthDate: '1970-11-05', sex: 'M', phone: '0919 555 0301', email: '', emergencyContact: 'Rosa Ramos (sister) 0919 555 0302',
    philhealthPin: '03-112233445-6', membership: 'Member', diagnosis: 'CKD 5 — chronic glomerulonephritis', schedule: 'MWF', shift: 'AM', access: 'Tunneled catheter, right IJ', dryWeight: 70, philhealthUsed: 31,
    notes: 'Fistula maturing; plan to switch access in December.',
    labs: [{ date: '2026-10-01', hgb: 11.2, potassium: 4.7, albumin: 4.0, ktv: 1.5 }] }),
  hd({ id: 4, name: 'Cecilia Bautista', birthDate: '1955-02-18', sex: 'F', phone: '0920 555 0401', email: 'cbautista@example.com', emergencyContact: 'Mario Bautista (husband) 0920 555 0402',
    philhealthPin: '08-998877665-4', membership: 'Senior citizen', diagnosis: 'CKD 5 — diabetic nephropathy', schedule: 'MWF', shift: 'Mid', access: 'AV fistula, left upper arm', dryWeight: 58, philhealthUsed: 120 }),
  hd({ id: 5, name: 'Arnel Villanueva', birthDate: '1968-09-30', sex: 'M', phone: '0921 555 0501', email: 'arnel.v@example.com', emergencyContact: 'Joy Villanueva (wife) 0921 555 0502',
    philhealthPin: '11-443322110-9', membership: 'Member', diagnosis: 'CKD 5 — polycystic kidney disease', schedule: 'MWF', shift: 'Mid', access: 'AV fistula, right forearm', dryWeight: 75, philhealthUsed: 154,
    hbsag: 'Positive', notes: 'Isolation machine (chair 4) only.',
    labs: [{ date: '2026-10-01', hgb: 10.1, potassium: 5.0, albumin: 3.6, ktv: 1.3 }] }),
  hd({ id: 6, name: 'Maricel Santos', birthDate: '1982-05-12', sex: 'F', phone: '0922 555 0601', email: 'maricel.s@example.com', emergencyContact: 'Ben Santos (brother) 0922 555 0602',
    philhealthPin: '15-667788990-1', membership: 'Member', diagnosis: 'CKD 5 — lupus nephritis', schedule: 'MWF', shift: 'PM', access: 'AV fistula, left forearm', dryWeight: 49, philhealthUsed: 12 }),
  hd({ id: 7, name: 'Joel Mendoza', birthDate: '1964-12-01', sex: 'M', phone: '0923 555 0701', email: '', emergencyContact: 'Liza Mendoza (daughter) 0923 555 0702',
    philhealthPin: '02-554433221-7', membership: 'Member', diagnosis: 'CKD 5 — diabetic nephropathy', schedule: 'MWF', shift: 'PM', access: 'AV fistula, left forearm', dryWeight: 68, philhealthUsed: 97 }),
  hd({ id: 8, name: 'Grace Lim', birthDate: '1975-04-09', sex: 'F', phone: '0924 555 0801', email: 'grace.lim@example.com', emergencyContact: 'Henry Lim (husband) 0924 555 0802',
    philhealthPin: '13-221100998-3', membership: 'Member', diagnosis: 'CKD 5 — IgA nephropathy', schedule: 'TThS', shift: 'AM', access: 'AV fistula, left forearm', dryWeight: 55.5, philhealthUsed: 60 }),
  { id: 9, name: 'Nestor Aquino', birthDate: '1972-08-17', sex: 'M', phone: '0925 555 0901', email: 'nestor.a@example.com', emergencyContact: 'Carla Aquino (wife) 0925 555 0902',
    philhealthPin: '07-123987456-0', membership: 'Member', diagnosis: 'CKD 5 — hypertensive nephrosclerosis', modality: 'PD', schedule: '', shift: '', access: 'PD catheter',
    dryWeight: 66, dialyzer: '', bloodFlow: null, hours: null, hbsag: 'Negative', antiHcv: 'Negative', philhealthUsed: null,
    notes: 'CAPD, 4 exchanges a day. Monthly clinic review.', labs: [] },
]

export const sessionsToday = [
  { id: 1, time: '06:00', patientId: 1, chair: 1, status: 'Done' },
  { id: 2, time: '06:00', patientId: 2, chair: 2, status: 'Done' },
  { id: 3, time: '06:00', patientId: 3, chair: 3, status: 'Done' },
  { id: 4, time: '10:30', patientId: 4, chair: 1, status: 'On machine' },
  { id: 5, time: '10:30', patientId: 5, chair: 4, status: 'On machine' },
  { id: 6, time: '15:00', patientId: 6, chair: 2, status: 'Scheduled' },
  { id: 7, time: '15:00', patientId: 7, chair: 3, status: 'Scheduled' },
]

export const CHAIRS = 12
export const PHILHEALTH_SESSIONS_PER_YEAR = 156
