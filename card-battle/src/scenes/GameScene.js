/**
 * GameScene - Main card battle gameplay
 */

import Phaser from 'phaser';
import { TurnManager, TurnPhase } from '../systems/TurnManager.js';
import { Deck } from '../entities/Deck.js';
import { Hand } from '../entities/Hand.js';
import { CardEffectSystem } from '../systems/CardEffectSystem.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { createStarterDeck } from '../data/cards.js';
import { HandConfig, PlayerConfig, EnemyConfig } from '../config.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    // CRITICAL: Initialize all state variables here (avoid undefined bugs)
    this.currentEnergy = 3;
    this.maxEnergy = 3;
    this.isPlayerTurn = true;
    this.selectedCard = null;
    this.gameOver = false;
    this.turnCount = 1;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Initialize systems
    this.initializeSystems();

    // Create UI
    this.createUI();

    // Create player and enemy
    this.createCombatants();

    // Create deck and draw starting hand
    this.initializeDeck();

    // Start first turn
    this.startPlayerTurn();

    // Fade in
    this.cameras.main.fadeIn(500);
  }

  initializeSystems() {
    // Initialize TurnManager
    this.turnManager = new TurnManager(this, {
      actionsPerTurn: 1,
      maxDrawPerTurn: 5
    });

    // Initialize CardEffectSystem
    this.cardEffectSystem = new CardEffectSystem(this);

    // Listen to turn events
    this.turnManager.events.on('turnStart', this.onTurnStart, this);
    this.turnManager.events.on('turnEnd', this.onTurnEnd, this);
    this.turnManager.events.on('phaseChange', this.onPhaseChange, this);

    // Listen to card effect events
    this.events.on('drawCards', (data) => this.drawCards(data.count));
    this.events.on('discardCards', (data) => this.discardRandomCards(data.count));
  }

  createUI() {
    const { width, height } = this.cameras.main;

    // Energy display
    this.energyText = this.add.text(50, 450, `Energy: ${this.currentEnergy}/${this.maxEnergy}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff88',
      stroke: '#000000',
      strokeThickness: 2
    });

    // Turn indicator
    this.turnText = this.add.text(width / 2, 20, `Turn ${this.turnCount}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // End turn button
    this.endTurnButton = this.add.rectangle(720, 380, 120, 40, 0x0066cc)
      .setInteractive({ useHandCursor: true });
    this.add.text(720, 380, 'End Turn', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.endTurnButton.on('pointerdown', () => this.endPlayerTurn());
    this.endTurnButton.on('pointerover', () => this.endTurnButton.setFillStyle(0x0088ff));
    this.endTurnButton.on('pointerout', () => this.endTurnButton.setFillStyle(0x0066cc));

    // Deck count
    this.deckCountText = this.add.text(720, 450, 'Deck: 0', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#888888'
    });

    // Discard count
    this.discardCountText = this.add.text(720, 520, 'Discard: 0', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#888888'
    });
  }

  createCombatants() {
    const { width, height } = this.cameras.main;

    // Create player
    this.player = new Player(this, 100, 500, {
      health: PlayerConfig.startingHealth,
      maxHealth: PlayerConfig.maxHealth
    });

    // Create enemy (random type)
    const enemyTypes = Object.keys(EnemyConfig.types);
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const enemyConfig = EnemyConfig.types[randomType];

    this.enemy = new Enemy(this, 600, 100, {
      type: randomType,
      health: Phaser.Math.Between(enemyConfig.health.min, enemyConfig.health.max),
      actions: enemyConfig.actions
    });
  }

  initializeDeck() {
    // Create starter deck
    const starterCards = createStarterDeck();
    this.deck = new Deck(starterCards);
    this.deck.shuffle();

    // Create hand
    this.hand = new Hand({ maxCards: HandConfig.maxCards });

    // Draw starting hand
    this.drawCards(HandConfig.startingCards);
    this.updateUI();
  }

  startPlayerTurn() {
    this.isPlayerTurn = true;
    this.currentEnergy = this.maxEnergy;

    // Reset block at start of turn (Slay the Spire rule)
    if (this.player) {
      this.player.resetBlock();
    }

    // Draw cards at start of turn
    this.drawCards(5);

    // Update turn manager
    this.turnManager.startTurn('player');

    this.updateUI();
  }

  endPlayerTurn() {
    if (!this.isPlayerTurn || this.gameOver) return;

    this.isPlayerTurn = false;

    // Discard all cards in hand
    this.discardHand();

    // Start enemy turn
    this.time.delayedCall(500, () => {
      this.startEnemyTurn();
    });
  }

  startEnemyTurn() {
    this.turnManager.startTurn('enemy');

    // Enemy takes action
    this.time.delayedCall(1000, () => {
      this.enemy.takeAction(this.player);
      this.checkGameOver();

      if (!this.gameOver) {
        this.time.delayedCall(500, () => {
          this.turnCount++;
          this.startPlayerTurn();
        });
      }
    });
  }

  drawCards(count) {
    const drawnCards = this.deck.draw(count);
    drawnCards.forEach((cardData, index) => {
      this.hand.addCard(cardData);
      this.createCardSprite(cardData, this.hand.cards.length - 1);
    });
    this.updateUI();
  }

  createCardSprite(cardData, index) {
    const { width } = this.cameras.main;
    const handSize = this.hand.cards.length;
    const startX = width / 2 - (handSize - 1) * HandConfig.cardSpacing / 2;

    const x = startX + index * HandConfig.cardSpacing;
    const y = HandConfig.cardY;

    // Create card sprite
    const cardSprite = this.add.rectangle(x, y, 130, 190, this.getCardColor(cardData.type))
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xffffff);

    // Card name
    this.add.text(x, y - 70, cardData.name, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Card cost
    this.add.text(x - 50, y - 70, `${cardData.cost}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ff4757',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Card description
    this.add.text(x, y + 50, cardData.description, {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#cccccc',
      wordWrap: { width: 110 },
      align: 'center'
    }).setOrigin(0.5);

    // Store reference
    cardSprite.cardData = cardData;
    cardSprite.originalY = y;

    // Card interactions
    cardSprite.on('pointerover', () => {
      if (this.isPlayerTurn) {
        cardSprite.setY(y - 30);
        cardSprite.setStrokeStyle(3, 0x00ff88);
      }
    });

    cardSprite.on('pointerout', () => {
      cardSprite.setY(y);
      cardSprite.setStrokeStyle(2, 0xffffff);
    });

    cardSprite.on('pointerdown', () => {
      if (this.isPlayerTurn) {
        this.playCard(cardSprite);
      }
    });

    return cardSprite;
  }

  getCardColor(type) {
    const colors = {
      attack: 0xe74c3c,
      defense: 0x3498db,
      skill: 0x2ecc71,
      special: 0x9b59b6
    };
    return colors[type] || 0x666666;
  }

  playCard(cardSprite) {
    const card = cardSprite.cardData;

    // Check energy
    if (this.currentEnergy < card.cost) {
      this.showMessage('Not enough energy!');
      return;
    }

    // Spend energy
    this.currentEnergy -= card.cost;

    // Execute card effects
    card.effects.forEach(effect => {
      const target = effect.type === 'damage' ? this.enemy : this.player;
      this.cardEffectSystem.resolve(card, effect, target);
    });

    // Remove card from hand
    this.hand.removeCard(card);

    // Add to discard pile
    this.deck.addToDiscard(card);

    // Remove sprite
    cardSprite.destroy();

    // Reorganize hand display
    this.reorganizeHand();

    // Update UI
    this.updateUI();

    // Check if enemy defeated
    if (this.enemy.health <= 0) {
      this.onEnemyDefeated();
    }
  }

  reorganizeHand() {
    // Destroy existing card sprites and recreate
    // (simplified - in production would animate)
  }

  discardHand() {
    while (this.hand.cards.length > 0) {
      const card = this.hand.cards.pop();
      this.deck.addToDiscard(card);
    }
    this.updateUI();
  }

  updateUI() {
    this.energyText.setText(`Energy: ${this.currentEnergy}/${this.maxEnergy}`);
    this.turnText.setText(`Turn ${this.turnCount}`);
    this.deckCountText.setText(`Deck: ${this.deck.getRemaining()}`);
    this.discardCountText.setText(`Discard: ${this.deck.getDiscardCount()}`);
  }

  showMessage(text) {
    const msg = this.add.text(400, 300, text, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.time.delayedCall(1000, () => msg.destroy());
  }

  checkGameOver() {
    if (this.player.health <= 0) {
      this.gameOver = true;
      this.scene.start('GameOverScene', { won: false });
    }
  }

  onEnemyDefeated() {
    this.showMessage('Enemy defeated!');
    this.time.delayedCall(1500, () => {
      this.scene.start('GameOverScene', { won: true });
    });
  }

  // Event handlers
  onTurnStart(data) {
    console.log(`[GameScene] Turn ${data.turn} started for ${data.player}`);
  }

  onTurnEnd(data) {
    console.log(`[GameScene] Turn ended for ${data.player}`);
  }

  onPhaseChange(data) {
    console.log(`[GameScene] Phase changed to ${data.phase}`);
  }

  /**
   * Discard random cards from hand
   * @param {Object} data - Contains count of cards to discard
   */
  discardRandomCards(count) {
    for (let i = 0; i < count && this.hand.cards.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * this.hand.cards.length);
      const card = this.hand.removeAt(randomIndex);
      if (card) {
        this.deck.addToDiscard(card);
      }
    }
    this.updateUI();
  }

  /**
   * Clean up event listeners on scene shutdown
   */
  shutdown() {
    if (this.turnManager) {
      this.turnManager.events.off('turnStart', this.onTurnStart, this);
      this.turnManager.events.off('turnEnd', this.onTurnEnd, this);
      this.turnManager.events.off('phaseChange', this.onPhaseChange, this);
    }
    this.events.off('drawCards');
    this.events.off('discardCards');
  }
}
