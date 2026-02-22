/**
 * GameScene3D - 主游戏场景
 *
 * 包含: 玩家、平台、收集物品、相机控制
 */

import { Scene3D } from '@enable3d/phaser-extension';
import Phaser from 'phaser';
import { GAME_CONFIG, GAME_CONSTANTS } from '../config.js';
import { UI_CONFIG } from '../config/ui.config.js';
import { Player3D } from '../entities/Player3D.js';
import { Platform3D } from '../entities/Platform3D.js';
import { Collectible3D } from '../entities/Collectible3D.js';
import { CameraController } from '../systems/CameraController.js';
import { VisualEffects } from '../systems/VisualEffects.js';

export class GameScene3D extends Scene3D {
  constructor() {
    super({ key: 'GameScene3D' });
  }

  init() {
    // CRITICAL: 必须在 init() 中调用 accessThirdDimension() 初始化 3D 环境
    this.accessThirdDimension();

    // 初始化状态变量 (TDD: 防止 undefined bug)
    this.score = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.platforms = [];
    this.collectibles = [];
    
    // 初始化视觉反馈系统
    this.visualEffects = new VisualEffects(this);
  }

  async create() {
    // 配置场景
    await this.third.warpSpeed('-orbit');

    // 物理引擎时间步长由 Enable3D 自动管理（移除 setFixedTimeStep）
    // 如需自定义物理步长，使用 this.third.physics.config 配置

    // 创建地面
    await this.createGround();

    // 创建玩家
    this.player = new Player3D(this);
    await this.player.create();

    // 创建平台
    await this.createPlatforms();

    // 创建收集物品
    await this.createCollectibles();

    // 设置相机控制器
    this.cameraController = new CameraController(this, this.player);

    // 设置输入
    this.setupInput();

    // 创建 UI
    this.createUI();

    console.log('[GameScene3D] Scene created successfully');
  }

  async createGround() {
    this.ground = this.third.physics.add.ground({
      width: 100,
      height: 100,
      y: -2,
      color: GAME_CONFIG.colors.ground
    });
    this.ground.name = 'ground';
  }

  async createPlatforms() {
    const { width, height, depth, gap } = GAME_CONFIG.platform;

    for (let i = 0; i < GAME_CONSTANTS.PLATFORM_COUNT; i++) {
      const x = Phaser.Math.Between(-20, 20);
      const y = i * gap;
      const z = Phaser.Math.Between(-20, 20);

      const platform = new Platform3D(this, x, y, z);
      await platform.create();
      this.platforms.push(platform);
    }
  }

  async createCollectibles() {
    for (let i = 0; i < GAME_CONSTANTS.COLLECTIBLE_COUNT; i++) {
      const x = Phaser.Math.Between(-25, 25);
      const y = Phaser.Math.Between(2, 50);
      const z = Phaser.Math.Between(-25, 25);

      const collectible = new Collectible3D(this, x, y, z);
      await collectible.create();
      this.collectibles.push(collectible);
    }
  }

  setupInput() {
    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // 暂停键
    this.input.keyboard.on('keydown-ESC', () => {
      this.togglePause();
    });
  }

  createUI() {
    // 分数显示 (2D UI)
    this.scoreText = this.add.text(10, 10, '分数: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial, Microsoft YaHei, sans-serif'
    }).setScrollFactor(0);

    // 金币显示
    this.coinText = this.add.text(10, 40, '金币: 0', {
      fontSize: '18px',
      fill: '#ffdd00',
      fontFamily: 'Arial, Microsoft YaHei, sans-serif'
    }).setScrollFactor(0);

    // 操作提示
    this.helpText = this.add.text(10, 570, 'WASD 移动 | 空格 跳跃 | ESC 暂停', {
      fontSize: '14px',
      fill: '#888888',
      fontFamily: 'Arial, Microsoft YaHei, sans-serif'
    }).setScrollFactor(0);
  }

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    // 更新玩家
    if (this.player && this.player.update) {
      this.player.update(this.cursors, this.wasd);
    }

    // 更新相机
    if (this.cameraController && this.cameraController.update) {
      this.cameraController.update();
    }

    // 更新视觉反馈效果
    if (this.visualEffects) {
      this.visualEffects.update();
    }

    // 检查收集
    this.checkCollectibles();

    // 检查游戏结束
    this.checkGameOver();

    // 旋转收集物品
    this.collectibles.forEach(c => c.update(time));
  }

  checkCollectibles() {
    if (!this.player || !this.player.getPosition) return;

    const playerPos = this.player.getPosition();

    this.collectibles.forEach((collectible) => {
      if (!collectible.collected) {
        const distance = this.calculateDistance(playerPos, collectible.getPosition());
        if (distance < 1) {
          collectible.collect();
          this.addScore(GAME_CONFIG.collectible.value);
          
          // 视觉反馈效果
          if (this.visualEffects) {
            this.visualEffects.createCollectEffect(collectible.getPosition(), 'coin');
          }
        }
      }
    });

    // 清理已收集的物品
    this.collectibles = this.collectibles.filter(c => !c.collected);
  }

  calculateDistance(pos1, pos2) {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) +
      Math.pow(pos1.y - pos2.y, 2) +
      Math.pow(pos1.z - pos2.z, 2)
    );
  }

  addScore(points) {
    this.score += points;
    window.gameState.score = this.score;
    this.scoreText.setText(`分数: ${this.score}`);
  }

  checkGameOver() {
    if (!this.player || !this.player.getPosition) return;

    const playerY = this.player.getPosition().y;
    if (playerY < GAME_CONSTANTS.WORLD_BOUNDS.minY) {
      this.gameOver();
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.third.physics.pause();
    } else {
      this.third.physics.resume();
    }
  }

  gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // 更新最高分
    if (this.score > window.gameState.highScore) {
      window.gameState.highScore = this.score;
      localStorage.setItem('platformer3d_highscore', this.score.toString());
    }

    // 延迟切换到结束场景
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene');
    });
  }
}
