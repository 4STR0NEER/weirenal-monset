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

export const sessionsToday = [
  { id: 1, time: '06:00', patient: 'Ramon Dela Cruz', chair: 1, philhealthUsed: 88, status: 'Done' },
  { id: 2, time: '06:00', patient: 'Liza Manalo', chair: 2, philhealthUsed: 142, status: 'Done' },
  { id: 3, time: '06:00', patient: 'Teodoro Ramos', chair: 3, philhealthUsed: 31, status: 'Done' },
  { id: 4, time: '10:30', patient: 'Cecilia Bautista', chair: 1, philhealthUsed: 120, status: 'On machine' },
  { id: 5, time: '10:30', patient: 'Arnel Villanueva', chair: 4, philhealthUsed: 154, status: 'On machine' },
  { id: 6, time: '15:00', patient: 'Maricel Santos', chair: 2, philhealthUsed: 12, status: 'Scheduled' },
  { id: 7, time: '15:00', patient: 'Joel Mendoza', chair: 3, philhealthUsed: 97, status: 'Scheduled' },
]

export const CHAIRS = 12
export const PHILHEALTH_SESSIONS_PER_YEAR = 156
