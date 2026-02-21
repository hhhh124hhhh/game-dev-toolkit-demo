/**
 * PlaceholderFactory - Phaser Graphics 占位符生成器
 *
 * 在游戏开发初期使用程序化生成的几何图形作为占位符，
 * 后期可通过素材替换脚本替换为真实素材。
 *
 * 使用方式:
 * 1. 在 BootScene 中调用 PlaceholderFactory.createAll(scene)
 * 2. 游戏运行时使用占位符纹理
 * 3. 素材准备好后，运行 asset_replacer.py 替换
 */

export class PlaceholderFactory {
  /**
   * 创建所有占位符纹理
   * @param {Phaser.Scene} scene - Phaser 场景
   * @param {Object} config - 自定义配置（可选）
   */
  static createAll(scene, config = {}) {
    const defaultConfig = {
      player: { color: 0x00ff88, size: 32 },
      platform: { color: 0x444444, width: 128, height: 16 },
      platformBounce: { color: 0x00ff00, width: 128, height: 16 },
      platformMoving: { color: 0xff00ff, width: 128, height: 16 },
      platformFragile: { color: 0xff8800, width: 128, height: 16 },
      platformTeleport: { color: 0xff0088, width: 128, height: 16 },
      platformIce: { color: 0x00ffff, width: 128, height: 16 },
      platformVanish: { color: 0xffff00, width: 128, height: 16 },
      coin: { color: 0xffd700, size: 24 },
      heart: { color: 0xff4444, size: 24 },
      powerup: { color: 0x00ff00, size: 28 },
      powerupJump: { color: 0x0088ff, size: 28 },
      powerupFly: { color: 0x8800ff, size: 28 },
      powerupShield: { color: 0xffcc00, size: 28 },
      powerupSpeed: { color: 0xff0000, size: 28 },
      enemy: { color: 0xff0000, size: 32 },
      slime: { color: 0x44ff44, width: 32, height: 24 },
      flyer: { color: 0xff44ff, width: 32, height: 28 },
      boss: { color: 0xff4400, width: 64, height: 80 },
      particle: { color: 0xffffff, size: 4 },
      ...config
    };

    // 创建玩家占位符（静态）
    this.createCircle(scene, 'player', defaultConfig.player.size, defaultConfig.player.color);

    // 创建玩家动画精灵图占位符（4帧水平排列）
    this.createPlayerAnimationSprites(scene, defaultConfig.player);

    // 创建平台占位符
    this.createRoundedRect(scene, 'platform', defaultConfig.platform.width, defaultConfig.platform.height, defaultConfig.platform.color);
    this.createRoundedRect(scene, 'platform_bounce', defaultConfig.platformBounce.width, defaultConfig.platformBounce.height, defaultConfig.platformBounce.color);
    this.createRoundedRect(scene, 'platform_moving', defaultConfig.platformMoving.width, defaultConfig.platformMoving.height, defaultConfig.platformMoving.color);
    this.createRoundedRect(scene, 'platform_fragile', defaultConfig.platformFragile.width, defaultConfig.platformFragile.height, defaultConfig.platformFragile.color);
    this.createRoundedRect(scene, 'platform_teleport', defaultConfig.platformTeleport.width, defaultConfig.platformTeleport.height, defaultConfig.platformTeleport.color);
    this.createRoundedRect(scene, 'platform_ice', defaultConfig.platformIce.width, defaultConfig.platformIce.height, defaultConfig.platformIce.color);
    this.createRoundedRect(scene, 'platform_vanish', defaultConfig.platformVanish.width, defaultConfig.platformVanish.height, defaultConfig.platformVanish.color);

    // 创建收集物占位符
    this.createCircle(scene, 'coin', defaultConfig.coin.size, defaultConfig.coin.color);
    this.createHeart(scene, 'heart', defaultConfig.heart.size, defaultConfig.heart.color);
    this.createCircle(scene, 'powerup', defaultConfig.powerup.size, defaultConfig.powerup.color);
    this.createCircle(scene, 'powerup_jump', defaultConfig.powerupJump.size, defaultConfig.powerupJump.color);
    this.createCircle(scene, 'powerup_fly', defaultConfig.powerupFly.size, defaultConfig.powerupFly.color);
    this.createCircle(scene, 'powerup_shield', defaultConfig.powerupShield.size, defaultConfig.powerupShield.color);
    this.createCircle(scene, 'powerup_speed', defaultConfig.powerupSpeed.size, defaultConfig.powerupSpeed.color);

    // 创建敌人占位符
    this.createSlime(scene, 'slime', defaultConfig.slime.width, defaultConfig.slime.height, defaultConfig.slime.color);
    this.createFlyer(scene, 'flyer', defaultConfig.flyer.width, defaultConfig.flyer.height, defaultConfig.flyer.color);
    this.createBoss(scene, 'boss', defaultConfig.boss.width, defaultConfig.boss.height, defaultConfig.boss.color);
    this.createTriangle(scene, 'enemy', defaultConfig.enemy.size, defaultConfig.enemy.color);
    this.createTriangle(scene, 'enemy', defaultConfig.enemy.size, defaultConfig.enemy.color);

    // 创建粒子占位符
    this.createSquare(scene, 'particle', defaultConfig.particle.size, defaultConfig.particle.color);

    // 创建背景纹理
    this.createBackgrounds(scene);

    // 创建 UI 元素占位符
    this.createUIElements(scene, defaultConfig);

    console.log('[PlaceholderFactory] All placeholder textures created');
  }

  /**
   * 创建玩家动画精灵图占位符
   * 为 idle, walk, jump, attack 创建 4 帧动画精灵图
   */
  static createPlayerAnimationSprites(scene, config) {
    const animations = [
      { key: 'player_idle', color: config.color, motionType: 'bounce' },
      { key: 'player_walk', color: config.color, motionType: 'walk' },
      { key: 'player_jump', color: config.color, motionType: 'jump' },
      { key: 'player_attack', color: 0xffaa00, motionType: 'attack' }
    ];

    const frameSize = 64;  // 纹理帧尺寸保持 64x64
    const frameCount = 4;
    const playerRadius = 20;  // 角色实际半径缩小到 20px（直径 40px）

    animations.forEach(anim => {
      const graphics = scene.add.graphics();
      const totalWidth = frameSize * frameCount;

      for (let i = 0; i < frameCount; i++) {
        const x = i * frameSize + frameSize / 2;
        const y = frameSize / 2;

        // 根据动画类型调整位置和效果
        let yOffset = 0;
        let scale = 1;

        switch (anim.motionType) {
          case 'bounce':
            yOffset = Math.sin(i * Math.PI / 2) * 3;
            break;
          case 'walk':
            yOffset = Math.abs(Math.sin(i * Math.PI / 2)) * 2;
            break;
          case 'jump':
            yOffset = -i * 4;
            scale = 1 - i * 0.03;
            break;
          case 'attack':
            yOffset = (i === 1 || i === 2) ? 2 : 0;
            break;
        }

        // 绘制发光效果
        graphics.fillStyle(anim.color, 0.3);
        graphics.fillCircle(x, y + yOffset, playerRadius * scale + 3);

        // 绘制主体圆
        graphics.fillStyle(anim.color, 1);
        graphics.fillCircle(x, y + yOffset, playerRadius * scale);

        // 绘制高光
        graphics.fillStyle(0xffffff, 0.5);
        graphics.fillCircle(
          x - playerRadius * 0.3 * scale,
          y + yOffset - playerRadius * 0.3 * scale,
          playerRadius * 0.25 * scale
        );

        // 绘制眼睛（方向指示）
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(x + 5, y + yOffset - 3, 3);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(x + 6, y + yOffset - 4, 1.5);

        // 攻击动画额外效果：武器指示
        if (anim.motionType === 'attack' && i > 0 && i < 3) {
          graphics.fillStyle(0xffcc00, 1);
          graphics.fillRect(x + playerRadius - 2, y + yOffset - 3, 12, 6);
        }
      }

      // 生成纹理
      graphics.generateTexture(anim.key, totalWidth, frameSize);
      graphics.destroy();

      // 添加帧数据到纹理（关键！）
      const texture = scene.textures.get(anim.key);
      if (texture) {
        for (let i = 0; i < frameCount; i++) {
          texture.add(i, 0, i * frameSize, 0, frameSize, frameSize);
        }
      }

      console.log(`[PlaceholderFactory] Created animation spritesheet: ${anim.key}`);
    });
  }

  /**
   * 创建圆形占位符
   */
  static createCircle(scene, key, size, color) {
    const graphics = scene.add.graphics();
    const radius = size / 2;

    // 绘制发光效果
    graphics.fillStyle(color, 0.3);
    graphics.fillCircle(radius, radius, radius + 4);

    // 绘制主圆
    graphics.fillStyle(color, 1);
    graphics.fillCircle(radius, radius, radius);

    // 绘制高光
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(radius - radius * 0.3, radius - radius * 0.3, radius * 0.3);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * 创建圆角矩形占位符
   */
  static createRoundedRect(scene, key, width, height, color) {
    const graphics = scene.add.graphics();
    const radius = 4;

    // 绘制边框发光
    graphics.lineStyle(2, color, 0.5);
    graphics.strokeRoundedRect(1, 1, width - 2, height - 2, radius);

    // 绘制填充
    graphics.fillStyle(color, 0.8);
    graphics.fillRoundedRect(0, 0, width, height, radius);

    // 绘制高光
    graphics.fillStyle(0xffffff, 0.2);
    graphics.fillRoundedRect(2, 2, width - 4, height / 3, radius - 1);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * 创建三角形占位符（敌人）
   */
  static createTriangle(scene, key, size, color) {
    const graphics = scene.add.graphics();

    graphics.fillStyle(color, 1);
    graphics.fillTriangle(
      size / 2, 0,
      0, size,
      size, size
    );

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * 创建史莱姆占位符（半圆形）
   */
  static createSlime(scene, key, width, height, color) {
    const graphics = scene.add.graphics();

    // Body (half ellipse)
    graphics.fillStyle(color, 1);
    graphics.fillEllipse(width / 2, height, width, height * 2);

    // Eyes
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(width * 0.35, height * 0.6, 3);
    graphics.fillCircle(width * 0.65, height * 0.6, 3);

    // Eye highlights
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(width * 0.35 + 1, height * 0.6 - 1, 1);
    graphics.fillCircle(width * 0.65 + 1, height * 0.6 - 1, 1);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * 创建飞行怪占位符（蝙蝠形）
   */
  static createFlyer(scene, key, width, height, color) {
    const graphics = scene.add.graphics();

    // Body
    graphics.fillStyle(color, 1);
    graphics.fillEllipse(width / 2, height / 2, width * 0.5, height * 0.4);

    // Wings
    graphics.fillStyle(color, 0.8);
    // Left wing
    graphics.fillTriangle(
      0, height / 2,
      width * 0.3, height * 0.3,
      width * 0.3, height * 0.7
    );
    // Right wing
    graphics.fillTriangle(
      width, height / 2,
      width * 0.7, height * 0.3,
      width * 0.7, height * 0.7
    );

    // Eyes
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(width * 0.4, height * 0.4, 2);
    graphics.fillCircle(width * 0.6, height * 0.4, 2);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * 创建Boss占位符（大型怪物）
   */
  static createBoss(scene, key, width, height, color) {
    const graphics = scene.add.graphics();

    // Body
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(width * 0.2, height * 0.3, width * 0.6, height * 0.6, 10);

    // Head
    graphics.fillStyle(color, 1);
    graphics.fillCircle(width / 2, height * 0.25, width * 0.3);

    // Horns
    graphics.fillStyle(color * 0.8, 1);
    graphics.fillTriangle(
      width * 0.3, height * 0.15,
      width * 0.2, 0,
      width * 0.4, height * 0.15
    );
    graphics.fillTriangle(
      width * 0.7, height * 0.15,
      width * 0.8, 0,
      width * 0.6, height * 0.15
    );

    // Eyes (angry)
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(width * 0.3, height * 0.2, width * 0.15, 5);
    graphics.fillRect(width * 0.55, height * 0.2, width * 0.15, 5);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * 创建心形占位符
   */
  static createHeart(scene, key, size, color) {
    const graphics = scene.add.graphics();
    const centerX = size / 2;
    const centerY = size / 2;

    // Draw heart shape using two circles and a triangle
    graphics.fillStyle(color, 1);

    // Left circle
    graphics.fillCircle(centerX - size * 0.15, centerY - size * 0.1, size * 0.25);
    // Right circle
    graphics.fillCircle(centerX + size * 0.15, centerY - size * 0.1, size * 0.25);
    // Bottom triangle
    graphics.fillTriangle(
      centerX - size * 0.35, centerY,
      centerX + size * 0.35, centerY,
      centerX, centerY + size * 0.4
    );

    // Highlight
    graphics.fillStyle(0xffffff, 0.4);
    graphics.fillCircle(centerX - size * 0.2, centerY - size * 0.15, size * 0.1);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * 创建正方形占位符
   */
  static createSquare(scene, key, size, color) {
    const graphics = scene.add.graphics();

    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, size, size);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * 创建背景纹理
   */
  static createBackgrounds(scene) {
    const width = 800;
    const height = 480;

    // bg-far: 远景背景（深蓝渐变）
    const bgFar = scene.add.graphics();
    bgFar.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bgFar.fillRect(0, 0, width, height);
    // 添加一些星星点
    bgFar.fillStyle(0xffffff, 0.3);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      bgFar.fillCircle(x, y, 1);
    }
    bgFar.generateTexture('bg-far', width, height);
    bgFar.destroy();

    // bg-near: 近景背景（稍亮的渐变）
    const bgNear = scene.add.graphics();
    bgNear.fillGradientStyle(0x16213e, 0x16213e, 0x0f3460, 0x0f3460, 1);
    bgNear.fillRect(0, 0, width, height);
    // 添加一些更大的星星
    bgNear.fillStyle(0xffffff, 0.2);
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      bgNear.fillCircle(x, y, 2);
    }
    bgNear.generateTexture('bg-near', width, height);
    bgNear.destroy();

    console.log('[PlaceholderFactory] Created background textures');
  }

  /**
   * 创建 UI 元素占位符
   */
  static createUIElements(scene, config) {
    // 按钮占位符
    const buttonGraphics = scene.add.graphics();
    buttonGraphics.fillStyle(0x0066cc, 1);
    buttonGraphics.fillRoundedRect(0, 0, 200, 50, 8);
    buttonGraphics.lineStyle(2, 0x0088ff, 1);
    buttonGraphics.strokeRoundedRect(0, 0, 200, 50, 8);
    buttonGraphics.generateTexture('button', 200, 50);
    buttonGraphics.destroy();

    // 进度条背景
    const progressBgGraphics = scene.add.graphics();
    progressBgGraphics.fillStyle(0x333333, 1);
    progressBgGraphics.fillRoundedRect(0, 0, 200, 20, 4);
    progressBgGraphics.generateTexture('progress_bg', 200, 20);
    progressBgGraphics.destroy();

    // 进度条填充
    const progressFillGraphics = scene.add.graphics();
    progressFillGraphics.fillStyle(0x00ff88, 1);
    progressFillGraphics.fillRoundedRect(0, 0, 196, 16, 3);
    progressFillGraphics.generateTexture('progress_fill', 196, 16);
    progressFillGraphics.destroy();

    // 图标占位符
    const iconPlaceholders = ['heart', 'star', 'settings', 'pause', 'play'];
    iconPlaceholders.forEach(name => {
      const iconGraphics = scene.add.graphics();
      iconGraphics.fillStyle(0xffffff, 1);
      iconGraphics.fillCircle(16, 16, 12);
      iconGraphics.generateTexture(`icon_${name}`, 32, 32);
      iconGraphics.destroy();
    });
  }

  /**
   * 创建动态粒子纹理
   */
  static createParticleTexture(scene, key, color, size = 8) {
    const graphics = scene.add.graphics();

    // 柔和的粒子
    graphics.fillStyle(color, 0.8);
    graphics.fillCircle(size / 2, size / 2, size / 2);
    graphics.fillStyle(0xffffff, 0.4);
    graphics.fillCircle(size / 2 - 1, size / 2 - 1, size / 4);

    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  /**
   * 根据配置批量创建自定义占位符
   * @param {Phaser.Scene} scene
   * @param {Array} placeholders - 占位符配置数组
   */
  static createFromManifest(scene, placeholders) {
    placeholders.forEach(p => {
      switch (p.shape) {
        case 'circle':
          this.createCircle(scene, p.id, p.size || 32, p.color || 0xffffff);
          break;
        case 'rounded_rect':
        case 'rect':
          this.createRoundedRect(scene, p.id, p.width || 64, p.height || 16, p.color || 0x444444);
          break;
        case 'triangle':
          this.createTriangle(scene, p.id, p.size || 32, p.color || 0xff0000);
          break;
        case 'square':
          this.createSquare(scene, p.id, p.size || 16, p.color || 0xffffff);
          break;
        default:
          console.warn(`[PlaceholderFactory] Unknown shape: ${p.shape}`);
      }
    });
  }
}

export default PlaceholderFactory;
