import { GAME_CONFIG, MAP_PATH, TOWER_CONFIG } from '../config.js';
import { Pathfinding } from '../systems/Pathfinding.js';
import { Economy } from '../systems/Economy.js';
import { WaveManager } from '../systems/WaveManager.js';
import { Enemy } from '../entities/Enemy.js';
import { Tower } from '../entities/Tower.js';

/**
 * GameScene - 游戏主场景
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    // 状态初始化（防止 undefined bug）
    this.lives = GAME_CONFIG.balance.startLives;
    this.isGameOver = false;
    this.isPaused = false;
    this.selectedTowerType = null;
    this.path = [];
    this.grid = [];
    this.towers = [];
    this.enemies = [];
    this.isProcessingWaveComplete = false;  // 防止重复触发
  }

  create() {
    // 初始化系统
    this.economy = new Economy();
    this.waveManager = new WaveManager(this, this.spawnEnemy.bind(this));

    // 创建网格和路径
    this.createGrid();
    this.calculatePath();

    // 设置输入
    this.setupInput();

    // 监听事件
    this.setupEvents();

    // 通知UI场景
    this.events.emit('game-ready', {
      lives: this.lives,
      gold: this.economy.gold
    });

    // 开始第一波
    this.time.delayedCall(2000, () => {
      this.waveManager.startNextWave();
    });
  }

  /**
   * 创建网格
   */
  createGrid() {
    const cellSize = GAME_CONFIG.grid.cellSize;
    const cols = GAME_CONFIG.grid.cols;
    const rows = GAME_CONFIG.grid.rows;

    // 初始化网格数组
    this.grid = Array(rows).fill(null).map(() => Array(cols).fill(0));

    // 创建网格显示
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = this.add.image(
          x * cellSize + cellSize / 2,
          y * cellSize + cellSize / 2,
          'grass_cell'
        );
        cell.setData('gridX', x);
        cell.setData('gridY', y);
        cell.setInteractive();
      }
    }

    // 标记路径格子
    MAP_PATH.forEach((point, index) => {
      // 连接路径点之间的所有格子
      if (index < MAP_PATH.length - 1) {
        const start = MAP_PATH[index];
        const end = MAP_PATH[index + 1];

        // 水平方向
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        for (let x = minX; x <= maxX; x++) {
          this.markPathCell(x, start.y);
        }

        // 垂直方向
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);
        for (let y = minY; y <= maxY; y++) {
          this.markPathCell(end.x, y);
        }
      }
    });

    // 起点和终点标记
    const startPoint = MAP_PATH[0];
    const endPoint = MAP_PATH[MAP_PATH.length - 1];
    this.add.image(
      startPoint.x * cellSize + cellSize / 2,
      startPoint.y * cellSize + cellSize / 2,
      'start_cell'
    ).setDepth(1);
    this.add.image(
      endPoint.x * cellSize + cellSize / 2,
      endPoint.y * cellSize + cellSize / 2,
      'end_cell'
    ).setDepth(1);
  }

  /**
   * 标记路径格子
   */
  markPathCell(x, y) {
    this.grid[y][x] = 1; // 1 = 路径，不能建塔

    const cellSize = GAME_CONFIG.grid.cellSize;
    this.add.image(
      x * cellSize + cellSize / 2,
      y * cellSize + cellSize / 2,
      'path_cell'
    ).setDepth(0.5);
  }

  /**
   * 计算敌人路径
   */
  calculatePath() {
    const cellSize = GAME_CONFIG.grid.cellSize;

    // 从路径点生成完整路径
    const fullPath = [];

    for (let i = 0; i < MAP_PATH.length - 1; i++) {
      const start = MAP_PATH[i];
      const end = MAP_PATH[i + 1];

      // 水平移动
      if (start.y === end.y) {
        const direction = end.x > start.x ? 1 : -1;
        for (let x = start.x; x !== end.x; x += direction) {
          fullPath.push([x * cellSize + cellSize / 2, start.y * cellSize + cellSize / 2]);
        }
      }
      // 垂直移动
      else if (start.x === end.x) {
        const direction = end.y > start.y ? 1 : -1;
        for (let y = start.y; y !== end.y; y += direction) {
          fullPath.push([start.x * cellSize + cellSize / 2, y * cellSize + cellSize / 2]);
        }
      }
    }

    // 添加最后一个点
    const lastPoint = MAP_PATH[MAP_PATH.length - 1];
    fullPath.push([lastPoint.x * cellSize + cellSize / 2, lastPoint.y * cellSize + cellSize / 2]);

    this.path = fullPath;
  }

  /**
   * 设置输入
   */
  setupInput() {
    // 点击网格放置塔
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      if (this.isGameOver || this.isPaused) return;

      const gridX = gameObject.getData('gridX');
      const gridY = gameObject.getData('gridY');

      if (gridX !== undefined && gridY !== undefined) {
        this.handleCellClick(gridX, gridY);
      }
    });

    // 暂停键
    this.input.keyboard.on('keydown-ESC', () => {
      this.togglePause();
    });

    // 空格开始下一波
    this.input.keyboard.on('keydown-SPACE', () => {
      if (!this.waveManager.isWaveActive && !this.isGameOver) {
        this.waveManager.startNextWave();
      }
    });
  }

  /**
   * 处理格子点击
   */
  handleCellClick(gridX, gridY) {
    // 检查是否可以建塔
    if (this.grid[gridY][gridX] === 1) {
      return; // 路径上不能建塔
    }

    // 检查是否已有塔
    const existingTower = this.towers.find(t => t.gridX === gridX && t.gridY === gridY);
    if (existingTower) {
      // 显示升级/出售选项
      this.events.emit('tower-selected', existingTower);
      return;
    }

    // 如果选择了塔类型，尝试建造
    if (this.selectedTowerType) {
      this.buildTower(this.selectedTowerType, gridX, gridY);
    }
  }

  /**
   * 建造塔
   */
  buildTower(type, gridX, gridY) {
    const config = TOWER_CONFIG[type];

    // 检查金币
    if (!this.economy.canAfford(config.cost)) {
      this.events.emit('not-enough-gold', config.cost);
      return false;
    }

    // 花费金币
    this.economy.spendGold(config.cost);

    // 创建塔
    const tower = new Tower(this, type, gridX, gridY);
    this.towers.push(tower);

    // 标记格子
    this.grid[gridY][gridX] = 2; // 2 = 有塔

    this.events.emit('tower-built', tower);
    return true;
  }

  /**
   * 生成敌人
   */
  spawnEnemy(type) {
    const enemy = new Enemy(this, type, [...this.path]);
    this.enemies.push(enemy);
  }

  /**
   * 设置事件监听
   */
  setupEvents() {
    // 敌人到达终点
    this.events.on('enemy-reached-end', (enemy) => {
      this.lives--;
      this.events.emit('lives-changed', this.lives);

      if (this.lives <= 0) {
        this.gameOver(false);
      }
    });

    // 敌人死亡
    this.events.on('enemy-killed', (enemy) => {
      this.economy.addGold(enemy.reward);
    });

    // 波次完成
    this.events.on('wave-enemies-spawned', (wave) => {
      // 检查是否所有敌人都被消灭
      this.checkWaveComplete();
    });

    // 所有波次完成
    this.events.on('waves-complete', () => {
      this.gameOver(true);
    });
  }

  /**
   * 检查波次是否完成
   */
  checkWaveComplete() {
    // 防护：必须已经开始波次且未在处理中
    if (this.waveManager.currentWave === 0 || this.isProcessingWaveComplete) {
      return;
    }

    const aliveEnemies = this.enemies.filter(e => e.isAlive && !e.reachedEnd);

    // 只有当没有活跃敌人且波次生成结束时才触发
    if (aliveEnemies.length === 0 && !this.waveManager.isWaveActive) {
      this.isProcessingWaveComplete = true;

      // 波次完成 - 发放奖励和利息
      const currentWave = this.waveManager.currentWave;
      const waveResult = this.economy.processWaveEnd(currentWave);

      this.events.emit('wave-complete', {
        wave: currentWave,
        bonus: waveResult.bonus,
        interest: waveResult.interest,
        totalGold: waveResult.total
      });

      // 显示波次奖励（可选）
      if (waveResult.total > 0) {
        this.showWaveReward(waveResult);
      }

      // 自动开始下一波（延迟）
      this.time.delayedCall(GAME_CONFIG.balance.waveDelay, () => {
        if (!this.isGameOver) {
          this.isProcessingWaveComplete = false;  // 重置标志
          this.waveManager.startNextWave();
        }
      });
    }
  }

  /**
   * 显示波次奖励
   */
  showWaveReward(result) {
    // 背景遮罩
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRect(250, 260, 300, 100);
    bg.setDepth(99);

    const text = this.add.text(400, 310,
      `波次 ${this.waveManager.currentWave} 完成!\n+${result.bonus} 金币  +${result.interest} 利息`, {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: [text, bg],
      alpha: 0,
      y: '-=50',
      duration: 2500,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
        bg.destroy();
      }
    });
  }

  /**
   * 切换暂停
   */
  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.scene.pause();
    } else {
      this.scene.resume();
    }

    this.events.emit('pause-changed', this.isPaused);
  }

  /**
   * 游戏结束
   */
  gameOver(victory) {
    this.isGameOver = true;

    this.time.delayedCall(1000, () => {
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene', {
        victory,
        wave: this.waveManager.currentWave,
        kills: this.enemies.filter(e => !e.isAlive && !e.reachedEnd).length
      });
    });
  }

  /**
   * 更新循环
   */
  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    // 更新敌人
    this.enemies.forEach(enemy => {
      if (enemy.isAlive && !enemy.reachedEnd) {
        enemy.update(delta);
      }
    });

    // 清理已死亡或到达终点的敌人
    this.enemies = this.enemies.filter(enemy => enemy.isAlive && !enemy.reachedEnd);

    // 更新塔
    this.towers.forEach(tower => {
      tower.tryFire(time, this.enemies);
    });

    // 检查波次完成
    this.checkWaveComplete();
  }
}
