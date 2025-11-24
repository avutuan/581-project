/*
Prologue Comments:
- Component: LandingPage — landing and overview screen with hero content plus an inline retirement calculator popup.
- Inputs: Auth state via useSupabaseAuth, upcomingOverview feature data, and localStorage-persisted calculator values.
- Outputs: JSX that renders the landing experience with calls-to-action and an interactive calculator dialog.
- External sources: None.
- Author: Raj Kaura; Creation date: Nov 15th.
*/

import React, { useEffect, useRef, useState } from 'react'; // Import hooks for state, persistence side-effects, and focus refs
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
  const LS_KEYS = { // Centralized localStorage key registry for consistency & avoidance of string duplication
    open: 'onTrackPopupOpen', // Stores boolean string indicating whether popup is open
    focus: 'onTrackPopupFocus', // Flag set cross-page to request focus when landing loads
    target: 'onTrackCalc.target', // Persisted retirement target value
    current: 'onTrackCalc.current', // Persisted current balance value
    years: 'onTrackCalc.years', // Persisted years until retirement value
  };

  // Helpers to read sane numeric defaults from localStorage
  const readNumber = (key, fallback) => { // Safely parse a non-negative numeric value from localStorage or return fallback
    const raw = localStorage.getItem(key); // Fetch raw string from localStorage
    if (raw === null || raw === undefined) return fallback; // If missing, use fallback default
    const n = Number(raw); // Convert string to number
    return Number.isFinite(n) && n >= 0 ? n : fallback; // Validate finite & non-negative else fallback
  };

  // Popup open/minimized state. Persisted in localStorage; default open so graders see it.
  const [popupOpen, setPopupOpen] = useState(() => { // Popup open state with lazy initializer reading persisted state
    const stored = localStorage.getItem(LS_KEYS.open); // Retrieve persisted open flag
    return stored !== null ? stored === 'true' : true; // If stored, coerce to boolean; else default open for visibility
  });

  // Calculator inputs (simple numeric state). Defaults chosen for demonstrative value.
  const [landingTarget, setLandingTarget] = useState(() => readNumber(LS_KEYS.target, 401000)); // tokens goal (persisted or default 401k parody)
  const [landingCurrent, setLandingCurrent] = useState(() => readNumber(LS_KEYS.current, 0)); // current tokens (persisted or start at 0)
  const [landingYears, setLandingYears] = useState(() => readNumber(LS_KEYS.years, 30)); // years until retirement (persisted or default span)

  // Refs for accessibility/focus management
  const firstInputRef = useRef(null); // Ref pointing to first input for focus management on open
  const headerTitleId = 'ontrack-calculator-title'; // Stable ID for aria-labelledby linking title to dialog & region
  const bodyRegionId = 'ontrack-calculator-panel'; // Stable ID for expanded region body container

  // Persist popup state and calculator defaults when they change
  useEffect(() => { // Persist popup open/minimized state whenever it changes
    localStorage.setItem(LS_KEYS.open, String(popupOpen)); // Store boolean state as string
  }, [popupOpen]);

  useEffect(() => { // Persist target input value changes
    localStorage.setItem(LS_KEYS.target, String(landingTarget ?? '')); // Safely stringify value for storage
  }, [landingTarget]);
  useEffect(() => { // Persist current balance input value changes
    localStorage.setItem(LS_KEYS.current, String(landingCurrent ?? '')); // Save updated current balance
  }, [landingCurrent]);
  useEffect(() => { // Persist years until retirement input value changes
    localStorage.setItem(LS_KEYS.years, String(landingYears ?? '')); // Save updated years span
  }, [landingYears]);

  // If a focus request flag was set by another page (e.g., Lobby), honor it on mount
  useEffect(() => { // One-time mount effect: handle cross-page focus request
    const wantsFocus = localStorage.getItem(LS_KEYS.focus) === 'true'; // Read focus flag from storage
    if (wantsFocus) { // If another page requested focus
      setPopupOpen(true); // Force popup open to ensure focus target exists
      localStorage.removeItem(LS_KEYS.focus); // Clear flag so it doesn't repeat on future visits
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps // Suppress exhaustive-deps since we intentionally run once
  }, []); // Empty dependency -> run only on first render

  // When popup opens, move focus to the first input for keyboard accessibility
  useEffect(() => { // Effect to focus first input when popup transitions to open
    if (popupOpen) { // Only act when now open
      setTimeout(() => { // Defer to next tick to allow DOM to render the input
        firstInputRef.current?.focus(); // Focus input if ref resolved (optional chaining prevents errors)
      }, 0); // Zero delay -> schedule after current call stack
    }
  }, [popupOpen]); // Depend on popupOpen so runs on toggle state change

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
        className={`landing-popup ${popupOpen ? 'landing-popup--open' : 'landing-popup--min'}`} // Dynamic class list reflecting open/minimized state
        role="dialog" // Acts as a non-modal dialog region for assistive tech
        aria-modal="false" // Explicitly non-modal so background remains accessible
        aria-labelledby={headerTitleId} // Links dialog to its title element for labeling
      >
        {/* Header row: title and controls */}
        <div className="landing-popup__header">
          {/* Strong element used as the visible title for the popup */}
          <strong id={headerTitleId}>Retirement Calculator</strong> {/* Title element labeled via ID for dialog and region */}
          <div className="landing-popup__controls">
            {/* Toggle button flips popupOpen; aria-label updates for a11y */}
            <button
              className="landing-popup__control" // Styling hook for toggle control
              aria-label={popupOpen ? 'Minimize popup' : 'Open popup'} // Accessible name describing current action
              aria-expanded={popupOpen} // Communicates expanded/collapsed state to AT
              aria-controls={bodyRegionId} // References the ID of the collapsible region
              type="button" // Explicit button type to avoid default form submit behavior
              onClick={() => setPopupOpen((s) => !s)} // Toggle popup open state using functional updater
            >
              {popupOpen ? '–' : '+'}
            </button>
          </div>
        </div>

        {/* Body renders only when popupOpen is true */}
        {popupOpen && ( // Conditionally render body only when popup is open
          <div className="landing-popup__body" id={bodyRegionId} role="region" aria-labelledby={headerTitleId}> {/* Region container with semantic labeling */}
            {/* Light-hearted, explanatory copy (v2) */}
            <p> {/* Explanatory copy elaborating purpose and limitations of calculator */}
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
                  type="number" // Numeric input for target token amount
                  min="0" // Prevent negative targets
                  step="1" // Whole token increments
                  // Coerce to number when passing into the input to avoid React warnings
                  value={Number.isFinite(Number(landingTarget)) ? landingTarget : ''} // Controlled value with fallback to empty string if invalid
                  onChange={(e) => setLandingTarget(e.target.value)} // Update state from user input (stored as string then coerced later)
                  ref={firstInputRef} // Focus target when popup opens
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(28,28,51,0.12)' }} // Inline styling for visual consistency
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
