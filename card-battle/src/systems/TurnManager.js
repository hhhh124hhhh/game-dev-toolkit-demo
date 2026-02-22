/**
 * TurnManager - Turn-based system management
 */

import Phaser from 'phaser';

export const TurnPhase = {
  DRAW: 'draw',
  ACTION: 'action',
  END: 'end'
};

/**
 * Simple EventEmitter wrapper for turn events
 */
class TurnEventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback, context) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push({ callback, context });
    return this;
  }

  off(event, callback, context) {
    if (!this.listeners.has(event)) return this;
    const eventListeners = this.listeners.get(event);
    const filtered = eventListeners.filter(
      l => l.callback !== callback || l.context !== context
    );
    this.listeners.set(event, filtered);
    return this;
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return this;
    this.listeners.get(event).forEach(({ callback, context }) => {
      callback.call(context, data);
    });
    return this;
  }
}

export class TurnManager {
  constructor(scene, config = {}) {
    // CRITICAL: Initialize all state variables
    this.scene = scene;
    this.currentTurn = 1;
    this.currentPlayer = 'player';
    this.phase = TurnPhase.DRAW;
    this.actionsRemaining = config.actionsPerTurn || 1;
    this.maxDrawPerTurn = config.maxDrawPerTurn || 5;
    this.cardsDrawnThisTurn = 0;
    this.config = config;

    // Event emitter for turn events
    // Use Phaser's EventEmitter if available, otherwise use our simple implementation
    try {
      this.events = new Phaser.Events.EventEmitter();
    } catch {
      this.events = new TurnEventEmitter();
    }
  }

  /**
   * Start a new turn for a player
   * @param {string} player - 'player' or 'enemy'
   */
  startTurn(player) {
    this.currentPlayer = player;
    this.phase = TurnPhase.DRAW;
    this.actionsRemaining = this.config.actionsPerTurn || 1;
    this.cardsDrawnThisTurn = 0;

    this.events.emit('turnStart', {
      player: this.currentPlayer,
      turn: this.currentTurn
    });

    console.log(`[TurnManager] Turn ${this.currentTurn} started for ${player}`);
  }

  /**
   * Draw a card (DRAW phase only)
   * @returns {boolean} - Whether draw was successful
   */
  drawCard() {
    if (this.phase !== TurnPhase.DRAW) {
      console.log('[TurnManager] Cannot draw: not in DRAW phase');
      return false;
    }

    if (this.cardsDrawnThisTurn >= this.maxDrawPerTurn) {
      console.log('[TurnManager] Max cards drawn this turn');
      return false;
    }

    this.cardsDrawnThisTurn++;
    this.events.emit('cardDrawn', {
      player: this.currentPlayer,
      total: this.cardsDrawnThisTurn
    });

    // Auto-transition to ACTION phase after max draws
    if (this.cardsDrawnThisTurn >= this.maxDrawPerTurn) {
      this.transitionTo(TurnPhase.ACTION);
    }

    return true;
  }

  /**
   * Play a card (ACTION phase only)
   * @param {Object} card - Card to play
   * @returns {boolean} - Whether play was successful
   */
  playCard(card) {
    if (this.phase !== TurnPhase.ACTION) {
      console.log('[TurnManager] Cannot play: not in ACTION phase');
      return false;
    }

    if (this.actionsRemaining <= 0) {
      console.log('[TurnManager] No actions remaining');
      return false;
    }

    this.actionsRemaining--;
    this.events.emit('cardPlayed', {
      card,
      player: this.currentPlayer,
      actionsRemaining: this.actionsRemaining
    });

    return true;
  }

  /**
   * Transition to a new phase
   * @param {string} phase - Target phase
   */
  transitionTo(phase) {
    const previousPhase = this.phase;
    this.phase = phase;

    this.events.emit('phaseChange', {
      previousPhase,
      currentPhase: phase
    });

    console.log(`[TurnManager] Phase: ${previousPhase} -> ${phase}`);
  }

  /**
   * End the current turn
   */
  endTurn() {
    this.phase = TurnPhase.END;

    this.events.emit('turnEnd', {
      player: this.currentPlayer,
      turn: this.currentTurn
    });

    // Switch players
    const nextPlayer = this.currentPlayer === 'player' ? 'enemy' : 'player';

    // Increment turn counter when returning to player
    if (nextPlayer === 'player') {
      this.currentTurn++;
    }

    // Start next turn
    this.startTurn(nextPlayer);
  }

  /**
   * Get current turn info
   * @returns {Object} - Turn information
   */
  getTurnInfo() {
    return {
      turn: this.currentTurn,
      player: this.currentPlayer,
      phase: this.phase,
      actionsRemaining: this.actionsRemaining,
      cardsDrawn: this.cardsDrawnThisTurn
    };
  }

  /**
   * Check if it's player's turn
   * @returns {boolean}
   */
  isPlayerTurn() {
    return this.currentPlayer === 'player';
  }

  /**
   * Check if it's enemy's turn
   * @returns {boolean}
   */
  isEnemyTurn() {
    return this.currentPlayer === 'enemy';
  }

  /**
   * Check if in specific phase
   * @param {string} phase - Phase to check
   * @returns {boolean}
   */
  isInPhase(phase) {
    return this.phase === phase;
  }

  /**
   * Force set phase (for testing)
   * @param {string} phase - Phase to set
   */
  setPhase(phase) {
    this.phase = phase;
  }

  /**
   * Reset turn manager
   */
  reset() {
    this.currentTurn = 1;
    this.currentPlayer = 'player';
    this.phase = TurnPhase.DRAW;
    this.actionsRemaining = this.config.actionsPerTurn || 1;
    this.cardsDrawnThisTurn = 0;
  }
}
