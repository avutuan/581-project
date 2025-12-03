/**
 * ----------------------------------------------------------
 * Blackjack Game Page
 * ----------------------------------------------------------
 * Author: John Tran
 * Last Modified: 2025/11/9
 *
 * Description:
 * This React component implements the Blackjack game page,
 * allowing users to place bets, play rounds of blackjack,
 * and view their game history. It integrates with the
 * Supabase account context for balance management.
 * ----------------------------------------------------------
 */

import { useMemo, useState } from 'react';
import { useSupabaseAccount } from '../context/SupabaseAccountContext.jsx';
import GameShell from '../components/game/GameShell.jsx';
import BetSlip from '../components/game/BetSlip.jsx';
import HandDisplay from '../components/game/HandDisplay.jsx';
import RoundHistory from '../components/game/RoundHistory.jsx';
import { createBlackJackDeck, shuffle } from '../data/deck.js';

// Initial state for a Blackjack game round
const INITIAL_ROUND = {
  stage: 'idle',
  deck: [],
  playerHand: [],
  dealerHand: [],
  currentBet: 0,
  message: 'Place a bet to begin.',
  outcome: null,
  hideDealerHole: true,
  error: ''
};

// Function to calculate the value of a hand
const handValue = (hand) => {
  // Calculate total value considering Aces as 1 or 11
  let total = hand.reduce((sum, card) => sum + card.value, 0);
  // Adjust for Aces if total exceeds 21
  let aceCount = hand.filter((card) => card.rank === 'A').length;
  // While we have Aces and total is over 21, convert an Ace from 11 to 1
  while (total > 21 && aceCount > 0) {
    // Convert Ace from 11 to 1
    total -= 10;
    aceCount -= 1;
  }
  // Return the final total
  return total;
};

// Function to check for natural blackjack
const isBlackjack = (hand) => hand.length === 2 && handValue(hand) === 21;

// Function to describe the outcome of a round
const describeOutcome = (outcome, playerTotal, dealerTotal) => {
  // Generate a message based on the outcome
  switch (outcome) {
    // Natural blackjack
    case 'blackjack':
      return 'Natural blackjack! 2x payout credited.';
    // Player win
    case 'win':
      return `You win with ${playerTotal} over dealer ${dealerTotal}.`;
    // Push (tie)
    case 'push':
      return `Push. ${playerTotal} ties ${dealerTotal}. Bet returned.`;
    // Dealer win
    case 'dealer':
    default:
      // Dealer win scenarios
      return dealerTotal > 21
        ? 'Dealer busts. You win this round!'
        : `Dealer takes it with ${dealerTotal}.`;
  }
};

// BlackjackPage component definition
const BlackjackPage = () => {
  // Hooks and context
  const { balance, debit, credit } = useSupabaseAccount();
  const [round, setRound] = useState(INITIAL_ROUND);
  const [history, setHistory] = useState([]);
  const [lastBet, setLastBet] = useState(100);

  // Memoized hand totals
  const playerTotal = useMemo(() => handValue(round.playerHand), [round.playerHand]);
  const dealerTotal = useMemo(() => handValue(round.dealerHand), [round.dealerHand]);

  // Minimum bet amount
  const minBet = 100;

  // Function to award winnings based on outcome
  const awardWinnings = (outcome, betAmount) => {
    // Credit winnings based on outcome
    if (outcome === 'win') {
      // Standard win payout
      credit(betAmount * 2, 'Blackjack win');
    } else if (outcome === 'blackjack') {
      // Natural blackjack payout
      credit(betAmount * 2, 'Blackjack win (natural)');
    } else if (outcome === 'push') {
      // Bet returned on push
      credit(betAmount, 'Blackjack push refund');
    }
  };

  // Function to conclude the round and update state
  const concludeRound = (outcome, options) => {
    const {
      deck,
      playerHand,
      dealerHand,
      betAmount,
      note
    } = options;

    // Handle any potential errors during ledger updates
    let ledgerError = '';

    // Attempt to award winnings
    try {
      awardWinnings(outcome, betAmount);
    } catch (error) {
      // Capture any errors during ledger operations
      ledgerError = error.message;
    }

    // Update round state to reflect conclusion
    setRound({
      stage: 'round-over',
      deck,
      playerHand,
      dealerHand,
      currentBet: betAmount,
      message: note,
      outcome,
      hideDealerHole: false,
      error: ledgerError
    });

    // Record the round in history
    setHistory((prev) => {
      const entry = {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : `round-${Date.now()}`,
        outcome,
        bet: betAmount,
        note,
        timestamp: new Date().toISOString()
      };
      return [entry, ...prev].slice(0, 12);
    });
  };

  // Function to handle dealer's turn and settle against player
  const settleAgainstDealer = (deck, playerHand, dealerHand, betAmount) => {
    // Dealer draws until reaching at least 17
    const workingDealerHand = [...dealerHand];
    // Keep drawing until the dealer's hand is 17 or higher
    while (handValue(workingDealerHand) < 17) {
      // Dealer draws a card
      workingDealerHand.push(deck.pop());
    }

    // Calculate final scores
    const playerScore = handValue(playerHand);
    const dealerScore = handValue(workingDealerHand);

    // Determine outcome
    let outcome;
    if (dealerScore > 21) {
      // Dealer busts
      outcome = 'win';
    } else if (playerScore > dealerScore) {
      // Player has higher score
      outcome = 'win';
    } else if (playerScore < dealerScore) {
      // Dealer has higher score
      outcome = 'dealer';
    } else {
      // Tie
      outcome = 'push';
    }

    // Create outcome note
    const note = playerScore > 21
      ? 'You busted; dealer wins.'
      : describeOutcome(outcome, playerScore, dealerScore);

    // Conclude the round with the determined outcome
    concludeRound(outcome, {
      deck,
      playerHand,
      dealerHand: workingDealerHand,
      betAmount,
      note
    });
  };

  // Function to start a new round
  const startRound = (amount) => {
    // Create and shuffle a new deck
    const deck = shuffle(createBlackJackDeck());
    // Deal initial hands
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];
    // Update last bet amount
    setLastBet(amount);

    // Check for natural blackjack
    if (isBlackjack(playerHand)) {
      // Handle player blackjack scenarios
      if (isBlackjack(dealerHand)) {
        // Both player and dealer have blackjack
        concludeRound('push', {
          deck,
          playerHand,
          dealerHand,
          betAmount: amount,
          note: 'Double blackjack! Bet returned.'
        });
      } else {
        // Player has blackjack, dealer does not
        concludeRound('blackjack', {
          deck,
          playerHand,
          dealerHand,
          betAmount: amount,
          note: describeOutcome('blackjack', handValue(playerHand), handValue(dealerHand))
        });
      }
    } else {
      // No blackjack, proceed to player turn
      setRound({
        stage: 'player-turn',
        deck,
        playerHand,
        dealerHand,
        currentBet: amount,
        message: 'Hit or stand?',
        outcome: null,
        hideDealerHole: true,
        error: ''
      });
    }
  };

  // Function to place a bet
  const placeBet = (amount) => {
    // Prevent betting if round is active
    if (round.stage !== 'idle' && round.stage !== 'round-over') {
      return;
    }
    // Deduct bet amount from user's balance and start round
    try {
      debit(amount, 'Blackjack bet');
      startRound(amount);
    } catch (error) {
      setRound((prev) => ({
        ...prev,
        error: error.message
      }));
    }
  };

  // Function to handle player choosing to hit
  const handleHit = () => {
    // Ensure it's the player's turn
    if (round.stage !== 'player-turn') {
      return;
    }
    // Draw a card for the player
    const deck = [...round.deck];
    const playerHand = [...round.playerHand, deck.pop()];
    const dealerHand = [...round.dealerHand];
    const betAmount = round.currentBet;

    // Calculate new hand total
    const total = handValue(playerHand);
    // Check for bust
    if (total > 21) {
      concludeRound('dealer', {
        deck,
        playerHand,
        dealerHand,
        betAmount,
        note: 'Player busts. Dealer takes the bet.'
      });
      return;
    }

    // Update round state after hit
    setRound({
      ...round,
      deck,
      playerHand,
      message: total === 21 ? '21! Standing automatically…' : 'Hit or stand?',
      hideDealerHole: total !== 21,
      stage: total === 21 ? 'dealer-turn' : 'player-turn',
      error: ''
    });

    // If player hits 21, proceed to dealer settlement
    if (total === 21) {
      settleAgainstDealer(deck, playerHand, dealerHand, betAmount);
    }
  };

  // Function to handle player choosing to stand
  const handleStand = () => {
    if (round.stage !== 'player-turn') {
      return;
    }
    // Proceed to dealer's turn
    const deck = [...round.deck];
    const playerHand = [...round.playerHand];
    const dealerHand = [...round.dealerHand];
    const betAmount = round.currentBet;

    // Update round state to dealer turn
    settleAgainstDealer(deck, playerHand, dealerHand, betAmount);
  };

  // Function to reset the round for a new game
  const handleNewRound = () => {
    setRound({
      ...INITIAL_ROUND,
      message: 'Ready when you are.',
      currentBet: lastBet
    });
  };

  // Action controls for the game
  const actionControls = (
    // Hit, Stand, and Reset buttons
    <div className="blackjack-actions">
      {/* Hit button */}
      <button
        type="button"
        className="cta-button cta-button--primary"
        onClick={handleHit}
        disabled={round.stage !== 'player-turn'}
      >
        Hit
      </button>
      {/* Stand button */}
      <button
        type="button"
        className="cta-button cta-button--secondary"
        onClick={handleStand}
        disabled={round.stage !== 'player-turn'}
      >
        Stand
      </button>
      {/* Reset round button */}
      <button
        type="button"
        className="cta-button cta-button--ghost"
        onClick={handleNewRound}
        disabled={round.stage === 'player-turn' || round.stage === 'dealer-turn'}
      >
        Reset round
      </button>
    </div>
  );

  // Determine if betting is disabled
  const betDisabled = round.stage === 'player-turn' || round.stage === 'dealer-turn' || balance < minBet;

  // Sidebar content for the game
  const sidebar = (
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
      {/* Round status and action controls */}
      <div className="game-sidebar-panel">
        <h2>Round status</h2>
        <p>{round.message}</p>
        {round.error && <p className="form-error">{round.error}</p>}
        {balance < minBet && (
          <p className="game-sidebar-panel__note">
            You need at least {minBet.toLocaleString()} tokens to join the table.
          </p>
        )}
      </div>
      {actionControls}
    </>
  );

  // Metadata for the game
  const meta = [
    { label: 'Payout', value: '2.0x (bet returned on push)' },
    { label: 'Deck', value: 'Single, reshuffled each round' },
    { label: 'Status', value: 'Sprint 1 complete' }
  ];

  // Render the Blackjack game page
  return (
    <div className="page blackjack-page">
      {/* Game shell with title, description, metadata, sidebar, and footer */}
      <GameShell
        title="Blackjack"
        description="Place a bet with your demo 401k tokens, play classic blackjack, and watch the ledger update in real time."
        meta={meta}
        sidebar={sidebar}
        footer={<RoundHistory history={history} />}
      >
        {/* Blackjack table displaying dealer and player hands */}
        <div className="blackjack-table">
          <HandDisplay
            title="Dealer"
            hand={round.dealerHand}
            total={round.hideDealerHole ? undefined : dealerTotal}
            hideHoleCard={round.hideDealerHole && round.stage === 'player-turn'}
            isDealer
          />
          <HandDisplay
            title="You"
            hand={round.playerHand}
            total={playerTotal}
          />
        </div>
      </GameShell>
    </div>
  );
};

export default BlackjackPage;
