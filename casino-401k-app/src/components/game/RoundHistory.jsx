const outcomeLabels = {
  win: 'Win',
  blackjack: 'Blackjack!',
  dealer: 'Loss',
  push: 'Push'
};

const RoundHistory = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="round-history">
        <h2>Round history</h2>
        <p>No rounds yet. Place a bet to start the satire.</p>
      </div>
    );
  }

  return (
    <div className="round-history">
      <h2>Round history</h2>
      <ul>
        {history.slice(0, 6).map((entry) => (
          <li key={entry.id}>
            <div>
              <p className={`round-history__outcome round-history__outcome--${entry.outcome}`}>
                {outcomeLabels[entry.outcome]} · {entry.bet.toLocaleString()} tokens
              </p>
              <p className="round-history__timestamp">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <p className="round-history__note">{entry.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoundHistory;
