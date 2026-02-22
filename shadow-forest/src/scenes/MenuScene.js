/**
 * MenuScene 主菜单场景
 * 《暗影森林》Shadow Forest
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    this.add.image(width / 2, height / 2, 'background');

    // 标题
    const title = this.add.text(width / 2, 150, '暗影森林', {
      fontFamily: 'Arial',
      fontSize: '64px',
      fontStyle: 'bold',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5, 0.5);

    // 副标题
    const subtitle = this.add.text(width / 2, 220, 'Shadow Forest', {
      fontFamily: 'Arial',
      fontSize: '24px',
      fill: '#aaaaaa'
    });
    subtitle.setOrigin(0.5, 0.5);

    // 开始按钮
    this.createButton(width / 2, 320, '开始游戏', () => {
      this.scene.start('GameScene');
    });

    // 设置按钮
    this.createButton(width / 2, 400, '游戏说明', () => {
      this.showInstructions();
    });

    // 操作提示
    const controlsText = this.add.text(width / 2, 520,
      '操作：← → 移动 | ↑ 跳跃 | J 攻击 | K 技能 | ESC 暂停', {
      fontFamily: 'Arial',
      fontSize: '14px',
      fill: '#888888'
    });
    controlsText.setOrigin(0.5, 0.5);

    // 版本信息
    const versionText = this.add.text(width - 10, height - 10, 'v1.0.0', {
      fontFamily: 'Arial',
      fontSize: '12px',
      fill: '#666666'
    });
    versionText.setOrigin(1, 1);
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

  showInstructions() {
    const { width, height } = this.cameras.main;

    // 半透明遮罩
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setInteractive();

    // 说明面板
    const panel = this.add.rectangle(width / 2, height / 2, 500, 350, 0x1a1a1a);
    panel.setStrokeStyle(2, 0xffd700);

    // 标题
    const title = this.add.text(width / 2, height / 2 - 140, '游戏说明', {
      fontFamily: 'Arial',
      fontSize: '28px',
      fill: '#ffd700'
    });
    title.setOrigin(0.5, 0.5);

    // 说明文字
    const instructions = [
      '【故事背景】',
      '你是一名勇敢的冒险者，深入神秘的暗影森林...',
      '',
      '【操作指南】',
      '← → : 左右移动',
      '↑ : 跳跃',
      'J : 普通攻击',
      'K : 释放技能',
      'ESC : 暂停游戏',
      '',
      '【游戏目标】',
      '击败敌人，获得经验，提升等级，探索森林深处！'
    ];

    const instructionText = this.add.text(width / 2, height / 2 + 20, instructions.join('\n'), {
      fontFamily: 'Arial',
      fontSize: '16px',
      fill: '#ffffff',
      align: 'center'
    });
    instructionText.setOrigin(0.5, 0.5);

    // 关闭按钮
    const closeBtn = this.add.text(width / 2, height / 2 + 150, '[ 点击关闭 ]', {
      fontFamily: 'Arial',
      fontSize: '18px',
      fill: '#e74c3c'
    });
    closeBtn.setOrigin(0.5, 0.5);
    closeBtn.setInteractive({ useHandCursor: true });

    closeBtn.on('pointerup', () => {
      overlay.destroy();
      panel.destroy();
      title.destroy();
      instructionText.destroy();
      closeBtn.destroy();
    });

    overlay.on('pointerup', () => {
      overlay.destroy();
      panel.destroy();
      title.destroy();
      instructionText.destroy();
      closeBtn.destroy();
    });
  }
}
