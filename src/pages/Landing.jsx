import { Link } from 'react-router'
import { Check, Phone } from 'lucide-react'
import { getPackages, useLoad, peso } from '../api.js'
import { PHILHEALTH_SESSIONS_PER_YEAR } from '../data.js'
import Logo from '../components/Logo.jsx'
import { FaqAccordion } from '../components/vengeance/faq-accordion.jsx'

const FAQ = [
  { question: 'Who can use the PhilHealth hemodialysis package?', answer: 'PhilHealth members and their qualified dependents diagnosed with chronic kidney disease stage 5. Our billing team checks your eligibility before your first session.' },
  { question: 'What does the package cover?', answer: 'Each covered session includes the dialyzer, bloodlines and dialysis kit, anticoagulation and anemia medicines, routine laboratory tests, and facility and professional fees.' },
  { question: 'What happens after 156 sessions?', answer: 'PhilHealth covers up to 156 hemodialysis sessions a year. We track your count for you and let you know well before you reach it, so you can plan the rest of the year with us.' },
  { question: 'Will I pay anything out of pocket?', answer: 'Covered sessions are billed straight to PhilHealth. You only pay for extras your doctor orders beyond the package, and we tell you the price before anything is given.' },
  { question: 'What should I bring on my first visit?', answer: 'Your PhilHealth ID or Member Data Record, a valid ID, your latest lab results, and your doctor’s referral or dialysis prescription if you have one.' },
]

export default function Landing() {
  const { data: packages } = useLoad(getPackages)
  const [hd, ...others] = packages ?? []

  return (
    <div className="landing">
      <header className="site-head">
        <div className="wrap">
          <Link to="/" className="logo"><Logo text="WEI Renal Care Clinic" /></Link>
          <nav aria-label="Main">
            <a href="#coverage">Coverage</a>
            <a href="#faq">Questions</a>
            <Link className="btn ghost" to="/login">Staff sign in</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap">
            <div>
              <h1>Dialysis,<br /><span>fully covered.</span></h1>
              <p className="lede">
                PhilHealth covers up to 156 hemodialysis sessions a year at ₱6,350 each. We bill them directly,
                track your count, and keep your chair ready, so your only job is to show up and rest.
              </p>
              <div className="row">
                <a className="btn" href="#contact"><Phone aria-hidden /> Book a consult</a>
                <a className="btn ghost" href="#coverage">See what’s covered</a>
              </div>
            </div>
            <YearCard />
          </div>
        </section>

        <section id="coverage" className="band">
          <div className="wrap">
            <h2>What PhilHealth pays for here</h2>
            <p className="intro">Three packages, billed to PhilHealth on your behalf. Rates follow the current PhilHealth circulars.</p>
            {hd && (
              <div className="plans">
                <Plan p={hd} main />
                <div className="side">{others.map((p) => <Plan key={p.id} p={p} />)}</div>
              </div>
            )}
            <p className="fine" style={{ marginTop: 20 }}>
              Rates per PhilHealth Circulars 2024-0023 and 2024-0036. Coverage depends on member eligibility.
            </p>
          </div>
        </section>

        <section className="band" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <h2>Starting with us takes one visit</h2>
            <ol className="steps">
              <li><strong>Call or walk in</strong><p>Tell us your schedule and your nephrologist. We find you a regular chair and shift.</p></li>
              <li><strong>We confirm your PhilHealth</strong><p>Our billing team checks your eligibility and how many sessions you have left this year.</p></li>
              <li><strong>Start your sessions</strong><p>Three times a week, same chair, same team. Each session is billed to PhilHealth for you.</p></li>
            </ol>
          </div>
        </section>

        <section id="faq" className="band faq-band">
          <div className="wrap">
            <div>
              <h2>Questions families ask us</h2>
              <p className="intro">Still unsure? Call us and a nurse or our billing team will walk you through it.</p>
            </div>
            <FaqAccordion items={FAQ} />
          </div>
        </section>
      </main>

      <footer id="contact" className="site-foot">
        <div className="wrap">
          <div>
            <strong>WEI Renal Care Clinic</strong>
            <p>[Clinic address] · [Phone] · [Email]</p>
          </div>
          <p>Open Monday to Saturday, three shifts daily.</p>
        </div>
      </footer>
    </div>
  )
}

// The signature: a year of sessions, one capsule each. 156 filled = what PhilHealth covers.
function YearCard() {
  return (
    <figure className="year" style={{ margin: 0 }}>
      <div className="year-head">
        <strong>One year of dialysis</strong>
        <span className="fine">3 sessions a week</span>
      </div>
      <div className="year-days">
        <span aria-hidden><i>Mon</i><i>Wed</i><i>Fri</i></span>
        <div>
          {/* 52 weeks x 3 sessions = 156: every session of the year, all covered */}
          <div className="year-grid" role="img" aria-label={`52 weeks, 3 sessions each: ${PHILHEALTH_SESSIONS_PER_YEAR} sessions covered by PhilHealth`}>
            {Array.from({ length: PHILHEALTH_SESSIONS_PER_YEAR }, (_, i) => (
              <span key={i} className="year-dot" style={{ '--w': Math.floor(i / 3) }} />
            ))}
          </div>
          <div className="year-months" aria-hidden>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>
      </div>
      <dl className="year-foot">
        <div><dt>Sessions covered</dt><dd>{PHILHEALTH_SESSIONS_PER_YEAR}</dd></div>
        <div><dt>Per session</dt><dd>₱6,350</dd></div>
        <div><dt>Covered a year</dt><dd>₱990,600</dd></div>
      </dl>
    </figure>
  )
}

function Plan({ p, main }) {
  return (
    <article className={'plan' + (main ? ' main' : '')}>
      <h3>{p.name}</h3>
      <p className="for">{p.for}</p>
      <p className="rate">
        {peso(p.rate)}{p.rateMax && <>–{peso(p.rateMax)}</>}<small>{p.unit}</small>
      </p>
      <p className="cap">{p.cap}</p>
      <ul>{p.includes.map((i) => <li key={i}><Check aria-hidden />{i}</li>)}</ul>
    </article>
  )
}
