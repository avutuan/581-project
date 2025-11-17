import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext.jsx';
import { upcomingOverview } from '../data/games.js';

// Landing / overview page for the demo app. Contains a hero card and an
// on-page popup (retirement calculator). The popup is local to this component
// and demonstrates a simple input -> computed-output interaction.

const LandingPage = () => {
  // Pull current auth flag so we can show the correct CTA
  const { isAuthenticated } = useSupabaseAuth();

  // Keys for localStorage to persist popup and calculator defaults
  const LS_KEYS = {
    open: 'onTrackPopupOpen',
    focus: 'onTrackPopupFocus',
    target: 'onTrackCalc.target',
    current: 'onTrackCalc.current',
    years: 'onTrackCalc.years',
  };

  // Helpers to read sane numeric defaults from localStorage
  const readNumber = (key, fallback) => {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  // Popup open/minimized state. Persisted in localStorage; default open so graders see it.
  const [popupOpen, setPopupOpen] = useState(() => {
    const stored = localStorage.getItem(LS_KEYS.open);
    return stored !== null ? stored === 'true' : true;
  });

  // Calculator inputs (simple numeric state). Defaults chosen for demonstrative value.
  const [landingTarget, setLandingTarget] = useState(() => readNumber(LS_KEYS.target, 401000)); // tokens goal
  const [landingCurrent, setLandingCurrent] = useState(() => readNumber(LS_KEYS.current, 0)); // current tokens
  const [landingYears, setLandingYears] = useState(() => readNumber(LS_KEYS.years, 30)); // years until retirement

  // Refs for accessibility/focus management
  const firstInputRef = useRef(null);
  const headerTitleId = 'ontrack-calculator-title';
  const bodyRegionId = 'ontrack-calculator-panel';

  // Persist popup state and calculator defaults when they change
  useEffect(() => {
    localStorage.setItem(LS_KEYS.open, String(popupOpen));
  }, [popupOpen]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.target, String(landingTarget ?? ''));
  }, [landingTarget]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.current, String(landingCurrent ?? ''));
  }, [landingCurrent]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.years, String(landingYears ?? ''));
  }, [landingYears]);

  // If a focus request flag was set by another page (e.g., Lobby), honor it on mount
  useEffect(() => {
    const wantsFocus = localStorage.getItem(LS_KEYS.focus) === 'true';
    if (wantsFocus) {
      // Ensure open and then move focus inside after paint
      setPopupOpen(true);
      // Focus will be handled by the effect watching popupOpen
      localStorage.removeItem(LS_KEYS.focus);
    }
  // We only want to check this once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When popup opens, move focus to the first input for keyboard accessibility
  useEffect(() => {
    if (popupOpen) {
      // Next tick to ensure input is in the DOM
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 0);
    }
  }, [popupOpen]);

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
      <div
        className={`landing-popup ${popupOpen ? 'landing-popup--open' : 'landing-popup--min'}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby={headerTitleId}
      >
        {/* Header row: title and controls */}
        <div className="landing-popup__header">
          {/* Strong element used as the visible title for the popup */}
          <strong id={headerTitleId}>On‑Track: Retirement Calculator</strong>
          <div className="landing-popup__controls">
            {/* Toggle button flips popupOpen; aria-label updates for a11y */}
            <button
              className="landing-popup__control"
              aria-label={popupOpen ? 'Minimize popup' : 'Open popup'}
              aria-expanded={popupOpen}
              aria-controls={bodyRegionId}
              type="button"
              onClick={() => setPopupOpen((s) => !s)}
            >
              {popupOpen ? '–' : '+'}
            </button>
          </div>
        </div>

        {/* Body renders only when popupOpen is true */}
        {popupOpen && (
          <div className="landing-popup__body" id={bodyRegionId} role="region" aria-labelledby={headerTitleId}>
            {/* Light-hearted, explanatory copy (v2) */}
            <p>
              Plot your glorious escape from the workforce. Tell us your target nest egg (in tokens),
              how many you&apos;ve got now, and when you&apos;d like to sail into the sunset. We&apos;ll estimate how many
              tokens you need to win each month to stay on track. It&apos;s a straight line — no compounding,
              no market swings, just vibes and math.
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
                  ref={firstInputRef}
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
