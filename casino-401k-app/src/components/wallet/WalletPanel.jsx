/**
 * ----------------------------------------------------------
 * WalletPanel Component
 * ----------------------------------------------------------
 * Author: Changwen Gong
 * Last Modified: 2025/11/7
 *
 * Description:
 * This React component displays the user's wallet information including
 * current balance, transaction statistics, and detailed transaction history.
 * It provides financial insights for the satirical 401k Casino gaming
 * experience.
 *
 * The component calculates and displays:
 * - Current balance with visual prominence
 * - Total amount wagered (all debit transactions)
 * - Total amount won (all credit transactions from wins)
 * - Net profit/loss with color-coded display
 * - Last 20 transaction entries with timestamps and details
 *
 * Basically, this is your financial dashboard for the casino.
 * ----------------------------------------------------------
 */

import { useSupabaseAccount } from '../../context/SupabaseAccountContext.jsx';
import ExportCSVButton from './ExportCSVButton.jsx';

const WalletPanel = () => {
  // Access user's balance and transaction history from Supabase account context
  const { balance, transactions } = useSupabaseAccount();

  // Limit transaction history to the most recent 20 entries for better performance
  const recentTransactions = transactions.slice(0, 20);
  
  // Calculate total amount wagered by summing all debit transactions (bets placed)
  const totalWagered = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate total winnings by summing credit transactions that contain 'win' in description
  const totalWon = transactions
    .filter(t => t.type === 'credit' && t.description.includes('win'))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="wallet-panel">
      {/* Wallet Header Section */}
      <div className="wallet-header">
        <div className="wallet-header__content">
          <div>
            <h2>💰 Your Wallet</h2>
            <p className="wallet-subtitle">Track your balance and transaction history</p>
          </div>
          <div className="wallet-header__actions">
            <ExportCSVButton />
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid - displays key wallet metrics */}
      <div className="wallet-stats">
        {/* Primary Card: Current Balance */}
        <div className="wallet-stat-card wallet-stat-card--primary">
          <div className="wallet-stat-card__label">Current Balance</div>
          <div className="wallet-stat-card__value">{balance.toLocaleString()}</div>
          <div className="wallet-stat-card__unit">tokens</div>
        </div>

        {/* Total Wagered: Sum of all bets placed */}
        <div className="wallet-stat-card">
          <div className="wallet-stat-card__label">Total Wagered</div>
          <div className="wallet-stat-card__value">{totalWagered.toLocaleString()}</div>
          <div className="wallet-stat-card__unit">tokens</div>
        </div>

        {/* Total Won: Sum of all winning payouts */}
        <div className="wallet-stat-card">
          <div className="wallet-stat-card__label">Total Won</div>
          <div className="wallet-stat-card__value">{totalWon.toLocaleString()}</div>
          <div className="wallet-stat-card__unit">tokens</div>
        </div>

        {/* Net Profit/Loss: Difference between winnings and wagers */}
        <div className="wallet-stat-card">
          <div className="wallet-stat-card__label">Net Profit/Loss</div>
          {/* Apply 'positive' or 'negative' class based on whether user is up or down */}
          <div className={`wallet-stat-card__value ${totalWon - totalWagered >= 0 ? 'positive' : 'negative'}`}>
            {totalWon - totalWagered >= 0 ? '+' : ''}{(totalWon - totalWagered).toLocaleString()}
          </div>
          <div className="wallet-stat-card__unit">tokens</div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="wallet-transactions">
        <h3>Transaction History</h3>
        {/* Show empty state if no transactions exist */}
        {recentTransactions.length === 0 ? (
          <p className="wallet-empty">No transactions yet. Start playing to see your history!</p>
        ) : (
          <div className="wallet-transaction-list">
            {/* Map through recent transactions and display each one */}
            {recentTransactions.map((txn) => (
              <div key={txn.id} className="wallet-transaction-item">
                {/* Left side: Icon and transaction details */}
                <div className="wallet-transaction-item__main">
                  {/* Visual indicator: up arrow for credits, down arrow for debits */}
                  <div className="wallet-transaction-item__icon">
                    {txn.type === 'credit' ? '↑' : '↓'}
                  </div>
                  <div className="wallet-transaction-item__details">
                    {/* Transaction description (e.g., "Blackjack bet", "Blackjack win") */}
                    <div className="wallet-transaction-item__description">
                      {txn.description}
                    </div>
                    {/* Formatted timestamp showing when transaction occurred */}
                    <div className="wallet-transaction-item__timestamp">
                      {new Date(txn.created_at || txn.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                {/* Right side: Amount and resulting balance */}
                <div className="wallet-transaction-item__amounts">
                  {/* Transaction amount with + or - prefix and color coding */}
                  <div className={`wallet-transaction-item__amount wallet-transaction-item__amount--${txn.type}`}>
                    {txn.type === 'credit' ? '+' : '-'}
                    {txn.amount.toLocaleString()}
                  </div>
                  {/* Balance after this transaction was processed */}
                  <div className="wallet-transaction-item__balance">
                    Balance: {(txn.balance_after || txn.balance).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPanel;
