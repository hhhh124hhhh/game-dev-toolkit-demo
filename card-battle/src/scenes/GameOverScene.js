/**
 * GameOverScene - End game screen
 */

import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.won = data.won || false;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Result text
    const resultText = this.won ? 'VICTORY!' : 'DEFEAT';
    const resultColor = this.won ? '#00ff88' : '#ff4444';

    this.add.text(width / 2, height / 3, resultText, {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: resultColor,
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Stats
    this.add.text(width / 2, height / 2, `Turns: ${window.gameState.wins || 1}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#888888'
    }).setOrigin(0.5);

    // Restart button
    const restartButton = this.add.rectangle(width / 2, height / 2 + 100, 200, 50, 0x0066cc)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height / 2 + 100, 'Play Again', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    restartButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    restartButton.on('pointerover', () => restartButton.setFillStyle(0x0088ff));
    restartButton.on('pointerout', () => restartButton.setFillStyle(0x0066cc));

    // Fade in
    this.cameras.main.fadeIn(500);
  }
}
