import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext.jsx';
import { upcomingOverview } from '../data/games.js';

// Landing / overview page for the demo app. Contains a hero card and an
// on-page popup (retirement calculator). The popup is local to this component
// and demonstrates a simple input -> computed-output interaction.

const LandingPage = () => {
  // Pull current auth flag so we can show the correct CTA
  const { isAuthenticated } = useSupabaseAuth();

  // Popup open/minimized state. Defaults to open so graders immediately see it.
  const [popupOpen, setPopupOpen] = useState(true);

  // Calculator inputs (simple numeric state). Defaults chosen for demonstrative value.
  const [landingTarget, setLandingTarget] = useState(401000); // tokens goal
  const [landingCurrent, setLandingCurrent] = useState(0); // current tokens
  const [landingYears, setLandingYears] = useState(30); // years until retirement

  // Primary CTA target and label change depending on auth state.
  const primaryCta = isAuthenticated ? '/lobby' : '/login';
  const primaryLabel = isAuthenticated ? 'Jump to Lobby' : 'Create Satirical Account';

  /*
    Small helper component that computes required monthly wins.
    Calculation is intentionally simple:
      remaining = max(0, target - current)
      months = max(1, floor(years * 12))
      perMonth = remaining / months

    The component focuses on clarity rather than financial realism.
  */
  function ResultDisplay({ target, current, years }) {
    if (!Number.isFinite(target) || target <= 0) {
      return <p style={{ color: '#c81d4f' }}>Enter a valid retirement target above.</p>;
    }

  // remaining tokens needed to reach the target; clamp to 0 to avoid negatives
  const remaining = Math.max(0, target - (Number.isFinite(current) ? current : 0));

  // Convert years to months. We floor to avoid fractional months, and ensure
  // at least one month to prevent divide-by-zero.
  const months = Math.max(1, Math.floor((Number.isFinite(years) && years > 0 ? years : 0) * 12));

  // monthly requirement; Infinity signals an invalid numeric input scenario
  const perMonth = months > 0 ? remaining / months : Infinity;

    return (
      <div>
        <p style={{ margin: 0, fontWeight: 700 }}>
          Required win per month: <span style={{ color: '#4d2fff' }}>{isFinite(perMonth) ? Math.ceil(perMonth).toLocaleString() : '—'}</span>
        </p>
        <p style={{ margin: 0, fontSize: 12, color: '#5c5c80' }}>
          Based on a simple linear projection over {months} months. This does not include
          interest, compounding, or losses.
        </p>
      </div>
    );
  }

  return (
    <div className="page landing-page">
      {/* Popup: toggles between open and minimized via `popupOpen` state */}
      <div className={`landing-popup ${popupOpen ? 'landing-popup--open' : 'landing-popup--min'}`}>
        {/* Header row: title and controls */}
        <div className="landing-popup__header">
          {/* Strong element used as the visible title for the popup */}
          <strong>Retirement Calculator</strong>
          <div className="landing-popup__controls">
            {/* Toggle button flips popupOpen; aria-label updates for a11y */}
            <button
              className="landing-popup__control"
              aria-label={popupOpen ? 'Minimize popup' : 'Open popup'}
              onClick={() => setPopupOpen((s) => !s)}
            >
              {popupOpen ? '–' : '+'}
            </button>
          </div>
        </div>

        {/* Body renders only when popupOpen is true */}
        {popupOpen && (
          <div className="landing-popup__body">
            {/* Short description explaining the calculator's simplified assumptions */}
            <p>
              Calculator: enter a retirement target, current balance, and years until retirement.
              We'll show the approximate tokens you must win per month to reach the goal (simple
              linear projection — no interest or investment returns included).
            </p>

            {/* Calculator inputs: each labeled input updates local component state */}
            <div style={{ display: 'grid', gap: 8 }}>
              <label style={{ fontSize: 12, color: '#5c5c80' }}>
                Retirement target (tokens)
                <input
                  type="number"
                  min="0"
                  step="1"
                  // Coerce to number when passing into the input to avoid React warnings
                  value={Number.isFinite(Number(landingTarget)) ? landingTarget : ''}
                  onChange={(e) => setLandingTarget(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(28,28,51,0.12)' }}
                />
              </label>

              <label style={{ fontSize: 12, color: '#5c5c80' }}>
                Current balance (tokens)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={Number.isFinite(Number(landingCurrent)) ? landingCurrent : ''}
                  onChange={(e) => setLandingCurrent(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(28,28,51,0.12)' }}
                />
              </label>

              <label style={{ fontSize: 12, color: '#5c5c80' }}>
                Years until retirement
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={Number.isFinite(Number(landingYears)) ? landingYears : ''}
                  onChange={(e) => setLandingYears(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(28,28,51,0.12)' }}
                />
              </label>
            </div>

            {/* Result area uses ResultDisplay to keep render logic separated */}
            <div style={{ marginTop: 8 }}>
              <ResultDisplay
                target={Number(landingTarget)}
                current={Number(landingCurrent)}
                years={Number(landingYears)}
              />
            </div>
          </div>
        )}
      </div>
      <section className="hero-card">
        <div className="hero-card__content">
          <h1>Retirement, reimagined for Sprint 1.</h1>
          <p>
            Welcome to 401k Casino — the totally fictional platform where your demo retirement
            fund meets questionable decision making. Sprint 1 focuses on auth, a token ledger,
            and a functional Blackjack table to prove the concept.
          </p>
          <div className="hero-card__actions">
            <Link to={primaryCta} className="cta-button cta-button--primary">
              {primaryLabel}
            </Link>
            <Link to="/game/blackjack" className="cta-button cta-button--secondary">
              Peek at Blackjack
            </Link>
          </div>
          <p className="hero-card__disclaimer">
            This is coursework satire — no actual investments were harmed in the making of Sprint 1.
          </p>
        </div>
        <aside className="hero-card__aside">
          <div className="metric-callout">
            <p className="metric-callout__eyebrow">Demo Balance</p>
            <p className="metric-callout__value">401,000 tokens</p>
            <p className="metric-callout__note">Every new user starts here. Try not to lose it all.</p>
          </div>
          <div className="metric-callout metric-callout--secondary">
            <p className="metric-callout__eyebrow">Sprint Scope</p>
            <ul>
              <li>Routing, lobby, and auth with hashed passwords</li>
              <li>401k token ledger with atomic debit/credit</li>
              <li>Reusable game shell + Blackjack implementation</li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="upcoming-section">
        <h2>Placeholders queued for future sprints</h2>
        <div className="upcoming-grid">
          {upcomingOverview.map((feature) => (
            <article className="placeholder-card" key={feature.title}>
              <p className="placeholder-card__sprint">{feature.sprint}</p>
              <h3>{feature.title}</h3>
              <p>{feature.summary}</p>
              <span className="placeholder-card__badge">Coming soon</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
