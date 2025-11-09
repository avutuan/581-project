# Sprint 1 — Requirements Artifacts

This document provides the artifacts for all requirements scheduled for Sprint 1. Artifacts are derived from `Sprint_Backlog - Three_Sprints.csv` and follow the "Requirements Artifacts" guidance. The artifacts below are written to be verifiable by a GTA.

---

## Requirement ID: 1 — Project scaffold, routing & lobby

- Title: Project scaffold, routing & lobby
- Description: Set up app, routes (`/`, `/login`, `/lobby`, `/game/:id`), and a simple game lobby.
- Story Points: 3
- Artifact Type: Collection of Features

Verifiable features:

- Application structure: A web application project scaffold exists (e.g., React + tooling) with a clear source layout.
- Routing configuration includes the following paths:
	- `/` (root) — public; may redirect to `/login` or a landing page.
	- `/login` — public; displays authentication form.
	- `/lobby` — protected; accessible only after login.
	- `/game/:id` — protected dynamic route (e.g., `/game/blackjack`).
- Route protection: Unauthenticated access to `/lobby` or `/game/:id` redirects to `/login`.
- Lobby UI: `/lobby` renders a simple view with placeholders or links for games (for example, a clickable "Blackjack" tile).

---

## Requirement ID: 2 — Auth: sign up/login (mock email verify ok)

- Title: Auth: sign up/login (mock email verify ok)
- Description: Local auth with hashed passwords; minimal session management.
- Story Points: 5
- Artifact Type: User Stories

Verifiable features (user stories):

- Sign Up: "As a new user, I can navigate to `/login`, provide a username and password, and click 'Sign Up' to create an account and access the application."
- Login: "As an existing user, I can log in with correct credentials and be redirected to `/lobby`."
- Bad Login: "If I enter an incorrect password, I see an error and remain on `/login`."
- Logout: "As an authenticated user, I can click 'Logout', which clears my session and redirects me to `/login`."

Security & session notes:

- Passwords must be stored as secure hashes (e.g., bcrypt) — no plain-text storage.
- Upon successful login, a session mechanism (cookie or token) is created to authorize protected routes.

---

## Requirement ID: 3 — Simulated 401k tokens ledger

- Title: Simulated 401k tokens ledger
- Description: Start users with demo tokens; atomic debit/credit on bets & wins.
- Story Points: 5
- Artifact Type: Collection of Features

Verifiable features:

- Initial balance: New accounts receive a starting demo-token balance (example: 1000 tokens).
- Balance storage: The user's token balance is persisted and associated with the user record.
- Atomic debit: An operation exists to atomically debit a user's balance for bets; it must fail if funds are insufficient.
- Atomic credit: An operation exists to atomically credit a user's balance for wins.
- Transaction log (recommended): A ledger table or similar records transactions with timestamp, user id, and amount.

---

## Requirement ID: 4 — Game #1: Blackjack

- Title: Game #1: Blackjack
- Description: Blackjack, 2.0x payout; server resolves outcome; UI animates result.
- Story Points: 5
- Artifact Type: User Stories & UI Model (Descriptive)

Verifiable features:

- Navigation: "As an authenticated user in the `/lobby`, I can click on 'Blackjack' to navigate to `/game/blackjack`."
- Betting: "On the Blackjack page, I can enter a bet and click 'Deal' to place the bet; my balance is debited accordingly."
- Gameplay: "I can see my hand and the dealer's hand and use 'Hit' and 'Stand' controls." 

UI model (high-level):

- The interface displays player and dealer cards and the player's current token balance.
- Controls for 'Hit' and 'Stand' are available during play.
- A status area indicates game state (e.g., "Your Turn", "Dealer's Turn", "You Win!", "Bust!").

Game logic & payout:

- Game logic (shuffling, dealing, bust/win) is resolved on the server; client sends actions and receives state updates.
- Payout rules per backlog:
	- Win: credit the player with 2.0x their original bet (bet + 100% profit).
	- Push (tie): return the original bet to the player.
	- Loss: bet is lost (no credit applied).
