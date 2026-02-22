/**
 * TurnManager Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TurnManager, TurnPhase } from '../../src/systems/TurnManager.js';

// Mock Phaser.Events.EventEmitter - must be defined inline due to hoisting
vi.mock('phaser', () => {
  class MockEventEmitter {
    constructor() {
      this.listeners = {};
    }
    on(event, callback, context) {
      this.listeners[event] = this.listeners[event] || [];
      this.listeners[event].push({ callback, context });
    }
    off(event, callback, context) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(
        l => l.callback !== callback || l.context !== context
      );
    }
    emit(event, data) {
      (this.listeners[event] || []).forEach(l => l.callback.call(l.context, data));
    }
  }
  return {
    default: {
      Events: {
        EventEmitter: MockEventEmitter
      }
    },
    Events: {
      EventEmitter: MockEventEmitter
    }
  };
});

describe('TurnManager', () => {
  let turnManager;
  let mockScene;

  beforeEach(() => {
    mockScene = {};
    turnManager = new TurnManager(mockScene, {
      actionsPerTurn: 1,
      maxDrawPerTurn: 5
    });
  });

  describe('initialization', () => {
    it('should initialize all state variables', () => {
      expect(turnManager.currentTurn).toBeDefined();
      expect(turnManager.currentPlayer).toBeDefined();
      expect(turnManager.phase).toBeDefined();
      expect(turnManager.actionsRemaining).toBeDefined();
      expect(turnManager.cardsDrawnThisTurn).toBeDefined();
    });

    it('should start with turn 1', () => {
      expect(turnManager.currentTurn).toBe(1);
    });

    it('should start with player turn', () => {
      expect(turnManager.currentPlayer).toBe('player');
    });

    it('should start in DRAW phase', () => {
      expect(turnManager.phase).toBe(TurnPhase.DRAW);
    });

    it('should start with 0 cards drawn', () => {
      expect(turnManager.cardsDrawnThisTurn).toBe(0);
    });
  });

  describe('turn flow', () => {
    it('should allow drawing cards in DRAW phase', () => {
      turnManager.startTurn('player');
      const result = turnManager.drawCard();
      expect(result).toBe(true);
    });

    it('should increment cards drawn counter', () => {
      turnManager.startTurn('player');
      turnManager.drawCard();
      expect(turnManager.cardsDrawnThisTurn).toBe(1);
    });

    it('should transition to ACTION phase after max draws', () => {
      turnManager.startTurn('player');
      // Draw max cards
      for (let i = 0; i < 5; i++) {
        turnManager.drawCard();
      }
      expect(turnManager.phase).toBe(TurnPhase.ACTION);
    });

    it('should not allow drawing more than max cards', () => {
      turnManager.startTurn('player');
      // Draw max cards
      for (let i = 0; i < 5; i++) {
        turnManager.drawCard();
      }
      // Try to draw one more
      const result = turnManager.drawCard();
      expect(result).toBe(false);
    });

    it('should not allow playing cards in DRAW phase', () => {
      turnManager.startTurn('player');
      // phase is DRAW, not ACTION
      const result = turnManager.playCard({});
      expect(result).toBe(false);
    });
  });

  describe('turn switching', () => {
    it('should switch to enemy after player ends turn', () => {
      turnManager.startTurn('player');
      turnManager.endTurn();
      expect(turnManager.currentPlayer).toBe('enemy');
    });

    it('should switch to player after enemy ends turn', () => {
      turnManager.startTurn('player');
      turnManager.endTurn(); // player -> enemy
      turnManager.endTurn(); // enemy -> player
      expect(turnManager.currentPlayer).toBe('player');
    });

    it('should increment turn after enemy ends', () => {
      turnManager.startTurn('player');
      turnManager.endTurn(); // player -> enemy
      turnManager.endTurn(); // enemy -> player (new turn)
      expect(turnManager.currentTurn).toBe(2);
    });

    it('should reset cards drawn on new turn', () => {
      turnManager.startTurn('player');
      turnManager.drawCard();
      turnManager.endTurn();
      turnManager.endTurn();
      expect(turnManager.cardsDrawnThisTurn).toBe(0);
    });
  });

  describe('events', () => {
    it('should emit turnStart event', () => {
      const callback = vi.fn();
      turnManager.events.on('turnStart', callback);
      turnManager.startTurn('player');
      expect(callback).toHaveBeenCalled();
    });

    it('should emit turnEnd event', () => {
      const callback = vi.fn();
      turnManager.events.on('turnEnd', callback);
      turnManager.startTurn('player');
      turnManager.endTurn();
      expect(callback).toHaveBeenCalled();
    });

    it('should emit phaseChange event', () => {
      const callback = vi.fn();
      turnManager.events.on('phaseChange', callback);
      turnManager.transitionTo(TurnPhase.ACTION);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('helper methods', () => {
    it('should correctly identify player turn', () => {
      turnManager.startTurn('player');
      expect(turnManager.isPlayerTurn()).toBe(true);
      expect(turnManager.isEnemyTurn()).toBe(false);
    });

    it('should correctly identify enemy turn', () => {
      turnManager.startTurn('enemy');
      expect(turnManager.isEnemyTurn()).toBe(true);
      expect(turnManager.isPlayerTurn()).toBe(false);
    });

    it('should correctly identify phase', () => {
      expect(turnManager.isInPhase(TurnPhase.DRAW)).toBe(true);
      turnManager.transitionTo(TurnPhase.ACTION);
      expect(turnManager.isInPhase(TurnPhase.ACTION)).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      turnManager.startTurn('player');
      turnManager.drawCard();
      turnManager.endTurn();
      turnManager.endTurn();

      turnManager.reset();

      expect(turnManager.currentTurn).toBe(1);
      expect(turnManager.currentPlayer).toBe('player');
      expect(turnManager.phase).toBe(TurnPhase.DRAW);
    });
  });
});
