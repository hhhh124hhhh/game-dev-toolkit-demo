/**
 * Card Battle Game Configuration
 * Slay the Spire style card game
 */

// Display settings
export const GameConfig = {
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  debug: false,
  gameTitle: 'Card Battle',
  gameVersion: '1.0.0'
};

// Turn system settings
export const TurnConfig = {
  phases: ['draw', 'action', 'end'],
  maxDrawPerTurn: 5,
  actionsPerTurn: 1,
  energyPerTurn: 3,
  maxEnergy: 3
};

// Hand settings
export const HandConfig = {
  maxCards: 10,
  startingCards: 5,
  cardSpacing: 150,
  cardY: 520,
  selectedY: 480
};

// Deck settings
export const DeckConfig = {
  minCards: 10,
  reshuffleDiscard: true
};

// Card design (Pencil integration)
export const CardDesign = {
  size: { width: 140, height: 200 },
  frame: { cornerRadius: 12, borderWidth: 3 },
  colors: {
    common: { frame: '#808080', bg: '#2d2d2d' },
    rare: { frame: '#4169e1', bg: '#1a1a3e' },
    epic: { frame: '#9932cc', bg: '#2d1a3e' },
    legendary: { frame: '#ffd700', bg: '#3e3a1a' }
  },
  cost: {
    x: 20,
    y: 20,
    radius: 18,
    bgColor: '#ff4757',
    textColor: '#ffffff'
  },
  art: {
    x: 15,
    y: 50,
    width: 110,
    height: 80
  },
  name: {
    x: 70,
    y: 145,
    fontSize: 14,
    color: '#ffffff'
  },
  description: {
    x: 10,
    y: 170,
    width: 120,
    height: 25,
    fontSize: 10,
    color: '#cccccc'
  }
};

// Board layout (Pencil integration)
export const BoardLayout = {
  enemyArea: {
    y: 50,
    height: 150
  },
  playArea: {
    y: 220,
    height: 150
  },
  deckArea: {
    x: 720,
    y: 450
  },
  discardArea: {
    x: 720,
    y: 520
  },
  energyDisplay: {
    x: 50,
    y: 450
  },
  healthBar: {
    player: { x: 100, y: 560, width: 200, height: 20 },
    enemy: { x: 600, y: 100, width: 150, height: 16 }
  }
};

// Player settings
export const PlayerConfig = {
  startingHealth: 80,
  maxHealth: 100,
  startingBlock: 0
};

// Enemy settings
export const EnemyConfig = {
  types: {
    slime: {
      name: 'Slime',
      health: { min: 12, max: 18 },
      actions: ['attack', 'defend', 'attack']
    },
    goblin: {
      name: 'Goblin',
      health: { min: 20, max: 25 },
      actions: ['attack', 'attack', 'attack', 'buff']
    },
    cultist: {
      name: 'Cultist',
      health: { min: 30, max: 40 },
      actions: ['buff', 'attack', 'attack', 'special']
    }
  }
};

// Effect types
export const EffectType = {
  DAMAGE: 'damage',
  HEAL: 'heal',
  DRAW: 'draw',
  DISCARD: 'discard',
  BUFF: 'buff',
  DEBUFF: 'debuff',
  BLOCK: 'block'
};

// Card types
export const CardType = {
  ATTACK: 'attack',
  DEFENSE: 'defense',
  SKILL: 'skill',
  SPECIAL: 'special'
};

// Rarity
export const Rarity = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};
