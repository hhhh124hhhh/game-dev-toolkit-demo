/**
 * 平台管理器 - 负责平台的生成和管理
 */

import { GAME_CONFIG } from '../config.js';
import { Platform } from '../objects/Platform.js';

export class PlatformManager {
  constructor(scene) {
    this.scene = scene;

    // 平台组
    this.platformGroup = scene.physics.add.group();
    this.energyGroup = scene.physics.add.group();
    this.obstacleGroup = scene.physics.add.group();

    // 平台池
    this.platforms = [];
    this.lastPlatformY = 0;
    this.difficultyLevel = 0;

    // 平台类型权重（根据难度调整）
    this.platformWeights = this.calculatePlatformWeights(0);
  }

  calculatePlatformWeights(difficulty) {
    const baseWeights = {
      normal: 40,
      bounce: 15,
      moving: 15,
      breakable: 10,
      portal: 5,
      ice: 10,
      vanish: 5,
    };

    // 根据难度调整权重
    if (difficulty > 2) {
      baseWeights.breakable += 5;
      baseWeights.vanish += 5;
      baseWeights.normal -= 10;
    }

    if (difficulty > 4) {
      baseWeights.moving += 5;
      baseWeights.portal += 3;
      baseWeights.normal -= 8;
    }

    return baseWeights;
  }

  generateInitialPlatforms() {
    const { width } = this.scene.cameras.main;

    // 起始平台（稳定）
    this.createPlatform(width / 2, 200, 'normal');
    let lastY = 200;

    // 生成初始平台
    for (let i = 1; i <= 20; i++) {
      const x = Phaser.Math.Between(
        GAME_CONFIG.platform.horizontalMargin + 50,
        width - GAME_CONFIG.platform.horizontalMargin - 50
      );
      const gap = Phaser.Math.Between(
        GAME_CONFIG.platform.minGap,
        GAME_CONFIG.platform.maxGap
      );
      const y = lastY + gap;

      const type = this.getRandomPlatformType(0);
      this.createPlatform(x, y, type);
      lastY = y;  // 跟踪实际位置

      // 随机生成能量
      if (Math.random() < 0.2) {
        this.createEnergy(x, y - 50);
      }
    }

    this.lastPlatformY = lastY;  // 使用实际最后位置
  }

  createPlatform(x, y, type) {
    const platform = new Platform(this.scene, x, y, type);
    this.platformGroup.add(platform.sprite);
    this.platforms.push(platform);
    return platform;
  }

  createEnergy(x, y) {
    const energyTypes = ['doubleJump', 'flying', 'shield', 'speedBoost'];
    const type = Phaser.Math.RND.pick(energyTypes);

    const energy = this.scene.physics.add.sprite(x, y, `energy_${type}`);
    energy.body.allowGravity = false;
    energy.setData('type', type);
    energy.setDepth(10);

    // 漂浮动画
    this.scene.tweens.add({
      targets: energy,
      y: y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 旋转动画
    this.scene.tweens.add({
      targets: energy,
      angle: 360,
      duration: 2000,
      repeat: -1,
    });

    this.energyGroup.add(energy);
    return energy;
  }

  createObstacle(x, y, type) {
    const obstacle = this.scene.physics.add.sprite(x, y, type);
    obstacle.body.allowGravity = false;
    obstacle.setData('type', type);
    obstacle.setDepth(20);  // 提高到 20，确保在玩家上方显示

    // 设置碰撞箱（比图片小一点，更公平）
    obstacle.body.setSize(24, 24);
    obstacle.body.setOffset(4, 4);

    // 危险闪烁效果（钉子）
    if (type === 'spike') {
      this.scene.tweens.add({
        targets: obstacle,
        alpha: 0.6,
        duration: 300,
        yoyo: true,
        repeat: -1,
      });
    }

    this.obstacleGroup.add(obstacle);
    return obstacle;
  }

  getRandomPlatformType(difficulty) {
    const weights = this.calculatePlatformWeights(difficulty);
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Phaser.Math.Between(1, totalWeight);

    for (const [type, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        return type;
      }
    }

    return 'normal';
  }

  update(cameraY) {
    // 更新所有平台
    this.platforms.forEach(platform => platform.update());

    // 清理屏幕上方的平台
    this.cleanupPlatforms(cameraY);

    // 生成新平台
    this.generateNewPlatforms(cameraY);
  }

  cleanupPlatforms(cameraY) {
    const topY = cameraY - 200;

    // 清理平台
    this.platforms = this.platforms.filter(platform => {
      if (platform.sprite.y < topY) {
        platform.destroy();
        return false;
      }
      return true;
    });

    // 清理能量
    this.energyGroup.getChildren().forEach(energy => {
      if (energy.y < topY) {
        energy.destroy();
      }
    });

    // 清理障碍物
    this.obstacleGroup.getChildren().forEach(obstacle => {
      if (obstacle.y < topY) {
        obstacle.destroy();
      }
    });
  }

  generateNewPlatforms(cameraY) {
    const { width, height } = this.scene.cameras.main;
    const bottomY = cameraY + height + 200;

    while (this.lastPlatformY < bottomY) {
      const x = Phaser.Math.Between(
        GAME_CONFIG.platform.horizontalMargin + 50,
        width - GAME_CONFIG.platform.horizontalMargin - 50
      );

      const gap = Phaser.Math.Between(
        GAME_CONFIG.platform.minGap + this.difficultyLevel * 2,
        GAME_CONFIG.platform.maxGap + this.difficultyLevel * 3
      );

      const y = this.lastPlatformY + gap;
      const type = this.getRandomPlatformType(this.difficultyLevel);

      this.createPlatform(x, y, type);

      // 随机生成能量
      if (Math.random() < 0.15 + this.difficultyLevel * 0.01) {
        this.createEnergy(x, y - 50);
      }

      // 随机生成障碍物（从第10层开始，20%概率）
      if (this.difficultyLevel > 1 && Math.random() < 0.2) {
        this.createObstacle(
          Phaser.Math.Between(50, width - 50),
          y - 30,
          Phaser.Math.RND.pick(['spike', 'bomb'])
        );
      }

      this.lastPlatformY = y;
    }
  }

  updateDifficulty(level) {
    this.difficultyLevel = level;
    this.platformWeights = this.calculatePlatformWeights(level);
  }

  destroy() {
    this.platforms.forEach(platform => platform.destroy());
    this.platformGroup.clear(true, true);
    this.energyGroup.clear(true, true);
    this.obstacleGroup.clear(true, true);
  }
}
