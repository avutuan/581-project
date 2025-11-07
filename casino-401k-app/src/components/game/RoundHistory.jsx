/**
 * ----------------------------------------------------------
 * Round History Component
 * ----------------------------------------------------------
 * Author: John Tran
 * Last Modified: 2025/11/7
 *
 * Description:
 * This React component displays the history of game rounds played.
 * It shows the outcome of each round, the bet amount, timestamp,
 * ----------------------------------------------------------
 */
// Labels for different round outcomes
const outcomeLabels = {
  win: 'Win',              // Player wins
  blackjack: 'Blackjack!', // Player wins with a blackjack
  dealer: 'Loss',          // Dealer wins
  push: 'Push'             // Tie game
};

const RoundHistory = ({ history }) => {
  // If there are no rounds played yet, show a simple message
  if (history.length === 0) {
    return (
      <div className="round-history">
        <h2>Round history</h2>
        <p>No rounds yet. Place a bet to start the satire.</p> {/* Funny placeholder text */}
      </div>
    );
  }

  return (
    <div className="round-history">
      <h2>Round history</h2>
      <ul>
        {/* Only show the last 6 rounds */}
        {history.slice(0, 6).map((entry) => (
          <li key={entry.id}>
            <div>
              {/* Shows outcome (Win, Loss, etc.) and bet amount */}
              <p className={`round-history__outcome round-history__outcome--${entry.outcome}`}>
                {outcomeLabels[entry.outcome]} · {entry.bet.toLocaleString()} tokens
              </p>

              {/* Shows the time the round ended */}
              <p className="round-history__timestamp">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </p>
            </div>

            {/* Extra info or comment about that round */}
            <p className="round-history__note">{entry.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoundHistory;

