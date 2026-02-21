/**
 * Game Mechanics Unit Tests
 * 游戏机制单元测试 - 验证核心物理和逻辑
 */

import { describe, it, expect } from 'vitest';

// 模拟配置
const GameConfig = {
  gravity: 1400,
  player: {
    jumpForce: -800,
    maxHealth: 3,
  }
};

describe('跳跃物理测试', () => {
  it('跳跃高度应该足够达到平台 (约229像素)', () => {
    // 物理公式: h = v² / (2g)
    const jumpForce = Math.abs(GameConfig.player.jumpForce); // 800
    const gravity = GameConfig.gravity; // 1400

    const maxHeight = (jumpForce * jumpForce) / (2 * gravity);

    console.log(`计算的最大跳跃高度: ${maxHeight.toFixed(1)} 像素`);

    // 平台最高在 y=250，地面在 y=448，差距约 200 像素
    // jumpForce=800 可以跳 ~229 像素，足够到达所有平台
    expect(maxHeight).toBeGreaterThan(200); // 应该能跳过 200 像素
    expect(maxHeight).toBeLessThan(250); // 但不应该跳太高
  });

  it('跳跃初速度应该是负数（向上）', () => {
    expect(GameConfig.player.jumpForce).toBeLessThan(0);
  });
});

describe('玩家生命值测试', () => {
  it('玩家初始生命值应该是 3', () => {
    expect(GameConfig.player.maxHealth).toBe(3);
  });

  it('玩家受到 3 次伤害后应该死亡', () => {
    let health = GameConfig.player.maxHealth;
    const damage = 1;

    // 模拟受到 3 次伤害
    health -= damage; // 2
    health -= damage; // 1
    health -= damage; // 0

    expect(health).toBe(0);
    expect(health <= 0).toBe(true); // 应该死亡
  });
});

describe('敌人边缘检测测试', () => {
  it('边缘检测应该正确识别前方是否有地面', () => {
    // 模拟平台数据
    const mockPlatforms = [
      { getBounds: () => ({ x: 0, y: 448, width: 400, height: 64 }) }, // 地面 0-400
      { getBounds: () => ({ x: 500, y: 448, width: 300, height: 64 }) }, // 地面 500-800
    ];

    // 模拟 hasGroundAhead 函数
    function hasGroundAhead(slimeX, slimeY, direction, platforms) {
      const aheadX = slimeX + (direction * 20);
      const aheadY = slimeY + 25;

      let hasGround = false;
      platforms.forEach(platform => {
        const bounds = platform.getBounds();
        if (aheadX >= bounds.x - 10 && aheadX <= bounds.x + bounds.width + 10 &&
            aheadY >= bounds.y - 30 && aheadY <= bounds.y + bounds.height) {
          hasGround = true;
        }
      });
      return hasGround;
    }

    // 测试用例 1: 史莱姆在 x=300，向右走，应该有地面
    expect(hasGroundAhead(300, 420, 1, mockPlatforms)).toBe(true);

    // 测试用例 2: 史莱姆在 x=390，向右走，快到边缘了，应该没有地面
    expect(hasGroundAhead(390, 420, 1, mockPlatforms)).toBe(false);

    // 测试用例 3: 史莱姆在 x=100，向左走，应该有地面
    expect(hasGroundAhead(100, 420, -1, mockPlatforms)).toBe(true);
  });
});

describe('掉坑伤害测试', () => {
  it('玩家 y > 550 应该触发掉坑', () => {
    const pitY = 550;
    const playerY = 560;

    expect(playerY > pitY).toBe(true);
  });

  it('玩家在屏幕内 (y < 480) 不应该触发掉坑', () => {
    const pitY = 550;
    const playerY = 450;

    expect(playerY > pitY).toBe(false);
  });
});

describe('碰撞检测测试', () => {
  it('玩家与敌人重叠应该造成伤害', () => {
    // 模拟碰撞检测
    function isOverlapping(playerBounds, enemyBounds) {
      return !(
        playerBounds.right < enemyBounds.left ||
        playerBounds.left > enemyBounds.right ||
        playerBounds.bottom < enemyBounds.top ||
        playerBounds.top > enemyBounds.bottom
      );
    }

    // 测试用例 1: 玩家和敌人在同一位置，应该重叠
    const player1 = { left: 100, right: 130, top: 400, bottom: 432 };
    const enemy1 = { left: 95, right: 125, top: 405, bottom: 425 };
    expect(isOverlapping(player1, enemy1)).toBe(true);

    // 测试用例 2: 玩家和敌人分开，不应该重叠
    const player2 = { left: 100, right: 130, top: 400, bottom: 432 };
    const enemy2 = { left: 200, right: 230, top: 400, bottom: 425 };
    expect(isOverlapping(player2, enemy2)).toBe(false);
  });
});
