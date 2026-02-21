import { GAME_CONFIG, BRICK_COLORS } from '../config.js';

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
    this.createPaddleTexture(scene);
    this.createBallTexture(scene);
    this.createBrickTextures(scene);
  }

  /**
   * 创建挡板纹理
   * @param {Phaser.Scene} scene
   */
  static createPaddleTexture(scene) {
    const { width, height } = GAME_CONFIG.paddle;
    const graphics = scene.add.graphics();

    // 渐变效果挡板
    const color = Phaser.Display.Color.HexStringToColor(GAME_CONFIG.colors.paddle).color;

    // 主体
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(0, 0, width, height, 10);

    // 高光
    graphics.fillStyle(0xffffff, 0.3);
    graphics.fillRoundedRect(4, 2, width - 8, height / 3, 8);

    graphics.generateTexture('paddle', width, height);
    graphics.destroy();
  }

  /**
   * 创建球纹理
   * @param {Phaser.Scene} scene
   */
  static createBallTexture(scene) {
    const radius = GAME_CONFIG.ball.radius;
    const size = radius * 2;
    const graphics = scene.add.graphics();

    // 发光效果
    graphics.fillStyle(0x00d4ff, 0.3);
    graphics.fillCircle(radius, radius, radius);

    // 主体
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(radius, radius, radius - 2);

    // 高光
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(radius - 2, radius - 2, 4);

    graphics.generateTexture('ball', size, size);
    graphics.destroy();
  }

  /**
   * 创建砖块纹理
   * @param {Phaser.Scene} scene
   */
  static createBrickTextures(scene) {
    const { width, height } = GAME_CONFIG.bricks;

    BRICK_COLORS.forEach((color, index) => {
      const graphics = scene.add.graphics();
      const brickColor = Phaser.Display.Color.HexStringToColor(color).color;

      // 主体
      graphics.fillStyle(brickColor, 1);
      graphics.fillRoundedRect(0, 0, width, height, 4);

      // 顶部高光
      graphics.fillStyle(0xffffff, 0.3);
      graphics.fillRoundedRect(2, 2, width - 4, height / 3, 2);

      // 底部阴影
      graphics.fillStyle(0x000000, 0.2);
      graphics.fillRoundedRect(2, height - height / 4, width - 4, height / 5, 2);

      graphics.generateTexture(`brick_${index}`, width, height);
      graphics.destroy();
    });

    // 创建坚固砖块纹理（灰色，需要2次击打）
    const strongGraphics = scene.add.graphics();
    strongGraphics.fillStyle(0x888888, 1);
    strongGraphics.fillRoundedRect(0, 0, width, height, 4);
    strongGraphics.fillStyle(0xffffff, 0.2);
    strongGraphics.fillRoundedRect(2, 2, width - 4, height / 3, 2);
    // 裂纹效果
    strongGraphics.lineStyle(2, 0x666666, 1);
    strongGraphics.lineBetween(width * 0.3, 0, width * 0.5, height);
    strongGraphics.lineBetween(width * 0.7, 0, width * 0.5, height);
    strongGraphics.generateTexture('brick_strong', width, height);
    strongGraphics.destroy();

    // 创建金色砖块纹理（需要3次击打）
    const goldGraphics = scene.add.graphics();
    goldGraphics.fillStyle(0xffd700, 1);
    goldGraphics.fillRoundedRect(0, 0, width, height, 4);
    goldGraphics.fillStyle(0xffffff, 0.4);
    goldGraphics.fillRoundedRect(2, 2, width - 4, height / 3, 2);
    goldGraphics.generateTexture('brick_gold', width, height);
    goldGraphics.destroy();
  }

  /**
   * 创建按钮纹理
   * @param {Phaser.Scene} scene
   */
  static createButtonTexture(scene, key, width, height, color) {
    const graphics = scene.add.graphics();

    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(0, 0, width, height, 25);

    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeRoundedRect(0, 0, width, height, 25);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}
