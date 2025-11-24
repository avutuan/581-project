import { Link } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext.jsx';
import { useSupabaseAccount } from '../context/SupabaseAccountContext.jsx';
import { gameLineup, sprintPlaceholders } from '../data/games.js';

// Lobby view — shows the user's current balance and available games. This page
// pulls account and auth data from context and renders a small transactions
// preview to demonstrate ledger updates after gameplay.

const LobbyPage = () => {
  // Current authenticated user (email and id useful for display/testing)
  const { currentUser } = useSupabaseAuth();

  // Account context provides the demo balance and transaction history
  const { balance, transactions } = useSupabaseAccount();

  // Show the most recent five transactions for quick inspection in the lobby
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="page lobby-page">
      <section className="lobby-hero">
        <div>
          <p className="lobby-hero__eyebrow">Welcome, {currentUser?.email}</p>
          <h1>Tonight&apos;s satirical bankroll</h1>
          <p>
            Blackjack landed in Sprint 1 and now shares the floor with High-Low and Slots Mini. Every wager still
            runs through the same satirical ledger, so bets debit instantly and wins credit straight back.
          </p>
          {/* On-Track popup launcher: opens/focuses the calculator on the landing page */}
          <div style={{ marginTop: '0.75rem' }}> {/* Spacing wrapper for launcher control */}
            <Link
              to="/" // Navigate back to landing page where calculator resides
              className="cta-button cta-button--secondary" // Use secondary styling to differentiate from primary CTAs
              onClick={() => { // Click handler sets persistence flags before navigation
                try { // Guard against potential localStorage access errors
                  localStorage.setItem('onTrackPopupOpen', 'true'); // Ensure popup will be open on load
                  localStorage.setItem('onTrackPopupFocus', 'true'); // Request focus transfer into calculator input
                } catch { // Silently ignore storage failures so navigation proceeds
                  // Ignore storage errors; navigation will still occur
                }
              }}
              aria-label="Open the On-Track retirement calculator on the landing page" // Accessible label describing action
            >
              Open Retirement Calculator {/* Visible link text for users */}
            </Link>
          </div>
        </div>
        <div className="balance-tile">
          <p className="balance-tile__label">401k Tokens</p>
          <p className="balance-tile__value">{balance.toLocaleString()}</p>
          <p className="balance-tile__note">Ledger debits on bets and credits on wins/pushes.</p>
        </div>
      </section>

    {/* Game lineup section: maps configured games into cards. Only live games
      are navigable; placeholders are intentionally disabled for clarity. */}
    <section className="games-section">
        <header className="section-header">
          <h2>Game lineup</h2>
          <p>Blackjack, High-Low, and Slots Mini are live; everything else stays placeholdered until future sprints.</p>
        </header>
        <div className="games-grid">
          {gameLineup.map((game) => (
            <article
              key={game.id}
              className={`lobby-game-card lobby-game-card--${game.status}`}
              aria-disabled={game.status !== 'available'}
            >
              <header>
                <p className="lobby-game-card__sprint">{game.sprint}</p>
                <h3>{game.name}</h3>
              </header>
              <p>{game.description}</p>
              {game.status === 'available' ? (
                <Link to={`/game/${game.id}`} className="cta-button cta-button--primary">
                  Enter table
                </Link>
              ) : (
                <button type="button" className="cta-button cta-button--ghost" disabled>
                  Placeholder
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="placeholder-section">
        <header className="section-header">
          <h2>Coming in later sprints</h2>
        </header>
        <div className="placeholder-grid">
          {sprintPlaceholders.map((item) => (
            <article className="placeholder-card" key={item.title}>
              <p className="placeholder-card__sprint">{item.sprint}</p>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <span className="placeholder-card__badge">Placeholder</span>
            </article>
          ))}
        </div>
      </section>

    {/* Transactions preview: simple list of recent ledger entries. Full export
      and wallet features are implemented in later sprints. */}
    <section className="transactions-section">
        <header className="section-header">
          <h2>Recent ledger entries</h2>
          <p>
            Full wallet panel ships in Sprint 2, but here&apos;s a quick look at the latest adjustments to prove the
            ledger works.
          </p>
        </header>
        <ul className="transactions-list">
          {recentTransactions.map((txn) => (
            <li key={txn.id}>
              <div>
                {/* Short description of the transaction e.g. "Blackjack win" */}
                <p className="transactions-list__description">{txn.description}</p>
                {/* Human-friendly timestamp; use created_at when available */}
                <p className="transactions-list__timestamp">
                  {new Date(txn.created_at || txn.timestamp).toLocaleString()}
                </p>
              </div>
              {/* Amount column: style depends on credit/debit */}
              <div className={`transactions-list__amount transactions-list__amount--${txn.type}`}>
                {txn.type === 'credit' ? '+' : '-'}
                {txn.amount.toLocaleString()}
              </div>
              {/* Running balance shown for context */}
              <div className="transactions-list__balance">
                Balance: {(txn.balance_after || txn.balance).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default LobbyPage;
