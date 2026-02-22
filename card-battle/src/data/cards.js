/**
 * Card database and starter deck
 */

import { CardType, Rarity } from '../config.js';

// Card definitions
export const CARD_DATABASE = {
  // === ATTACK CARDS ===
  strike: {
    id: 'strike',
    name: 'Strike',
    type: CardType.ATTACK,
    cost: 1,
    rarity: Rarity.COMMON,
    description: 'Deal 6 damage.',
    effects: [
      { type: 'damage', value: 6 }
    ]
  },

  heavy_strike: {
    id: 'heavy_strike',
    name: 'Heavy Strike',
    type: CardType.ATTACK,
    cost: 2,
    rarity: Rarity.COMMON,
    description: 'Deal 12 damage.',
    effects: [
      { type: 'damage', value: 12 }
    ]
  },

  quick_slash: {
    id: 'quick_slash',
    name: 'Quick Slash',
    type: CardType.ATTACK,
    cost: 1,
    rarity: Rarity.COMMON,
    description: 'Deal 4 damage. Draw 1 card.',
    effects: [
      { type: 'damage', value: 4 },
      { type: 'draw', value: 1 }
    ]
  },

  double_tap: {
    id: 'double_tap',
    name: 'Double Tap',
    type: CardType.ATTACK,
    cost: 2,
    rarity: Rarity.RARE,
    description: 'Deal 5 damage twice.',
    effects: [
      { type: 'damage', value: 5 },
      { type: 'damage', value: 5 }
    ]
  },

  // === DEFENSE CARDS ===
  defend: {
    id: 'defend',
    name: 'Defend',
    type: CardType.DEFENSE,
    cost: 1,
    rarity: Rarity.COMMON,
    description: 'Gain 5 block.',
    effects: [
      { type: 'block', value: 5 }
    ]
  },

  iron_wave: {
    id: 'iron_wave',
    name: 'Iron Wave',
    type: CardType.DEFENSE,
    cost: 1,
    rarity: Rarity.COMMON,
    description: 'Gain 5 block. Deal 5 damage.',
    effects: [
      { type: 'block', value: 5 },
      { type: 'damage', value: 5 }
    ]
  },

  armaments: {
    id: 'armaments',
    name: 'Armaments',
    type: CardType.DEFENSE,
    cost: 1,
    rarity: Rarity.COMMON,
    description: 'Gain 5 block.',
    effects: [
      { type: 'block', value: 5 }
    ]
  },

  // === SKILL CARDS ===
  flexible: {
    id: 'flexible',
    name: 'Flex',
    type: CardType.SKILL,
    cost: 0,
    rarity: Rarity.COMMON,
    description: 'Draw 2 cards.',
    effects: [
      { type: 'draw', value: 2 }
    ]
  },

  shrug_it_off: {
    id: 'shrug_it_off',
    name: 'Shrug It Off',
    type: CardType.SKILL,
    cost: 1,
    rarity: Rarity.COMMON,
    description: 'Gain 8 block. Draw 1 card.',
    effects: [
      { type: 'block', value: 8 },
      { type: 'draw', value: 1 }
    ]
  },

  battle_trance: {
    id: 'battle_trance',
    name: 'Battle Trance',
    type: CardType.SKILL,
    cost: 0,
    rarity: Rarity.RARE,
    description: 'Draw 3 cards.',
    effects: [
      { type: 'draw', value: 3 }
    ]
  },

  // === SPECIAL CARDS ===
  bash: {
    id: 'bash',
    name: 'Bash',
    type: CardType.SPECIAL,
    cost: 2,
    rarity: Rarity.COMMON,
    description: 'Deal 8 damage.',
    effects: [
      { type: 'damage', value: 8 }
    ]
  },

  cleave: {
    id: 'cleave',
    name: 'Cleave',
    type: CardType.SPECIAL,
    cost: 1,
    rarity: Rarity.RARE,
    description: 'Deal 8 damage to ALL enemies.',
    effects: [
      { type: 'damage', value: 8, target: 'all' }
    ]
  },

  anger: {
    id: 'anger',
    name: 'Anger',
    type: CardType.SPECIAL,
    cost: 0,
    rarity: Rarity.COMMON,
    description: 'Deal 6 damage.',
    effects: [
      { type: 'damage', value: 6 }
    ]
  },

  clothesline: {
    id: 'clothesline',
    name: 'Clothesline',
    type: CardType.SPECIAL,
    cost: 2,
    rarity: Rarity.COMMON,
    description: 'Deal 12 damage. Gain 5 block.',
    effects: [
      { type: 'damage', value: 12 },
      { type: 'block', value: 5 }
    ]
  },

  // === LEGENDARY CARDS ===
  bludgeon: {
    id: 'bludgeon',
    name: 'Bludgeon',
    type: CardType.ATTACK,
    cost: 3,
    rarity: Rarity.LEGENDARY,
    description: 'Deal 32 damage.',
    effects: [
      { type: 'damage', value: 32 }
    ]
  },

  impervious: {
    id: 'impervious',
    name: 'Impervious',
    type: CardType.DEFENSE,
    cost: 2,
    rarity: Rarity.LEGENDARY,
    description: 'Gain 30 block.',
    effects: [
      { type: 'block', value: 30 }
    ]
  }
};

/**
 * Create a starter deck
 * @returns {Array} - Array of card objects
 */
export function createStarterDeck() {
  return [
    // 5 Strike cards
    { ...CARD_DATABASE.strike },
    { ...CARD_DATABASE.strike },
    { ...CARD_DATABASE.strike },
    { ...CARD_DATABASE.strike },
    { ...CARD_DATABASE.strike },

    // 4 Defend cards
    { ...CARD_DATABASE.defend },
    { ...CARD_DATABASE.defend },
    { ...CARD_DATABASE.defend },
    { ...CARD_DATABASE.defend },

    // 1 Bash card
    { ...CARD_DATABASE.bash }
  ];
}

/**
 * Get a card by ID
 * @param {string} id - Card ID
 * @returns {Object|null} - Card object or null
 */
export function getCardById(id) {
  const card = CARD_DATABASE[id];
  return card ? { ...card } : null;
}

/**
 * Get cards by type
 * @param {string} type - Card type
 * @returns {Array} - Array of cards
 */
export function getCardsByType(type) {
  return Object.values(CARD_DATABASE)
    .filter(card => card.type === type)
    .map(card => ({ ...card }));
}

/**
 * Get cards by rarity
 * @param {string} rarity - Card rarity
 * @returns {Array} - Array of cards
 */
export function getCardsByRarity(rarity) {
  return Object.values(CARD_DATABASE)
    .filter(card => card.rarity === rarity)
    .map(card => ({ ...card }));
}

/**
 * Get a random card
 * @param {string} rarity - Optional rarity filter
 * @returns {Object} - Random card
 */
export function getRandomCard(rarity = null) {
  let pool = Object.values(CARD_DATABASE);

  if (rarity) {
    pool = pool.filter(card => card.rarity === rarity);
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return { ...pool[randomIndex] };
}
