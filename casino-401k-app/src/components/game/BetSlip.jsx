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

  // Quick bet buttons: produce exactly three suggestions (min, 25%, 50%), clamped to cap
  const betCap = maxBet || balance;
  const insufficientBalance = balance < minBet;

  const computedQuick = [
    minBet,
    Math.max(minBet, Math.floor(balance * 0.25)),
    Math.max(minBet, Math.floor(balance * 0.5)),
  ].map((v) => Math.min(v, betCap));

  // remove duplicates while preserving order
  const quickBets = Array.from(new Set(computedQuick));

  // Global keyboard listener for Shift+Arrows: map to quick bet indices
  useEffect(() => {
    const onKey = (e) => {
      if (!e.shiftKey) return;
      if (disabled || insufficientBalance) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const v = quickBets[0];
        if (v != null) {
          setAmount(v);
          onSubmit(v);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const v = quickBets[1];
        if (v != null) {
          setAmount(v);
          onSubmit(v);
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const v = quickBets[2];
        if (v != null) {
          setAmount(v);
          onSubmit(v);
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [quickBets, disabled, insufficientBalance]);

  return (
    <form className="bet-slip" onSubmit={handleSubmit} aria-labelledby="betslip-heading">
      <h2 id="betslip-heading">Bet Slip</h2>

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
        aria-describedby={`bet-balance-hint ${error ? 'bet-error' : ''}`.trim()}
        aria-invalid={!!error}
        aria-required="true"
      />

      <p id="bet-balance-hint" className="bet-slip__hint">Balance: {formatNumber(balance)} tokens</p>

      <div className="bet-slip__shortcuts" aria-hidden="true">
        <span className="kbd">Shift + ←</span>
        <span className="kbd">Shift + ↑</span>
        <span className="kbd">Shift + →</span>
      </div>

      <div className="bet-slip__quickbets" role="group" aria-label="Quick bet amounts">
        {quickBets.length === 0 ? (
          <p className="bet-slip__hint">No quick bet suggestions available. Enter an amount above or top up your Wallet to see suggestions.</p>
        ) : (
          quickBets.map((value, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAmount(value)}
              disabled={disabled || insufficientBalance}
              aria-label={`Quick bet ${i + 1}: ${formatNumber(value)} tokens (Shift+${i === 0 ? 'Left' : i === 1 ? 'Up' : 'Down or Right'})`}
              title={`Quick bet: ${formatNumber(value)} tokens`}
            >
              {formatNumber(value)}
            </button>
          ))
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="cta-button cta-button--primary" disabled={disabled}>
        {disabled ? 'Round running' : 'Place bet'}
      </button>
    </form>
  );
};

export default BetSlip;
