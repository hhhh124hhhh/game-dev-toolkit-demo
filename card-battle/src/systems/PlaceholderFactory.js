/**
 * PlaceholderFactory - Phaser Graphics 占位符生成器
 * Extended for Card Battle game with card texture generation
 */

import { CardDesign, CardType, Rarity } from '../config.js';

export class PlaceholderFactory {
  /**
   * 创建所有占位符纹理
   */
  static createAll(scene) {
    // Create card textures
    this.createCardTextures(scene);

    // Create UI textures
    this.createUITextures(scene);

    // Create character textures
    this.createCharacterTextures(scene);

    console.log('[PlaceholderFactory] All card battle textures created');
  }

  /**
   * 创建卡牌纹理
   */
  static createCardTextures(scene) {
    const cardTypes = Object.values(CardType);
    const rarities = Object.values(Rarity);

    // Create card textures for each type and rarity
    cardTypes.forEach(type => {
      rarities.forEach(rarity => {
        this.createCardTexture(scene, type, rarity);
      });
    });

    // Create card back texture
    this.createCardBackTexture(scene);

    // Create deck and discard pile textures
    this.createDeckTexture(scene);
    this.createDiscardTexture(scene);
  }

  /**
   * 创建单张卡牌纹理
   */
  static createCardTexture(scene, type, rarity) {
    const { size, frame, colors } = CardDesign;
    const graphics = scene.add.graphics();
    const colorSet = colors[rarity] || colors.common;

    // Card background
    const bgColor = this.hexToNumber(colorSet.bg);
    graphics.fillStyle(bgColor, 1);
    graphics.fillRoundedRect(0, 0, size.width, size.height, frame.cornerRadius);

    // Card frame/border
    const frameColor = this.hexToNumber(colorSet.frame);
    graphics.lineStyle(frame.borderWidth, frameColor, 1);
    graphics.strokeRoundedRect(0, 0, size.width, size.height, frame.cornerRadius);

    // Cost circle (top-left)
    graphics.fillStyle(0xff4757, 1);
    graphics.fillCircle(CardDesign.cost.x, CardDesign.cost.y, CardDesign.cost.radius);
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeCircle(CardDesign.cost.x, CardDesign.cost.y, CardDesign.cost.radius);

    // Card art area (center)
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(
      CardDesign.art.x,
      CardDesign.art.y,
      CardDesign.art.width,
      CardDesign.art.height
    );

    // Type icon (center of art area)
    const typeColors = {
      [CardType.ATTACK]: 0xe74c3c,
      [CardType.DEFENSE]: 0x3498db,
      [CardType.SKILL]: 0x2ecc71,
      [CardType.SPECIAL]: 0x9b59b6
    };
    const iconColor = typeColors[type] || 0x666666;
    graphics.fillStyle(iconColor, 1);
    graphics.fillCircle(
      CardDesign.art.x + CardDesign.art.width / 2,
      CardDesign.art.y + CardDesign.art.height / 2,
      25
    );

    // Type symbol
    graphics.fillStyle(0xffffff, 1);
    const symbols = {
      [CardType.ATTACK]: '⚔',
      [CardType.DEFENSE]: '🛡',
      [CardType.SKILL]: '✦',
      [CardType.SPECIAL]: '★'
    };
    // Note: Can't draw text in graphics, this will be handled by sprite

    // Name area (bottom section)
    graphics.fillStyle(0x000000, 0.6);
    graphics.fillRoundedRect(
      10,
      CardDesign.name.y - 15,
      size.width - 20,
      30,
      4
    );

    // Description area
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRoundedRect(
      10,
      CardDesign.description.y - 8,
      size.width - 20,
      CardDesign.description.height,
      4
    );

    // Generate texture
    graphics.generateTexture(`card_${type}_${rarity}`, size.width, size.height);
    graphics.destroy();
  }

  /**
   * 创建卡牌背面纹理
   */
  static createCardBackTexture(scene) {
    const { size, frame } = CardDesign;
    const graphics = scene.add.graphics();

    // Background
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillRoundedRect(0, 0, size.width, size.height, frame.cornerRadius);

    // Border
    graphics.lineStyle(frame.borderWidth, 0xf1c40f, 1);
    graphics.strokeRoundedRect(0, 0, size.width, size.height, frame.cornerRadius);

    // Pattern lines
    graphics.lineStyle(1, 0x34495e, 1);
    for (let i = 0; i < size.width; i += 20) {
      graphics.lineBetween(i, 0, i, size.height);
    }
    for (let i = 0; i < size.height; i += 20) {
      graphics.lineBetween(0, i, size.width, i);
    }

    // Center emblem
    graphics.fillStyle(0xf1c40f, 1);
    graphics.fillCircle(size.width / 2, size.height / 2, 30);
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillCircle(size.width / 2, size.height / 2, 20);

    graphics.generateTexture('card_back', size.width, size.height);
    graphics.destroy();
  }

  /**
   * 创建牌堆纹理
   */
  static createDeckTexture(scene) {
    const graphics = scene.add.graphics();
    const { size } = CardDesign;

    // Stack effect (multiple cards)
    for (let i = 2; i >= 0; i--) {
      graphics.fillStyle(0x2c3e50, 1);
      graphics.fillRoundedRect(i * 2, i * 2, size.width, size.height, 8);
      graphics.lineStyle(2, 0xf1c40f, 0.5);
      graphics.strokeRoundedRect(i * 2, i * 2, size.width, size.height, 8);
    }

    graphics.generateTexture('deck_pile', size.width + 6, size.height + 6);
    graphics.destroy();
  }

  /**
   * 创建弃牌堆纹理
   */
  static createDiscardTexture(scene) {
    const graphics = scene.add.graphics();
    const { size } = CardDesign;

    // Discard pile effect
    graphics.fillStyle(0x444444, 0.8);
    graphics.fillRoundedRect(0, 0, size.width, size.height, 8);
    graphics.lineStyle(2, 0x888888, 1);
    graphics.strokeRoundedRect(0, 0, size.width, size.height, 8);

    graphics.generateTexture('discard_pile', size.width, size.height);
    graphics.destroy();
  }

  /**
   * 创建 UI 纹理
   */
  static createUITextures(scene) {
    // Button
    const buttonGraphics = scene.add.graphics();
    buttonGraphics.fillStyle(0x0066cc, 1);
    buttonGraphics.fillRoundedRect(0, 0, 150, 45, 8);
    buttonGraphics.lineStyle(2, 0x0088ff, 1);
    buttonGraphics.strokeRoundedRect(0, 0, 150, 45, 8);
    buttonGraphics.generateTexture('button', 150, 45);
    buttonGraphics.destroy();

    // Energy orb
    const energyGraphics = scene.add.graphics();
    energyGraphics.fillStyle(0x00ff88, 0.3);
    energyGraphics.fillCircle(25, 25, 25);
    energyGraphics.fillStyle(0x00ff88, 1);
    energyGraphics.fillCircle(25, 25, 20);
    energyGraphics.fillStyle(0xffffff, 0.3);
    energyGraphics.fillCircle(20, 20, 8);
    energyGraphics.generateTexture('energy_orb', 50, 50);
    energyGraphics.destroy();

    // Health bar background
    const healthBgGraphics = scene.add.graphics();
    healthBgGraphics.fillStyle(0x333333, 1);
    healthBgGraphics.fillRoundedRect(0, 0, 200, 20, 4);
    healthBgGraphics.lineStyle(1, 0x666666, 1);
    healthBgGraphics.strokeRoundedRect(0, 0, 200, 20, 4);
    healthBgGraphics.generateTexture('health_bar_bg', 200, 20);
    healthBgGraphics.destroy();

    // Health bar fill
    const healthFillGraphics = scene.add.graphics();
    healthFillGraphics.fillStyle(0x00ff88, 1);
    healthFillGraphics.fillRoundedRect(0, 0, 196, 16, 3);
    healthFillGraphics.generateTexture('health_bar_fill', 196, 16);
    healthFillGraphics.destroy();

    // Block shield
    const blockGraphics = scene.add.graphics();
    blockGraphics.fillStyle(0x3498db, 1);
    blockGraphics.fillCircle(16, 16, 16);
    blockGraphics.fillStyle(0xffffff, 0.3);
    blockGraphics.fillCircle(12, 12, 6);
    blockGraphics.generateTexture('block_shield', 32, 32);
    blockGraphics.destroy();
  }

  /**
   * 创建角色纹理
   */
  static createCharacterTextures(scene) {
    // Player avatar
    const playerGraphics = scene.add.graphics();
    playerGraphics.fillStyle(0x00ff88, 1);
    playerGraphics.fillRoundedRect(0, 0, 80, 100, 10);
    playerGraphics.lineStyle(3, 0xffffff, 1);
    playerGraphics.strokeRoundedRect(0, 0, 80, 100, 10);
    playerGraphics.fillStyle(0xffffff, 0.3);
    playerGraphics.fillRect(5, 5, 70, 30);
    playerGraphics.generateTexture('player_avatar', 80, 100);
    playerGraphics.destroy();

    // Enemy avatars
    const enemyColors = {
      slime: 0x44ff44,
      goblin: 0xff8844,
      cultist: 0x8844ff
    };

    Object.entries(enemyColors).forEach(([type, color]) => {
      const enemyGraphics = scene.add.graphics();
      enemyGraphics.fillStyle(color, 1);
      enemyGraphics.fillRoundedRect(0, 0, 100, 120, 12);
      enemyGraphics.lineStyle(3, 0xffffff, 1);
      enemyGraphics.strokeRoundedRect(0, 0, 100, 120, 12);
      enemyGraphics.fillStyle(0xffffff, 0.2);
      enemyGraphics.fillRect(5, 5, 90, 35);
      enemyGraphics.generateTexture(`enemy_${type}`, 100, 120);
      enemyGraphics.destroy();
    });
  }

  /**
   * Convert hex string to number
   */
  static hexToNumber(hex) {
    if (typeof hex === 'number') return hex;
    return parseInt(hex.replace('#', '0x'), 16);
  }

  /**
   * Create custom card texture with specific properties
   */
  static createCustomCardTexture(scene, key, options = {}) {
    const {
      width = 140,
      height = 200,
      bgColor = 0x2d2d2d,
      borderColor = 0x808080,
      costColor = 0xff4757,
      typeColor = 0x666666
    } = options;

    const graphics = scene.add.graphics();

    // Background
    graphics.fillStyle(bgColor, 1);
    graphics.fillRoundedRect(0, 0, width, height, 12);

    // Border
    graphics.lineStyle(3, borderColor, 1);
    graphics.strokeRoundedRect(0, 0, width, height, 12);

    // Cost circle
    graphics.fillStyle(costColor, 1);
    graphics.fillCircle(20, 20, 18);

    // Type indicator
    graphics.fillStyle(typeColor, 1);
    graphics.fillCircle(width / 2, 90, 30);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}
