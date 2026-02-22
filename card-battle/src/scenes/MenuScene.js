/**
 * MenuScene - Title screen and game start
 */

import Phaser from 'phaser';
import { GameConfig } from '../config.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    this.add.text(width / 2, height / 3, 'CARD BATTLE', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ff88',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 3 + 50, 'Slay the Spire Style', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#888888'
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.rectangle(width / 2, height / 2 + 50, 200, 50, 0x0066cc)
      .setInteractive({ useHandCursor: true });

    const startText = this.add.text(width / 2, height / 2 + 50, 'Start Game', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Button hover effects
    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x0088ff);
      startText.setColor('#ffff00');
    });

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x0066cc);
      startText.setColor('#ffffff');
    });

    startButton.on('pointerdown', () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameScene');
      });
    });

    // Instructions
    this.add.text(width / 2, height - 80,
      'Draw cards each turn • Spend energy to play cards • Defeat enemies', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#666666'
    }).setOrigin(0.5);

    // Fade in
    this.cameras.main.fadeIn(500);
  }
}
