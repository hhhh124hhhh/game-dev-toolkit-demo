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
    // 创建玩家飞船
    this.createPlayerShip(scene);

    // 创建子弹
    this.createBullet(scene, 'bullet_player', 0x00ffff);
    this.createBullet(scene, 'bullet_enemy', 0xff0000);

    // 创建敌人
    this.createEnemy(scene, 'enemy_basic', 0x00ff00, 24);
    this.createEnemy(scene, 'enemy_medium', 0xffff00, 32);
    this.createEnemy(scene, 'enemy_heavy', 0xff8800, 48);
    this.createEnemy(scene, 'enemy_boss', 0xff00ff, 80);

    // 创建道具
    this.createPowerup(scene, 'powerup_heal', 0x00ff00);      // 绿色 - 治疗
    this.createPowerup(scene, 'powerup_doubleFire', 0xffff00); // 黄色 - 双发
    this.createPowerup(scene, 'powerup_shield', 0x00ffff);     // 青色 - 护盾

    // 创建 UI 元素
    this.createUIElements(scene);

    // 创建背景元素
    this.createBackgroundElements(scene);

    console.log('[PlaceholderFactory] All placeholder textures created');
  }

  /**
   * 创建玩家飞船
   */
  static createPlayerShip(scene) {
    const graphics = scene.add.graphics();
    const size = 40;

    // 飞船主体
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillTriangle(size / 2, 0, 0, size, size, size);

    // 飞船细节
    graphics.fillStyle(0x0066aa, 1);
    graphics.fillTriangle(size / 2, 10, 10, size - 5, size - 10, size - 5);

    // 引擎光效
    graphics.fillStyle(0x00ffff, 0.8);
    graphics.fillRect(size / 2 - 5, size - 5, 10, 5);

    graphics.generateTexture('player_ship', size, size);
    graphics.destroy();
  }

  /**
   * 创建子弹
   */
  static createBullet(scene, key, color) {
    const graphics = scene.add.graphics();
    const size = 12;

    // 发光效果
    graphics.fillStyle(color, 0.3);
    graphics.fillCircle(size / 2, size / 2, size / 2);

    // 主体
    graphics.fillStyle(color, 1);
    graphics.fillCircle(size / 2, size / 2, size / 3);

    // 高光
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(size / 2 - 1, size / 2 - 1, size / 6);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * 创建敌人
   */
  static createEnemy(scene, key, color, size) {
    const graphics = scene.add.graphics();
    const halfSize = size / 2;

    // 发光效果
    graphics.fillStyle(color, 0.2);
    graphics.fillCircle(halfSize, halfSize, halfSize + 2);

    // 主体 - 六边形
    graphics.fillStyle(color, 1);
    graphics.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 2;
      const x = halfSize + Math.cos(angle) * (halfSize - 2);
      const y = halfSize + Math.sin(angle) * (halfSize - 2);
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.closePath();
    graphics.fillPath();

    // 中心
    graphics.fillStyle(0x000000, 0.5);
    graphics.fillCircle(halfSize, halfSize, halfSize / 3);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * 创建道具
   */
  static createPowerup(scene, key, color) {
    const graphics = scene.add.graphics();
    const size = 24;

    // 外圈
    graphics.lineStyle(2, color, 1);
    graphics.strokeCircle(size / 2, size / 2, size / 2 - 2);

    // 内部
    graphics.fillStyle(color, 0.5);
    graphics.fillCircle(size / 2, size / 2, size / 3);

    // 闪光
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(size / 3, size / 3, 3);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * 创建 UI 元素
   */
  static createUIElements(scene) {
    // 生命图标
    const heartGraphics = scene.add.graphics();
    heartGraphics.fillStyle(0xff4444, 1);
    heartGraphics.fillCircle(8, 10, 6);
    heartGraphics.fillCircle(18, 10, 6);
    heartGraphics.fillTriangle(2, 12, 24, 12, 13, 24);
    heartGraphics.generateTexture('icon_heart', 26, 26);
    heartGraphics.destroy();

    // 星星（分数）
    const starGraphics = scene.add.graphics();
    starGraphics.fillStyle(0xffff00, 1);
    this.drawStar(starGraphics, 12, 12, 5, 12, 6);
    starGraphics.generateTexture('icon_star', 24, 24);
    starGraphics.destroy();

    // 按钮背景
    const buttonGraphics = scene.add.graphics();
    buttonGraphics.fillStyle(0x0066cc, 1);
    buttonGraphics.fillRoundedRect(0, 0, 200, 50, 8);
    buttonGraphics.lineStyle(2, 0x0088ff, 1);
    buttonGraphics.strokeRoundedRect(0, 0, 200, 50, 8);
    buttonGraphics.generateTexture('button', 200, 50);
    buttonGraphics.destroy();
  }

  /**
   * 创建背景元素
   */
  static createBackgroundElements(scene) {
    // 星星背景
    const starBg = scene.add.graphics();
    starBg.fillStyle(0xffffff, 1);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 2;
      const y = Math.random() * 2;
      starBg.fillCircle(x, y, 1);
    }
    starBg.generateTexture('star', 4, 4);
    starBg.destroy();

    // 爆炸粒子
    const explosionGraphics = scene.add.graphics();
    explosionGraphics.fillStyle(0xff8800, 1);
    explosionGraphics.fillCircle(8, 8, 8);
    explosionGraphics.fillStyle(0xffff00, 0.8);
    explosionGraphics.fillCircle(8, 8, 5);
    explosionGraphics.fillStyle(0xffffff, 0.6);
    explosionGraphics.fillCircle(8, 8, 3);
    explosionGraphics.generateTexture('explosion', 16, 16);
    explosionGraphics.destroy();
  }

  /**
   * 绘制星星形状
   */
  static drawStar(graphics, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    graphics.beginPath();
    graphics.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      graphics.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      graphics.lineTo(x, y);
      rot += step;
    }

    graphics.lineTo(cx, cy - outerRadius);
    graphics.closePath();
    graphics.fillPath();
  }
}
