/*
Prologue Comments:
- NotFoundPage: This component is displayed when a route is not found.
- Inputs: None.
- Outputs: Renders a 404 page.
- External sources: None.
- Author: John Tran, Creation date: 2025-11-09
*/

// Import Link for client-side navigation
import { Link } from 'react-router-dom';

// Minimal 404 page used when a route does not exist or is outside sprint scope.
// Provides links back to core app areas so graders can continue testing flows.
const NotFoundPage = () => {
  return (
    // Outer page container with styling hooks
    <div className="page not-found-page">
      {/* Card-styled section to present the 404 message */}
      <section className="placeholder-card placeholder-card--large">
        {/* Eyebrow-like label for consistent visual language */}
        <p className="placeholder-card__sprint">Oops</p>
        {/* Primary heading explaining the error */}
        <h1>404 – Out of scope</h1>
        {/* Supporting copy that directs the user to valid routes */}
        <p>
          That route isn&apos;t part of Sprint 1. Head back to the lobby or spin up Blackjack to keep testing.
        </p>
        {/* Suggested actions to navigate away from the 404 */}
        <div className="not-found-page__actions">
          {/* Link back to the lobby (protected area) */}
          <Link to="/lobby" className="cta-button cta-button--primary">
            Lobby
          </Link>
          {/* Link to the public landing page */}
          <Link to="/" className="cta-button cta-button--secondary">
            Project overview
          </Link>
        </div>
      </section>
    </div>
  );
};

// Export the component as default
export default NotFoundPage;
