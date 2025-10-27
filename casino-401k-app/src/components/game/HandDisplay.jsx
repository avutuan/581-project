const Card = ({ card, hidden }) => {
  if (hidden) {
    return <div className="bj-card bj-card--hidden">??</div>;
  }
  return (
    <div className={`bj-card bj-card--${card.suitColor}`}>
      <span className="bj-card__rank">{card.rank}</span>
      <span className="bj-card__suit">{card.suit}</span>
    </div>
  );
};

const HandDisplay = ({ title, hand, total, isDealer = false, hideHoleCard = false }) => {
  return (
    <div className="hand-display">
      <header>
        <h3>{title}</h3>
        <span className="hand-display__total">{typeof total === 'number' ? total : '--'}</span>
      </header>
      <div className="hand-display__cards">
        {hand.map((card, index) => (
          <Card
            card={card}
            hidden={hideHoleCard && index === 1}
            key={`${card.code}-${index}`}
          />
        ))}
        {hand.length === 0 && <p className="hand-display__empty">Cards will appear here.</p>}
      </div>
    </div>
  );
};

export default HandDisplay;
