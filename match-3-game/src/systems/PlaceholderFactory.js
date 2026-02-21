import { GEM_COLORS, GAME_CONFIG } from '../config.js';

/**
 * PlaceholderFactory - 无素材开发支持
 * 使用程序化图形代替外部素材
 */
export class PlaceholderFactory {
  /**
   * 创建所有游戏占位符素材
   * @param {Phaser.Scene} scene
   */
  static createAll(scene) {
    this.createGemTextures(scene);
    this.createUITextures(scene);
  }

  /**
   * 创建宝石纹理（使用 Pencil 设计的颜色和形状）
   * @param {Phaser.Scene} scene
   */
  static createGemTextures(scene) {
    const size = 60;
    const cornerRadius = 12;  // 来自 Pencil 设计

    GEM_COLORS.forEach((color, index) => {
      const key = `gem_${index}`;
      const graphics = scene.add.graphics();

      // 绘制圆角方块（来自 Pencil 设计）
      graphics.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
      graphics.fillRoundedRect(2, 2, size - 4, size - 4, cornerRadius);

      // 添加高光效果
      graphics.fillStyle(0xffffff, 0.2);
      graphics.fillRoundedRect(6, 6, size - 20, size / 3, cornerRadius - 4);

      graphics.generateTexture(key, size, size);
      graphics.destroy();
    });

    // 创建选中效果纹理
    const selectGraphics = scene.add.graphics();
    selectGraphics.lineStyle(3, 0xffffff, 1);
    selectGraphics.strokeRoundedRect(2, 2, size - 4, size - 4, cornerRadius);
    selectGraphics.generateTexture('gem_selected', size, size);
    selectGraphics.destroy();
  }

  /**
   * 创建 UI 纹理
   * @param {Phaser.Scene} scene
   */
  static createUITextures(scene) {
    // 棋盘背景（来自 Pencil 设计）
    const boardGraphics = scene.add.graphics();
    const boardWidth = GAME_CONFIG.grid.cols * (GAME_CONFIG.grid.gemSize + GAME_CONFIG.grid.gemGap) + GAME_CONFIG.grid.padding * 2;
    const boardHeight = GAME_CONFIG.grid.rows * (GAME_CONFIG.grid.gemSize + GAME_CONFIG.grid.gemGap) + GAME_CONFIG.grid.padding * 2;

    // 深色背景，圆角16（来自 Pencil）
    boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(GAME_CONFIG.colors.board).color, 1);
    boardGraphics.fillRoundedRect(0, 0, boardWidth, boardHeight, 16);

    boardGraphics.generateTexture('board_bg', boardWidth, boardHeight);
    boardGraphics.destroy();

    // 按钮纹理
    const buttonGraphics = scene.add.graphics();
    const buttonWidth = 200;
    const buttonHeight = 50;

    buttonGraphics.fillStyle(0xe94560, 1);
    buttonGraphics.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 25);
    buttonGraphics.lineStyle(2, 0xffffff, 0.5);
    buttonGraphics.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 25);

    buttonGraphics.generateTexture('button', buttonWidth, buttonHeight);
    buttonGraphics.destroy();

    // 粒子纹理（消除效果）
    const particleGraphics = scene.add.graphics();
    particleGraphics.fillStyle(0xffffff, 1);
    particleGraphics.fillCircle(4, 4, 4);
    particleGraphics.generateTexture('particle', 8, 8);
    particleGraphics.destroy();
  }

  /**
   * 创建分数弹出效果
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} score
   */
  static createScorePopup(scene, x, y, score) {
    const text = scene.add.text(x, y, `+${score}`, {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }
}
