/**
 * 平台对象
 */

import { GAME_CONFIG } from '../config.js';

export class Platform {
  constructor(scene, x, y, type = 'normal') {
    this.scene = scene;
    this.type = type;
    this.config = GAME_CONFIG.platformTypes[type] || GAME_CONFIG.platformTypes.normal;

    // 创建平台精灵 (图片是 120x40，包含 10px 发光边距，核心区域 100x20)
    this.sprite = scene.physics.add.sprite(x, y, `platform_${type}`);
    this.sprite.setImmovable(true);
    this.sprite.body.allowGravity = false;
    this.sprite.body.setSize(100, 20);  // 核心平台区域
    this.sprite.body.setOffset(10, 10);  // 考虑 10px 发光边距
    this.sprite.setData('platform', this);

    // 平台特性
    this.isMoving = this.config.moving;
    this.isBreakable = this.config.breakable;
    this.isSlippery = this.config.slippery;
    this.isVanishing = this.config.vanishing;
    this.isPortal = this.config.portal;
    this.isBounce = this.config.bounce;

    // 移动平台参数
    if (this.isMoving) {
      this.moveSpeed = Phaser.Math.Between(50, 100);
      this.moveDirection = Phaser.Math.RND.pick([-1, 1]);
      this.moveRange = Phaser.Math.Between(50, 100);
      this.startX = x;
    }

    // 破碎平台状态
    this.isBreaking = false;
    this.breakTimer = null;

    // 消失平台状态
    this.isVanishActive = false;
    this.vanishTimer = null;

    // 发光效果
    this.createGlowEffect();
  }

  createGlowEffect() {
    // 霓虹发光 (图片已包含发光效果，这里添加额外的动态光晕)
    this.glow = this.scene.add.graphics();
    this.glow.fillStyle(this.config.color, 0.2);
    this.glow.fillRoundedRect(0, 0, 120, 40, 10);
    this.glow.x = this.sprite.x - 60;
    this.glow.y = this.sprite.y - 20;

    // 闪烁动画
    this.scene.tweens.add({
      targets: this.glow,
      alpha: 0.1,
      duration: 1000 + Phaser.Math.Between(0, 500),
      yoyo: true,
      repeat: -1,
    });
  }

  onPlayerLand(player) {
    if (this.isBreakable && !this.isBreaking) {
      this.startBreaking();
    }

    if (this.isBounce) {
      player.bounce('bounce');
    } else {
      player.bounce('normal');
    }

    if (this.isSlippery) {
      player.applySlippery();
    }

    if (this.isVanishing && !this.isVanishActive) {
      this.startVanishing();
    }

    if (this.isPortal) {
      this.activatePortal(player);
    }
  }

  startBreaking() {
    this.isBreaking = true;

    // 破碎预警 - 闪烁
    this.scene.tweens.add({
      targets: [this.sprite, this.glow],
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 5,
    });

    // 3秒后破碎
    this.breakTimer = this.scene.time.delayedCall(3000, () => {
      this.break();
    });
  }

  break() {
    // 破碎动画
    this.scene.tweens.add({
      targets: this.sprite,
      scaleY: 0,
      alpha: 0,
      duration: 200,
    });

    // 粒子效果
    const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      blendMode: 'ADD',
      tint: this.config.color,
      quantity: 20,
    });

    this.scene.time.delayedCall(500, () => particles.destroy());

    // 禁用碰撞
    this.sprite.body.enable = false;

    // 移除
    this.scene.time.delayedCall(300, () => {
      this.destroy();
    });
  }

  startVanishing() {
    this.isVanishActive = true;

    // 闪烁预警
    this.scene.tweens.add({
      targets: [this.sprite, this.glow],
      alpha: 0.2,
      duration: 150,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.vanish();
      },
    });
  }

  vanish() {
    // 消失动画
    this.scene.tweens.add({
      targets: [this.sprite, this.glow],
      alpha: 0,
      scaleY: 0,
      duration: 200,
    });

    // 禁用碰撞
    this.sprite.body.enable = false;

    // 移除
    this.scene.time.delayedCall(300, () => {
      this.destroy();
    });
  }

  activatePortal(player) {
    // 传送效果 - 传送到附近随机平台
    const platforms = this.scene.platformManager.platformGroup.getChildren();
    if (platforms.length > 1) {
      const targetPlatform = Phaser.Math.RND.pick(
        platforms.filter(p => p !== this.sprite && p.y > this.sprite.y)
      );

      if (targetPlatform) {
        // 紫色闪烁
        this.sprite.setTint(0xaa00ff);
        player.teleport(targetPlatform.x, targetPlatform.y - 50);
        this.scene.time.delayedCall(200, () => {
          this.sprite.clearTint();
        });
      }
    }
  }

  update() {
    // 移动平台逻辑
    if (this.isMoving) {
      this.sprite.x += this.moveDirection * this.moveSpeed * (this.scene.game.loop.delta / 1000);
      this.glow.x = this.sprite.x - 60;

      // 边界检测
      if (Math.abs(this.sprite.x - this.startX) > this.moveRange) {
        this.moveDirection *= -1;
      }
    }
  }

  destroy() {
    if (this.breakTimer) this.breakTimer.destroy();
    if (this.vanishTimer) this.vanishTimer.destroy();
    if (this.glow) this.glow.destroy();
    if (this.sprite) this.sprite.destroy();
  }
}
