/**
 * ----------------------------------------------------------
 * Deck Module
 * ----------------------------------------------------------
 * Author: Tuan Vu
 * Last Modified: 2025/11/9
 *
 * Description:
 * This module provides utility functions to create and shuffle a standard deck of playing cards.
 * ----------------------------------------------------------
 */

// Definitions for card ranks
const RANKS = [
  { rank: 'A', value: 1 },
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 11 },
  { rank: 'Q', value: 12 },
  { rank: 'K', value: 13 }
];

// Definitions for card suits
const SUITS = [
  { symbol: '♠', suitColor: 'dark' },
  { symbol: '♥', suitColor: 'bright' },
  { symbol: '♦', suitColor: 'bright' },
  { symbol: '♣', suitColor: 'dark' }
];

// Function to create a standard 52-card deck
export const createDeck = () => {
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

// Function to shuffle a deck of cards using Fisher-Yates algorithm
export const shuffle = (deck) => {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};