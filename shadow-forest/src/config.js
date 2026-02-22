/**
 * 游戏配置
 * 《暗影森林》Shadow Forest
 */

import Phaser from 'phaser';

export const GAME_CONFIG = {
  // 游戏尺寸
  WIDTH: 800,
  HEIGHT: 600,

  // 世界尺寸（用于更大的地图）
  WORLD_WIDTH: 1600,
  WORLD_HEIGHT: 600,

  // 颜色
  COLORS: {
    BACKGROUND: 0x1a1a2e,
    UI_BACKGROUND: 0x16213e,
    PRIMARY: 0xe94560,
    SECONDARY: 0x0f3460,
    GOLD: 0xffd700,
    TEXT: 0xffffff,
    TEXT_DARK: 0x16213e
  },

  // 物理
  PHYSICS: {
    GRAVITY: 800,
    DEBUG: false
  },

  // 玩家配置
  PLAYER: {
    MAX_HEALTH: 100,
    MAX_MANA: 80,
    ATTACK: 10,
    DEFENSE: 5,
    SPEED: 160,
    JUMP_FORCE: -550
  },

  // 敌人配置
  ENEMY: {
    MAX_HEALTH: 50,
    ATTACK: 5,
    SPEED: 80,
    DETECTION_RANGE: 150,
    ATTACK_RANGE: 40,
    PATROL_RANGE: 100,
    EXP_REWARD: 25
  },

  // 升级配置
  LEVEL: {
    BASE_EXP: 100,
    EXP_MULTIPLIER: 1.5,
    HEALTH_BONUS: 10,
    ATTACK_BONUS: 2,
    DEFENSE_BONUS: 1
  },

  // UI 配置
  UI: {
    HEALTH_BAR: {
      X: 16,
      Y: 16,
      WIDTH: 200,
      HEIGHT: 20
    },
    MANA_BAR: {
      X: 16,
      Y: 44,
      WIDTH: 160,
      HEIGHT: 16
    },
    EXP_BAR: {
      X: 16,
      Y: 68,
      WIDTH: 120,
      HEIGHT: 8
    },
    SKILL_BAR: {
      SLOT_SIZE: 48,
      GAP: 6,
      Y: 560,
      OPACITY: 0.7
    }
  }
};

// Phaser 游戏配置
export const PHASER_CONFIG = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.COLORS.BACKGROUND,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GAME_CONFIG.PHYSICS.GRAVITY },
      debug: GAME_CONFIG.PHYSICS.DEBUG
    }
  },
  scene: []
};
