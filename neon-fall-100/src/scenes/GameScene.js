/**
 * 游戏主场景 - 核心玩法
 */

import { GAME_CONFIG, GameState } from '../config.js';
import { Player } from '../objects/Player.js';
import { Platform } from '../objects/Platform.js';
import { PlatformManager } from '../systems/PlatformManager.js';
import { AbilitySystem } from '../systems/AbilitySystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    // 游戏状态
    this.floorCount = 0;
    this.lastPlatformY = 0;  // 修复：初始化上一次平台Y坐标
    this.score = 0;
    this.energyCollected = 0;
    this.gameTime = 0;
    this.noDamageFloors = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.cameraScrollSpeed = 1;
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    this.createBackground();

    // 创建平台管理器
    this.platformManager = new PlatformManager(this);

    // 创建玩家
    this.player = new Player(this, width / 2, 100);

    // 能力系统
    this.abilitySystem = new AbilitySystem(this);

    // 音效系统
    this.audioSystem = new AudioSystem(this);

    // 粒子效果
    this.createParticles();

    // UI
    this.createUI();

    // 碰撞检测
    this.setupCollisions();

    // 输入控制
    this.setupInput();

    // 初始平台
    this.platformManager.generateInitialPlatforms();

    // 相机设置
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    // 淡入效果
    this.cameras.main.fadeIn(500);

    // 启动背景音乐
    if (this.audioSystem) {
      this.audioSystem.startBackgroundMusic();
    }
  }

  createBackground() {
    // 纯色背景（简洁，无干扰）
    this.cameras.main.setBackgroundColor(0x0a0a1a);
  }

  drawGrid() {
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0x00ffff, 0.05);

    // 垂直线
    for (let x = 0; x < GAME_CONFIG.width; x += 40) {
      this.gridGraphics.lineBetween(x, this.cameras.main.scrollY - 100, x, this.cameras.main.scrollY + GAME_CONFIG.height + 100);
    }

    // 水平线
    for (let y = Math.floor(this.cameras.main.scrollY / 40) * 40; y < this.cameras.main.scrollY + GAME_CONFIG.height + 100; y += 40) {
      this.gridGraphics.lineBetween(0, y, GAME_CONFIG.width, y);
    }
  }

  createParticles() {
    // 跳跃粒子
    this.jumpParticles = this.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      blendMode: 'ADD',
      emitting: false,
    });

    // 能量收集粒子
    this.energyParticles = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 800,
      blendMode: 'ADD',
      emitting: false,
    });

    // 下落轨迹粒子
    this.trailParticles = this.add.particles(0, 0, 'particle', {
      speed: { min: 10, max: 30 },
      scale: { start: 0.3, end: 0 },
      lifespan: 300,
      blendMode: 'ADD',
      tint: 0x00ffff,
    });
  }

  createUI() {
    const { width } = this.cameras.main;

    // 层数显示
    this.floorText = this.add.text(width / 2, 30, '第 0 层', {
      fontSize: '32px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.floorText.setOrigin(0.5);
    this.floorText.setScrollFactor(0);
    this.floorText.setDepth(100);

    // 分数显示
    this.scoreText = this.add.text(width - 20, 30, '分数: 0', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00',
    });
    this.scoreText.setOrigin(1, 0);
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);

    // 能量显示
    this.energyText = this.add.text(20, 30, '能量: 0', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ff00ff',
    });
    this.energyText.setScrollFactor(0);
    this.energyText.setDepth(100);

    // 能力状态栏
    this.abilityBar = this.add.container(20, 70);
    this.abilityBar.setScrollFactor(0);
    this.abilityBar.setDepth(100);

    // 暂停按钮
    this.pauseButton = this.add.text(width - 20, 70, '⏸', {
      fontSize: '30px',
      color: '#00ffff',
    });
    this.pauseButton.setOrigin(1, 0);
    this.pauseButton.setScrollFactor(0);
    this.pauseButton.setDepth(100);
    this.pauseButton.setInteractive({ useHandCursor: true });
    this.pauseButton.on('pointerdown', () => this.togglePause());
  }

  setupCollisions() {
    // 玩家与平台碰撞
    this.physics.add.overlap(
      this.player.sprite,
      this.platformManager.platformGroup,
      this.handlePlatformCollision,
      null,
      this
    );

    // 玩家与能量碰撞
    this.physics.add.overlap(
      this.player.sprite,
      this.platformManager.energyGroup,
      this.handleEnergyCollision,
      null,
      this
    );

    // 玩家与障碍物碰撞
    this.physics.add.overlap(
      this.player.sprite,
      this.platformManager.obstacleGroup,
      this.handleObstacleCollision,
      null,
      this
    );
  }

  setupInput() {
    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    // 暂停键
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard.on('keydown-P', () => this.togglePause());

    // 下坠加速（空格键）
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.abilitySystem.hasAbility('fallBoost') && this.player.canFallBoost) {
        this.player.fallBoost();
      }
    });
  }

  handlePlatformCollision(playerSprite, platformSprite) {
    if (this.isGameOver || this.isPaused) return;

    const platform = platformSprite.getData('platform');
    if (!platform) return;

    // 只在从上方落下时触发
    if (playerSprite.body.velocity.y > 0 && playerSprite.y < platformSprite.y) {
      platform.onPlayerLand(this.player);

      // 更新层数
      if (platformSprite.y > this.lastPlatformY + 50) {
        this.floorCount++;
        this.lastPlatformY = platformSprite.y;
        this.updateFloorDisplay();

        // 增加分数
        this.addScore(10);

        // 检查成就
        this.checkAchievements();
      }

      // 跳跃粒子效果
      this.jumpParticles.setPosition(playerSprite.x, playerSprite.y + 20);
      this.jumpParticles.explode(10);

      // 播放跳跃音效
      if (this.audioSystem) {
        this.audioSystem.playJump();
      }

      // 屏幕震动（高层）
      if (this.floorCount > 50) {
        this.cameras.main.shake(50, 0.002);
      }
    }
  }

  handleEnergyCollision(playerSprite, energySprite) {
    if (this.isGameOver) return;

    const energyType = energySprite.getData('type');
    this.abilitySystem.collectEnergy(energyType);

    // 播放收集音效
    if (this.audioSystem) {
      this.audioSystem.playCollect(energyType);
    }

    // 粒子效果
    this.energyParticles.setPosition(energySprite.x, energySprite.y);
    this.energyParticles.explode(15);

    // 更新能量计数
    this.energyCollected++;
    this.energyText.setText(`能量: ${this.energyCollected}`);

    // 增加分数
    this.addScore(50);

    // 移除能量
    energySprite.destroy();
  }

  handleObstacleCollision(playerSprite, obstacleSprite) {
    if (this.isGameOver || this.abilitySystem.hasAbility('shield')) return;

    const obstacleType = obstacleSprite.getData('type');

    if (obstacleType === 'spike' || obstacleType === 'laser') {
      this.gameOver();
    } else if (obstacleType === 'bomb') {
      // 炸弹爆炸
      this.createExplosion(obstacleSprite.x, obstacleSprite.y);
      this.gameOver();
    }
  }

  createExplosion(x, y) {
    // 爆炸粒子
    const explosion = this.add.particles(x, y, 'particle', {
      speed: { min: 200, max: 400 },
      scale: { start: 2, end: 0 },
      lifespan: 1000,
      blendMode: 'ADD',
      tint: [0xff0000, 0xff6600, 0xffff00],
      quantity: 30,
    });

    this.time.delayedCall(1000, () => explosion.destroy());

    // 屏幕震动
    this.cameras.main.shake(200, 0.02);
  }

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    // 更新游戏时间
    this.gameTime += delta / 1000;

    // 玩家控制
    this.player.handleInput(this.cursors, this.wasd);

    // 更新能力系统
    this.abilitySystem.update(delta);

    // 更新平台管理器
    this.platformManager.update(this.cameras.main.scrollY);

    // 向上推力（模拟屏幕滚动，让游戏有紧迫感）
    const pushSpeed = this.cameraScrollSpeed * 0.5;
    this.player.sprite.y -= pushSpeed;

    // 检查玩家是否被推出屏幕顶部
    if (this.player.sprite.y < this.cameras.main.scrollY - 50) {
      this.gameOver();
    }

    // 检查玩家是否掉出屏幕底部
    if (this.player.sprite.y > this.cameras.main.scrollY + GAME_CONFIG.height + 100) {
      this.gameOver();
    }

    // 更新轨迹粒子
    if (this.player.sprite.body.velocity.y > 100) {
      this.trailParticles.setPosition(this.player.sprite.x, this.player.sprite.y);
    }

    // 难度递增
    this.updateDifficulty();

    // 检查胜利条件
    if (this.floorCount >= 100 && !this.isGameOver) {
      this.victory();
    }
  }

  updateDifficulty() {
    // 每10层增加难度
    const difficultyLevel = Math.floor(this.floorCount / 10);

    // 增加相机滚动速度
    this.cameraScrollSpeed = 1 + difficultyLevel * 0.1;

    // 更新平台生成参数
    this.platformManager.updateDifficulty(difficultyLevel);
  }

  addScore(points) {
    // 能力加成
    if (this.abilitySystem.hasAbility('speedBoost')) {
      points *= 2;
    }

    this.score += points;
    this.scoreText.setText(`分数: ${this.score}`);
  }

  updateFloorDisplay() {
    this.floorText.setText(`第 ${this.floorCount} 层`);

    // 每10层特效
    if (this.floorCount % 10 === 0) {
      this.floorText.setColor('#ffff00');
      this.time.delayedCall(500, () => {
        this.floorText.setColor('#00ffff');
      });

      // 播放里程碑音效
      if (this.audioSystem) {
        this.audioSystem.playMilestone();
      }

      // 屏幕闪烁
      this.cameras.main.flash(200, 0, 255, 255);
    }
  }

  checkAchievements() {
    const achievements = GAME_CONFIG.achievements;
    const unlocked = window.gameState.achievements;

    // 检查层数成就
    if (this.floorCount >= 10 && !unlocked.includes('firstSteps')) {
      this.unlockAchievement('firstSteps');
    }
    if (this.floorCount >= 50 && !unlocked.includes('halfway')) {
      this.unlockAchievement('halfway');
    }
    if (this.floorCount >= 100 && !unlocked.includes('champion')) {
      this.unlockAchievement('champion');
    }

    // 检查能量收集成就
    if (this.energyCollected >= 50 && !unlocked.includes('collector')) {
      this.unlockAchievement('collector');
    }

    // 检查时间成就
    if (this.gameTime >= 300 && !unlocked.includes('survivor')) {
      this.unlockAchievement('survivor');
    }
  }

  unlockAchievement(key) {
    window.gameState.achievements.push(key);
    localStorage.setItem('neonFallAchievements', JSON.stringify(window.gameState.achievements));

    // 播放成就音效
    if (this.audioSystem) {
      this.audioSystem.playAchievement();
    }

    // 显示成就通知
    const achievement = GAME_CONFIG.achievements[key];
    const { width } = this.cameras.main;

    const notification = this.add.container(width / 2, 100);
    notification.setScrollFactor(0);
    notification.setDepth(200);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRoundedRect(-150, -30, 300, 60, 10);
    bg.lineStyle(2, 0xffff00, 1);
    bg.strokeRoundedRect(-150, -30, 300, 60, 10);

    const title = this.add.text(0, -10, '成就解锁!', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00',
    });
    title.setOrigin(0.5);

    const desc = this.add.text(0, 15, achievement.name, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
    });
    desc.setOrigin(0.5);

    notification.add([bg, title, desc]);

    // 动画
    notification.setY(-100);
    this.tweens.add({
      targets: notification,
      y: 100,
      duration: 500,
      ease: 'Back.easeOut',
    });

    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: notification,
        y: -100,
        duration: 500,
        ease: 'Back.easeIn',
        onComplete: () => notification.destroy(),
      });
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
      this.showPauseMenu();
    } else {
      this.physics.resume();
      this.hidePauseMenu();
    }
  }

  showPauseMenu() {
    const { width, height } = this.cameras.main;

    this.pauseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    this.pauseOverlay.setScrollFactor(0);
    this.pauseOverlay.setDepth(300);

    this.pauseText = this.add.text(width / 2, height / 2 - 50, '游戏暂停', {
      fontSize: '48px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
    });
    this.pauseText.setOrigin(0.5);
    this.pauseText.setScrollFactor(0);
    this.pauseText.setDepth(301);

    this.resumeText = this.add.text(width / 2, height / 2 + 30, '点击任意处继续', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
    });
    this.resumeText.setOrigin(0.5);
    this.resumeText.setScrollFactor(0);
    this.resumeText.setDepth(301);

    this.pauseOverlay.setInteractive();
    this.pauseOverlay.on('pointerdown', () => this.togglePause());
  }

  hidePauseMenu() {
    if (this.pauseOverlay) this.pauseOverlay.destroy();
    if (this.pauseText) this.pauseText.destroy();
    if (this.resumeText) this.resumeText.destroy();
  }

  gameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // 播放游戏结束音效
    if (this.audioSystem) {
      this.audioSystem.playGameOver();
      this.audioSystem.stopBackgroundMusic();
    }

    // 保存分数
    if (this.floorCount > window.gameState.highScore) {
      window.gameState.highScore = this.floorCount;
      localStorage.setItem('neonFallHighScore', this.floorCount.toString());
    }

    window.gameState.totalGames++;
    localStorage.setItem('neonFallTotalGames', window.gameState.totalGames.toString());

    // 死亡效果
    this.player.die();

    // 慢动作
    this.time.timeScale = 0.3;

    // 屏幕变红
    this.cameras.main.flash(500, 255, 0, 0);

    // 延迟跳转
    this.time.delayedCall(1500, () => {
      this.time.timeScale = 1;
      this.scene.start('GameOverScene', {
        floor: this.floorCount,
        score: this.score,
        energy: this.energyCollected,
        time: this.gameTime,
      });
    });
  }

  victory() {
    // 播放胜利音效
    if (this.audioSystem) {
      this.audioSystem.playVictory();
      this.audioSystem.stopBackgroundMusic();
    }

    // 胜利效果
    this.cameras.main.flash(1000, 0, 255, 255);

    // 胜利文字
    const { width, height } = this.cameras.main;
    const victoryText = this.add.text(width / 2, height / 2, '恭喜通关!', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6,
    });
    victoryText.setOrigin(0.5);
    victoryText.setScrollFactor(0);
    victoryText.setDepth(200);

    // 保存分数
    if (this.floorCount > window.gameState.highScore) {
      window.gameState.highScore = this.floorCount;
      localStorage.setItem('neonFallHighScore', this.floorCount.toString());
    }

    // 延迟跳转
    this.time.delayedCall(3000, () => {
      this.scene.start('GameOverScene', {
        floor: this.floorCount,
        score: this.score,
        energy: this.energyCollected,
        time: this.gameTime,
        victory: true,
      });
    });
  }
}
