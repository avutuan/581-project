import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext.jsx';
import { upcomingOverview } from '../data/games.js';

const LandingPage = () => {
  const { isAuthenticated } = useSupabaseAuth();
  const [popupOpen, setPopupOpen] = useState(true);
  const [landingTarget, setLandingTarget] = useState(401000);
  const [landingCurrent, setLandingCurrent] = useState(0);
  const [landingYears, setLandingYears] = useState(30);
  const primaryCta = isAuthenticated ? '/lobby' : '/login';
  const primaryLabel = isAuthenticated ? 'Jump to Lobby' : 'Create Satirical Account';

  /* Small display helper - simple math: (target - current) / (years * 12) */
  function ResultDisplay({ target, current, years }) {
    if (!Number.isFinite(target) || target <= 0) {
      return <p style={{ color: '#c81d4f' }}>Enter a valid retirement target above.</p>;
    }

    const remaining = Math.max(0, target - (Number.isFinite(current) ? current : 0));
    const months = Math.max(1, Math.floor((Number.isFinite(years) && years > 0 ? years : 0) * 12));
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
      {/* Simple toggleable popup — opens by default and can be minimized */}
      <div className={`landing-popup ${popupOpen ? 'landing-popup--open' : 'landing-popup--min'}`}>
        <div className="landing-popup__header">
          <strong>Retirement Calculator</strong>
          <div className="landing-popup__controls">
            <button
              className="landing-popup__control"
              aria-label={popupOpen ? 'Minimize popup' : 'Open popup'}
              onClick={() => setPopupOpen((s) => !s)}
            >
              {popupOpen ? '–' : '+'}
            </button>
          </div>
        </div>
        {popupOpen && (
          <div className="landing-popup__body">
            <p>
              Calculator: enter a retirement target, current balance, and years until retirement.
              We'll show the approximate tokens you must win per month to reach the goal (simple
              linear projection — no interest or investment returns included).
            </p>

            {/* Calculator inputs */}
            <div style={{ display: 'grid', gap: 8 }}>
              <label style={{ fontSize: 12, color: '#5c5c80' }}>
                Retirement target (tokens)
                <input
                  type="number"
                  min="0"
                  step="1"
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

            {/* Result */}
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
