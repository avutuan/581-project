import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { upcomingOverview } from '../data/games.js';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const primaryCta = isAuthenticated ? '/lobby' : '/login';
  const primaryLabel = isAuthenticated ? 'Jump to Lobby' : 'Create Satirical Account';

  return (
    <div className="page landing-page">
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
