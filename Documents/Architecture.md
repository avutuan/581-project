# Team Number

Group 19

## Team Members

- Tuan Vu — Software Engineer
- Kobe Jordan — Software Engineer
- Raj Kaura — Software Engineer
- John Tran — Software Engineer
- Kevinh Nguyen — Software Engineer
- Changwen Gong — Software Engineer


## Project Name

401k Sim

## Project Synopsis

A casino simulator using demo 401k tokens to bankroll management.

## Architecture

## Project Synopsis

A satirical but technically-focused product that implements the sprint backlog: scaffold and routing with a lobby, local auth with sign up/login (mock email verification acceptable), a simulated 401k tokens ledger, core games, a wallet UI, and polish items listed in the backlog.

## Architecture

Overview

This architecture is strictly derived from the sprint backlog and treats the product as a satirical but fully realized demo application. The scope and priorities follow the backlog: establish the project scaffold and routes, implement local auth, provide a simulated 401k tokens ledger and wallet panel, deliver three core mini-games with a reusable shell, ensure responsive styles and basic accessibility, and finish with export, polish, and a demo runbook.

Project scaffold & routing

Sprint 1 establishes the scaffold and routes: `/`, `/login`, `/lobby`, and `/game/:id`. The lobby serves as the central navigation hub with quick-start tiles for available games and links to the wallet and profile pages. The routing design favors simplicity: each page is focused and lightweight so the app loads quickly on mobile devices.

Authentication & onboarding

Local auth supports sign up and login with hashed passwords; email verification may be mocked during development to streamline testing and demos. Onboarding assigns a demo token balance to new users via the simulated 401k tokens ledger so they can immediately interact with games and the wallet UI.

The backlog defines three core games and one stretch game. Each game plugs into a single reusable game shell and bet slip component that centralizes bet submission, result display, and balance updates. Implemented games:

- Blackjack (Game #1): Server-resolved round with a 2.0x payout and client animation for wins/losses.
- High–Low (Game #2): Predict the next card higher/lower; ~1.9x payout and quick resolution UI.
- Slots Mini (Game #3): 3-reel slots with fixed paylines and selectable bet sizes.
- Red/Black (Game #4 — Stretch): A roulette-lite red/black option with 2.0x payout, implemented if time permits.

Wallet, history & export

The wallet panel shows current token balance and the most recent 20 transactions, matching backlog requirements. Users can export history via a CSV feature that downloads the last 200 transactions for record-keeping or instructor review.

On‑Track features and UX

The On‑Track Popup (v1) is a focused UI that computes how much a user would need to win per month to hit a user-entered retirement target — presented with satirical copy. Version 2 persists defaults, exposes a lobby link, and refines the tone and copy to match the project's voice.

Styles, accessibility & polish

Base styles and mobile breakpoints provide responsive layouts across lobby, wallet, and games. Accessibility (A11y) work includes keyboard navigation, proper labels, and clear empty/error states as specified in the backlog. A final polish sprint addresses QA fixes, micro-perf improvements, and UI refinements.

Testing, demo & delivery

Testing is scoped to the backlog: integration checks for critical bet/settle flows, and an end-to-end demo script that seeds users and runs through primary flows. The README + demo script documents seeding, run steps, and instructor-facing notes required by the sprint backlog.
