/**
 * Level Manager
 * 关卡管理器 - 处理关卡布局、敌人生成、检查点、终点
 *
 * 功能:
 * - 线性关卡布局生成
 * - 敌人配置
 * - 收集物分布
 * - 检查点系统
 * - 关卡完成判定
 */

import { GameConfig, GameEvents } from '../config.js';
import { Slime } from '../entities/Slime.js';
import { Flyer } from '../entities/Flyer.js';
import { Boss } from '../entities/Boss.js';

export class LevelManager {
  constructor(scene) {
    this.scene = scene;

    // Level data
    this.currentLevel = 1;
    this.levelWidth = GameConfig.level.levelWidth;
    this.tileSize = GameConfig.level.tileSize;

    // Groups
    this.platforms = scene.physics.add.staticGroup();
    this.enemies = scene.physics.add.group();

    // Player spawn
    this.spawnPoint = { x: 100, y: 300 };
    this.checkpoints = [];
    this.lastCheckpoint = null;

    // End point
    this.endPoint = null;
    this.boss = null;

    // Player reference
    this.player = null;

    // Collectible system reference
    this.collectibleSystem = null;
  }

  setPlayer(player) {
    this.player = player;
  }

  setCollectibleSystem(collectibleSystem) {
    this.collectibleSystem = collectibleSystem;
  }

  // ============ Level Generation ============
  generateLevel(levelData = null) {
    // Use default level if no data provided
    if (!levelData) {
      levelData = this.getDefaultLevelData();
    }

    // Create platforms
    this.createPlatforms(levelData.platforms);

    // Create enemies
    this.createEnemies(levelData.enemies);

    // Create collectibles
    this.createCollectibles(levelData.collectibles);

    // Create checkpoints
    this.createCheckpoints(levelData.checkpoints);

    // Create end point (with boss)
    this.createEndPoint();

    return {
      platforms: this.platforms,
      enemies: this.enemies
    };
  }

  getDefaultLevelData() {
    const levelWidth = this.levelWidth;
    const groundY = GameConfig.height - 32;
    const platformY = 300;

    return {
      platforms: [
        // Ground sections with gaps
        { type: 'ground', x: 0, width: 400 },
        { type: 'ground', x: 500, width: 300 },
        { type: 'ground', x: 900, width: 400 },
        { type: 'ground', x: 1400, width: 300 },
        { type: 'ground', x: 1800, width: 400 },
        { type: 'ground', x: 2300, width: 300 },
        { type: 'ground', x: 2700, width: 500 },

        // Floating platforms - 高度控制在 320-400 之间（从地面最多跳 128px）
        { type: 'platform', x: 300, y: 370, width: 100 },   // 高度差 78px ✓
        { type: 'platform', x: 500, y: 320, width: 120 },   // 高度差 128px ✓
        { type: 'platform', x: 750, y: 370, width: 100 },   // 高度差 78px ✓
        { type: 'platform', x: 950, y: 320, width: 150 },   // 高度差 128px ✓ (原250太高)
        { type: 'platform', x: 1200, y: 350, width: 100 },  // 高度差 98px ✓
        { type: 'platform', x: 1450, y: 390, width: 80 },   // 高度差 58px ✓
        { type: 'platform', x: 1650, y: 320, width: 120 },  // 高度差 128px ✓
        { type: 'platform', x: 1900, y: 370, width: 100 },  // 高度差 78px ✓
        { type: 'platform', x: 2150, y: 350, width: 150 },  // 高度差 98px ✓
        { type: 'platform', x: 2450, y: 370, width: 100 },  // 高度差 78px ✓
      ],
      enemies: [
        { type: 'slime', x: 300, y: 400 },
        { type: 'slime', x: 600, y: 400 },
        { type: 'flyer', x: 800, y: 200 },
        { type: 'slime', x: 1000, y: 400 },
        { type: 'flyer', x: 1200, y: 150 },
        { type: 'slime', x: 1500, y: 400 },
        { type: 'flyer', x: 1700, y: 200 },
        { type: 'slime', x: 2000, y: 400 },
        { type: 'flyer', x: 2200, y: 250 },
      ],
      collectibles: [
        // 起始区域 - 地面1 (0-400)
        { type: 'coin', points: [{ x: 80, y: 400 }, { x: 130, y: 400 }, { x: 180, y: 400 }, { x: 230, y: 400 }] },
        { type: 'coin', points: [{ x: 150, y: 370 }, { x: 200, y: 370 }, { x: 250, y: 370 }] }, // 平台300,y=370
        { type: 'coin', points: [{ x: 320, y: 370 }, { x: 370, y: 370 }] }, // 平台300,y=370

        // 地面2区域 (500-800)
        { type: 'coin', points: [{ x: 530, y: 320 }, { x: 580, y: 320 }] }, // 平台500,y=320
        { type: 'coin', points: [{ x: 550, y: 400 }, { x: 600, y: 400 }, { x: 650, y: 400 }, { x: 700, y: 400 }] },
        { type: 'coin', points: [{ x: 770, y: 370 }, { x: 820, y: 370 }] }, // 平台750,y=370

        // 地面3区域 (900-1300)
        { type: 'heart', x: 980, y: 290 }, // 平台950,y=320 上方
        { type: 'coin', points: [{ x: 920, y: 400 }, { x: 970, y: 400 }, { x: 1020, y: 400 }] },
        { type: 'coin', points: [{ x: 1100, y: 400 }, { x: 1150, y: 400 }, { x: 1200, y: 400 }] },

        // 地面4区域 (1400-1700)
        { type: 'coin', points: [{ x: 1420, y: 400 }, { x: 1470, y: 400 }, { x: 1520, y: 400 }] },
        { type: 'coin', points: [{ x: 1580, y: 400 }, { x: 1630, y: 400 }] },
        { type: 'coin', points: [{ x: 1680, y: 320 }, { x: 1730, y: 320 }] }, // 平台1650,y=320

        // 地面5区域 (1800-2200)
        { type: 'coin', points: [{ x: 1820, y: 400 }, { x: 1870, y: 400 }, { x: 1920, y: 400 }] },
        { type: 'coin', points: [{ x: 1980, y: 400 }, { x: 2030, y: 400 }, { x: 2080, y: 400 }] },
        { type: 'heart', x: 2180, y: 320 }, // 平台2150,y=350 上方

        // Boss前区域 (2300-3200) - 地面6和7
        { type: 'coin', points: [{ x: 2320, y: 400 }, { x: 2370, y: 400 }, { x: 2420, y: 400 }] },
        { type: 'coin', points: [{ x: 2480, y: 370 }, { x: 2530, y: 370 }] }, // 平台2450,y=370
        { type: 'coin', points: [{ x: 2750, y: 400 }, { x: 2800, y: 400 }, { x: 2850, y: 400 }, { x: 2900, y: 400 }] },
        { type: 'coin', points: [{ x: 2950, y: 400 }, { x: 3000, y: 400 }] },
      ],
      checkpoints: [
        { x: 1000, y: 400 },
        { x: 2000, y: 400 }
      ]
    };
  }

  createPlatforms(platformData) {
    const groundY = GameConfig.height - 32;

    platformData.forEach(p => {
      if (p.type === 'ground') {
        // Ground section
        const numTiles = Math.ceil(p.width / this.tileSize);
        for (let i = 0; i < numTiles; i++) {
          const tile = this.scene.add.rectangle(
            p.x + i * this.tileSize + this.tileSize / 2,
            groundY,
            this.tileSize,
            64,
            0x4a5568
          );
          this.platforms.add(tile);
        }
      } else {
        // Floating platform
        const platform = this.scene.add.rectangle(
          p.x + p.width / 2,
          p.y,
          p.width,
          24,
          0x2d3748
        );
        this.platforms.add(platform);

        // Platform border
        this.scene.add.rectangle(
          p.x + p.width / 2,
          p.y - 10,
          p.width + 4,
          4,
          0x718096
        );
      }
    });

    // Walls
    const leftWall = this.scene.add.rectangle(-16, GameConfig.height / 2, 32, GameConfig.height, 0x1a202c);
    const rightWall = this.scene.add.rectangle(this.levelWidth + 16, GameConfig.height / 2, 32, GameConfig.height, 0x1a202c);
    this.platforms.add(leftWall);
    this.platforms.add(rightWall);
  }

  createEnemies(enemyData) {
    console.log('[LevelManager] createEnemies called - player ref:', this.player ? 'set' : 'NULL');

    enemyData.forEach(e => {
      let enemy;

      switch (e.type) {
        case 'slime':
          enemy = new Slime(this.scene, e.x, e.y);
          break;
        case 'flyer':
          enemy = new Flyer(this.scene, e.x, e.y);
          break;
        case 'boss':
          enemy = new Boss(this.scene, e.x, e.y);
          this.boss = enemy;
          break;
        default:
          console.warn(`Unknown enemy type: ${e.type}`);
          return;
      }

      if (enemy) {
        console.log('[LevelManager] Setting player on enemy, player is:', this.player ? 'available' : 'NULL');
        enemy.setPlayer(this.player);
        this.enemies.add(enemy);
      }
    });
  }

  createCollectibles(collectibleData) {
    if (!this.collectibleSystem) return;

    collectibleData.forEach(c => {
      switch (c.type) {
        case 'coin':
          if (c.points) {
            this.collectibleSystem.spawnCoinsAlongPath(c.points, c.points.length);
          }
          break;
        case 'heart':
          this.collectibleSystem.spawnHeart(c.x, c.y);
          break;
        case 'powerup':
          this.collectibleSystem.spawnPowerup(c.x, c.y, c.powerupType || 'speed');
          break;
      }
    });
  }

  createCheckpoints(checkpointData) {
    checkpointData.forEach(cp => {
      // Visual checkpoint marker
      const marker = this.scene.add.rectangle(cp.x, cp.y - 20, 32, 40, 0x4299e1, 0.3);
      marker.setStrokeStyle(2, 0x4299e1);

      // Flag pole
      this.scene.add.rectangle(cp.x, cp.y - 10, 4, 60, 0x718096);

      this.checkpoints.push({
        x: cp.x,
        y: cp.y,
        marker: marker,
        activated: false
      });
    });
  }

  createEndPoint() {
    // Boss area at the end
    const bossX = this.levelWidth - 400;
    const arenaY = GameConfig.height - 100;

    // Boss arena platform - 先创建普通矩形，再添加物理
    const arenaPlatform = this.scene.add.rectangle(
      bossX,
      arenaY,
      400,
      32,
      0x553c9a
    );
    this.scene.physics.add.existing(arenaPlatform);
    arenaPlatform.body.setAllowGravity(false);
    arenaPlatform.body.setImmovable(true);
    this.platforms.add(arenaPlatform);

    // Spawn boss - 在竞技场平台正上方，确保不会卡在墙里
    const boss = new Boss(this.scene, bossX, arenaY - 80);
    boss.setPlayer(this.player);
    this.enemies.add(boss);
    this.boss = boss;

    // End point marker
    this.endPoint = this.scene.add.rectangle(
      this.levelWidth - 50,
      GameConfig.height - 100,
      40,
      80,
      0x48bb78,
      0.5
    );
    this.endPoint.setStrokeStyle(3, 0x48bb78);
  }

  // ============ Checkpoint System ============
  checkCheckpoints() {
    if (!this.player) return;

    this.checkpoints.forEach(cp => {
      if (cp.activated) return;

      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        cp.x, cp.y
      );

      if (distance < 50) {
        this.activateCheckpoint(cp);
      }
    });
  }

  activateCheckpoint(checkpoint) {
    checkpoint.activated = true;
    this.lastCheckpoint = { x: checkpoint.x, y: checkpoint.y };

    // Visual feedback
    checkpoint.marker.setFillStyle(0x4299e1, 0.8);

    // Flag animation
    this.scene.tweens.add({
      targets: checkpoint.marker,
      scaleY: 1.2,
      duration: 200,
      yoyo: true
    });

    // Emit event
    this.scene.events.emit('checkpoint:activated', this.lastCheckpoint);
  }

  getSpawnPoint() {
    if (this.lastCheckpoint) {
      return this.lastCheckpoint;
    }
    return this.spawnPoint;
  }

  // ============ Level Completion ============
  checkLevelComplete() {
    if (!this.boss || !this.player) return false;

    // Level is complete when boss is dead and player reaches end point
    if (!this.boss.isAlive) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.endPoint.x, this.endPoint.y
      );

      if (distance < 50) {
        this.onLevelComplete();
        return true;
      }
    }

    return false;
  }

  onLevelComplete() {
    this.scene.events.emit(GameEvents.LEVEL_COMPLETE);

    // Victory effect
    this.scene.cameras.main.flash(500, 255, 255, 255);
  }

  // ============ Update ============
  update() {
    this.checkCheckpoints();
    this.checkLevelComplete();
  }

  // ============ Getters ============
  getPlatforms() {
    return this.platforms;
  }

  getEnemies() {
    return this.enemies;
  }

  getBoss() {
    return this.boss;
  }

  getLevelWidth() {
    return this.levelWidth;
  }
}
