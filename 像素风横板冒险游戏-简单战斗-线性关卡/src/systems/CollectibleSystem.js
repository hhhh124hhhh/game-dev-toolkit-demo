/**
 * Collectible System
 * 收集物系统 - 处理金币、爱心、能量道具
 *
 * 功能:
 * - 收集物生成
 * - 拾取检测 (overlap)
 * - 效果应用
 * - 分数和生命值更新
 */

import { GameConfig, CollectibleType, GameEvents } from '../config.js';

export class CollectibleSystem {
  constructor(scene) {
    this.scene = scene;

    // Collectible groups
    this.coins = scene.physics.add.group();
    this.hearts = scene.physics.add.group();
    this.powerups = scene.physics.add.group();

    // Player reference
    this.player = null;

    // Score tracking
    this.score = 0;

    // Active powerups
    this.activePowerups = [];
  }

  setPlayer(player) {
    this.player = player;
    this.setupOverlapDetection();
  }

  setupOverlapDetection() {
    // Coins
    this.scene.physics.add.overlap(
      this.player,
      this.coins,
      this.collectCoin,
      null,
      this
    );

    // Hearts
    this.scene.physics.add.overlap(
      this.player,
      this.hearts,
      this.collectHeart,
      null,
      this
    );

    // Powerups
    this.scene.physics.add.overlap(
      this.player,
      this.powerups,
      this.collectPowerup,
      null,
      this
    );
  }

  // ============ Spawn Methods ============
  spawnCoin(x, y) {
    const coin = this.coins.create(x, y, 'coin');

    // Add bounce effect
    coin.setBounceY(GameConfig.collectibles.coin.bounceY);
    coin.setVelocity(0, -100); // Pop up

    // Spin animation (placeholder - uses scale pulse)
    this.scene.tweens.add({
      targets: coin,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    return coin;
  }

  spawnCoinsAlongPath(points, count = 5) {
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const x = Phaser.Math.Linear(points[0].x, points[1].x, t);
      const y = Phaser.Math.Linear(points[0].y, points[1].y, t);
      this.spawnCoin(x, y);
    }
  }

  spawnHeart(x, y) {
    const heart = this.hearts.create(x, y, 'heart');
    heart.setBounceY(0.5);
    heart.setVelocity(0, -80);

    // Pulse effect
    this.scene.tweens.add({
      targets: heart,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    return heart;
  }

  spawnPowerup(x, y, type = 'speed') {
    const powerup = this.powerups.create(x, y, 'powerup');
    powerup.setData('type', type);
    powerup.setBounceY(0.3);
    powerup.setVelocity(0, -60);

    // Glow effect
    this.scene.tweens.add({
      targets: powerup,
      alpha: 0.6,
      duration: 400,
      yoyo: true,
      repeat: -1
    });

    // Auto-remove after 10 seconds
    this.scene.time.delayedCall(10000, () => {
      if (powerup.active) {
        this.scene.tweens.add({
          targets: powerup,
          alpha: 0,
          duration: 300,
          onComplete: () => powerup.destroy()
        });
      }
    });

    return powerup;
  }

  // ============ Collect Callbacks ============
  collectCoin(player, coin) {
    // Deactivate immediately
    coin.disableBody(true, true);

    // Add score
    this.score += GameConfig.collectibles.coin.value;
    this.scene.events.emit(GameEvents.COIN_COLLECTED, this.score);

    // Play effect
    this.playCollectEffect(coin.x, coin.y, 0xffdd00);

    // Update UI
    this.scene.events.emit('ui:score', this.score);
  }

  collectHeart(player, heart) {
    // Only collect if not at max health
    if (player.health >= player.maxHealth) {
      return; // Don't collect, leave it for later
    }

    heart.disableBody(true, true);

    // Heal player
    player.heal(GameConfig.collectibles.heart.healAmount);

    // Play effect
    this.playCollectEffect(heart.x, heart.y, 0xff6666);

    // Update UI
    this.scene.events.emit('ui:health', player.health);
  }

  collectPowerup(player, powerup) {
    const type = powerup.getData('type');
    powerup.destroy();

    // Apply powerup effect
    this.applyPowerup(type);

    // Play effect
    this.playCollectEffect(powerup.x, powerup.y, 0x66ff66);
  }

  // ============ Powerup Effects ============
  applyPowerup(type) {
    const duration = GameConfig.collectibles.powerup.duration;

    switch (type) {
      case 'speed':
        this.applySpeedBoost(duration);
        break;
      case 'invincible':
        this.applyInvincibility(duration);
        break;
      default:
        console.warn(`Unknown powerup type: ${type}`);
    }
  }

  applySpeedBoost(duration) {
    const originalSpeed = GameConfig.player.speed;
    GameConfig.player.speed *= GameConfig.collectibles.powerup.speedMultiplier;

    // Visual indicator
    this.player.setTint(0x00ff00);

    // Track active powerup
    const powerup = { type: 'speed', endTime: this.scene.time.now + duration };
    this.activePowerups.push(powerup);

    // Reset after duration
    this.scene.time.delayedCall(duration, () => {
      GameConfig.player.speed = originalSpeed;
      this.player.clearTint();
      this.activePowerups = this.activePowerups.filter(p => p !== powerup);
    });
  }

  applyInvincibility(duration) {
    this.player.isInvincible = true;
    this.player.invincibleTimer = duration;

    this.scene.time.delayedCall(duration, () => {
      this.player.isInvincible = false;
      this.player.setAlpha(1);
    });
  }

  // ============ Effects ============
  playCollectEffect(x, y, color) {
    // Particle burst
    const particles = this.scene.add.particles(x, y, null, {
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      lifespan: 300,
      quantity: 8,
      emitting: false
    });

    // Manual particles (since we don't have a particle texture)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.scene.add.circle(x, y, 4, color);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30,
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => particle.destroy()
      });
    }

    // Score popup
    const scoreText = this.scene.add.text(x, y - 20, '+' + GameConfig.collectibles.coin.value, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: scoreText,
      y: y - 50,
      alpha: 0,
      duration: 500,
      onComplete: () => scoreText.destroy()
    });
  }

  // ============ Getters ============
  getScore() {
    return this.score;
  }

  getCoins() {
    return this.coins;
  }

  getHearts() {
    return this.hearts;
  }

  getPowerups() {
    return this.powerups;
  }

  // ============ Update ============
  update() {
    // Check expired powerups (backup check)
    const now = this.scene.time.now;
    this.activePowerups = this.activePowerups.filter(p => p.endTime > now);
  }
}
