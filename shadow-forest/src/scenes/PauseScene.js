/**
 * PauseScene 暂停场景
 * 《暗影森林》Shadow Forest
 */

import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // 半透明遮罩
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    overlay.setInteractive();

    // 暂停标题
    const title = this.add.text(width / 2, 180, '游戏暂停', {
      fontFamily: 'Arial',
      fontSize: '48px',
      fontStyle: 'bold',
      fill: '#ffffff'
    });
    title.setOrigin(0.5, 0.5);

    // 继续按钮
    this.createButton(width / 2, 280, '继续游戏', () => {
      this.resumeGame();
    });

    // 重新开始按钮
    this.createButton(width / 2, 360, '重新开始', () => {
      this.restartGame();
    });

    // 返回主菜单按钮
    this.createButton(width / 2, 440, '返回主菜单', () => {
      this.returnToMenu();
    });

    // 操作提示
    const hint = this.add.text(width / 2, 520, '按 ESC 或点击"继续游戏"继续', {
      fontFamily: 'Arial',
      fontSize: '14px',
      fill: '#888888'
    });
    hint.setOrigin(0.5, 0.5);

    // ESC 键继续
    this.input.keyboard.on('keydown-ESC', () => {
      this.resumeGame();
    });
  }

  createButton(x, y, text, callback) {
    const button = this.add.image(x, y, 'button');
    button.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(x, y, text, {
      fontFamily: 'Arial',
      fontSize: '20px',
      fill: '#ffffff'
    });
    buttonText.setOrigin(0.5, 0.5);

    // 悬停效果
    button.on('pointerover', () => {
      button.setTint(0xcccccc);
      buttonText.setScale(1.1);
    });

    button.on('pointerout', () => {
      button.clearTint();
      buttonText.setScale(1);
    });

    button.on('pointerdown', () => {
      button.setTint(0xaaaaaa);
    });

    button.on('pointerup', () => {
      button.clearTint();
      callback();
    });

    return { button, text: buttonText };
  }

  resumeGame() {
    const gameScene = this.scene.get('GameScene');
    gameScene.resumeGame();
    this.scene.resume('GameScene');
    this.scene.stop();
  }

  restartGame() {
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
    this.scene.stop();
  }

  returnToMenu() {
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
    this.scene.stop();
  }
}
