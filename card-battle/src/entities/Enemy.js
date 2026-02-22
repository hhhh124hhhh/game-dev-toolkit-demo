/**
 * Enemy - AI opponent entity
 */

import Phaser from 'phaser';

export class Enemy {
  constructor(scene, x, y, config = {}) {
    this.scene = scene;

    // CRITICAL: Initialize all state variables
    this.type = config.type || 'slime';
    this.health = config.health || 20;
    this.maxHealth = config.health || 20;
    this.block = 0;
    this.actions = config.actions || ['attack', 'attack'];
    this.currentActionIndex = 0;
    this.strength = 0; // Damage buff

    // Create visual representation
    this.createSprite(x, y);
    this.createHealthBar(x, y + 60);

    // Show intent
    this.showIntent();
  }

  createSprite(x, y) {
    // Enemy avatar (different colors for different types)
    const colors = {
      slime: 0x44ff44,
      goblin: 0xff8844,
      cultist: 0x8844ff
    };

    this.sprite = this.scene.add.rectangle(x, y, 100, 120, colors[this.type] || 0xff4444)
      .setStrokeStyle(3, 0xffffff);

    // Enemy label
    const names = {
      slime: 'SLIME',
      goblin: 'GOBLIN',
      cultist: 'CULTIST'
    };

    this.scene.add.text(x, y - 80, names[this.type] || 'ENEMY', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ff4444'
    }).setOrigin(0.5);
  }

  createHealthBar(x, y) {
    // Health bar background
    this.healthBarBg = this.scene.add.rectangle(x, y, 150, 16, 0x333333)
      .setStrokeStyle(1, 0x666666);

    // Health bar fill
    this.healthBarFill = this.scene.add.rectangle(
      x - 73 + (this.health / this.maxHealth) * 146 / 2,
      y,
      (this.health / this.maxHealth) * 146,
      12,
      0xff4444
    );
    this.healthBarFill.setOrigin(0.5);

    // Health text
    this.healthText = this.scene.add.text(x, y, `${this.health}/${this.maxHealth}`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  showIntent() {
    const action = this.actions[this.currentActionIndex];

    // Intent display
    const intentTexts = {
      attack: 'ATTACK',
      defend: 'DEFEND',
      buff: 'BUFF',
      special: 'SPECIAL'
    };

    if (this.intentText) {
      this.intentText.destroy();
    }

    this.intentText = this.scene.add.text(
      this.sprite.x,
      this.sprite.y - 40,
      intentTexts[action] || 'ATTACK',
      {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5);
  }

  takeAction(player) {
    const action = this.actions[this.currentActionIndex];

    console.log(`[Enemy] Taking action: ${action}`);

    switch (action) {
      case 'attack':
        this.attack(player);
        break;
      case 'defend':
        this.defend();
        break;
      case 'buff':
        this.buff();
        break;
      case 'special':
        this.special(player);
        break;
    }

    // Move to next action
    this.currentActionIndex = (this.currentActionIndex + 1) % this.actions.length;
    this.showIntent();
  }

  attack(player) {
    const baseDamage = this.type === 'slime' ? 6 : this.type === 'goblin' ? 9 : 8;
    const damage = baseDamage + this.strength;

    player.takeDamage(damage);

    // Visual feedback
    this.sprite.setFillStyle(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.resetColor();
    });

    console.log(`[Enemy] Attacked for ${damage} damage`);
  }

  defend() {
    const blockGain = 6;
    this.block += blockGain;
    this.updateHealthBar();

    console.log(`[Enemy] Gained ${blockGain} block`);
  }

  buff() {
    this.strength += 2;

    // Visual feedback
    this.sprite.setScale(1.1);
    this.scene.time.delayedCall(200, () => {
      this.sprite.setScale(1);
    });

    console.log(`[Enemy] Gained 2 strength, total: ${this.strength}`);
  }

  special(player) {
    // Cultist special: attack + gain strength
    this.attack(player);
    this.strength += 1;

    console.log(`[Enemy] Used special ability`);
  }

  resetColor() {
    const colors = {
      slime: 0x44ff44,
      goblin: 0xff8844,
      cultist: 0x8844ff
    };
    this.sprite.setFillStyle(colors[this.type] || 0xff4444);
  }

  takeDamage(amount) {
    // Block absorbs damage first
    if (this.block > 0) {
      if (this.block >= amount) {
        this.block -= amount;
        amount = 0;
      } else {
        amount -= this.block;
        this.block = 0;
      }
    }

    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();
    this.flashDamage();

    console.log(`[Enemy] Took ${amount} damage, health: ${this.health}`);
  }

  updateHealthBar() {
    // Prevent division by zero
    const maxHealth = this.maxHealth || 1;
    const healthPercent = this.health / maxHealth;

    this.healthBarFill.width = healthPercent * 146;
    this.healthText.setText(`${this.health}/${this.maxHealth}`);
  }

  flashDamage() {
    this.sprite.setFillStyle(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.resetColor();
    });
  }
}
