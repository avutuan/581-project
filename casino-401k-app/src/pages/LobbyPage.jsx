import { Link } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext.jsx';
import { useSupabaseAccount } from '../context/SupabaseAccountContext.jsx';
import { gameLineup, sprintPlaceholders } from '../data/games.js';

const LobbyPage = () => {
  const { currentUser } = useSupabaseAuth();
  const { balance, transactions } = useSupabaseAccount();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="page lobby-page">
      <section className="lobby-hero">
        <div>
          <p className="lobby-hero__eyebrow">Welcome, {currentUser?.email}</p>
          <h1>Tonight&apos;s satirical bankroll</h1>
          <p>
            Sprint 1 delivers a working Blackjack table backed by a simple ledger. Place real bets (with fake
            tokens), watch balances update atomically, and preview what future sprints will unlock.
          </p>
        </div>
        <div className="balance-tile">
          <p className="balance-tile__label">401k Tokens</p>
          <p className="balance-tile__value">{balance.toLocaleString()}</p>
          <p className="balance-tile__note">Ledger debits on bets and credits on wins/pushes.</p>
        </div>
      </section>

      <section className="games-section">
        <header className="section-header">
          <h2>Game lineup</h2>
          <p>Only Blackjack is live for Sprint 1. The rest are neatly placeholdered.</p>
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
                <p className="transactions-list__description">{txn.description}</p>
                <p className="transactions-list__timestamp">
                  {new Date(txn.created_at || txn.timestamp).toLocaleString()}
                </p>
              </div>
              <div className={`transactions-list__amount transactions-list__amount--${txn.type}`}>
                {txn.type === 'credit' ? '+' : '-'}
                {txn.amount.toLocaleString()}
              </div>
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
