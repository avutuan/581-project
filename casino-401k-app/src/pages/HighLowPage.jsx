/**
 * ----------------------------------------------------------
 * High Low Game Page Module
 * ----------------------------------------------------------
 * Author: Tuan Vu
 * Last Modified: 2025/11/9
 *
 * Description:
 * This module implements the High Low game logic and UI components.
 * ----------------------------------------------------------
 */

import { useState } from 'react';
import { useSupabaseAccount } from '../context/SupabaseAccountContext.jsx';
import GameShell from '../components/game/GameShell.jsx';
import BetSlip from '../components/game/BetSlip.jsx';
import HandDisplay from '../components/game/HandDisplay.jsx';
import RoundHistory from '../components/game/RoundHistory.jsx';
import { createDeck, shuffle } from '../data/deck.js';

// Initial state for a High Low game round
const INITIAL = {
  stage: 'idle', // idle | waiting-choice | resolved | round-over
  deck: [],
  firstCard: null,
  secondCard: null,
  currentBet: 0,
  message: 'Place a bet and pick higher or lower.',
  outcome: null,
  error: ''
};

// HighLowPage component definition
const HighLowPage = () => {
  // Hooks and context
  const { balance, debit, credit, recordGameSession } = useSupabaseAccount();
  const [round, setRound] = useState(INITIAL);
  const [history, setHistory] = useState([]);
  const [lastBet, setLastBet] = useState(100);

  // Minimum bet amount
  const minBet = 100;

  // Function to start a new round
  const startRound = (amount) => {
    // Shuffle the deck and draw the first card
    const deck = shuffle(createDeck());
    const first = deck.pop();

    // Update state to waiting for player's choice
    setLastBet(amount);

    // Update round state
    setRound({
      stage: 'waiting-choice',
      deck,
      firstCard: first,
      secondCard: null,
      currentBet: amount,
      message: 'Choose Higher or Lower',
      outcome: null,
      error: ''
    });
  };

  // Function to place a bet
  const placeBet = async (amount) => {
    // Prevent betting if round is active
    if (round.stage !== 'idle' && round.stage !== 'round-over') return;
    // Deduct bet amount from user's balance and start round
    try {
      await debit(amount, 'High-Low bet');
      startRound(amount);
    } catch (err) {
      setRound((prev) => ({ ...prev, error: err.message }));
    }
  };

  // Function to resolve player's choice
  const resolveChoice = async (userChoice) => {
    // Ensure round is in correct stage
    if (round.stage !== 'waiting-choice') return;
    // Draw the next card
    const deck = [...round.deck];
    const second = deck.pop();
    const first = round.firstCard;
    // Determine outcome
    let outcome;
    // Evaluate player's choice against drawn cards
    if (second.value === first.value) {
      outcome = 'push';
    } else if (userChoice === 'higher') {
      outcome = second.value > first.value ? 'win' : 'lose';
    } else {
      outcome = second.value < first.value ? 'win' : 'lose';
    }

    // payout rules: win -> 1.9x stake, push -> stake returned, lose -> nothing
    const stake = round.currentBet;
    const multiplier = 1.9;
    const payout = outcome === 'win' ? Math.round(stake * multiplier * 100) / 100 : (outcome === 'push' ? stake : 0);

    // Update ledger and record game session
    try {
      if (payout > 0) {
        await credit(payout, `High-Low ${outcome}`);
      }
      // Record the game session
      await recordGameSession('high-low', stake, payout, outcome, { first: first.code, second: second.code, choice: userChoice });
    } catch (err) {
      // ledger or recording failed
      setRound((prev) => ({ ...prev, error: err.message }));
    }

    // Update history and round state
    const note = outcome === 'win' ? `Win: ${payout}` : outcome === 'push' ? 'Push: bet returned' : 'Lose';
    setHistory((prev) => [{ id: `hl-${Date.now()}`, outcome, bet: stake, note, timestamp: new Date().toISOString() }, ...prev].slice(0, 12));

    setRound({
      stage: 'round-over',
      deck,
      firstCard: first,
      secondCard: second,
      currentBet: stake,
      message: note,
      outcome,
      error: ''
    });
  };

  // Function to handle new round (reset)
  const handleNewRound = () => {
    // Reset to initial state, preserving last bet
    setRound({ ...INITIAL, message: 'Ready when you are.', currentBet: lastBet });
  };

  // Action controls for the game
  const actionControls = (
    // Higher, Lower, and Reset buttons
    <div className="highlow-actions">
        <button
            type="button"
            className="cta-button cta-button--primary"
            onClick={() => resolveChoice('higher')}
            disabled={round.stage !== 'waiting-choice'}
        >
            Higher
        </button>
        <button
            type="button"
            className="cta-button cta-button--primary"
            onClick={() => resolveChoice('lower')}
            disabled={round.stage !== 'waiting-choice'}
        >
            Lower
        </button>
        <button
            type="button"
            className="cta-button cta-button--ghost"
            onClick={handleNewRound}
            disabled={round.stage === 'waiting-choice'}
        >
            Reset
        </button>
    </div>
  );

  // Determine if betting is disabled
  const betDisabled = round.stage === 'waiting-choice' || balance < minBet;

  // Sidebar content for the game
  const sidebar = (
    // BetSlip, round status, and action controls
    <>
      {/* Bet slip for placing bets */}
      <BetSlip
        onSubmit={placeBet}
        balance={balance}
        disabled={betDisabled}
        currentBet={round.stage === 'idle' ? lastBet : round.currentBet}
        minBet={minBet}
        maxBet={balance}
      />
      {/* Round status display */}
      <div className="game-sidebar-panel">
        <h2>Round status</h2>
        <p>{round.message}</p>
        {round.error && <p className="form-error">{round.error}</p>}
      </div>
      {/* Game action controls */}
      {actionControls}
    </>
  );

  // Metadata for the game
  const meta = [
    { label: 'Payout', value: '~1.9x' },
    { label: 'Deck', value: 'Single, reshuffled each round' },
    { label: 'Status', value: 'Sprint 2' }
  ];

  // Render the High Low game page
  return (
    // Page container
    <div className="page highlow-page">
      {/* Game shell */}
      <GameShell
        title="High-Low"
        description="Predict whether the next card will be higher or lower. Place a bet and reveal the result."
        meta={meta}
        sidebar={sidebar}
        footer={<RoundHistory history={history} />}
      >
        {/* Playfield displaying current and next cards */}
        <div className="highlow-playfield">
          <HandDisplay title="Current card" hand={round.firstCard ? [round.firstCard] : []} total={round.firstCard ? round.firstCard.value : undefined} />
          <HandDisplay title="Next card" hand={round.secondCard ? [round.secondCard] : []} total={round.secondCard ? round.secondCard.value : undefined} />
        </div>
      </GameShell>
    </div>
  );
};

export default HighLowPage;
