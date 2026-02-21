import { GAME_CONFIG, SCORE_CONFIG } from '../config.js';
import { Board } from '../entities/Board.js';
import { Gem } from '../entities/Gem.js';
import { MatchDetector } from '../systems/MatchDetector.js';
import { PlaceholderFactory } from '../systems/PlaceholderFactory.js';

/**
 * GameScene - 游戏主场景
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    // 初始化所有状态变量（防止 undefined bug）
    this.score = 0;
    this.moves = 30;
    this.level = 1;
    this.selectedGem = null;
    this.isAnimating = false;
    this.gemSprites = [];
  }

  create() {
    this.cameras.main.setBackgroundColor(GAME_CONFIG.colors.background);

    // 创建逻辑棋盘
    this.board = new Board(
      GAME_CONFIG.grid.rows,
      GAME_CONFIG.grid.cols,
      GAME_CONFIG.gemTypes
    );
    this.detector = new MatchDetector(
      GAME_CONFIG.grid.rows,
      GAME_CONFIG.grid.cols,
      GAME_CONFIG.matchMin
    );

    // 创建 UI
    this.createUI();

    // 创建棋盘
    this.createBoard();

    // 创建宝石精灵
    this.createGemSprites();

    // 设置输入
    this.setupInput();
  }

  /**
   * 创建 UI（分数、关卡、步数）- 来自 Pencil 设计
   */
  createUI() {
    const headerY = 10;

    // 分数面板（左对齐）
    const scoreX = 40;
    this.add.text(scoreX, headerY, '分数', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa'
    });
    this.scoreText = this.add.text(scoreX, headerY + 18, '0', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 关卡面板（居中）
    const levelX = GAME_CONFIG.width / 2;
    this.add.text(levelX, headerY, '关卡', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa'
    }).setOrigin(0.5, 0);
    this.levelText = this.add.text(levelX, headerY + 18, '1', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // 步数面板（右对齐，绿色高亮）
    const movesX = GAME_CONFIG.width - 40;
    this.add.text(movesX, headerY, '步数', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa'
    }).setOrigin(1, 0);
    this.movesText = this.add.text(movesX, headerY + 18, '30', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: GAME_CONFIG.colors.movesHighlight,  // 绿色高亮 #00ff88
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    // 棋盘背景
    const { cols, rows, gemSize, gemGap, padding, offsetX, offsetY } = GAME_CONFIG.grid;
    const boardWidth = cols * (gemSize + gemGap) + padding * 2;
    const boardHeight = rows * (gemSize + gemGap) + padding * 2;

    this.add.image(
      offsetX + boardWidth / 2,
      offsetY + boardHeight / 2,
      'board_bg'
    ).setOrigin(0.5);
  }

  /**
   * 创建棋盘网格
   */
  createBoard() {
    const { rows, cols, gemSize, gemGap, padding, offsetX, offsetY } = GAME_CONFIG.grid;
    const cellSize = gemSize + gemGap;

    // 绘制网格线
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333366, 0.3);

    for (let row = 0; row <= rows; row++) {
      graphics.moveTo(offsetX + padding, offsetY + padding + row * cellSize);
      graphics.lineTo(offsetX + padding + cols * cellSize, offsetY + padding + row * cellSize);
    }

    for (let col = 0; col <= cols; col++) {
      graphics.moveTo(offsetX + padding + col * cellSize, offsetY + padding);
      graphics.lineTo(offsetX + padding + col * cellSize, offsetY + padding + rows * cellSize);
    }

    graphics.strokePath();
  }

  /**
   * 创建宝石精灵
   */
  createGemSprites() {
    this.gemSprites = [];

    for (let row = 0; row < this.board.rows; row++) {
      this.gemSprites[row] = [];
      for (let col = 0; col < this.board.cols; col++) {
        const type = this.board.grid[row][col];
        const gem = this.createGemSprite(type, col, row);
        this.gemSprites[row][col] = gem;
      }
    }
  }

  /**
   * 创建单个宝石精灵
   */
  createGemSprite(type, gridX, gridY) {
    const { gemSize, gemGap, padding, offsetX, offsetY } = GAME_CONFIG.grid;
    const x = offsetX + padding + gridX * (gemSize + gemGap) + gemSize / 2;
    const y = offsetY + padding + gridY * (gemSize + gemGap) + gemSize / 2;

    const sprite = this.add.image(x, y, `gem_${type}`)
      .setInteractive()
      .setData('gridX', gridX)
      .setData('gridY', gridY)
      .setData('type', type);

    return sprite;
  }

  /**
   * 设置输入事件
   */
  setupInput() {
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      if (this.isAnimating) return;

      const gridX = gameObject.getData('gridX');
      const gridY = gameObject.getData('gridY');

      this.handleGemClick(gridX, gridY);
    });
  }

  /**
   * 处理宝石点击
   */
  handleGemClick(gridX, gridY) {
    const clickedGem = this.gemSprites[gridY][gridX];

    if (!this.selectedGem) {
      // 第一次选择
      this.selectedGem = clickedGem;
      this.highlightGem(clickedGem, true);
    } else {
      const selectedX = this.selectedGem.getData('gridX');
      const selectedY = this.selectedGem.getData('gridY');

      // 检查是否相邻
      if (this.detector.isAdjacent(
        { row: selectedY, col: selectedX },
        { row: gridY, col: gridX }
      )) {
        // 交换
        this.highlightGem(this.selectedGem, false);
        this.trySwap(selectedX, selectedY, gridX, gridY);
        this.selectedGem = null;
      } else {
        // 选择新的宝石
        this.highlightGem(this.selectedGem, false);
        this.selectedGem = clickedGem;
        this.highlightGem(clickedGem, true);
      }
    }
  }

  /**
   * 高亮宝石
   */
  highlightGem(gem, highlight) {
    if (highlight) {
      gem.setTint(0xffff00);
      this.tweens.add({
        targets: gem,
        scale: 1.2,
        duration: 100
      });
    } else {
      gem.clearTint();
      this.tweens.add({
        targets: gem,
        scale: 1,
        duration: 100
      });
    }
  }

  /**
   * 尝试交换宝石
   */
  async trySwap(x1, y1, x2, y2) {
    this.isAnimating = true;

    // 逻辑交换
    const pos1 = { row: y1, col: x1 };
    const pos2 = { row: y2, col: x2 };
    this.board.swap(pos1, pos2);

    // 视觉交换动画
    await this.animateSwap(x1, y1, x2, y2);

    // 检测匹配
    const matches = this.detector.findMatches(this.board.grid);

    if (matches.length > 0) {
      // 有匹配，消耗步数
      this.moves--;
      this.movesText.setText(this.moves.toString());

      // 处理消除
      await this.processMatches();
    } else {
      // 无匹配，换回
      this.board.swap(pos1, pos2);
      await this.animateSwap(x1, y1, x2, y2);
    }

    this.isAnimating = false;

    // 检查游戏结束
    if (this.moves <= 0) {
      this.scene.start('GameOverScene', { score: this.score });
    }
  }

  /**
   * 交换动画
   */
  animateSwap(x1, y1, x2, y2) {
    return new Promise(resolve => {
      const gem1 = this.gemSprites[y1][x1];
      const gem2 = this.gemSprites[y2][x2];

      const { gemSize, gemGap, padding, offsetX, offsetY } = GAME_CONFIG.grid;
      const cellSize = gemSize + gemGap;

      const targetX1 = offsetX + padding + x2 * cellSize + gemSize / 2;
      const targetY1 = offsetY + padding + y2 * cellSize + gemSize / 2;
      const targetX2 = offsetX + padding + x1 * cellSize + gemSize / 2;
      const targetY2 = offsetY + padding + y1 * cellSize + gemSize / 2;

      this.tweens.add({
        targets: gem1,
        x: targetX1,
        y: targetY1,
        duration: 200,
        ease: 'Power2'
      });

      this.tweens.add({
        targets: gem2,
        x: targetX2,
        y: targetY2,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          // 更新精灵数组
          this.gemSprites[y1][x1] = gem2;
          this.gemSprites[y2][x2] = gem1;
          gem1.setData('gridX', x2);
          gem1.setData('gridY', y2);
          gem2.setData('gridX', x1);
          gem2.setData('gridY', y1);
          resolve();
        }
      });
    });
  }

  /**
   * 处理匹配消除
   */
  async processMatches() {
    let cascade = 0;

    while (true) {
      const matches = this.detector.findMatches(this.board.grid);
      if (matches.length === 0) break;

      cascade++;

      // 计算分数
      const baseScore = matches.reduce((total, match) => {
        const count = match.positions.length;
        if (count === 3) return total + SCORE_CONFIG.match3;
        if (count === 4) return total + SCORE_CONFIG.match4;
        return total + SCORE_CONFIG.match5;
      }, 0);

      const cascadeBonus = Math.floor(baseScore * Math.pow(SCORE_CONFIG.cascadeMultiplier, cascade - 1));
      this.score += cascadeBonus;
      this.scoreText.setText(this.score.toString());

      // 显示分数弹出
      if (matches[0] && matches[0].positions[0]) {
        const pos = matches[0].positions[0];
        const gem = this.gemSprites[pos.row][pos.col];
        if (gem) {
          PlaceholderFactory.createScorePopup(this, gem.x, gem.y, cascadeBonus);
        }
      }

      // 播放消除动画
      await this.animateMatches(matches);

      // 移除匹配
      for (const match of matches) {
        this.board.removeMatches(match.positions);
      }

      // 应用重力
      await this.animateGravity();

      // 填充新宝石
      await this.animateFill();
    }
  }

  /**
   * 消除动画
   */
  animateMatches(matches) {
    return new Promise(resolve => {
      const promises = [];

      for (const match of matches) {
        for (const pos of match.positions) {
          const gem = this.gemSprites[pos.row][pos.col];
          if (gem) {
            promises.push(new Promise(res => {
              // 粒子效果
              this.createMatchParticles(gem.x, gem.y, gem.getData('type'));

              this.tweens.add({
                targets: gem,
                scale: 0,
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                  gem.destroy();
                  res();
                }
              });
            }));
          }
        }
      }

      Promise.all(promises).then(resolve);
    });
  }

  /**
   * 创建消除粒子效果
   */
  createMatchParticles(x, y, type) {
    const colors = [0xff4757, 0x3742fa, 0x2ed573, 0xffa502, 0xa55eea, 0xff6b81];
    const color = colors[type] || 0xffffff;

    for (let i = 0; i < 8; i++) {
      const particle = this.add.circle(x, y, 4, color, 1);

      const angle = (i / 8) * Math.PI * 2;
      const distance = 30;

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  /**
   * 重力动画
   */
  animateGravity() {
    return new Promise(resolve => {
      const { gemSize, gemGap, padding, offsetX, offsetY } = GAME_CONFIG.grid;
      const cellSize = gemSize + gemGap;
      const promises = [];

      // 对每一列应用重力
      for (let col = 0; col < this.board.cols; col++) {
        // 从下往上扫描，收集非空宝石
        const gems = [];
        for (let row = this.board.rows - 1; row >= 0; row--) {
          if (this.board.grid[row][col] !== null) {
            gems.push({
              type: this.board.grid[row][col],
              sprite: this.gemSprites[row][col]
            });
          }
        }

        // 清空该列的精灵数组
        for (let row = 0; row < this.board.rows; row++) {
          this.gemSprites[row][col] = null;
        }

        // 从底部重新填充
        for (let i = 0; i < gems.length; i++) {
          const row = this.board.rows - 1 - i;
          const gem = gems[i];

          if (gem.sprite) {
            const targetY = offsetY + padding + row * cellSize + gemSize / 2;

            promises.push(new Promise(res => {
              this.tweens.add({
                targets: gem.sprite,
                y: targetY,
                duration: 200 + i * 50,
                ease: 'Bounce.easeOut',
                onComplete: res
              });
            }));

            gem.sprite.setData('gridY', row);
            this.gemSprites[row][col] = gem.sprite;
          }
        }

        // 更新逻辑网格
        for (let row = this.board.rows - 1; row >= 0; row--) {
          const idx = this.board.rows - 1 - row;
          if (idx < gems.length) {
            this.board.grid[row][col] = gems[idx].type;
          } else {
            this.board.grid[row][col] = null;
          }
        }
      }

      Promise.all(promises).then(resolve);
    });
  }

  /**
   * 填充动画
   */
  animateFill() {
    return new Promise(resolve => {
      const { gemSize, gemGap, padding, offsetX, offsetY } = GAME_CONFIG.grid;
      const cellSize = gemSize + gemGap;
      const promises = [];

      for (let col = 0; col < this.board.cols; col++) {
        let delay = 0;

        for (let row = 0; row < this.board.rows; row++) {
          if (this.board.grid[row][col] === null) {
            // 生成新宝石类型
            const type = Math.floor(Math.random() * GAME_CONFIG.gemTypes);
            this.board.grid[row][col] = type;

            // 创建新精灵
            const x = offsetX + padding + col * cellSize + gemSize / 2;
            const startY = offsetY - gemSize;
            const targetY = offsetY + padding + row * cellSize + gemSize / 2;

            const sprite = this.add.image(x, startY, `gem_${type}`)
              .setInteractive()
              .setData('gridX', col)
              .setData('gridY', row)
              .setData('type', type);

            this.gemSprites[row][col] = sprite;

            promises.push(new Promise(res => {
              this.tweens.add({
                targets: sprite,
                y: targetY,
                duration: 300,
                delay: delay,
                ease: 'Bounce.easeOut',
                onComplete: res
              });
            }));

            delay += 50;
          }
        }
      }

      Promise.all(promises).then(resolve);
    });
  }
}
