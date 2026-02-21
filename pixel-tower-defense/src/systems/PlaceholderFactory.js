/**
 * PlaceholderFactory - Phaser Graphics 占位符生成器
 *
 * 在游戏开发初期使用程序化生成的几何图形作为占位符，
 * 后期可通过素材替换脚本替换为真实素材。
 */

export class PlaceholderFactory {
  /**
   * 创建所有占位符纹理
   * @param {Phaser.Scene} scene - Phaser 场景
   */
  static createAll(scene) {
    // 创建塔占位符
    this.createTower(scene, 'tower_arrow', 0x00ff88, 32);
    this.createTower(scene, 'tower_mage', 0x8800ff, 32);
    this.createTower(scene, 'tower_cannon', 0xff8800, 40);
    this.createTower(scene, 'tower_slow', 0x00ffff, 32);

    // 创建敌人占位符
    this.createEnemy(scene, 'enemy_basic', 0xff0000, 24);
    this.createEnemy(scene, 'enemy_fast', 0xffff00, 20);
    this.createEnemy(scene, 'enemy_tank', 0x880000, 40);
    this.createEnemy(scene, 'enemy_boss', 0xff00ff, 64);

    // 创建弹道占位符
    this.createProjectile(scene, 'projectile_arrow', 0x00ff88, 8);
    this.createProjectile(scene, 'projectile_magic', 0x8800ff, 12);
    this.createProjectile(scene, 'projectile_cannon', 0xff8800, 16);

    // 创建 UI 元素
    this.createUIElements(scene);

    // 创建地图元素
    this.createMapElements(scene);

    console.log('[PlaceholderFactory] All placeholder textures created');
  }

  /**
   * 创建塔占位符
   */
  static createTower(scene, key, color, size) {
    const graphics = scene.add.graphics();
    const halfSize = size / 2;

    // 底座
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(2, size - 8, size - 4, 8);

    // 塔身
    graphics.fillStyle(color, 1);
    graphics.fillRect(halfSize - 6, 4, 12, size - 12);

    // 塔顶
    graphics.fillStyle(color, 0.8);
    graphics.fillTriangle(
      halfSize, 0,
      halfSize - 10, 12,
      halfSize + 10, 12
    );

    // 高光
    graphics.fillStyle(0xffffff, 0.3);
    graphics.fillRect(halfSize - 4, 8, 4, size - 20);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * 创建敌人占位符
   */
  static createEnemy(scene, key, color, size) {
    const graphics = scene.add.graphics();
    const halfSize = size / 2;
    const radius = size / 2 - 2;

    // 发光效果
    graphics.fillStyle(color, 0.3);
    graphics.fillCircle(halfSize, halfSize, radius + 4);

    // 主体
    graphics.fillStyle(color, 1);
    graphics.fillCircle(halfSize, halfSize, radius);

    // 眼睛
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(halfSize - radius * 0.3, halfSize - radius * 0.2, radius * 0.25);
    graphics.fillCircle(halfSize + radius * 0.3, halfSize - radius * 0.2, radius * 0.25);

    // 瞳孔
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(halfSize - radius * 0.3 + 2, halfSize - radius * 0.2, radius * 0.12);
    graphics.fillCircle(halfSize + radius * 0.3 + 2, halfSize - radius * 0.2, radius * 0.12);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * 创建弹道占位符
   */
  static createProjectile(scene, key, color, size) {
    const graphics = scene.add.graphics();
    const halfSize = size / 2;

    // 发光
    graphics.fillStyle(color, 0.5);
    graphics.fillCircle(halfSize, halfSize, halfSize + 2);

    // 主体
    graphics.fillStyle(color, 1);
    graphics.fillCircle(halfSize, halfSize, halfSize);

    // 高光
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(halfSize - 1, halfSize - 1, halfSize * 0.4);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * 创建 UI 元素
   */
  static createUIElements(scene) {
    // 按钮占位符
    const buttonGraphics = scene.add.graphics();
    buttonGraphics.fillStyle(0x0066cc, 1);
    buttonGraphics.fillRoundedRect(0, 0, 200, 50, 8);
    buttonGraphics.lineStyle(2, 0x0088ff, 1);
    buttonGraphics.strokeRoundedRect(0, 0, 200, 50, 8);
    buttonGraphics.generateTexture('button', 200, 50);
    buttonGraphics.destroy();

    // 金币图标
    const coinGraphics = scene.add.graphics();
    coinGraphics.fillStyle(0xffd700, 1);
    coinGraphics.fillCircle(16, 16, 12);
    coinGraphics.fillStyle(0xffff00, 0.5);
    coinGraphics.fillCircle(13, 13, 6);
    coinGraphics.generateTexture('icon_gold', 32, 32);
    coinGraphics.destroy();

    // 生命图标
    const heartGraphics = scene.add.graphics();
    heartGraphics.fillStyle(0xff4444, 1);
    heartGraphics.fillCircle(8, 12, 8);
    heartGraphics.fillCircle(24, 12, 8);
    heartGraphics.fillTriangle(0, 14, 32, 14, 16, 32);
    heartGraphics.generateTexture('icon_heart', 32, 32);
    heartGraphics.destroy();

    // 波次横幅
    const bannerGraphics = scene.add.graphics();
    bannerGraphics.fillStyle(0x333366, 1);
    bannerGraphics.fillRoundedRect(0, 0, 200, 40, 6);
    bannerGraphics.lineStyle(2, 0x6666aa, 1);
    bannerGraphics.strokeRoundedRect(0, 0, 200, 40, 6);
    bannerGraphics.generateTexture('banner_wave', 200, 40);
    bannerGraphics.destroy();

    // 塔选择按钮
    const towerButtonGraphics = scene.add.graphics();
    towerButtonGraphics.fillStyle(0x444466, 1);
    towerButtonGraphics.fillRoundedRect(0, 0, 60, 60, 6);
    towerButtonGraphics.lineStyle(2, 0x6666aa, 1);
    towerButtonGraphics.strokeRoundedRect(0, 0, 60, 60, 6);
    towerButtonGraphics.generateTexture('tower_button', 60, 60);
    towerButtonGraphics.destroy();
  }

  /**
   * 创建地图元素
   */
  static createMapElements(scene) {
    // 路径格子
    const pathGraphics = scene.add.graphics();
    pathGraphics.fillStyle(0x664422, 1);
    pathGraphics.fillRoundedRect(0, 0, 40, 40, 4);
    pathGraphics.lineStyle(2, 0x886644, 1);
    pathGraphics.strokeRoundedRect(0, 0, 40, 40, 4);
    pathGraphics.generateTexture('path_cell', 40, 40);
    pathGraphics.destroy();

    // 普通格子（可建塔）
    const grassGraphics = scene.add.graphics();
    grassGraphics.fillStyle(0x228822, 1);
    grassGraphics.fillRoundedRect(0, 0, 40, 40, 4);
    grassGraphics.lineStyle(1, 0x44aa44, 0.5);
    grassGraphics.strokeRoundedRect(0, 0, 40, 40, 4);
    grassGraphics.generateTexture('grass_cell', 40, 40);
    grassGraphics.destroy();

    // 起点标记
    const startGraphics = scene.add.graphics();
    startGraphics.fillStyle(0x00ff00, 0.3);
    startGraphics.fillRoundedRect(0, 0, 40, 40, 4);
    startGraphics.lineStyle(3, 0x00ff00, 1);
    startGraphics.strokeRoundedRect(0, 0, 40, 40, 4);
    startGraphics.fillStyle(0x00ff00, 1);
    startGraphics.fillTriangle(15, 10, 15, 30, 35, 20);
    startGraphics.generateTexture('start_cell', 40, 40);
    startGraphics.destroy();

    // 终点标记
    const endGraphics = scene.add.graphics();
    endGraphics.fillStyle(0xff0000, 0.3);
    endGraphics.fillRoundedRect(0, 0, 40, 40, 4);
    endGraphics.lineStyle(3, 0xff0000, 1);
    endGraphics.strokeRoundedRect(0, 0, 40, 40, 4);
    endGraphics.fillStyle(0xff0000, 1);
    endGraphics.fillRoundedRect(10, 10, 20, 20, 4);
    endGraphics.generateTexture('end_cell', 40, 40);
    endGraphics.destroy();
  }
}
