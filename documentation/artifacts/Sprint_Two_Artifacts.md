# Sprint 2 — Requirements Artifacts

This document provides the artifacts for all requirements scheduled for Sprint 2. Artifacts are derived from `Sprint_Backlog - Three_Sprints.csv` and follow the "Requirements Artifacts" guidance. The artifacts below are written to be verifiable by a GTA.

---

## Requirement ID: 5 — Game #2: High‑Low

- Title: Game #2: High‑Low
- Description: A simple higher/lower prediction game where the UI shows a first card, the player predicts whether the next card will be higher or lower, and the server resolves and settles the round.
- Story Points: 5
- Artifact Type: User Stories & Feature List

Verifiable features:

- Navigation: `/lobby` contains a "High‑Low" tile that navigates to `/game/high-low`.
- Betting: The High‑Low page allows the player to enter a bet and submit; the user's balance is atomically debited when the bet is placed.
- Play flow:
  - On bet placement the UI draws and displays the first card while the next card remains hidden.
  - The player chooses "Higher" or "Lower"; the server (or server-authorized engine) draws the next card and returns the outcome.
  - The UI reveals the second card and displays the outcome (Win/Push/Lose).
- Payout & settlement:
  - Win: credit the player with ~1.9x their stake (bet + 90% profit); amount may be rounded to two decimal places when currencies are fractional.
  - Push (tie): return the original stake to the player.
  - Loss: no credit applied; the original debit stands.
  - Credits and refunds are applied atomically and recorded in the transaction ledger.
- Ledger & history:
  - Each played round records a game session entry with timestamp, game id (`high-low`), bet amount, payout, and outcome code.
  - Transactions created for bet debit and payout credit have timestamps and link to the game session when applicable.
- Robustness & UX:
  - Controls are disabled while a round is resolving to prevent double submissions.
  - If a bet request fails (insufficient funds, server error), the UI shows a clear error and no balance change occurs (or it is rolled back by the server).

---

## Requirement ID: 6 — Transactions & Game History

- Title: Transactions and Game History
- Description: Provide UI views for users to inspect their transaction ledger and recent game sessions.
- Story Points: 3
- Artifact Type: Feature List

Verifiable features:

- Transactions list:
  - Authenticated users can navigate to a transactions/history view from the account area.
  - The view lists recent transactions (debit/credit) with columns: timestamp, transaction id, type, amount, running balance, description, and associated game id when applicable.
  - Pagination or "load more" is available when the list is long.
- Game session history:
  - A separate or combined list allows the user to see recent game sessions with details: game id, bet amount, payout, outcome, and small summary (e.g., first/second card for High‑Low).
  - Each session includes a timestamp and links back to the corresponding transaction(s).
- Privacy & security:
  - Users only see their own transactions and sessions; server enforces authorization.

---

## Requirement ID: 7 — On‑Track Popup (v1)

- Title: On‑Track Popup (v1): Basic calculator and copy
- Description: Implement the initial version of the On‑Track popup used on the landing page — a small interactive calculator that helps users estimate retirement targets. This v1 focuses on core functionality without persistence.
- Story Points: 2
- Artifact Type: UI / User Story

Verifiable features:

- Popup content:
  - The landing page contains an On‑Track popup with a small retirement calculator (inputs: current balance, target, years to target) and an explanation blurb.
  - The popup can be opened and closed from the landing page.
- Accessibility & basic UX:
  - Popup is keyboard accessible and focus moves into the popup when opened.
  - Inputs have labels and reasonable defaults.
- Non-persistent:
  - For v1, calculator defaults and popup state do not persist across reloads (persistence is scheduled for v2 in Sprint 3).

---

## Requirement ID: 8 — Faucet & Demo Accounts

- Title: Faucet and demo account bootstrap
- Description: Provide a simple faucet and/or seed mechanism so demo users can top up test tokens during local/demo sessions.
- Story Points: 3
- Artifact Type: Feature / Dev UX

Verifiable features:

- Seed/demo accounts:
  - README or seed script documents how to create demo users and assign an initial token balance (example: 1000 tokens).
  - A faucet button is available in the account area (or lobby) that grants a small demo token top‑up.
- Safeguards:
  - Faucet grants are recorded as transactions in the ledger with description like "Faucet grant".
  - Server-side logic prevents abuse in production (for a demo, a simple once‑per-session safeguard is acceptable and documented).

---

## Requirement ID: 9 — Server Settling Endpoints (dev/demo)

- Title: Server settling endpoints for games (dev/demo)
- Description: Expose simple, documented endpoints that allow the frontend to place bets and receive resolved game outcomes for server‑settled games (Blackjack already exists; High‑Low to be added). This requirement ensures server-side settlement is available for integration testing.
- Story Points: 3
- Artifact Type: API / Integration

Verifiable features:

- API endpoints:
  - `POST /games/high-low/placeBet` (or equivalent) accepts a bet request, debits user account (atomic), resolves the round outcome, credits payout (if any), and returns the resolution and updated balance.
  - `POST /games/blackjack/placeBet` (existing or extended) continues to operate as the server-side resolver for Blackjack.
  - `GET /wallet/:userId` or similar returns the current balance and recent transactions for quick ledger checks.
- Documentation:
  - Each endpoint is documented with request/response shapes, required authentication, and error cases (insufficient funds, malformed request).
- Atomicity & ledger:
  - The server applies debits and credits atomically and writes transaction records and game session entries so the ledger and game history remain consistent.

---