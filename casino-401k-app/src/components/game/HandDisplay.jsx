/**
 * ----------------------------------------------------------
 * Hand Display Component
 * ----------------------------------------------------------
 * Author: John Tran
 * Last Modified: 2025/11/7
 *
 * Description:
 * This React component displays a player's or dealer's hand in a card game.  
 * It shows the cards, the total value of the hand, and can optionally hide
 * the dealer's hole card for suspense.
 * ----------------------------------------------------------
 */
const Card = ({ card, hidden }) => {
  // If the card should be hidden (like the dealer's hole card), show a placeholder
  if (hidden) {
    return <div className="bj-card bj-card--hidden">??</div>;
  }

  // Otherwise, display the actual card with rank and suit
  return (
    <div className={`bj-card bj-card--${card.suitColor}`}>
      <span className="bj-card__rank">{card.rank}</span> {/* shows the card rank (e.g., A, 10, K) */}
      <span className="bj-card__suit">{card.suit}</span> {/* shows the card suit (e.g., ♥, ♣) */}
    </div>
  );
};

const HandDisplay = ({ title, hand, total, isDealer = false, hideHoleCard = false }) => {
  return (
    <div className="hand-display">
      <header>
        {/* Displays whose hand it is (Dealer or Player) */}
        <h3>{title}</h3>

        {/* Shows the total hand value, or "--" if it's not a number yet */}
        <span className="hand-display__total">
          {typeof total === 'number' ? total : '--'}
        </span>
      </header>

      {/* Renders all cards in the hand */}
      <div className="hand-display__cards">
        {hand.map((card, index) => (
          <Card
            card={card}
            hidden={hideHoleCard && index === 1} // hide second card if dealer's hole card
            key={`${card.code}-${index}`} // unique key for React rendering
          />
        ))}

        {/* Message shown when no cards are dealt yet */}
        {hand.length === 0 && (
          <p className="hand-display__empty">Cards will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default HandDisplay;
