import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { BulletPool } from '../systems/BulletPool.js';
import { GAME_CONFIG, PLAYER_CONFIG, ENEMY_CONFIG, DEPTH } from '../config.js';

/**
 * GameScene - 游戏主场景
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // 重置状态
    this.score = 0;
    this.wave = 1;
    this.enemiesKilled = 0;
    this.enemiesPerWave = 10;
    this.isGameOver = false;
    this.spawnTimer = 0;
    this.spawnInterval = 1500; // 毫秒

    // 创建背景
    this.createBackground();

    // 创建子弹池
    this.playerBulletPool = new BulletPool(this, 'bullet_player', 50);
    this.enemyBulletPool = new BulletPool(this, 'bullet_enemy', 30);

    // 创建玩家
    this.player = new Player(this);

    // 敌人数组
    this.enemies = [];

    // 道具数组
    this.powerups = [];

    // 设置碰撞检测
    this.setupCollisions();

    // 设置输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听事件
    this.setupEvents();

    // 创建 HUD
    this.createHUD();
  }

  /**
   * 创建背景
   */
  createBackground() {
    // 星空背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0a0a1a, 1);
    graphics.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);

    // 随机星星
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * GAME_CONFIG.width;
      const y = Math.random() * GAME_CONFIG.height;
      const size = Math.random() * 2 + 0.5;
      const alpha = Math.random() * 0.5 + 0.5;

      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(x, y, size);
    }

    graphics.setDepth(DEPTH.BACKGROUND);
  }

  /**
   * 设置碰撞检测
   */
  setupCollisions() {
    // 玩家子弹 vs 敌人
    this.physics.add.overlap(
      this.playerBulletPool.group,
      this.player.sprite,
      this.onPlayerBulletHitEnemy,
      null,
      this
    );

    // 注意：由于敌人不是 Group，我们需要在 update 中手动检测
  }

  /**
   * 设置事件监听
   */
  setupEvents() {
    // 敌人被击杀
    this.events.on('enemy-killed', (data) => {
      this.score += data.score;
      this.enemiesKilled++;
      this.updateHUD();

      // 检查波次完成
      if (this.enemiesKilled >= this.enemiesPerWave) {
        this.nextWave();
      }

      // 概率掉落道具
      if (Math.random() < 0.15) {
        this.spawnPowerup(data.x, data.y);
      }
    });

    // 玩家受伤
    this.events.on('player-damaged', (lives) => {
      this.updateHUD();
    });

    // 玩家治疗
    this.events.on('player-healed', (lives) => {
      this.updateHUD();
    });

    // 玩家死亡
    this.events.on('player-died', () => {
      this.gameOver();
    });
  }

  /**
   * 创建 HUD
   */
  createHUD() {
    const padding = 20;

    // 分数
    this.scoreText = this.add.text(padding, padding, '分数: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setDepth(DEPTH.UI);

    // 生命值
    this.livesText = this.add.text(padding, padding + 30, '生命: ' + '❤️'.repeat(this.player.lives), {
      fontSize: '20px',
      color: '#ff6666'
    }).setDepth(DEPTH.UI);

    // 波次
    this.waveText = this.add.text(GAME_CONFIG.width - padding, padding, '波次: 1', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(1, 0).setDepth(DEPTH.UI);
  }

  /**
   * 更新 HUD
   */
  updateHUD() {
    this.scoreText.setText('分数: ' + this.score);
    this.livesText.setText('生命: ' + '❤️'.repeat(this.player.lives));
    this.waveText.setText('波次: ' + this.wave);
  }

  /**
   * 生成敌人
   */
  spawnEnemy() {
    if (this.isGameOver) return;

    // 根据波次决定敌人类型
    const types = this.getEnemyTypesForWave();
    const type = types[Math.floor(Math.random() * types.length)];

    // 随机 X 位置
    const x = 50 + Math.random() * (GAME_CONFIG.width - 100);
    const y = -30;

    const enemy = new Enemy(this, type, x, y);
    this.enemies.push(enemy);
  }

  /**
   * 获取当前波次的敌人类型
   */
  getEnemyTypesForWave() {
    if (this.wave >= 5) {
      return ['basic', 'medium', 'heavy'];
    } else if (this.wave >= 3) {
      return ['basic', 'medium'];
    }
    return ['basic'];
  }

  /**
   * 进入下一波
   */
  nextWave() {
    this.wave++;
    this.enemiesKilled = 0;
    this.enemiesPerWave += 5;
    this.spawnInterval = Math.max(500, this.spawnInterval - 100);

    // 波次提示
    this.showWaveMessage();

    // 每 3 波生成 Boss
    if (this.wave % 3 === 0) {
      this.spawnBoss();
    }
  }

  /**
   * 显示波次提示
   */
  showWaveMessage() {
    const text = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      `第 ${this.wave} 波`,
      {
        fontSize: '48px',
        color: '#ffff00',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI);

    this.tweens.add({
      targets: text,
      alpha: 0,
      scale: 2,
      duration: 1500,
      onComplete: () => text.destroy()
    });
  }

  /**
   * 生成 Boss
   */
  spawnBoss() {
    const boss = new Enemy(this, 'boss', GAME_CONFIG.width / 2, -50);
    this.enemies.push(boss);

    // Boss 提示
    const text = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 3,
      '⚠️ BOSS ⚠️',
      {
        fontSize: '36px',
        color: '#ff0000',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI);

    this.tweens.add({
      targets: text,
      alpha: 0,
      duration: 2000,
      onComplete: () => text.destroy()
    });
  }

  /**
   * 生成道具
   */
  spawnPowerup(x, y) {
    const types = ['heal', 'doubleFire', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];

    const powerup = this.physics.add.image(x, y, `powerup_${type}`);
    powerup.setDepth(DEPTH.ENEMIES);
    powerup.setData('type', type);
    powerup.setVelocityY(80);

    this.powerups.push(powerup);
  }

  /**
   * 游戏结束
   */
  gameOver() {
    this.isGameOver = true;

    // 停止所有敌人
    this.enemies.forEach(enemy => enemy.destroy());

    // 游戏结束提示
    this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 - 50,
      '游戏结束',
      {
        fontSize: '48px',
        color: '#ff0000',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI);

    this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 20,
      `最终分数: ${this.score}`,
      {
        fontSize: '32px',
        color: '#ffffff'
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI);

    // 重新开始提示
    const restartText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2 + 80,
      '按 R 重新开始',
      {
        fontSize: '24px',
        color: '#00ff00'
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI);

    // 闪烁效果
    this.tweens.add({
      targets: restartText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // R 键重新开始
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  /**
   * 主更新循环
   */
  update(time, delta) {
    if (this.isGameOver) return;

    // 处理玩家输入
    this.player.handleInput(this.cursors, this.spaceKey, time);

    // 更新玩家
    // (Player 内部已处理)

    // 敌人生成
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }

    // 更新敌人
    const playerPos = this.player.getPosition();
    this.enemies = this.enemies.filter(enemy => {
      if (enemy.isAlive) {
        enemy.update(time, playerPos.x);
        return true;
      }
      return false;
    });

    // 检测碰撞：玩家子弹 vs 敌人
    this.checkPlayerBulletCollisions();

    // 检测碰撞：敌人子弹 vs 玩家
    this.checkEnemyBulletCollisions();

    // 检测碰撞：敌人 vs 玩家
    this.checkEnemyCollisions();

    // 检测碰撞：道具 vs 玩家
    this.checkPowerupCollisions();

    // 回收超出屏幕的子弹
    this.recycleBullets();
  }

  /**
   * 检测玩家子弹与敌人碰撞
   */
  checkPlayerBulletCollisions() {
    const bullets = this.playerBulletPool.getActiveBullets();

    bullets.forEach(bullet => {
      if (!bullet.active) return;

      this.enemies.forEach(enemy => {
        if (!enemy.isAlive) return;

        const dist = Phaser.Math.Distance.Between(
          bullet.x, bullet.y,
          enemy.sprite.x, enemy.sprite.y
        );

        if (dist < 30) {
          // 回收子弹
          this.playerBulletPool.recycle(bullet);

          // 敌人受伤
          enemy.takeDamage(1);
        }
      });
    });
  }

  /**
   * 检测敌人子弹与玩家碰撞
   */
  checkEnemyBulletCollisions() {
    const bullets = this.enemyBulletPool.getActiveBullets();

    bullets.forEach(bullet => {
      if (!bullet.active || !this.player.sprite.active) return;

      const dist = Phaser.Math.Distance.Between(
        bullet.x, bullet.y,
        this.player.sprite.x, this.player.sprite.y
      );

      if (dist < 25) {
        // 回收子弹
        this.enemyBulletPool.recycle(bullet);

        // 玩家受伤
        this.player.takeDamage();
      }
    });
  }

  /**
   * 检测敌人与玩家碰撞
   */
  checkEnemyCollisions() {
    if (!this.player.sprite.active) return;

    this.enemies.forEach(enemy => {
      if (!enemy.isAlive) return;

      const dist = Phaser.Math.Distance.Between(
        enemy.sprite.x, enemy.sprite.y,
        this.player.sprite.x, this.player.sprite.y
      );

      if (dist < 35) {
        // 敌人死亡
        enemy.die();

        // 玩家受伤
        this.player.takeDamage();
      }
    });
  }

  /**
   * 检测道具与玩家碰撞
   */
  checkPowerupCollisions() {
    if (!this.player.sprite.active) return;

    this.powerups = this.powerups.filter(powerup => {
      if (!powerup.active) return false;

      // 检查是否超出屏幕
      if (powerup.y > GAME_CONFIG.height + 50) {
        powerup.destroy();
        return false;
      }

      const dist = Phaser.Math.Distance.Between(
        powerup.x, powerup.y,
        this.player.sprite.x, this.player.sprite.y
      );

      if (dist < 30) {
        // 收集道具
        const type = powerup.getData('type');
        this.player.collectPowerup(type, 5000);

        // 显示效果
        this.showPowerupText(type);

        powerup.destroy();
        return false;
      }

      return true;
    });
  }

  /**
   * 显示道具效果文字
   */
  showPowerupText(type) {
    const texts = {
      heal: '+1 生命',
      doubleFire: '双发火力!',
      shield: '护盾激活!'
    };

    const text = this.add.text(
      this.player.sprite.x,
      this.player.sprite.y - 40,
      texts[type],
      {
        fontSize: '20px',
        color: '#00ff00',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(DEPTH.UI);

    this.tweens.add({
      targets: text,
      y: text.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });
  }

  /**
   * 回收超出屏幕的子弹
   */
  recycleBullets() {
    // 回收玩家子弹
    this.playerBulletPool.getActiveBullets().forEach(bullet => {
      if (bullet.y < -20 || bullet.y > GAME_CONFIG.height + 20) {
        this.playerBulletPool.recycle(bullet);
      }
    });

    // 回收敌人子弹
    this.enemyBulletPool.getActiveBullets().forEach(bullet => {
      if (bullet.y < -20 || bullet.y > GAME_CONFIG.height + 20) {
        this.enemyBulletPool.recycle(bullet);
      }
    });
  }
}
