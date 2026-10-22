import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import AppShell, { MODULES } from './pages/AppShell.jsx'
import Overview from './pages/Overview.jsx'
import Inventory from './pages/Inventory.jsx'
import Patients from './pages/Patients.jsx'
import PatientDetail from './pages/PatientDetail.jsx'
import PatientForm from './pages/PatientForm.jsx'
import Schedule from './pages/Schedule.jsx'
import Billing from './pages/Billing.jsx'
import Claims from './pages/Claims.jsx'
import Reports from './pages/Reports.jsx'
import Crm from './pages/Crm.jsx'
import './styles.css'

const built = {
  overview: <Overview />, inventory: <Inventory />, patients: <Patients />, schedule: <Schedule />,
  billing: <Billing />, philhealth: <Claims />, reports: <Reports />, crm: <Crm />,
}

function Soon({ mod }) {
  return (
    <div className="card empty">
      <h2>{mod.label}</h2>
      <p>{mod.blurb}</p>
      <span className="badge">Phase {mod.phase}</span>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="overview" replace />} />
          {MODULES.map((m) => (
            <Route key={m.path} path={m.path} element={built[m.path] ?? <Soon mod={m} />} />
          ))}
          <Route path="patients/new" element={<PatientForm />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="patients/:id/edit" element={<PatientForm />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
