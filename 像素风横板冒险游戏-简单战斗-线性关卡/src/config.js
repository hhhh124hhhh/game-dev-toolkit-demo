/**
 * Game Configuration
 * 像素风横板冒险游戏 - 配置参数
 * 基于 GDD 和最佳实践搜索结果
 */

export const GameConfig = {
  // 显示设置
  width: 800,
  height: 480,
  backgroundColor: '#1a1a2e',

  // 物理设置 (基于最佳实践)
  gravity: 1400,          // GDD: 1400 px/s²

  // 调试设置 (通过 URL 参数控制: ?debug=true&god=1)
  debug: {
    enabled: false,       // 调试模式总开关
    godMode: false,       // 无敌模式
    showHitboxes: false,  // 显示碰撞框
    showFPS: false,       // 显示 FPS
    startLevel: 1,        // 起始关卡
  },

  // 游戏信息
  gameTitle: '像素冒险',
  gameVersion: '1.0.0',

  // 玩家设置 (基于 GDD)
  player: {
    speed: 200,           // 地面移动速度: 200 px/s
    airSpeed: 180,        // 空中移动速度: 180 px/s
    jumpForce: -600,      // 跳跃初速度: 600 px/s (向上为负) - 跳跃高度 ~128px，匹配最高平台
    maxHealth: 3,         // 最大生命值: 3 HP
    invincibleTime: 1500, // 受伤后无敌时间: 1.5s
    bounce: 0.1,          // 轻微弹跳
  },

  // 跳跃手感优化 (来自最佳实践搜索)
  jump: {
    coyoteTime: 100,      // 土狼时间: 离开平台后仍可跳跃的时间窗口 (ms)
    jumpBufferTime: 100,  // 跳跃缓冲: 落地前按跳跃，落地瞬间自动跳 (ms)
    fallGravityMultiplier: 2.0, // 下落重力倍数: 下落比上升更快
    jumpCutMultiplier: 0.5,     // 松开跳跃键时上升速度削减
    maxFallSpeed: 600,    // 最大下落速度
  },

  // 战斗参数
  combat: {
    attackRange: 100,     // 攻击范围 (原60，增加到100)
    attackCooldown: 400,  // 攻击冷却时间 (ms)
    attackDamage: 1,      // 攻击伤害
    knockbackForce: 200,  // 击退力度
    knockbackDuration: 200, // 击退持续时间 (ms)
  },

  // 敌人参数
  enemies: {
    slime: {
      speed: 80,          // 巡逻速度
      chaseSpeed: 120,    // 追击速度
      detectionRange: 150, // 检测范围
      attackRange: 30,    // 攻击范围
      health: 1,          // 生命值
      damage: 1,          // 接触伤害
      patrolDistance: 100, // 巡逻距离
    },
    flyer: {
      speed: 60,          // 悬浮移动速度
      chaseSpeed: 100,    // 追击速度
      detectionRange: 200, // 检测范围
      diveSpeed: 200,     // 俯冲速度
      health: 1,
      damage: 1,
      hoverAmplitude: 20, // 悬浮振幅
      hoverSpeed: 2,      // 悬浮速度
    },
    boss: {
      health: 10,
      damage: 2,
      speed: 60,
      chargeSpeed: 250,   // 冲撞速度
      projectileSpeed: 150, // 弹幕速度
    }
  },

  // 收集物参数
  collectibles: {
    coin: {
      value: 10,          // 分数
      bounceY: 0.4,       // 弹跳
    },
    heart: {
      healAmount: 1,      // 恢复生命值
    },
    powerup: {
      duration: 5000,     // 持续时间 (ms)
      speedMultiplier: 1.5, // 速度倍数
    }
  },

  // 关卡参数
  level: {
    tileSize: 32,         // 瓦片大小
    levelWidth: 3200,     // 关卡宽度 (10 屏幕)
    levelHeight: 480,     // 关卡高度
    checkpointInterval: 800, // 检查点间隔
  },

  // 音频设置
  audio: {
    musicVolume: 0.3,
    sfxVolume: 0.6,
  }
};

// 玩家状态枚举
export const PlayerState = {
  IDLE: 'idle',
  RUNNING: 'running',
  JUMPING: 'jumping',
  FALLING: 'falling',
  ATTACKING: 'attacking',
  HURT: 'hurt',
  DEAD: 'dead'
};

// 敌人状态枚举
export const EnemyState = {
  IDLE: 'idle',
  PATROL: 'patrol',
  CHASE: 'chase',
  ATTACK: 'attack',
  HURT: 'hurt',
  DEAD: 'dead'
};

// 收集物类型
export const CollectibleType = {
  COIN: 'coin',
  HEART: 'heart',
  POWERUP: 'powerup'
};

// 平台类型
export const PlatformType = {
  NORMAL: 'normal',
  MOVING: 'moving',
  BREAKABLE: 'breakable',
  BOUNCE: 'bounce'
};

// 游戏事件
export const GameEvents = {
  PLAYER_HURT: 'player:hurt',
  PLAYER_HEAL: 'player:heal',
  PLAYER_DIE: 'player:die',
  ENEMY_KILLED: 'enemy:killed',
  COIN_COLLECTED: 'coin:collected',
  LEVEL_COMPLETE: 'level:complete',
  GAME_OVER: 'game:over'
};

// 解析 URL 参数启用调试模式
// 用法: http://localhost:5179?debug=true&god=1
(function parseDebugParams() {
  const params = new URLSearchParams(window.location.search);

  if (params.get('debug') === 'true') {
    GameConfig.debug.enabled = true;
    console.log('🎮 调试模式已启用');

    if (params.get('god') === '1') {
      GameConfig.debug.godMode = true;
      console.log('🛡️ 无敌模式已启用');
    }

    if (params.get('hitbox') === '1') {
      GameConfig.debug.showHitboxes = true;
      console.log('📦 碰撞框显示已启用');
    }

    if (params.get('fps') === '1') {
      GameConfig.debug.showFPS = true;
      console.log('📊 FPS 显示已启用');
    }

    const level = params.get('level');
    if (level) {
      GameConfig.debug.startLevel = parseInt(level, 10);
      console.log(`🎯 起始关卡: ${GameConfig.debug.startLevel}`);
    }
  }
})();
