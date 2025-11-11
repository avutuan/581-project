/**
 * ----------------------------------------------------------
 * Game Placeholder Page Module
 * ----------------------------------------------------------
 * Author: John Tran
 * Last Modified: 2025/11/9
 *
 * Description:
 * This React component serves as a placeholder page for upcoming games
 * that are not yet implemented in the casino 401k app. It provides
 * users with information about the upcoming game and a link back to the lobby.
 * ----------------------------------------------------------
 */
import { Link, useParams } from 'react-router-dom';

// Placeholder copy for different upcoming games
const placeholderCopy = {
  slots: {
    sprint: 'Sprint 3',
    title: 'Slots Mini',
    description: 'Three reels and glory arrive in Sprint 3. Until then, the lobby is the vibe.'
  },
  default: {
    sprint: 'Later',
    title: 'Coming soon',
    description: 'This table is pencilled into a future sprint. Check the backlog for details.'
  }
};

// GamePlaceholderPage component definition
const GamePlaceholderPage = () => {
  // Get the gameId from route parameters
  const { gameId } = useParams();

  // Select the appropriate placeholder copy based on gameId
  const copy = placeholderCopy[gameId] || placeholderCopy.default;

  // Render the placeholder page
  return (
    // Page container
    <div className="page placeholder-page">
      {/* Placeholder content */}
      <section className="placeholder-card placeholder-card--large">
        {/* Sprint information */}
        <p className="placeholder-card__sprint">{copy.sprint}</p>
        {/* Title and description */}
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        {/* Note about current availability */}
        <p className="placeholder-card__note">
          Blackjack, High-Low, and Slots Mini are live today. This placeholder keeps the rest of the routes intact for later development.
        </p>
        {/* Link back to lobby */}
        <Link to="/lobby" className="cta-button cta-button--primary">
          Back to lobby
        </Link>
      </section>
    </div>
  );
};

export default GamePlaceholderPage;
