import { Link, useParams } from 'react-router-dom';

const placeholderCopy = {
  'high-low': {
    sprint: 'Sprint 2',
    title: 'High–Low',
    description: 'Card predictions unlock next sprint. For now, revel in anticipation.'
  },
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

const GamePlaceholderPage = () => {
  const { gameId } = useParams();
  const copy = placeholderCopy[gameId] || placeholderCopy.default;

  return (
    <div className="page placeholder-page">
      <section className="placeholder-card placeholder-card--large">
        <p className="placeholder-card__sprint">{copy.sprint}</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <p className="placeholder-card__note">
          Only Blackjack is live today. This placeholder keeps the route intact for later development.
        </p>
        <Link to="/lobby" className="cta-button cta-button--primary">
          Back to lobby
        </Link>
      </section>
    </div>
  );
};

export default GamePlaceholderPage;
