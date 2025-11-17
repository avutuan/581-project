/**
 * ----------------------------------------------------------
 * Roulette-Lite Game Page
 * ----------------------------------------------------------
 * Author: Changwen Gong
 * Last Modified: 2025/11/17
 *
 * Description:
 * This React component implements a simplified Roulette game
 * with red/black betting only and a 2.0x payout. Users place
 * bets on either red or black, spin the wheel, and receive
 * their winnings if they guess correctly.
 *
 * Basically, this is a coin-flip style roulette game.
 * ----------------------------------------------------------
 */

import { useState } from 'react';
import { useSupabaseAccount } from '../context/SupabaseAccountContext.jsx';
import GameShell from '../components/game/GameShell.jsx';
import BetSlip from '../components/game/BetSlip.jsx';
import RoundHistory from '../components/game/RoundHistory.jsx';

// Initial state for a roulette round
const INITIAL_ROUND = {
  stage: 'idle',
  currentBet: 0,
  selectedColor: null,
  result: null,
  resultSection: null,
  message: 'Place a bet and choose red or black.',
  error: ''
};

// 8 sections alternating red and black (starting with red at top)
const WHEEL_SECTIONS = Array.from({ length: 8 }, (_, i) => ({
  index: i,
  color: i % 2 === 0 ? 'red' : 'black'
}));

const RoulettePage = () => {
  // Access balance and transaction functions from context
  const { balance, debit, credit } = useSupabaseAccount();
  const [round, setRound] = useState(INITIAL_ROUND);
  const [history, setHistory] = useState([]);
  const [lastBet, setLastBet] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  // Minimum bet amount
  const minBet = 100;

  // Function to handle color selection
  const handleColorSelect = (color) => {
    // Only allow selection when idle
    if (round.stage !== 'idle') return;
    
    setRound((prev) => ({
      ...prev,
      selectedColor: color,
      message: `${color.toUpperCase()} selected. Ready to spin!`,
      error: ''
    }));
  };

  // Function to handle bet placement and spin
  const handleSpin = async (betAmount) => {
    // Validate bet amount
    if (betAmount < minBet) {
      setRound((prev) => ({ ...prev, error: `Minimum bet is ${minBet} tokens.` }));
      return;
    }

    // Check if balance is sufficient
    if (betAmount > balance) {
      setRound((prev) => ({ ...prev, error: 'Insufficient balance.' }));
      return;
    }

    // Check if color is selected
    if (!round.selectedColor) {
      setRound((prev) => ({ ...prev, error: 'Please select red or black first.' }));
      return;
    }

    // Reset wheel to 0 position first
    setWheelRotation(0);
    setIsSpinning(false);

    // Wait a moment for the reset to take effect
    await new Promise(resolve => setTimeout(resolve, 50));

    // Debit the bet amount
    await debit(betAmount, 'Roulette bet');

    // Calculate random rotation
    const randomSpins = 3 + Math.random() * 2; // 3-5 full rotations
    const randomAngle = Math.random() * 360; // Random angle within a full rotation
    const finalRotation = (randomSpins * 360) + randomAngle;
    
    // Calculate which section the arrow will point to after rotation
    // The arrow points at the top (0 degrees)
    // After rotating the wheel by finalRotation, we need to figure out which section is at top
    // Normalize the rotation to 0-360 range
    const normalizedRotation = finalRotation % 360;
    // The wheel rotates, so we need to find which section ends up at 0 degrees
    // If wheel rotates 45 degrees, section 1 moves to where section 0 was (top)
    // So the section at top is at position (360 - normalizedRotation)
    const sectionAtTop = Math.floor(((360 - normalizedRotation) % 360) / 45);
    const resultSection = sectionAtTop;

    // Update state to spinning
    setRound((prev) => ({
      ...prev,
      stage: 'spinning',
      currentBet: betAmount,
      resultSection,
      message: 'Spinning...',
      error: ''
    }));
    setLastBet(betAmount);
    setIsSpinning(true);
    setWheelRotation(finalRotation);

    // Simulate wheel spin with a delay (3 seconds to match CSS transition)
    setTimeout(() => {
      resolveRound(betAmount, resultSection);
    }, 3000);
  };

  // Function to resolve the round
  const resolveRound = async (betAmount, resultSection) => {
    // Get the color from the result section
    const resultColor = WHEEL_SECTIONS[resultSection].color;
    const won = resultColor === round.selectedColor;

    // Award winnings if player won
    if (won) {
      await credit(betAmount * 2, 'Roulette win');
    }

    // Create history entry
    const historyEntry = {
      id: Date.now(),
      bet: betAmount,
      selectedColor: round.selectedColor,
      resultColor,
      outcome: won ? 'win' : 'loss',
      payout: won ? betAmount * 2 : 0,
      timestamp: new Date()
    };

    // Update history
    setHistory((prev) => [historyEntry, ...prev.slice(0, 9)]);

    // Update round state with result
    setRound({
      stage: 'complete',
      currentBet: betAmount,
      selectedColor: round.selectedColor,
      result: resultColor,
      resultSection,
      message: won 
        ? `${resultColor.toUpperCase()}! You won ${(betAmount * 2).toLocaleString()} tokens!`
        : `${resultColor.toUpperCase()}. Better luck next time.`,
      error: ''
    });
    // Keep isSpinning true to maintain the transition
    setTimeout(() => setIsSpinning(false), 100);
  };

  // Function to reset for a new round
  const handleNewRound = () => {
    setRound(INITIAL_ROUND);
  };

  return (
    <GameShell
      title="Roulette-Lite"
      eyebrow="Sprint 3"
      description="Simple red/black betting with 2.0x payout. Choose your color and spin the wheel!"
      meta={[
        { label: 'Payout', value: '2.0x' },
        { label: 'Min Bet', value: `${minBet} tokens` },
        { label: 'Balance', value: `${balance.toLocaleString()} tokens` }
      ]}
    >
      <div className="game-shell__body">
        {/* Main playfield area */}
        <div className="game-shell__playfield">
          <div className="roulette-lite-table">
            {/* Color selection buttons */}
            <div className="roulette-lite-colors">
              <button
                className={`roulette-lite-color roulette-lite-color--red ${
                  round.selectedColor === 'red' ? 'selected' : ''
                }`}
                onClick={() => handleColorSelect('red')}
                disabled={round.stage !== 'idle'}
              >
                RED
              </button>
              <button
                className={`roulette-lite-color roulette-lite-color--black ${
                  round.selectedColor === 'black' ? 'selected' : ''
                }`}
                onClick={() => handleColorSelect('black')}
                disabled={round.stage !== 'idle'}
              >
                BLACK
              </button>
            </div>

            {/* Wheel display */}
            <div className="roulette-lite-wheel-container">
              {/* Arrow pointer at top */}
              <div className="roulette-lite-arrow"></div>
              
              {/* Spinning wheel */}
              <div 
                className="roulette-lite-wheel"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
                }}
              >
                {/* 8 sections alternating red and black */}
                {WHEEL_SECTIONS.map((section) => (
                  <div
                    key={section.index}
                    className={`roulette-lite-section roulette-lite-section--${section.color}`}
                    style={{
                      transform: `rotate(${section.index * 45}deg)`
                    }}
                  />
                ))}
                
                {/* Center circle */}
                <div className="roulette-lite-center">
                  <span>SPIN</span>
                </div>
              </div>
            </div>

            {/* Message display */}
            <div className="roulette-lite-message">
              {round.message}
            </div>
          </div>
        </div>

        {/* Sidebar with betting controls */}
        <div className="game-shell__sidebar">
          <BetSlip
            currentBet={lastBet}
            balance={balance}
            minBet={minBet}
            onSubmit={handleSpin}
            disabled={round.stage === 'spinning'}
          />

          {round.stage === 'complete' && (
            <button
              className="cta-button cta-button--secondary"
              onClick={handleNewRound}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              New Round
            </button>
          )}

          {history.length > 0 && (
            <RoundHistory
              history={history.map((h) => ({
                ...h,
                outcome: h.outcome === 'loss' ? 'dealer' : h.outcome,
                note: `${h.selectedColor.toUpperCase()} → ${h.resultColor.toUpperCase()}: ${
                  h.outcome === 'win' ? `Won ${h.payout.toLocaleString()}` : 'Lost'
                }`
              }))}
            />
          )}
        </div>
      </div>
    </GameShell>
  );
};

export default RoulettePage;
