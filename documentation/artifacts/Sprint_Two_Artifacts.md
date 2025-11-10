# Sprint 2 — Requirements Artifacts

This document provides the artifacts for all requirements scheduled for Sprint 2. Artifacts are derived from `Sprint_Backlog - Three_Sprints.csv` and follow the "Requirements Artifacts" guidance. The artifacts below are written to be verifiable by a GTA.

---

## Requirement ID: 5 — Transactions & Game History

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

## Requirement ID: 6 — Reusable game shell + bet slip

- Title: Reusable Game Shell + Bet Slip
- Description: Build common, reusable components that provide consistent layout for games and a standard bet placement UI (BetSlip) used by multiple games.
- Story Points: 5
- Artifact Type: Component / UI

Verifiable features:

- `GameShell` component:
  - Accepts props for title, description, meta (array of label/value), sidebar and footer slots, and renders a consistent game play area.
  - Is used by at least two game pages (e.g., `BlackjackPage` and `HighLowPage`) to demonstrate reusability.
- `BetSlip` component:
  - Accepts `onSubmit(amount)`, `balance`, `minBet`, `maxBet`, and `disabled` props.
  - Validates input and calls `onSubmit` only when the bet is allowed; shows inline validation messages for insufficient funds or invalid amounts.
  - Disables controls during an in-progress round to prevent double-submission.
- Ledger integration:
  - `BetSlip` usage integrates with the account context (`debit` API) to atomically debit the stake before the round begins.
  - The components remain display-only regarding credits; settlement logic is implemented by the game pages or server endpoints.
- Reuse & documentation:
  - At least two game pages reuse `GameShell` and `BetSlip` proving consistent UX.
  - A short README or developer note documents the component contract (props, events, and expected behavior).

---

## Requirement ID: 7 — Game #2: High‑Low

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

## Requirement ID: 8 — On‑Track Popup (v1)

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

## Requirement ID: 9 — Base styles & mobile breakpoints

- Title: Base styles & mobile breakpoints
- Description: Provide a small design system and responsive layout rules so core pages (lobby, wallet, games) render well on mobile and desktop.
- Story Points: 3
- Artifact Type: UI / Styling

Verifiable features:

- Design tokens / base styles:
  - A central stylesheet or variables file (CSS custom properties, Sass, or equivalent) defines primary spacing, colors, and type scales used across the app.
- Layout verification:
  - Lobby, wallet/account, and a game page (e.g., Blackjack or High‑Low) display correctly at common device widths (phone, tablet, narrow desktop).
  - Navigation and primary controls remain accessible and usable at mobile widths (buttons large enough to tap, readable text sizes).
- Non-regression:
  - Existing components do not visually break after applying base styles; basic visual smoke test performed (developer confirms via browser resize or device emulator).


