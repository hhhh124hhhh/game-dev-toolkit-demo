import Phaser from 'phaser';
import { GAME_CONFIG, BRICK_COLORS, BRICK_POINTS, GAME_SETTINGS } from '../config.js';
import { Ball } from '../entities/Ball.js';
import { Paddle } from '../entities/Paddle.js';

/**
 * GameScene - 游戏主场景
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    // 初始化所有状态变量（防止 undefined bug）
    this.score = window.gameState?.score || 0;
    this.level = window.gameState?.level || 1;
    this.lives = window.gameState?.lives || 3;
    this.gameOver = false;
    this.levelComplete = false;
  }

  create() {
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.background);

    // 创建游戏对象
    this.createPaddle();
    this.createBall();
    this.createBricks();
    this.createUI();

    // 设置碰撞
    this.setupCollisions();

    // 设置输入
    this.setupInput();
  }

  createPaddle() {
    const x = GAME_CONFIG.width / 2;
    const y = GAME_CONFIG.height - GAME_CONFIG.paddle.yOffset;

    this.paddle = new Paddle(this, x, y);
  }

  createBall() {
    const x = this.paddle.x;
    const y = this.paddle.y - 30;

    this.ball = new Ball(this, x, y);
  }

  createBricks() {
    this.bricks = this.physics.add.staticGroup();

    const { rows, cols, width, height, gap, offsetTop, offsetLeft } = GAME_CONFIG.bricks;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = offsetLeft + col * (width + gap) + width / 2;
        const y = offsetTop + row * (height + gap) + height / 2;

        // 根据关卡决定砖块生命值
        let health = 1;
        if (this.level >= 2 && row < 2) health = 2;
        if (this.level >= 3 && row === 0 && col % 3 === 0) health = 3;

        // 关键修复：使用静态组的 create 方法
        const textureKey = this.getBrickTextureKey(row, health);
        const brick = this.bricks.create(x, y, textureKey);

        // 设置砖块属性
        brick.setData('row', row);
        brick.setData('col', col);
        brick.setData('health', health);
        brick.setData('points', BRICK_POINTS[row] || BRICK_POINTS[0]);

        // 关键：刷新静态物体的碰撞体
        brick.refreshBody();
      }
    }
  }

  /**
   * 获取砖块纹理键
   */
  getBrickTextureKey(row, health) {
    if (health === 3) return 'brick_gold';
    if (health === 2) return 'brick_strong';
    return `brick_${row % BRICK_COLORS.length}`;
  }

  createUI() {
    const headerY = 10;

    // 分数
    this.add.text(20, headerY, '分数', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa'
    });
    this.scoreText = this.add.text(20, headerY + 18, this.score.toString(), {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 关卡
    this.add.text(GAME_CONFIG.width / 2, headerY, '关卡', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa'
    }).setOrigin(0.5, 0);
    this.levelText = this.add.text(GAME_CONFIG.width / 2, headerY + 18, this.level.toString(), {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#00ff88',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // 生命
    this.add.text(GAME_CONFIG.width - 20, headerY, '生命', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa'
    }).setOrigin(1, 0);
    this.livesText = this.add.text(GAME_CONFIG.width - 20, headerY + 18, this.lives.toString(), {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff4757',
      fontStyle: 'bold'
    }).setOrigin(1, 0);
  }

  setupCollisions() {
    // 球与挡板碰撞
    this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

    // 球与砖块碰撞
    this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);

    // 世界边界事件（检测球掉落）
    this.physics.world.setBounds(0, 0, GAME_CONFIG.width, GAME_CONFIG.height + 50);
    this.ball.body.setCollideWorldBounds(true);
    this.ball.body.onWorldBounds = true;

    this.physics.world.on('worldbounds', (body, up, down, left, right) => {
      if (down && body.gameObject === this.ball) {
        this.loseLife();
      }
    });
  }

  setupInput() {
    // 键盘光标
    this.cursors = this.input.keyboard.createCursorKeys();

    // 空格键发射
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 鼠标/触摸控制
    this.input.on('pointermove', (pointer) => {
      if (!this.gameOver) {
        this.paddle.followPointer(pointer.x);

        // 球未发射时跟随挡板
        if (!this.ball.isLaunched) {
          this.ball.x = this.paddle.x;
        }
      }
    });

    this.input.on('pointerdown', () => {
      if (!this.ball.isLaunched && !this.gameOver) {
        this.launchBall();
      }
    });

    // ESC 键暂停
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.gameOver) {
        this.scene.start('MenuScene');
      }
    });
  }

  launchBall() {
    this.ball.launch(GAME_CONFIG.ball.speed + (this.level - 1) * 50);
  }

  hitPaddle(ball, paddle) {
    // 根据击中位置改变反弹角度
    const diff = ball.x - paddle.x;
    const maxAngle = 60;
    const maxDiff = paddle.width / 2;

    // 防止除零，并限制比例在 -1 到 1 之间
    const ratio = maxDiff > 0 ? Phaser.Math.Clamp(diff / maxDiff, -1, 1) : 0;
    const angle = ratio * maxAngle;

    // 计算新速度
    const speed = Math.sqrt(ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2) || GAME_CONFIG.ball.speed;
    const rad = Phaser.Math.DegToRad(angle - 90);

    ball.body.velocity.x = Math.cos(rad) * speed;
    ball.body.velocity.y = Math.sin(rad) * speed;

    // 确保球向上运动（最小垂直速度）
    if (ball.body.velocity.y > -50) {
      ball.body.velocity.y = -Math.abs(speed * 0.5);
    }
  }

  hitBrick(ball, brick) {
    if (!brick || !brick.active) return;

    const health = brick.getData('health');
    const newHealth = health - 1;

    if (newHealth <= 0) {
      // 关键修复：使用 disableBody 正确移除静态组砖块
      brick.disableBody(true, true);
      this.score += (brick.getData('points') || 0) * this.level;
      this.scoreText.setText(this.score.toString());
      this.checkLevelComplete();
    } else {
      // 减少生命值
      brick.setData('health', newHealth);

      // 更新外观
      if (newHealth === 1) {
        const row = brick.getData('row');
        brick.setTexture(`brick_${row % BRICK_COLORS.length}`);
      }
    }
  }

  loseLife() {
    this.lives--;
    this.livesText.setText(this.lives.toString());

    if (this.lives <= 0) {
      this.endGame();
    } else {
      // 重置球
      this.ball.reset(this.paddle.x, this.paddle.y - 30);
    }
  }

  checkLevelComplete() {
    const activeBricks = this.bricks.countActive();

    if (activeBricks === 0) {
      this.levelComplete = true;

      if (this.level >= GAME_SETTINGS.levels) {
        // 游戏胜利
        this.endGame(true);
      } else {
        // 下一关
        this.level++;
        window.gameState.level = this.level;
        window.gameState.score = this.score;

        // 显示关卡完成
        this.showLevelComplete();
      }
    }
  }

  showLevelComplete() {
    const { width, height } = this.cameras.main;

    const text = this.add.text(width / 2, height / 2, `关卡 ${this.level - 1} 完成!`, {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#00ff88',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      alpha: 0,
      y: height / 2 - 50,
      duration: 1500,
      onComplete: () => {
        this.scene.restart();
      }
    });
  }

  endGame(victory = false) {
    this.gameOver = true;

    // 更新最高分（带错误处理）
    if (this.score > (window.gameState.highScore || 0)) {
      window.gameState.highScore = this.score;
      try {
        localStorage.setItem('breakout_highscore', this.score.toString());
      } catch (e) {
        console.warn('无法保存最高分');
      }
    }

    // 传递结束数据
    window.gameState.finalScore = this.score;
    window.gameState.victory = victory;

    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene');
    });
  }

  update() {
    if (this.gameOver || this.levelComplete) return;

    // 键盘控制挡板
    this.paddle.update(this.cursors);

    // 球未发射时跟随挡板
    if (!this.ball.isLaunched) {
      this.ball.x = this.paddle.x;

      // 空格键发射
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.launchBall();
      }
    } else {
      // 限制球速
      this.ball.limitSpeed();
    }
  }
}
