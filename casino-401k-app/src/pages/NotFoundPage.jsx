import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="page not-found-page">
      <section className="placeholder-card placeholder-card--large">
        <p className="placeholder-card__sprint">Oops</p>
        <h1>404 – Out of scope</h1>
        <p>
          That route isn&apos;t part of Sprint 1. Head back to the lobby or spin up Blackjack to keep testing.
        </p>
        <div className="not-found-page__actions">
          <Link to="/lobby" className="cta-button cta-button--primary">
            Lobby
          </Link>
          <Link to="/" className="cta-button cta-button--secondary">
            Project overview
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;
