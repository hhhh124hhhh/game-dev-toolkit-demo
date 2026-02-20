/**
 * 能力系统 - 管理玩家能力
 */

import { GAME_CONFIG } from '../config.js';

export class AbilitySystem {
  constructor(scene) {
    this.scene = scene;
    this.abilities = {
      fallBoost: { active: false, duration: 0, endTime: 0 },
      flying: { active: false, duration: GAME_CONFIG.abilities.flying.duration, endTime: 0 },
      shield: { active: false, duration: GAME_CONFIG.abilities.shield.duration, endTime: 0 },
      speedBoost: { active: false, duration: GAME_CONFIG.abilities.speedBoost.duration, endTime: 0 },
    };

    // 能力UI
    this.abilityIcons = {};
    this.createAbilityUI();
  }

  createAbilityUI() {
    const abilityTypes = ['fallBoost', 'flying', 'shield', 'speedBoost'];
    let x = 20;
    const y = 90;

    abilityTypes.forEach((type, index) => {
      const icon = this.scene.add.container(x + index * 35, y);
      icon.setScrollFactor(0);
      icon.setDepth(100);

      // 背景框
      const bg = this.scene.add.graphics();
      bg.fillStyle(0x000000, 0.5);
      bg.fillRoundedRect(0, 0, 30, 30, 5);
      bg.lineStyle(1, GAME_CONFIG.abilities[type].color, 0.5);
      bg.strokeRoundedRect(0, 0, 30, 30, 5);

      // 图标 (使用能量图形)
      const img = this.scene.add.image(15, 15, `energy_${type}`);
      img.setScale(0.6);
      img.setAlpha(0.3);

      icon.add([bg, img]);
      this.abilityIcons[type] = { container: icon, bg, img };
    });
  }

  collectEnergy(type) {
    const ability = this.abilities[type];
    if (!ability) return;

    // 激活能力
    ability.active = true;
    ability.endTime = this.scene.time.now + ability.duration;

    // 应用能力效果
    this.applyAbilityEffect(type);

    // 更新UI
    this.updateAbilityUI(type, true);

    // 显示收集提示
    this.showAbilityNotification(type);
  }

  applyAbilityEffect(type) {
    const player = this.scene.player;

    switch (type) {
      case 'fallBoost':
        player.enableFallBoost();
        player.setColor(GAME_CONFIG.abilities.fallBoost.color);
        break;

      case 'flying':
        player.sprite.body.allowGravity = false;
        player.sprite.setVelocityY(0);
        player.setColor(GAME_CONFIG.abilities.flying.color);
        // 飞行粒子效果
        this.createFlyingParticles();
        break;

      case 'shield':
        player.setColor(GAME_CONFIG.abilities.shield.color);
        // 创建护盾效果
        this.createShieldEffect();
        break;

      case 'speedBoost':
        player.moveSpeed *= 1.5;
        player.sprite.setVelocityY(300);
        player.setColor(GAME_CONFIG.abilities.speedBoost.color);
        // 速度粒子效果
        this.createSpeedParticles();
        break;
    }
  }

  removeAbilityEffect(type) {
    const player = this.scene.player;

    switch (type) {
      case 'fallBoost':
        player.canFallBoost = false;
        player.hasFallBoosted = false;  // 重置下坠加速状态
        player.resetColor();
        break;

      case 'flying':
        player.sprite.body.allowGravity = true;
        player.resetColor();
        if (this.flyingParticles) {
          this.flyingParticles.destroy();
          this.flyingParticles = null;
        }
        break;

      case 'shield':
        player.resetColor();
        if (this.shieldEffect) {
          this.shieldEffect.destroy();
          this.shieldEffect = null;
        }
        break;

      case 'speedBoost':
        player.moveSpeed = GAME_CONFIG.physics.playerSpeed;
        player.resetColor();
        if (this.speedParticles) {
          this.speedParticles.destroy();
          this.speedParticles = null;
        }
        break;
    }

    // 更新UI
    this.updateAbilityUI(type, false);
  }

  updateAbilityUI(type, active) {
    const icon = this.abilityIcons[type];
    if (!icon) return;

    if (active) {
      icon.img.setAlpha(1);
      icon.bg.clear();
      icon.bg.fillStyle(GAME_CONFIG.abilities[type].color, 0.3);
      icon.bg.fillRoundedRect(0, 0, 30, 30, 5);
      icon.bg.lineStyle(2, GAME_CONFIG.abilities[type].color, 1);
      icon.bg.strokeRoundedRect(0, 0, 30, 30, 5);

      // 闪烁效果
      this.scene.tweens.add({
        targets: icon.container,
        scale: 1.2,
        duration: 100,
        yoyo: true,
      });
    } else {
      icon.img.setAlpha(0.3);
      icon.bg.clear();
      icon.bg.fillStyle(0x000000, 0.5);
      icon.bg.fillRoundedRect(0, 0, 30, 30, 5);
      icon.bg.lineStyle(1, GAME_CONFIG.abilities[type].color, 0.5);
      icon.bg.strokeRoundedRect(0, 0, 30, 30, 5);
    }
  }

  showAbilityNotification(type) {
    const ability = GAME_CONFIG.abilities[type];
    const { width } = this.scene.cameras.main;

    const text = this.scene.add.text(width / 2, 150, `获得 ${ability.name}!`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: `#${ability.color.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 3,
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(150);

    this.scene.tweens.add({
      targets: text,
      y: 100,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy(),
    });
  }

  createFlyingParticles() {
    this.flyingParticles = this.scene.add.particles(0, 0, 'particle', {
      follow: this.scene.player.sprite,
      speed: { min: 20, max: 50 },
      scale: { start: 0.4, end: 0 },
      lifespan: 500,
      blendMode: 'ADD',
      tint: 0xaa00ff,
      quantity: 2,
    });
  }

  createShieldEffect() {
    this.shieldEffect = this.scene.add.graphics();
    this.shieldEffect.setScrollFactor(0);
    this.shieldEffect.setDepth(15);

    // 护盾动画
    this.scene.tweens.add({
      targets: this.shieldEffect,
      rotation: Math.PI * 2,
      duration: 2000,
      repeat: -1,
    });
  }

  createSpeedParticles() {
    this.speedParticles = this.scene.add.particles(0, 0, 'particle', {
      follow: this.scene.player.sprite,
      speed: { min: 50, max: 100 },
      scale: { start: 0.6, end: 0 },
      lifespan: 300,
      blendMode: 'ADD',
      tint: 0xff0066,
      quantity: 3,
    });
  }

  hasAbility(type) {
    const ability = this.abilities[type];
    return ability && ability.active;
  }

  update(delta) {
    const currentTime = this.scene.time.now;

    // 检查能力过期
    for (const [type, ability] of Object.entries(this.abilities)) {
      if (ability.active && ability.duration > 0 && currentTime >= ability.endTime) {
        ability.active = false;
        this.removeAbilityEffect(type);
      }
    }

    // 更新护盾效果
    if (this.shieldEffect && this.abilities.shield.active) {
      this.shieldEffect.clear();
      this.shieldEffect.lineStyle(3, GAME_CONFIG.abilities.shield.color, 0.8);
      this.shieldEffect.strokeCircle(
        this.scene.player.sprite.x,
        this.scene.player.sprite.y,
        30 + Math.sin(currentTime / 200) * 5
      );
    }
  }

  destroy() {
    if (this.flyingParticles) this.flyingParticles.destroy();
    if (this.shieldEffect) this.shieldEffect.destroy();
    if (this.speedParticles) this.speedParticles.destroy();
  }
}
