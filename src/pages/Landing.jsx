import { Link } from 'react-router'
import { getPackages, useLoad, peso } from '../api.js'

export default function Landing() {
  const { data: packages } = useLoad(getPackages)

  return (
    <div className="landing">
      <header className="topbar">
        <span className="logo"><span className="logo-mark" aria-hidden>W</span>WEI Renal Care Clinic</span>
        <Link className="btn ghost" to="/login">Staff sign in</Link>
      </header>

      <section className="hero">
        <p className="eyebrow">PhilHealth-accredited dialysis center</p>
        <h1>Dialysis care,<br />covered by PhilHealth.</h1>
        <p className="lede">
          Up to 156 hemodialysis sessions a year at ₱6,350 per session, billed straight to PhilHealth.
          We handle the paperwork so you can focus on feeling well.
        </p>
        <div className="row">
          <a className="btn" href="#packages">See PhilHealth packages</a>
          <a className="btn ghost" href="#contact">Book a consult</a>
        </div>
      </section>

      <section id="packages" className="section">
        <h2>PhilHealth packages</h2>
        <div className="grid3">
          {packages?.map((p) => (
            <article key={p.id} className={'card pkg' + (p.featured ? ' featured' : '')}>
              <h3>{p.name}</h3>
              <p className="muted">{p.for}</p>
              <p className="price">
                {peso(p.rate)}{p.rateMax && <> – {peso(p.rateMax)}</>}
                <small> {p.unit}</small>
              </p>
              <p className="cap">{p.cap}</p>
              <ul>{p.includes.map((i) => <li key={i}>{i}</li>)}</ul>
            </article>
          ))}
        </div>
        <p className="fine">
          Rates per PhilHealth Circulars 2024-0023 and 2024-0036. Coverage depends on member eligibility;
          our billing team confirms your benefits before your first session.
        </p>
      </section>

      <footer id="contact" className="footer">
        <div>
          <strong>WEI Renal Care Clinic</strong>
          <p className="muted">[Clinic address] · [Phone] · [Email]</p>
        </div>
        <p className="muted">Open Monday–Saturday, three shifts daily.</p>
      </footer>
    </div>
  )
}
