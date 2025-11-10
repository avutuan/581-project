/**
 * ----------------------------------------------------------
 * Betslip Component
 * ----------------------------------------------------------
 * Author: Kevinh Nguyen
 * Last Modified: 2025/11/9
 *
 * Description:
 * This React component renders a bet slip form for placing bets in a casino game.
 * It includes an input for the bet amount, quick bet buttons, and validation
 * to ensure the bet is within allowed limits based on the player's balance
 * and specified minimum/maximum bet amounts.
 * ----------------------------------------------------------
 */
import { useEffect, useState } from 'react';

// Helper to format numbers as 1.5 K / 2.3 M / 1 B
const formatNumber = (num) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + ' B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + ' M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + ' K';
  return num.toString();
};

const BetSlip = ({
  onSubmit,
  balance,
  disabled,
  currentBet,
  minBet,
  maxBet,
  defaultPercentage = 0.1
}) => {
  const [amount, setAmount] = useState(currentBet || Math.max(minBet, Math.floor(balance * defaultPercentage)));
  const [error, setError] = useState('');

  // Sync currentBet when it changes
  useEffect(() => {
    if (!disabled && currentBet) {
      setAmount(currentBet);
    }
  }, [currentBet, disabled]);

  // Dynamically update bet if balance changes
  useEffect(() => {
    const cap = maxBet || balance;
    let newAmount = Math.max(minBet, Math.floor(balance * defaultPercentage));
    if (newAmount > cap) newAmount = cap;
    setAmount(newAmount);
  }, [balance, maxBet, minBet, defaultPercentage]);

  const handleChange = (event) => {
    const value = Number(event.target.value);
    setAmount(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const betCap = maxBet || balance;
    if (Number.isNaN(amount) || amount < minBet) {
      setError(`Bet must be at least ${formatNumber(minBet)} tokens.`);
      return;
    }
    if (amount > betCap) {
      setError(`Bet cannot exceed ${formatNumber(betCap)} tokens.`);
      return;
    }

    onSubmit(amount);
  };

  // Quick bet buttons scaled by balance
  const quickBets = [minBet, Math.floor(balance * 0.25), Math.floor(balance * 0.5), Math.floor(balance * 0.75)]
    .filter((val) => val <= (maxBet || balance) && val >= minBet);

  return (
    <form className="bet-slip" onSubmit={handleSubmit}>
      <h2>Bet Slip</h2>

      <label htmlFor="betAmount">Bet amount</label>
      <input
        id="betAmount"
        type="number"
        min={minBet}
        max={maxBet || balance}
        step={minBet}
        value={amount}
        onChange={handleChange}
        disabled={disabled}
      />

      <p className="bet-slip__hint">Balance: {formatNumber(balance)} tokens</p>

      <div className="bet-slip__quickbets">
        {quickBets.map((value) => (
          <button key={value} type="button" onClick={() => setAmount(value)} disabled={disabled}>
            {formatNumber(value)}
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="cta-button cta-button--primary" disabled={disabled}>
        {disabled ? 'Round running' : 'Place bet'}
      </button>
    </form>
  );
};

export default BetSlip;
