/**
 * GameScene 主游戏场景
 * 《暗影森林》Shadow Forest
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { Enemy, EnemyState } from '../entities/Enemy.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { HUD } from '../ui/HUD.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init() {
    // 初始化所有状态变量 (CRITICAL: 防止 undefined bug)
    this.score = 0;
    this.isGameOver = false;
    this.isPaused = false;
    this.enemiesKilled = 0;
    this.isRespawning = false;  // 掉落重生状态
  }

  create() {
    const worldWidth = GAME_CONFIG.WORLD_WIDTH || 1600;
    const worldHeight = GAME_CONFIG.WORLD_HEIGHT || 600;

    // 设置世界边界
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 背景 - 使用平铺覆盖整个世界
    this.add.image(worldWidth / 2, worldHeight / 2, 'background');

    // 创建平台
    this.createPlatforms();

    // 创建玩家
    this.player = new Player(this, 100, 400);

    // 设置玩家世界边界碰撞
    this.player.sprite.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    this.spawnInitialEnemies();

    // 设置碰撞
    this.setupCollisions();

    // 创建输入
    this.setupInput();

    // 创建 HUD
    this.hud = new HUD(this);

    // 事件监听
    this.setupEvents();

    // 相机跟随玩家
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    const worldWidth = GAME_CONFIG.WORLD_WIDTH || 1600;

    // 主地面 - 贯穿整个世界
    for (let x = 0; x < worldWidth; x += 64) {
      this.platforms.create(x + 32, 568, 'ground');
    }

    // 第一区域 (0-800) - 入门难度
    this.platforms.create(200, 480, 'platform');  // 88px - 容易跳上
    this.platforms.create(500, 420, 'platform');  // 148px - 中等难度
    this.platforms.create(650, 480, 'platform');  // 88px - 容易跳上
    this.platforms.create(350, 400, 'platform');  // 168px - 接近极限
    this.platforms.create(100, 450, 'platform');  // 118px - 中等难度

    // 第二区域 (800-1600) - 进阶难度
    this.platforms.create(900, 450, 'platform');
    this.platforms.create(1100, 400, 'platform');
    this.platforms.create(1300, 450, 'platform');
    this.platforms.create(1450, 380, 'platform');
  }

  spawnInitialEnemies() {
    // 第一区域敌人 - 在平台上方
    this.spawnEnemy(200, 440);  // 在第一个平台上方
    this.spawnEnemy(500, 380);  // 在第二个平台上方
    this.spawnEnemy(650, 440);  // 在第三个平台上方

    // 第二区域敌人
    this.spawnEnemy(1100, 360);  // 在第二区域平台上方
    this.spawnEnemy(1300, 410);  // 在第二区域平台上方
  }

  spawnEnemy(x, y) {
    const enemy = new Enemy(this, x, y);
    this.enemies.add(enemy.sprite);
    return enemy;
  }

  setupCollisions() {
    // 玩家与平台碰撞
    this.physics.add.collider(this.player.sprite, this.platforms);

    // 敌人与平台碰撞
    this.physics.add.collider(this.enemies, this.platforms);

    // 玩家攻击与敌人
    this.physics.add.overlap(
      this.player.sprite,
      this.enemies,
      this.onPlayerAttackEnemy,
      this.canAttack,
      this
    );

    // 敌人攻击玩家
    this.physics.add.overlap(
      this.player.sprite,
      this.enemies,
      this.onEnemyAttackPlayer,
      this.canEnemyAttack,
      this
    );
  }

  setupInput() {
    // 方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 攻击键
    this.attackKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.J
    );

    // 技能键
    this.skillKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.K
    );

    // 暂停键
    this.input.keyboard.on('keydown-ESC', () => {
      this.pauseGame();
    });
  }

  setupEvents() {
    // 敌人被击败
    this.events.on('enemyDefeated', (enemy) => {
      this.onEnemyDefeated(enemy);
    });

    // 玩家升级
    this.events.on('playerLevelUp', (level) => {
      this.onPlayerLevelUp(level);
    });

    // 敌人攻击事件
    this.events.on('enemyAttack', (enemy, player) => {
      this.handleEnemyAttack(enemy, player);
    });
  }

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    // 更新玩家
    this.player.update(this.cursors);

    // 检查玩家是否掉出平台 - 重生机制
    const worldHeight = GAME_CONFIG.WORLD_HEIGHT || 600;
    if (this.player.sprite.y > worldHeight + 20) {
      this.respawnPlayer();
    }

    // 更新敌人 (使用 for 循环避免 iterate 中断问题)
    this.updateEnemies(time, delta);

    // 攻击输入
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.playerAttack();
    }

    // 技能输入
    if (Phaser.Input.Keyboard.JustDown(this.skillKey)) {
      this.playerSkill();
    }

    // 更新 HUD
    this.hud.update(this.player);

    // 检查游戏结束
    this.checkGameOver();

    // 检查是否需要生成新敌人
    this.checkSpawnEnemies();
  }

  playerAttack() {
    if (this.player.isAttacking) return;

    const direction = this.player.attackEnemy(null);
    if (direction === null) return;

    // 攻击动画效果
    const attackX = this.player.sprite.x + direction * 40;
    const attackY = this.player.sprite.y;

    // 创建攻击特效
    this.createAttackEffect(attackX, attackY, direction);

    // 检测攻击范围内的敌人
    const attackRange = 60;
    this.enemies.children.iterate((sprite) => {
      if (!sprite || !sprite.active) return;

      const enemy = sprite.getData('entity');
      if (!enemy || enemy.isDead()) return;

      const distance = Phaser.Math.Distance.Between(
        attackX, attackY,
        sprite.x, sprite.y
      );

      if (distance < attackRange) {
        // 判断攻击方向
        const enemyDirection = sprite.x > this.player.sprite.x ? 1 : -1;
        if (enemyDirection === direction) {
          // 造成伤害
          const result = CombatSystem.performAttack(this.player, enemy);
          this.showDamageNumber(sprite.x, sprite.y - 30, result.damage, result.isCritical);

          // 击退效果
          if (!enemy.isDead()) {
            CombatSystem.knockback(enemy, this.player.sprite.x, this.player.sprite.y, 200);
          }
        }
      }
    });
  }

  createAttackEffect(x, y, direction) {
    // 创建斩击弧线特效
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0xffffff, 1);

    // 绘制弧线
    const startAngle = direction > 0 ? -Math.PI / 3 : Math.PI - Math.PI / 3;
    const endAngle = direction > 0 ? Math.PI / 3 : Math.PI + Math.PI / 3;

    graphics.beginPath();
    graphics.arc(x, y, 35, startAngle, endAngle, false);
    graphics.strokePath();

    // 添加闪光点
    const flash = this.add.circle(x + direction * 20, y, 6, 0xffffff, 1);

    // 淡出动画
    this.tweens.add({
      targets: [graphics, flash],
      alpha: 0,
      duration: 150,
      onComplete: () => {
        graphics.destroy();
        flash.destroy();
      }
    });

    // 屏幕轻微震动
    this.cameras.main.shake(50, 0.002);
  }

  playerSkill() {
    const manaCost = 20;
    if (!this.player.useMana(manaCost)) {
      // 魔法不足提示
      return;
    }

    // 范围攻击
    const skillRange = 150;
    this.enemies.children.iterate((sprite) => {
      if (!sprite || !sprite.active) return;

      const enemy = sprite.getData('entity');
      if (!enemy || enemy.isDead()) return;

      const distance = Phaser.Math.Distance.Between(
        this.player.sprite.x, this.player.sprite.y,
        sprite.x, sprite.y
      );

      if (distance < skillRange) {
        // 技能造成 1.5 倍伤害
        const result = CombatSystem.performCriticalAttack(this.player, enemy);
        this.showDamageNumber(sprite.x, sprite.y - 30, result.damage, true);

        // 击退
        CombatSystem.knockback(enemy, this.player.sprite.x, this.player.sprite.y, 300);
      }
    });

    // 技能视觉效果
    this.createSkillEffect();
  }

  createSkillEffect() {
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0x3498db, 1);
    graphics.strokeCircle(this.player.sprite.x, this.player.sprite.y, 150);

    this.tweens.add({
      targets: graphics,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      onComplete: () => graphics.destroy()
    });
  }

  showDamageNumber(x, y, damage, isCritical) {
    const color = isCritical ? '#ffd700' : '#ffffff';
    const size = isCritical ? '24px' : '18px';

    const text = this.add.text(x, y, damage.toString(), {
      fontFamily: 'Arial',
      fontSize: size,
      fontStyle: 'bold',
      fill: color,
      stroke: '#000000',
      strokeThickness: 2
    });
    text.setOrigin(0.5, 0.5);

    // 飘动动画
    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  canAttack(playerSprite, enemySprite) {
    return Phaser.Input.Keyboard.JustDown(this.attackKey);
  }

  canEnemyAttack(playerSprite, enemySprite) {
    const enemy = enemySprite.getData('entity');
    if (!enemy) return false;
    if (enemy.state !== EnemyState.ATTACK) return false;
    if (enemy.attackCooldown > 0) return false;
    if (enemy.isDead()) return false;

    // 检查距离是否足够近
    const distance = Phaser.Math.Distance.Between(
      enemySprite.x, enemySprite.y,
      playerSprite.x, playerSprite.y
    );

    return distance < enemy.attackRange * 1.2; // 增加一点容差
  }

  onPlayerAttackEnemy(playerSprite, enemySprite) {
    // 已在 playerAttack 中处理
  }

  onEnemyAttackPlayer(playerSprite, enemySprite) {
    const enemy = enemySprite.getData('entity');
    if (!enemy) return;

    // 直接调用伤害处理
    this.handleEnemyAttack(enemy, this.player);

    // 设置攻击冷却
    enemy.attackCooldown = 800;
  }

  handleEnemyAttack(enemy, player) {
    // 防御检查
    if (player.isDead()) return;
    if (player.invincible) return;
    if (!enemy || !enemy.sprite) return;

    // 计算伤害
    const damage = enemy.attack || 5;
    const actualDamage = player.takeDamage(damage);

    this.showDamageNumber(
      player.sprite.x,
      player.sprite.y - 30,
      actualDamage,
      false
    );

    // 击退玩家
    CombatSystem.knockback(player, enemy.sprite.x, enemy.sprite.y, 200);

    // 攻击视觉反馈
    enemy.sprite.setTint(0xff6600);
    this.time.delayedCall(100, () => {
      if (enemy.sprite && enemy.state !== EnemyState.DEAD) {
        enemy.sprite.clearTint();
      }
    });
  }

  onEnemyDefeated(enemy) {
    // 获得经验
    const exp = enemy.getExpReward();
    this.player.gainExp(exp);

    // 增加分数
    this.addScore(100);

    // 增加击杀数
    this.enemiesKilled++;

    // 恢复一点魔法
    this.player.restoreMana(5);
  }

  onPlayerLevelUp(level) {
    // 升级特效
    const text = this.add.text(
      this.player.sprite.x,
      this.player.sprite.y - 50,
      `Level Up! Lv.${level}`,
      {
        fontFamily: 'Arial',
        fontSize: '28px',
        fontStyle: 'bold',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    text.setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: text,
      y: text.y - 80,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  addScore(points) {
    this.score += points;
  }

  pauseGame() {
    this.isPaused = true;
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  resumeGame() {
    this.isPaused = false;
  }

  checkGameOver() {
    if (this.player.isDead() && !this.isGameOver) {
      this.gameOver();
    }
  }

  gameOver() {
    this.isGameOver = true;

    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        level: this.player.level,
        kills: this.enemiesKilled
      });
    });
  }

  respawnPlayer() {
    // 防止重复触发
    if (this.isRespawning) return;
    this.isRespawning = true;

    // 掉落惩罚 - 扣除25%最大生命值
    const fallDamage = Math.floor(this.player.maxHealth * 0.25);
    this.player.takeDamage(fallDamage);

    // 显示伤害数字
    this.showDamageNumber(100, 370, fallDamage, false);

    // 检查是否死亡
    if (this.player.isDead()) {
      this.isRespawning = false;
      return; // 让 checkGameOver 处理
    }

    // 传送回起点
    this.player.sprite.setPosition(100, 400);
    this.player.sprite.setVelocity(0, 0);

    // 短暂无敌
    this.player.invincible = true;
    this.player.invincibleTime = 1500;

    // 闪烁效果
    this.tweens.add({
      targets: this.player.sprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 8,
      onComplete: () => {
        this.isRespawning = false;
      }
    });
  }

  updateEnemies(time, delta) {
    const enemies = this.enemies.getChildren();

    for (let i = 0; i < enemies.length; i++) {
      const sprite = enemies[i];
      if (!sprite || !sprite.active) continue;

      const enemy = sprite.getData('entity');
      if (!enemy || enemy.isDead()) continue;

      enemy.update(this.player, time, delta);
    }
  }

  checkSpawnEnemies() {
    // 如果敌人太少，生成新敌人
    const activeEnemies = this.enemies.countActive(true);
    if (activeEnemies < 4) {
      // 在玩家附近生成敌人（但不 太近）
      const worldWidth = GAME_CONFIG.WORLD_WIDTH || 1600;
      const spawnX = Phaser.Math.Between(100, worldWidth - 100);
      const spawnY = Phaser.Math.Between(400, 500);
      this.spawnEnemy(spawnX, spawnY);
    }
  }
}
