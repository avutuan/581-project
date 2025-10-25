import { useMemo, useState } from 'react';
import { useAccount } from '../context/AccountContext.jsx';
import GameShell from '../components/game/GameShell.jsx';
import BetSlip from '../components/game/BetSlip.jsx';
import HandDisplay from '../components/game/HandDisplay.jsx';
import RoundHistory from '../components/game/RoundHistory.jsx';

const SUITS = [
  { symbol: '♠', suitColor: 'dark' },
  { symbol: '♥', suitColor: 'bright' },
  { symbol: '♦', suitColor: 'bright' },
  { symbol: '♣', suitColor: 'dark' }
];

const RANKS = [
  { rank: 'A', value: 11 },
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 10 },
  { rank: 'Q', value: 10 },
  { rank: 'K', value: 10 }
];

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

const createDeck = () => {
  const deck = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({
        ...rank,
        suit: suit.symbol,
        suitColor: suit.suitColor,
        code: `${rank.rank}${suit.symbol}`
      });
    });
  });
  return deck;
};

const shuffle = (deck) => {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const handValue = (hand) => {
  let total = hand.reduce((sum, card) => sum + card.value, 0);
  let aceCount = hand.filter((card) => card.rank === 'A').length;
  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount -= 1;
  }
  return total;
};

const isBlackjack = (hand) => hand.length === 2 && handValue(hand) === 21;

const describeOutcome = (outcome, playerTotal, dealerTotal) => {
  switch (outcome) {
    case 'blackjack':
      return 'Natural blackjack! 2x payout credited.';
    case 'win':
      return `You win with ${playerTotal} over dealer ${dealerTotal}.`;
    case 'push':
      return `Push. ${playerTotal} ties ${dealerTotal}. Bet returned.`;
    case 'dealer':
    default:
      return dealerTotal > 21
        ? 'Dealer busts. You win this round!'
        : `Dealer takes it with ${dealerTotal}.`;
  }
};

const BlackjackPage = () => {
  const { balance, debit, credit } = useAccount();
  const [round, setRound] = useState(INITIAL_ROUND);
  const [history, setHistory] = useState([]);
  const [lastBet, setLastBet] = useState(100);

  const playerTotal = useMemo(() => handValue(round.playerHand), [round.playerHand]);
  const dealerTotal = useMemo(() => handValue(round.dealerHand), [round.dealerHand]);

  const minBet = 100;

  const awardWinnings = (outcome, betAmount) => {
    if (outcome === 'win') {
      credit(betAmount * 2, 'Blackjack win');
    } else if (outcome === 'blackjack') {
      credit(betAmount * 2, 'Blackjack win (natural)');
    } else if (outcome === 'push') {
      credit(betAmount, 'Blackjack push refund');
    }
  };

  const concludeRound = (outcome, options) => {
    const {
      deck,
      playerHand,
      dealerHand,
      betAmount,
      note
    } = options;

    let ledgerError = '';

    try {
      awardWinnings(outcome, betAmount);
    } catch (error) {
      ledgerError = error.message;
    }

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

  const settleAgainstDealer = (deck, playerHand, dealerHand, betAmount) => {
    const workingDealerHand = [...dealerHand];
    while (handValue(workingDealerHand) < 17) {
      workingDealerHand.push(deck.pop());
    }

    const playerScore = handValue(playerHand);
    const dealerScore = handValue(workingDealerHand);

    let outcome;
    if (dealerScore > 21) {
      outcome = 'win';
    } else if (playerScore > dealerScore) {
      outcome = 'win';
    } else if (playerScore < dealerScore) {
      outcome = 'dealer';
    } else {
      outcome = 'push';
    }

    const note = playerScore > 21
      ? 'You busted; dealer wins.'
      : describeOutcome(outcome, playerScore, dealerScore);

    concludeRound(outcome, {
      deck,
      playerHand,
      dealerHand: workingDealerHand,
      betAmount,
      note
    });
  };

  const startRound = (amount) => {
    const deck = shuffle(createDeck());
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];
    setLastBet(amount);

    if (isBlackjack(playerHand)) {
      if (isBlackjack(dealerHand)) {
        concludeRound('push', {
          deck,
          playerHand,
          dealerHand,
          betAmount: amount,
          note: 'Double blackjack! Bet returned.'
        });
      } else {
        concludeRound('blackjack', {
          deck,
          playerHand,
          dealerHand,
          betAmount: amount,
          note: describeOutcome('blackjack', handValue(playerHand), handValue(dealerHand))
        });
      }
    } else {
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

  const placeBet = (amount) => {
    if (round.stage !== 'idle' && round.stage !== 'round-over') {
      return;
    }
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

  const handleHit = () => {
    if (round.stage !== 'player-turn') {
      return;
    }
    const deck = [...round.deck];
    const playerHand = [...round.playerHand, deck.pop()];
    const dealerHand = [...round.dealerHand];
    const betAmount = round.currentBet;

    const total = handValue(playerHand);
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

    setRound({
      ...round,
      deck,
      playerHand,
      message: total === 21 ? '21! Standing automatically…' : 'Hit or stand?',
      hideDealerHole: total !== 21,
      stage: total === 21 ? 'dealer-turn' : 'player-turn',
      error: ''
    });

    if (total === 21) {
      settleAgainstDealer(deck, playerHand, dealerHand, betAmount);
    }
  };

  const handleStand = () => {
    if (round.stage !== 'player-turn') {
      return;
    }
    const deck = [...round.deck];
    const playerHand = [...round.playerHand];
    const dealerHand = [...round.dealerHand];
    const betAmount = round.currentBet;

    settleAgainstDealer(deck, playerHand, dealerHand, betAmount);
  };

  const handleNewRound = () => {
    setRound({
      ...INITIAL_ROUND,
      message: 'Ready when you are.',
      currentBet: lastBet
    });
  };

  const actionControls = (
    <div className="blackjack-actions">
      <button
        type="button"
        className="cta-button cta-button--primary"
        onClick={handleHit}
        disabled={round.stage !== 'player-turn'}
      >
        Hit
      </button>
      <button
        type="button"
        className="cta-button cta-button--secondary"
        onClick={handleStand}
        disabled={round.stage !== 'player-turn'}
      >
        Stand
      </button>
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

  const betDisabled = round.stage === 'player-turn' || round.stage === 'dealer-turn' || balance < minBet;

  const sidebar = (
    <>
      <BetSlip
        onSubmit={placeBet}
        balance={balance}
        disabled={betDisabled}
        currentBet={round.stage === 'idle' ? lastBet : round.currentBet}
        minBet={minBet}
        maxBet={balance}
      />
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

  const meta = [
    { label: 'Payout', value: '2.0x (bet returned on push)' },
    { label: 'Deck', value: 'Single, reshuffled each round' },
    { label: 'Status', value: 'Sprint 1 complete' }
  ];

  return (
    <div className="page blackjack-page">
      <GameShell
        title="Blackjack"
        description="Place a bet with your demo 401k tokens, play classic blackjack, and watch the ledger update in real time."
        meta={meta}
        sidebar={sidebar}
        footer={<RoundHistory history={history} />}
      >
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
