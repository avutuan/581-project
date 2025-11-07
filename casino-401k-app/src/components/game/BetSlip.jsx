/**
 * ----------------------------------------------------------
 * Betslip Component
 * ----------------------------------------------------------
 * Author: Kevinh Nguyen
 * Last Modified: 2025/11/7
 *
 * Description:
 * This React component renders a bet slip form for placing bets in a casino game.
 * It includes an input for the bet amount, quick bet buttons, and validation
 * to ensure the bet is within allowed limits based on the player's balance
 * and specified minimum/maximum bet amounts.
 * ----------------------------------------------------------
 */

import { useEffect, useState } from 'react';

const BetSlip = ({ onSubmit, balance, disabled, currentBet, minBet = 100, maxBet }) => {
  // Track the amount the user is currently betting
  const [amount, setAmount] = useState(currentBet || minBet);

  // Store error messages when validation fails
  const [error, setError] = useState('');

  // When the game is NOT disabled and there's a current bet, sync it
  useEffect(() => {
    if (!disabled && currentBet) {
      setAmount(currentBet);
    }
  }, [currentBet, disabled]);

  // Watch for balance or max bet changes and adjust amount if needed
  useEffect(() => {
    const cap = maxBet || balance; // max bet limit (whichever is smaller)
    if (cap <= 0) {
      setAmount(minBet);
      return;
    }
    // Keep the amount within the allowed range
    setAmount((prev) => (prev > cap ? Math.max(minBet, cap) : prev));
  }, [balance, maxBet, minBet]);

  // Handle input field changes
  const handleChange = (event) => {
    const value = Number(event.target.value);
    setAmount(value);
  };

  // Handle bet submission
  const handleSubmit = (event) => {
    event.preventDefault(); // stop form refresh
    setError(''); // reset errors first

    try {
      const betValue = Number(amount);
      const betCap = maxBet || balance;

      // Validate: minimum bet check
      if (Number.isNaN(betValue) || betValue < minBet) {
        throw new Error(`Bet must be at least ${minBet.toLocaleString()} tokens.`);
      }

      // Validate: maximum bet check
      if (betValue > betCap) {
        throw new Error(`Bet cannot exceed ${betCap.toLocaleString()} tokens.`);
      }

      // If valid, submit the bet
      onSubmit(betValue);
    } catch (submitError) {
      // Display error message under form
      setError(submitError.message);
    }
  };

  // Quick bet shortcuts (1x, 2x, 5x the minimum bet)
  const quickBets = [minBet, minBet * 2, minBet * 5].filter(
    (value) => value <= (maxBet || balance)
  );

  return (
    <form className="bet-slip" onSubmit={handleSubmit}>
      <h2>Bet slip</h2>

      {/* Input for custom bet amount */}
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

      {/* Show current balance for user reference */}
      <p className="bet-slip__hint">Balance: {balance.toLocaleString()} tokens</p>

      {/* Quick bet buttons for convenience */}
      <div className="bet-slip__quickbets">
        {quickBets.map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => setAmount(value)}
            disabled={disabled}
          >
            {value.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Display error message if validation fails */}
      {error && <p className="form-error">{error}</p>}

      {/* Submit button (disabled when a round is in progress) */}
      <button
        type="submit"
        className="cta-button cta-button--primary"
        disabled={disabled}
      >
        {disabled ? 'Round running' : 'Place bet'}
      </button>
    </form>
  );
};

export default BetSlip;