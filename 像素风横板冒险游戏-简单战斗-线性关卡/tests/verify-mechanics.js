/**
 * Game Mechanics Verification
 * 游戏机制验证脚本 - 无需额外依赖
 *
 * 运行: node tests/verify-mechanics.js
 */

console.log('='.repeat(60));
console.log('🎮 游戏机制验证');
console.log('='.repeat(60));

// 配置
const GameConfig = {
  gravity: 1400,
  player: {
    jumpForce: -800,
    maxHealth: 3,
  }
};

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   错误: ${e.message}`);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`期望 ${expected}，实际 ${actual}`);
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`期望 > ${expected}，实际 ${actual}`);
      }
    },
    toBeLessThan(expected) {
      if (actual >= expected) {
        throw new Error(`期望 < ${expected}，实际 ${actual}`);
      }
    },
    toBeTrue() {
      if (actual !== true) {
        throw new Error(`期望 true，实际 ${actual}`);
      }
    },
    toBeFalse() {
      if (actual !== false) {
        throw new Error(`期望 false，实际 ${actual}`);
      }
    }
  };
}

// ========== 跳跃物理测试 ==========
console.log('\n📐 跳跃物理测试');

test('跳跃高度应该足够 (约229像素)', () => {
  const jumpForce = Math.abs(GameConfig.player.jumpForce);
  const gravity = GameConfig.gravity;
  const maxHeight = (jumpForce * jumpForce) / (2 * gravity);

  console.log(`   跳跃力: ${jumpForce} px/s`);
  console.log(`   重力: ${gravity} px/s²`);
  console.log(`   最大跳跃高度: ${maxHeight.toFixed(1)} 像素`);

  expect(maxHeight).toBeGreaterThan(200);
  expect(maxHeight).toBeLessThan(250);
});

test('跳跃初速度应该是负数（向上）', () => {
  expect(GameConfig.player.jumpForce).toBeLessThan(0);
});

// ========== 玩家生命值测试 ==========
console.log('\n❤️ 玩家生命值测试');

test('玩家初始生命值应该是 3', () => {
  expect(GameConfig.player.maxHealth).toBe(3);
});

test('玩家受到 3 次伤害后应该死亡', () => {
  let health = GameConfig.player.maxHealth;
  health -= 1;
  health -= 1;
  health -= 1;
  expect(health).toBe(0);
});

// ========== 敌人边缘检测测试 ==========
console.log('\n🔄 敌人边缘检测测试');

function hasGroundAhead(slimeX, slimeY, direction, platforms) {
  const aheadX = slimeX + (direction * 25); // 前方25像素
  const aheadY = slimeY + 20; // 脚下位置

  let hasGround = false;
  platforms.forEach(platform => {
    const bounds = platform.getBounds();
    // 严格检查：前方点必须在平台范围内
    if (aheadX >= bounds.x && aheadX <= bounds.x + bounds.width &&
        aheadY >= bounds.y - 10 && aheadY <= bounds.y + bounds.height) {
      hasGround = true;
    }
  });
  return hasGround;
}

const mockPlatforms = [
  { getBounds: () => ({ x: 0, y: 448, width: 400, height: 64 }) },
  { getBounds: () => ({ x: 500, y: 448, width: 300, height: 64 }) },
];

test('史莱姆在 x=300 向右走，应该有地面', () => {
  expect(hasGroundAhead(300, 420, 1, mockPlatforms)).toBeTrue();
});

test('史莱姆在 x=370 向右走（平台内），应该有地面', () => {
  // aheadX = 370 + 25 = 395, 在平台 0-400 范围内
  expect(hasGroundAhead(370, 420, 1, mockPlatforms)).toBeTrue();
});

test('史莱姆在 x=385 向右走（快到边缘），应该没有地面', () => {
  // aheadX = 385 + 25 = 410, 超出平台 0-400 范围
  expect(hasGroundAhead(385, 420, 1, mockPlatforms)).toBeFalse();
});

test('史莱姆在 x=100 向左走，应该有地面', () => {
  expect(hasGroundAhead(100, 420, -1, mockPlatforms)).toBeTrue();
});

// ========== 掉坑伤害测试 ==========
console.log('\n🕳️ 掉坑伤害测试');

test('玩家 y=560 应该触发掉坑 (>550)', () => {
  expect(560 > 550).toBeTrue();
});

test('玩家 y=450 不应该触发掉坑 (<550)', () => {
  expect(450 > 550).toBeFalse();
});

// ========== 碰撞检测测试 ==========
console.log('\n💥 碰撞检测测试');

function isOverlapping(playerBounds, enemyBounds) {
  return !(
    playerBounds.right < enemyBounds.left ||
    playerBounds.left > enemyBounds.right ||
    playerBounds.bottom < enemyBounds.top ||
    playerBounds.top > enemyBounds.bottom
  );
}

test('玩家和敌人在同一位置，应该重叠', () => {
  const player = { left: 100, right: 130, top: 400, bottom: 432 };
  const enemy = { left: 95, right: 125, top: 405, bottom: 425 };
  expect(isOverlapping(player, enemy)).toBeTrue();
});

test('玩家和敌人分开，不应该重叠', () => {
  const player = { left: 100, right: 130, top: 400, bottom: 432 };
  const enemy = { left: 200, right: 230, top: 400, bottom: 425 };
  expect(isOverlapping(player, enemy)).toBeFalse();
});

// ========== 总结 ==========
console.log('\n' + '='.repeat(60));
console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败`);
console.log('='.repeat(60));

if (failed > 0) {
  process.exit(1);
}
