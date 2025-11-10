/**
 * ----------------------------------------------------------
 * Game Lineup and Upcoming Features Module
 * ----------------------------------------------------------
 * Author: John Tran
 * Last Modified: 2025/11/9
 *
 * Description:
 * This module defines the lineup of casino games available in the application,
 * along with placeholders for upcoming features and an overview of future plans.
 * ----------------------------------------------------------
 */

// Array of game objects representing the casino game lineup
export const gameLineup = [
  {
    id: 'blackjack',
    name: 'Blackjack',
    sprint: 'Sprint 1',
    status: 'available',
    description: 'Classic 2.0x payout blackjack with a reusable game shell and ledger settlement.'
  },
  {
    id: 'high-low',
    name: 'High-Low',
    sprint: 'Sprint 2',
    status: 'available',
    description: 'Predict whether the next card is higher or lower. Play a quick resolve-and-settle round with ~1.9x payout.'
  },
  {
    id: 'slots',
    name: 'Slots Mini',
    sprint: 'Sprint 3',
    status: 'coming-soon',
    description: 'Three-reel chaos goes live in Sprint 3 alongside polish and fairness work.'
  }
];

// Array of placeholders for upcoming sprint features
export const sprintPlaceholders = [
  {
    sprint: 'Sprint 2',
    title: 'Wallet Panel',
    summary: 'Richer balance insights and transaction filters land next sprint.'
  },
  {
    sprint: 'Sprint 2',
    title: 'On-Track Popup',
    summary: 'Satirical projections and user-entered goals arrive with the next release.'
  },
  {
    sprint: 'Sprint 3',
    title: 'Export & Fairness',
    summary: 'Seeded RNG transparency, CSV exports, and accessibility polish are queued.'
  }
];

// Array of placeholders for upcoming features overview
export const upcomingOverview = [
  {
    title: 'Wallet Panel',
    sprint: 'Sprint 2',
    summary: 'Balance dashboards and filters attach to the ledger soon.'
  },
  {
    title: 'High-Low & Slots',
    sprint: 'Sprint 2 / 3',
    summary: 'Fresh games unlock in future sprints—routes are placeholdered today.'
  },
  {
    title: 'Fairness & RNG Transparency',
    sprint: 'Sprint 3',
    summary: 'Expect seeded RNG, download buttons, and additional satire down the road.'
  }
];
