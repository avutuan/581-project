/**
 * ----------------------------------------------------------
 * Slots Mini Page
 * ----------------------------------------------------------
 * Author: Codex Automation
 * Last Modified: 2025/02/09
 *
 * Description:
 * Implements a compact three-reel slot machine with fixed paylines
 * and discrete bet sizes. Bets are debited via the Supabase ledger
 * before a spin resolves, and any winnings are credited back along
 * with a recorded game session payload to mimic server settlement.
 * ----------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameShell from '../components/game/GameShell.jsx';
import RoundHistory from '../components/game/RoundHistory.jsx';
import { useSupabaseAccount } from '../context/SupabaseAccountContext.jsx';
import BetSlip from '../components/game/BetSlip.jsx';

// Fixed wager options for the slot machine
const BET_OPTIONS = [100, 250, 500, 1000];

const SHUFFLE_INTERVAL = 140;
const SPIN_SETTLE_DELAY = 900;
const AUTO_SPIN_DELAY = 700;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Symbol definitions with rarity weights and payout multipliers
const SYMBOLS = [
  { id: 'seven', label: '7', icon: '7️⃣', weight: 1, multiplier: 25, displayName: 'Lucky Seven' },
  { id: 'bar', label: 'BAR', icon: '⬛️', weight: 2, multiplier: 12, displayName: 'Bar' },
  { id: 'bell', label: 'BELL', icon: '🔔', weight: 3, multiplier: 8, displayName: 'Bell' },
  { id: 'cherry', label: 'CH', icon: '🍒', weight: 4, multiplier: 5, displayName: 'Cherry' },
  { id: 'lemon', label: 'LE', icon: '🍋', weight: 5, multiplier: 3, displayName: 'Lemon' }
];

// Blank symbol used for the idle reel state
const BLANK_SYMBOL = { id: 'blank', label: '--', weight: 0, multiplier: 0, displayName: 'Idle' };

// Five fixed paylines (3 horizontals + 2 diagonals)
const PAYLINES = [
  { id: 'line-1', label: 'Top line', rows: [0, 0, 0] },
  { id: 'line-2', label: 'Center line', rows: [1, 1, 1] },
  { id: 'line-3', label: 'Bottom line', rows: [2, 2, 2] },
  { id: 'line-4', label: 'Forward diagonal', rows: [0, 1, 2] },
  { id: 'line-5', label: 'Reverse diagonal', rows: [2, 1, 0] }
];

// Pre-build a weighted bag for quick symbol sampling
const SYMBOL_BAG = SYMBOLS.flatMap((symbol) => Array(symbol.weight).fill(symbol));

// Deterministic pseudo RNG (Mulberry32) for reproducible spins
const mulberry32 = (seed) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Generate a numeric seed using the browser's crypto API
const generateSeed = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0];
  }
  return Math.floor(Math.random() * 1_000_000_000);
};

// Build the default (idle) three-reel grid
const createEmptyReels = () =>
  Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => BLANK_SYMBOL));

const randomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

const createShuffleReels = () =>
  Array.from({ length: 3 }, () => Array.from({ length: 3 }, randomSymbol));

// Spin the reels using the seeded RNG
const spinReels = (seed) => {
  const rng = mulberry32(seed ?? generateSeed());
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => {
      const index = Math.floor(rng() * SYMBOL_BAG.length);
      return SYMBOL_BAG[index];
    })
  );
};

// Evaluate paylines and aggregate payouts for a given spin
const evaluateSpin = (reels, betAmount) => {
  const lineWins = [];
  const winningPositions = new Set();
  let totalPayout = 0;
  let jackpot = false;

  PAYLINES.forEach((line) => {
    const pulled = line.rows.map((rowIndex, reelIndex) => reels[reelIndex][rowIndex]);
    const first = pulled[0];
    if (!first || first.id === 'blank') return;
    const matches = pulled.every((symbol) => symbol.id === first.id);
    if (!matches) return;

    const payout = betAmount * first.multiplier;
    totalPayout += payout;
    pulled.forEach((_symbol, reelIndex) => {
      winningPositions.add(`${reelIndex}-${line.rows[reelIndex]}`);
    });

    lineWins.push({
      lineId: line.id,
      label: line.label,
      symbol: first,
      payout
    });

    if (first.multiplier >= 20) {
      jackpot = true;
    }
  });

  return {
    lineWins,
    winningPositions,
    totalPayout,
    isJackpot: jackpot
  };
};

// SlotsPage component definition
const SlotsPage = () => {
  const { balance, debit, credit, recordGameSession } = useSupabaseAccount();
  const [selectedBet, setSelectedBet] = useState(BET_OPTIONS[0]);
  const [reels, setReels] = useState(createEmptyReels);
  const [lineWins, setLineWins] = useState([]);
  const [winningPositions, setWinningPositions] = useState(() => new Set());
  const [history, setHistory] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [status, setStatus] = useState({
    stage: 'idle',
    message: 'Pick a bet, spin the reels, and watch the ledger settle.',
    outcome: null,
    payout: 0,
    error: ''
  });
  const spinIntervalRef = useRef(null);
  const autoTimeoutRef = useRef(null);

  // Ensure the selected bet always matches what the player can afford
  useEffect(() => {
    if (selectedBet <= balance) return;
    const affordable = [...BET_OPTIONS].reverse().find((option) => option <= balance);
    if (affordable) {
      setSelectedBet(affordable);
    }
  }, [balance, selectedBet]);

  const minBet = BET_OPTIONS[0];
  const insufficientFunds = balance < minBet || selectedBet > balance;
  const spinDisabled = spinning || insufficientFunds;

  // Metadata shown inside the reusable GameShell header
  const meta = useMemo(
    () => [
      { label: 'Paylines', value: '5 fixed' },
      { label: 'Reels', value: '3 columns × 3 rows' },
      { label: 'Bet sizes', value: BET_OPTIONS.map((opt) => opt.toLocaleString()).join(' / ') }
    ],
    []
  );

  // Paytable sorted by multiplier for quick reference
  const payTable = useMemo(
    () => [...SYMBOLS].sort((a, b) => b.multiplier - a.multiplier),
    []
  );

  const stopReelShuffle = useCallback(() => {
    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
  }, []);

  const startReelShuffle = useCallback(() => {
    stopReelShuffle();
    setReels(createShuffleReels());
    spinIntervalRef.current = setInterval(() => {
      setReels(createShuffleReels());
    }, SHUFFLE_INTERVAL);
  }, [stopReelShuffle]);

  useEffect(
    () => () => {
      stopReelShuffle();
      if (autoTimeoutRef.current) {
        clearTimeout(autoTimeoutRef.current);
      }
    },
    [stopReelShuffle]
  );

  // Handle spin lifecycle: debit, settle, credit, and record the session
  const handleSpin = useCallback(async () => {
    if (spinDisabled) return;
    setSpinning(true);
    setLineWins([]);
    setWinningPositions(new Set());
    startReelShuffle();
    setStatus((prev) => ({
      ...prev,
      stage: 'spinning',
      message: 'Reels are spinning…',
      outcome: null,
      payout: 0,
      error: ''
    }));

    try {
      await debit(selectedBet, 'Slots Mini wager');
    } catch (error) {
      stopReelShuffle();
      setAutoPlay(false);
      setStatus({
        stage: 'idle',
        message: 'Bet failed before spin could start.',
        outcome: null,
        payout: 0,
        error: error.message
      });
      setSpinning(false);
      return;
    }

    try {
      const seed = generateSeed();
      const nextReels = spinReels(seed);
      const evaluation = evaluateSpin(nextReels, selectedBet);
      let ledgerError = '';

      if (evaluation.totalPayout > 0) {
        try {
          await credit(
            evaluation.totalPayout,
            evaluation.isJackpot ? 'Slots Mini jackpot' : 'Slots Mini win'
          );
        } catch (error) {
          ledgerError = error.message;
        }
      }

      try {
        await recordGameSession(
          'slots-mini',
          selectedBet,
          evaluation.totalPayout,
          evaluation.totalPayout > 0 ? 'win' : 'loss',
          {
            bet: selectedBet,
            lineWins: evaluation.lineWins.map((line) => ({
              lineId: line.lineId,
              symbol: line.symbol.id,
              payout: line.payout
            })),
            reels: nextReels.map((column) => column.map((symbol) => symbol.id))
          },
          seed.toString()
        );
      } catch (error) {
        ledgerError = ledgerError || error.message;
      }

      await sleep(SPIN_SETTLE_DELAY);
      stopReelShuffle();

      const message =
        evaluation.totalPayout > 0
          ? `Paid ${evaluation.totalPayout.toLocaleString()} tokens across ${evaluation.lineWins.length} line${
              evaluation.lineWins.length === 1 ? '' : 's'
            }.`
          : 'No paylines hit. Tokens stay with the house.';

      const outcome = evaluation.totalPayout > 0 ? (evaluation.isJackpot ? 'jackpot' : 'win') : 'loss';

      setReels(nextReels);
      setLineWins(evaluation.lineWins);
      setWinningPositions(new Set(evaluation.winningPositions));
      setStatus({
        stage: 'settled',
        message,
        outcome,
        payout: evaluation.totalPayout,
        error: ledgerError
      });
      setHistory((prev) => [
        {
          id: `slots-${Date.now()}`,
          outcome,
          bet: selectedBet,
          note: message,
          timestamp: new Date().toISOString()
        },
        ...prev
      ].slice(0, 12));
    } catch (error) {
      setAutoPlay(false);
      setStatus({
        stage: 'idle',
        message: 'Spin failed mid-settlement.',
        outcome: null,
        payout: 0,
        error: error.message
      });
    } finally {
      stopReelShuffle();
      setSpinning(false);
    }
  }, [spinDisabled, startReelShuffle, debit, selectedBet, credit, recordGameSession, stopReelShuffle]);

  useEffect(() => {
    if (!autoPlay) {
      if (autoTimeoutRef.current) {
        clearTimeout(autoTimeoutRef.current);
        autoTimeoutRef.current = null;
      }
      return;
    }

    if (insufficientFunds) {
      setAutoPlay(false);
      return;
    }

    if (!spinning) {
      autoTimeoutRef.current = setTimeout(() => {
        handleSpin();
      }, AUTO_SPIN_DELAY);
    }

    return () => {
      if (autoTimeoutRef.current) {
        clearTimeout(autoTimeoutRef.current);
        autoTimeoutRef.current = null;
      }
    };
  }, [autoPlay, spinning, insufficientFunds, handleSpin]);

  const handleBetUpdate = useCallback((amount) => {
    setSelectedBet(amount);
    setStatus((prev) => ({
      ...prev,
      message: `Bet locked at ${amount.toLocaleString()} tokens.`
    }));
  }, []);

  // Sidebar content includes bet selection, paytable, and balance info
  const sidebar = (
    <>
      <BetSlip
        onSubmit={handleBetUpdate}
        balance={balance}
        disabled={spinning}
        currentBet={selectedBet}
        minBet={minBet}
        maxBet={balance}
      />

      <div className="game-sidebar-panel">
        <h2>Paytable (3 of a kind)</h2>
        <ul className="slots-paytable">
          {payTable.map((symbol) => (
            <li key={symbol.id}>
              <span className="slots-paytable__icon" aria-hidden="true">
                {symbol.icon || symbol.label}
              </span>
              <span>{symbol.displayName}</span>
              <strong>×{symbol.multiplier}</strong>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  const celebrationActive =
    status.outcome === 'jackpot' || (status.outcome === 'win' && status.payout > 0);

  return (
    <div className="page slots-page">
      <GameShell
        title="Slots Mini"
        description="Three reels, five fixed paylines, and Supabase-settled payouts. Pick a chip and spin."
        meta={meta}
        sidebar={sidebar}
        footer={<RoundHistory history={history} />}
      >
        <div className="slots-game">
          <div className={`slots-machine${spinning ? ' slots-machine--spinning' : ''}`}>
            {celebrationActive && (
              <div
                className={`slots-celebration${
                  status.outcome === 'jackpot' ? ' slots-celebration--jackpot' : ''
                }`}
                aria-hidden="true"
              >
                <span />
                <span />
                <span />
              </div>
            )}
            <div className="slots-reels">
              {reels.map((column, columnIndex) => (
                <div
                  key={`reel-${columnIndex}`}
                  className={`slots-reel${spinning ? ' slots-reel--spinning' : ''}`}
                >
                  {column.map((symbol, rowIndex) => {
                    const key = `${columnIndex}-${rowIndex}`;
                    const highlight =
                      winningPositions instanceof Set && winningPositions.has(key)
                        ? ' slots-symbol--winner'
                        : '';

                    const activeRow = rowIndex === 1 ? ' slots-symbol--active' : '';
                    const glyph = symbol.icon || symbol.label;

                    return (
                      <div
                        key={key}
                        className={`slots-symbol${highlight}${activeRow}`}
                        role="img"
                        aria-label={symbol.displayName}
                      >
                        <span className="slots-symbol__icon" aria-hidden="true">{glyph}</span>
                        {!symbol.icon && <span className="slots-symbol__label">{symbol.label}</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="slots-actions">
              <button
                type="button"
                className="cta-button cta-button--primary"
                onClick={handleSpin}
                disabled={spinDisabled}
              >
                {spinning ? 'Spinning…' : `Spin · ${selectedBet.toLocaleString()} tokens`}
              </button>
              <button
                type="button"
                className={`slots-auto-toggle${autoPlay ? ' slots-auto-toggle--active' : ''}`}
                onClick={() => setAutoPlay((prev) => !prev)}
                disabled={!autoPlay && insufficientFunds}
              >
                {autoPlay ? 'Stop Auto' : 'Auto Spin'}
              </button>
            </div>
            <p className="slots-message">{status.message}</p>
            {status.error && <p className="form-error">Ledger note: {status.error}</p>}
          </div>

          <div className="game-sidebar-panel">
            <h2>Line breakdown</h2>
            {lineWins.length === 0 ? (
              <p className="game-sidebar-panel__note">Results land here after each server-settled spin.</p>
            ) : (
              <ul className="slots-linewins">
                {lineWins.map((line) => (
                  <li key={line.lineId}>
                    <strong>{line.label}</strong>
                    <span>
                      {line.symbol.icon || line.symbol.label} ×3 · +{line.payout.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </GameShell>
    </div>
  );
};

export default SlotsPage;
