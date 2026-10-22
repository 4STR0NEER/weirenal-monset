import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import AppShell, { MODULES } from './pages/AppShell.jsx'
import Overview from './pages/Overview.jsx'
import Inventory from './pages/Inventory.jsx'
import './styles.css'

const built = { overview: <Overview />, inventory: <Inventory /> }

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
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
