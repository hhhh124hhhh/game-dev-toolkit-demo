/**
 * 玩家对象
 */

import { GAME_CONFIG } from '../config.js';

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    // 创建玩家精灵
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setBounce(0.1);
    this.sprite.setDragX(500);
    this.sprite.setData('player', this);

    // 设置物理体大小 (图片是 64x64，设置一个稍小的圆形碰撞区域)
    this.sprite.body.setSize(50, 50);
    this.sprite.body.setOffset(7, 7);
    this.sprite.setScale(0.6);  // 缩放到合适的大小

    // 玩家属性
    this.moveSpeed = GAME_CONFIG.physics.playerSpeed;
    this.jumpVelocity = GAME_CONFIG.physics.jumpVelocity;
    this.isJumping = false;
    this.canFallBoost = false;
    this.hasFallBoosted = false;

    // 创建光晕效果
    this.glow = scene.add.sprite(x, y, 'playerGlow');
    this.glow.setAlpha(0.5);
    this.glow.setBlendMode(Phaser.BlendModes.ADD);

    // 光晕动画
    scene.tweens.add({
      targets: this.glow,
      alpha: 0.8,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  handleInput(cursors, wasd) {
    const { width } = this.scene.cameras.main;
    const isOnGround = this.sprite.body.touching.down || this.sprite.body.blocked.down;

    // 左右移动
    if (cursors.left.isDown || wasd.left.isDown) {
      this.sprite.setVelocityX(-this.moveSpeed);
      this.sprite.setFlipX(true);
    } else if (cursors.right.isDown || wasd.right.isDown) {
      this.sprite.setVelocityX(this.moveSpeed);
      this.sprite.setFlipX(false);
    }

    // 下落加速（手动）
    if (cursors.down.isDown || wasd.down.isDown) {
      this.sprite.setVelocityY(this.sprite.body.velocity.y + 20);
    }

    // 边界处理 - 从另一边出现
    if (this.sprite.x < -20) {
      this.sprite.x = width + 20;
    } else if (this.sprite.x > width + 20) {
      this.sprite.x = -20;
    }

    // 更新光晕位置
    this.glow.x = this.sprite.x;
    this.glow.y = this.sprite.y;

    // 更新跳跃状态
    if (isOnGround) {
      this.isJumping = false;
      this.hasFallBoosted = false;
    }
  }

  // 下坠加速 - 快速向下冲刺
  fallBoost() {
    if (this.hasFallBoosted) return;

    // 向下冲刺
    this.sprite.setVelocityY(600);  // 快速下坠
    this.hasFallBoosted = true;

    // 下坠加速特效
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 0.7,
      scaleY: 1.5,
      duration: 100,
      yoyo: true,
    });

    // 更改光晕颜色为蓝色
    this.glow.setTint(0x00aaff);
    this.scene.time.delayedCall(500, () => {
      this.glow.clearTint();
    });

    // 下坠轨迹特效
    for (let i = 0; i < 8; i++) {
      this.scene.time.delayedCall(i * 30, () => {
        const trail = this.scene.add.circle(
          this.sprite.x,
          this.sprite.y - i * 10,
          5,
          0x00aaff,
          0.5
        );
        this.scene.tweens.add({
          targets: trail,
          alpha: 0,
          scale: 0,
          duration: 300,
          onComplete: () => trail.destroy(),
        });
      });
    }
  }

  enableFallBoost() {
    this.canFallBoost = true;
  }

  bounce(platformType) {
    let velocity = this.jumpVelocity;

    // 弹跳平台加成
    if (platformType === 'bounce') {
      velocity = GAME_CONFIG.physics.bounceVelocity;
      this.showBounceEffect();
    }

    this.sprite.setVelocityY(velocity);
    this.isJumping = true;
  }

  showBounceEffect() {
    // 弹跳特效
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.5,
      scaleY: 0.5,
      duration: 100,
      yoyo: true,
    });

    // 绿色闪烁
    this.sprite.setTint(0x00ff00);
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });
  }

  applySlippery() {
    // 冰面效果 - 减少阻力
    this.sprite.setDragX(100);
    this.scene.time.delayedCall(500, () => {
      this.sprite.setDragX(500);
    });
  }

  teleport(x, y) {
    // 传送效果
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 0.5,
      duration: 200,
      onComplete: () => {
        this.sprite.x = x;
        this.sprite.y = y;
        this.scene.tweens.add({
          targets: this.sprite,
          alpha: 1,
          scale: 1,
          duration: 200,
        });
      },
    });
  }

  setColor(color) {
    this.sprite.setTint(color);
    this.glow.setTint(color);
  }

  resetColor() {
    this.sprite.clearTint();
    this.glow.clearTint();
  }

  die() {
    // 死亡动画
    this.scene.tweens.add({
      targets: [this.sprite, this.glow],
      alpha: 0,
      scale: 0,
      rotation: Math.PI * 2,
      duration: 1000,
      ease: 'Power2',
    });
  }

  update() {
    // 保持更新
  }
}
