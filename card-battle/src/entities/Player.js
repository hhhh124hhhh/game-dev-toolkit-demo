/**
 * Player - Player entity with health and block
 */

import Phaser from 'phaser';

export class Player {
  constructor(scene, x, y, config = {}) {
    this.scene = scene;

    // CRITICAL: Initialize all state variables
    this.health = config.health || 80;
    this.maxHealth = config.maxHealth || 100;
    this.block = config.block || 0;

    // Create visual representation
    this.createSprite(x, y);
    this.createHealthBar(x, y + 60);
  }

  createSprite(x, y) {
    // Player avatar
    this.sprite = this.scene.add.rectangle(x, y, 80, 100, 0x00ff88)
      .setStrokeStyle(3, 0xffffff);

    // Player label
    this.scene.add.text(x, y - 60, 'PLAYER', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#00ff88'
    }).setOrigin(0.5);
  }

  createHealthBar(x, y) {
    // Health bar background
    this.healthBarBg = this.scene.add.rectangle(x, y, 200, 20, 0x333333)
      .setStrokeStyle(1, 0x666666);

    // Health bar fill
    this.healthBarFill = this.scene.add.rectangle(
      x - 98 + (this.health / this.maxHealth) * 196 / 2,
      y,
      (this.health / this.maxHealth) * 196,
      16,
      0x00ff88
    );
    this.healthBarFill.setOrigin(0.5);

    // Health text
    this.healthText = this.scene.add.text(x, y, `${this.health}/${this.maxHealth}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Block display
    this.blockText = this.scene.add.text(x + 110, y, `Block: ${this.block}`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#3498db'
    }).setOrigin(0, 0.5);
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

    // Apply remaining damage
    this.health = Math.max(0, this.health - amount);
    this.updateHealthBar();

    // Visual feedback
    this.flashDamage();

    console.log(`[Player] Took ${amount} damage, health: ${this.health}`);
  }

  heal(amount) {
    const actualHeal = Math.min(amount, this.maxHealth - this.health);
    this.health += actualHeal;
    this.updateHealthBar();

    console.log(`[Player] Healed ${actualHeal}, health: ${this.health}`);
  }

  addBlock(amount) {
    this.block += amount;
    this.updateHealthBar();

    console.log(`[Player] Gained ${amount} block, total: ${this.block}`);
  }

  resetBlock() {
    this.block = 0;
    this.updateHealthBar();
  }

  updateHealthBar() {
    // Prevent division by zero
    const maxHealth = this.maxHealth || 1;
    const healthPercent = this.health / maxHealth;

    // Update fill width
    this.healthBarFill.width = healthPercent * 196;

    // Update color based on health
    if (healthPercent > 0.5) {
      this.healthBarFill.setFillStyle(0x00ff88);
    } else if (healthPercent > 0.25) {
      this.healthBarFill.setFillStyle(0xffcc00);
    } else {
      this.healthBarFill.setFillStyle(0xff4444);
    }

    // Update text
    this.healthText.setText(`${this.health}/${this.maxHealth}`);
    this.blockText.setText(`Block: ${this.block}`);
  }

  flashDamage() {
    this.sprite.setFillStyle(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.setFillStyle(0x00ff88);
    });
  }
}
