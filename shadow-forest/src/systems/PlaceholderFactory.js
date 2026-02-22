/**
 * PlaceholderFactory 程序化素材生成器
 * 《暗影森林》Shadow Forest
 */

export class PlaceholderFactory {
  /**
   * 创建玩家纹理
   */
  static createPlayerTexture(scene, key = 'player') {
    const graphics = scene.add.graphics();

    // 像素风角色 32x48
    // 身体 - 蓝色衣服
    graphics.fillStyle(0x3498db);
    graphics.fillRect(8, 16, 16, 24);

    // 头部 - 黄色皮肤
    graphics.fillStyle(0xf1c40f);
    graphics.fillRect(12, 4, 8, 12);

    // 头发 - 深色
    graphics.fillStyle(0x2c3e50);
    graphics.fillRect(10, 0, 12, 8);

    // 眼睛
    graphics.fillStyle(0x2c3e50);
    graphics.fillRect(13, 8, 2, 2);
    graphics.fillRect(17, 8, 2, 2);

    // 腿部
    graphics.fillStyle(0x2c3e50);
    graphics.fillRect(10, 40, 5, 8);
    graphics.fillRect(17, 40, 5, 8);

    // 生成纹理
    graphics.generateTexture(key, 32, 48);
    graphics.destroy();
  }

  /**
   * 创建敌人纹理
   */
  static createEnemyTexture(scene, key = 'enemy') {
    const graphics = scene.add.graphics();

    // 像素风敌人 32x32
    // 身体 - 红色
    graphics.fillStyle(0xe74c3c);
    graphics.fillRect(4, 8, 24, 20);

    // 眼睛 - 深红
    graphics.fillStyle(0xc0392b);
    graphics.fillRect(8, 12, 6, 6);
    graphics.fillRect(18, 12, 6, 6);

    // 眼珠
    graphics.fillStyle(0x000000);
    graphics.fillRect(10, 14, 2, 2);
    graphics.fillRect(20, 14, 2, 2);

    // 嘴巴
    graphics.fillStyle(0x000000);
    graphics.fillRect(12, 22, 8, 2);

    // 角
    graphics.fillStyle(0x8b0000);
    graphics.fillRect(6, 4, 4, 6);
    graphics.fillRect(22, 4, 4, 6);

    graphics.generateTexture(key, 32, 32);
    graphics.destroy();
  }

  /**
   * 创建地形纹理
   */
  static createGroundTexture(scene, key = 'ground') {
    const graphics = scene.add.graphics();

    // 地面 - 深绿色
    graphics.fillStyle(0x27ae60);
    graphics.fillRect(0, 0, 32, 32);

    // 草地纹理
    graphics.fillStyle(0x2ecc71);
    graphics.fillRect(0, 0, 32, 8);

    // 添加一些纹理细节
    graphics.fillStyle(0x229954);
    graphics.fillRect(4, 12, 4, 4);
    graphics.fillRect(16, 20, 6, 4);
    graphics.fillRect(8, 24, 4, 4);

    graphics.generateTexture(key, 32, 32);
    graphics.destroy();
  }

  /**
   * 创建平台纹理
   */
  static createPlatformTexture(scene, key = 'platform') {
    const graphics = scene.add.graphics();

    // 石头平台
    graphics.fillStyle(0x7f8c8d);
    graphics.fillRect(0, 8, 64, 24);

    // 顶部高光
    graphics.fillStyle(0x95a5a6);
    graphics.fillRect(0, 8, 64, 4);

    // 裂缝
    graphics.fillStyle(0x5d6d7e);
    graphics.fillRect(10, 12, 2, 16);
    graphics.fillRect(30, 16, 2, 12);
    graphics.fillRect(50, 14, 2, 14);

    graphics.generateTexture(key, 64, 32);
    graphics.destroy();
  }

  /**
   * 创建 UI 纹理
   */
  static createUITextures(scene) {
    // 血条背景
    this.createBarTexture(scene, 'bar-bg', 0x1a1a1a, 200, 20);

    // 血条填充
    this.createBarTexture(scene, 'health-fill', 0xe74c3c, 196, 16);

    // 魔法条填充
    this.createBarTexture(scene, 'mana-fill', 0x3498db, 196, 16);

    // 经验条填充
    this.createBarTexture(scene, 'exp-fill', 0xf1c40f, 196, 16);

    // 技能槽
    this.createSkillSlotTexture(scene, 'skill-slot', 64, 64);

    // 技能冷却遮罩
    this.createCooldownMask(scene, 'cooldown-mask', 60, 60);
  }

  /**
   * 创建条形纹理
   */
  static createBarTexture(scene, key, color, width, height) {
    const graphics = scene.add.graphics();

    graphics.fillStyle(color);
    graphics.fillRoundedRect(0, 0, width, height, 4);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * 创建技能槽纹理
   */
  static createSkillSlotTexture(scene, key, width, height) {
    const graphics = scene.add.graphics();

    // 背景
    graphics.fillStyle(0x1a1a1a);
    graphics.fillRoundedRect(0, 0, width, height, 8);

    // 边框
    graphics.lineStyle(2, 0xffd700);
    graphics.strokeRoundedRect(1, 1, width - 2, height - 2, 8);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * 创建冷却遮罩
   */
  static createCooldownMask(scene, key, width, height) {
    const graphics = scene.add.graphics();

    graphics.fillStyle(0x000000, 0.7);
    graphics.fillRoundedRect(0, 0, width, height, 6);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * 创建按钮纹理
   */
  static createButtonTextures(scene) {
    // 普通按钮
    this.createButtonTexture(scene, 'button', 0x3498db, 120, 40);

    // 悬停按钮
    this.createButtonTexture(scene, 'button-hover', 0x2980b9, 120, 40);

    // 主要按钮
    this.createButtonTexture(scene, 'button-primary', 0xe74c3c, 120, 40);

    // 金色按钮
    this.createButtonTexture(scene, 'button-gold', 0xffd700, 120, 40);
  }

  /**
   * 创建按钮纹理
   */
  static createButtonTexture(scene, key, color, width, height) {
    const graphics = scene.add.graphics();

    // 背景
    graphics.fillStyle(color);
    graphics.fillRoundedRect(0, 0, width, height, 8);

    // 高光
    graphics.fillStyle(0xffffff, 0.2);
    graphics.fillRoundedRect(2, 2, width - 4, height / 2 - 2, 6);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * 创建背景纹理
   */
  static createBackgroundTexture(scene, key = 'background') {
    const graphics = scene.add.graphics();

    // 渐变背景
    for (let y = 0; y < 600; y++) {
      const ratio = y / 600;
      const r = Math.floor(26 + ratio * 10);
      const g = Math.floor(26 + ratio * 10);
      const b = Math.floor(46 + ratio * 20);
      graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      graphics.fillRect(0, y, 800, 1);
    }

    // 添加星星
    graphics.fillStyle(0xffffff);
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const size = Phaser.Math.Between(1, 3);
      graphics.fillRect(x, y, size, size);
    }

    graphics.generateTexture(key, 800, 600);
    graphics.destroy();
  }

  /**
   * 创建所有素材
   */
  static createAllTextures(scene) {
    this.createPlayerTexture(scene);
    this.createEnemyTexture(scene);
    this.createGroundTexture(scene);
    this.createPlatformTexture(scene);
    this.createUITextures(scene);
    this.createButtonTextures(scene);
    this.createBackgroundTexture(scene);
  }
}
