# Sprint 3 — Requirements Artifacts

This document provides the artifacts for all requirements scheduled for Sprint 3. Artifacts are derived from `Sprint_Backlog - Three_Sprints.csv` and follow the "Requirements Artifacts" guidance. The artifacts below are written to be verifiable by a GTA.

---

## Requirement ID: 10 — Game #3: Slots Mini

- Title: Game #3: Slots Mini
- Description: Implement a compact 3-reel slot machine with fixed paylines, discrete bet sizes, and server-settled results that update a user's token balance.
- Story Points: 8
- Artifact Type: User Stories & Feature List

Verifiable features:

- Navigation: `/lobby` contains a "Slots" tile that navigates to `/game/slots-mini`.
- Betting:
	- The Slots page allows selecting a bet size from a finite list (example: 10, 25, 50 tokens).
	- Pressing "Spin" atomically debits the user's balance by the selected bet.
- Reels & Outcome:
	- UI shows 3 animated reels during a spin.
	- Outcome is generated server-side (or server-authorized) and returned to the client.
	- Final reel positions shown in UI match the server result.
- Payout & Settlement:
	- Wins are paid according to the pay table and credited atomically to the user's balance.
	- Transaction ledger records bet and payout entries with timestamp, user id, bet amount, payout amount, and outcome code.
- Robustness:
	- Controls are disabled during an in-progress spin to prevent double-submission.
	- If the spin request fails, the UI displays a clear error and no balance change occurs (or it is rolled back).

---

## Requirement ID: 11 — Game #4: Red/Black (Stretch)

- Title: Game #4: Red/Black (Roulette-lite)
- Description: Implement a red/black betting game where players bet on red or black and receive a 2.0x payout on win. (Sprint 3 stretch target)
- Story Points: 5
- Artifact Type: User Stories

Verifiable features:

- Navigation: `/lobby` links to `/game/red-black`.
- Betting:
	- Player chooses bet amount and side (Red or Black) and submits; balance is debited atomically.
- Outcome & Payout:
	- Server determines outcome (Red/Black) and returns it.
	- Correct winners are credited 2.0x (bet + 100% profit); losers lose their bet.
- Ledger & Security:
	- All bets and payouts persisted to the ledger with outcome tags.
	- Bets exceeding balance are rejected with a clear error.

---

## Requirement ID: 12 — On-Track Popup (v2)

- Title: On-Track Popup (v2): Persist defaults and lobby link
- Description: Enhance the landing-page popup (On-Track) to persist user defaults, add a lobby link to open/focus it, and improve copy.
- Story Points: 3
- Artifact Type: Collection of Features

Verifiable features:

- Persistence:
	- Popup state (open/minimized) and calculator defaults (target/current/years) persist in `localStorage` (or equivalent) and restore on page load.
- Lobby integration:
	- `/lobby` includes a clear control (button/link) that opens or focuses the popup when clicked.
- Copy & UX:
	- Popup includes the specified light-hearted explanatory copy.
	- Popup remains keyboard accessible; focus moves into the popup on open.

---

## Requirement ID: 14 — Export history CSV

- Title: Export transaction history as CSV
- Description: Provide a download for the user's last 200 transactions as a CSV file.
- Story Points: 3
- Artifact Type: Feature / Acceptance Criteria

Verifiable features:

- UI:
	- A labelled "Export CSV" button is present in the transactions page/account area.
	- Button is disabled if the user has zero transactions.
- Data & format:
	- Download contains up to the last 200 transactions with columns: timestamp (ISO 8601), transaction_id, type (debit/credit), amount, running_balance, description, game_id (nullable).
	- Filename pattern: `transactions-<user>-<YYYYMMDD>.csv`.
- Security:
	- Only the authenticated user can export their own transactions.

---

## Requirement ID: 15 — A11y + empty/error states

- Title: Accessibility improvements and friendly empty/error messaging
- Description: Improve keyboard navigation, ARIA labeling, focus management, and provide friendly empty/error states across lobby, games, auth, and transactions.
- Story Points: 2
- Artifact Type: Acceptance Checklist

Verifiable features:

- Keyboard:
	- Tab order reaches all primary controls; controls operable with Enter/Space.
- ARIA & announcements:
	- Interactive controls have accessible names; dynamic state updates use ARIA live regions.
- Focus management:
	- Opening modal/popups moves focus into the modal; closing returns focus to trigger.
- Empty & error states:
	- Empty lists show descriptive guidance; errors show plain-language remediation steps.

---

## Requirement ID: 16 — Polish & bug-bash

- Title: Polish & bug-bash (QA pass)
- Description: Triage and fix small UI bugs and performance nits discovered in prior testing.
- Story Points: 2
- Artifact Type: QA Checklist / Bug Fix List

Verifiable features:

- Bug triage:
	- A short list of small bugs is resolved (spacing, alignment, color contrast, small logic bugs).
- Performance:
	- Eliminate obvious synchronous blocking; ensure animations are smooth on modest hardware.
- Visual polish:
	- Ensure consistency of button styles, shadows, and spacing.

---

## Requirement ID: 17 — README + Demo script

- Title: README and demo runbook
- Description: Deliver an up-to-date README with setup steps, seed users, and a demo script for graders.
- Story Points: 2
- Artifact Type: Documentation

Verifiable features:

- README includes:
	- Project overview, tech stack, setup instructions, how to seed data, and how to run the dev server.
	- Test/demo user accounts or seed script instructions to create demo users with demo balances.
- Demo script:
	- Step-by-step runbook demonstrating:
		- Create/login demo user.
		- Visit `/lobby`, open Blackjack, place a bet, verify ledger entry.
		- Export transactions CSV.
		- Use the On-Track popup calculator.
	- Expected outcomes and troubleshooting notes.
- Test:
	- Someone following README/demo steps can run the app and exercise main flows.
