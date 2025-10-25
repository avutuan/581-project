import { useEffect, useState } from 'react';

const BetSlip = ({ onSubmit, balance, disabled, currentBet, minBet = 100, maxBet }) => {
  const [amount, setAmount] = useState(currentBet || minBet);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!disabled && currentBet) {
      setAmount(currentBet);
    }
  }, [currentBet, disabled]);

  useEffect(() => {
    const cap = maxBet || balance;
    if (cap <= 0) {
      setAmount(minBet);
      return;
    }
    setAmount((prev) => (prev > cap ? Math.max(minBet, cap) : prev));
  }, [balance, maxBet, minBet]);

  const handleChange = (event) => {
    const value = Number(event.target.value);
    setAmount(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    try {
      const betValue = Number(amount);
      const betCap = maxBet || balance;
      if (Number.isNaN(betValue) || betValue < minBet) {
        throw new Error(`Bet must be at least ${minBet.toLocaleString()} tokens.`);
      }
      if (betValue > betCap) {
        throw new Error(`Bet cannot exceed ${betCap.toLocaleString()} tokens.`);
      }
      onSubmit(betValue);
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const quickBets = [minBet, minBet * 2, minBet * 5].filter((value) => value <= (maxBet || balance));

  return (
    <form className="bet-slip" onSubmit={handleSubmit}>
      <h2>Bet slip</h2>
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
      <p className="bet-slip__hint">Balance: {balance.toLocaleString()} tokens</p>

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

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="cta-button cta-button--primary" disabled={disabled}>
        {disabled ? 'Round running' : 'Place bet'}
      </button>
    </form>
  );
};

export default BetSlip;
