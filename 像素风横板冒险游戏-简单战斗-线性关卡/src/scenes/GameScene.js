/**
 * Game Scene - Main Gameplay
 * 主游戏场景 - 整合所有系统
 *
 * 系统:
 * - Player: 玩家控制 (跳跃手感优化)
 * - LevelManager: 关卡管理
 * - CombatSystem: 战斗系统
 * - CollectibleSystem: 收集物系统
 */

import Phaser from 'phaser';
import { GameConfig, GameEvents } from '../config.js';
import { Player } from '../entities/Player.js';
import { LevelManager } from '../systems/LevelManager.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { CollectibleSystem } from '../systems/CollectibleSystem.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Reset game state
    window.gameState.score = 0;
    window.gameState.health = 3;

    // Set world bounds for scrolling level
    // 扩展下方边界，允许玩家掉下去
    const levelWidth = GameConfig.level.levelWidth;
    this.physics.world.setBounds(0, 0, levelWidth, height + 200);
    this.cameras.main.setBounds(0, 0, levelWidth, height);

    // Background with parallax layers
    this.createBackground(levelWidth);

    // Initialize systems
    this.initSystems();

    // Create player
    this.createPlayer();

    // Generate level
    this.generateLevel();

    // Setup collisions
    this.setupCollisions();

    // Create UI
    this.createUI();

    // Setup event listeners
    this.setupEvents();

    // Fade in
    this.cameras.main.fadeIn(500);
  }

  createBackground(levelWidth) {
    // Far background layer (slower parallax)
    this.bgFar = this.add.tileSprite(0, 0, levelWidth, 480, 'bg-far');
    this.bgFar.setOrigin(0, 0);
    this.bgFar.setDepth(-20);

    // Near background layer (faster parallax)
    this.bgNear = this.add.tileSprite(0, 0, levelWidth, 480, 'bg-near');
    this.bgNear.setOrigin(0, 0);
    this.bgNear.setDepth(-10);

    // If textures don't exist, create placeholder backgrounds
    if (!this.textures.exists('bg-far')) {
      this.createPlaceholderBackground();
    }
  }

  createPlaceholderBackground() {
    // Create gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    graphics.fillRect(0, 0, GameConfig.level.levelWidth, 480);
    graphics.setDepth(-30);

    // Stars
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, GameConfig.level.levelWidth);
      const y = Phaser.Math.Between(0, 300);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);

      this.add.circle(x, y, size, 0xffffff, alpha).setDepth(-25);
    }
  }

  initSystems() {
    // Level Manager
    this.levelManager = new LevelManager(this);

    // Combat System
    this.combatSystem = new CombatSystem(this);

    // Collectible System
    this.collectibleSystem = new CollectibleSystem(this);
  }

  createPlayer() {
    const spawn = this.levelManager.getSpawnPoint();

    // Create player using new Player class
    this.player = new Player(this, spawn.x, spawn.y);

    // Set player for all systems
    this.levelManager.setPlayer(this.player);
    this.combatSystem.setPlayer(this.player);
    this.collectibleSystem.setPlayer(this.player);

    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  generateLevel() {
    const levelData = this.levelManager.generateLevel();

    // Set enemies for combat system
    this.combatSystem.setEnemies(this.levelManager.getEnemies());

    // Set boss projectiles if boss exists
    const boss = this.levelManager.getBoss();
    if (boss) {
      this.combatSystem.setEnemyProjectiles(boss.getProjectiles());
    }

    // Set collectible system for level manager
    this.levelManager.setCollectibleSystem(this.collectibleSystem);
  }

  setupCollisions() {
    // Player vs platforms
    this.physics.add.collider(this.player, this.levelManager.getPlatforms());

    // Enemies vs platforms
    this.physics.add.collider(this.levelManager.getEnemies(), this.levelManager.getPlatforms());
  }

  createUI() {
    // Health display - 金色边框红色心
    this.healthIcons = [];
    const healthY = 20;

    for (let i = 0; i < GameConfig.player.maxHealth; i++) {
      const heart = this.add.circle(30 + i * 30, healthY, 10, 0xd4af37);  // 金色
      heart.setStrokeStyle(2, 0xffffff);
      heart.setScrollFactor(0);
      heart.setDepth(100);
      this.healthIcons.push(heart);
    }

    // Score display - 金色
    this.scoreText = this.add.text(this.cameras.main.width - 20, 20, 'Score: 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#d4af37',
    });
    this.scoreText.setOrigin(1, 0);
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);

    // Controls hint - 灰色
    this.controlsText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 20,
      'Arrow Keys: Move | Space: Jump | Z: Attack | ESC: Menu',
      {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#888888'
      }
    );
    this.controlsText.setOrigin(0.5, 1);
    this.controlsText.setScrollFactor(0);
    this.controlsText.setDepth(100);

    // Fade out controls after 5 seconds
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: this.controlsText,
        alpha: 0,
        duration: 1000
      });
    });
  }

  setupEvents() {
    // Health update
    this.events.on(GameEvents.PLAYER_HURT, (health) => {
      this.updateHealthUI(health);
    });

    this.events.on(GameEvents.PLAYER_HEAL, (health) => {
      this.updateHealthUI(health);
    });

    // Score update
    this.events.on(GameEvents.COIN_COLLECTED, (score) => {
      window.gameState.score = score;
      this.scoreText.setText(`Score: ${score}`);
    });

    // Player death
    this.events.on(GameEvents.PLAYER_DIE, () => {
      this.onPlayerDeath();
    });

    // Level complete
    this.events.on(GameEvents.LEVEL_COMPLETE, () => {
      this.onLevelComplete();
    });

    // Game over on ESC
    this.input.keyboard.on('keydown-ESC', () => {
      this.onPause();
    });
  }

  updateHealthUI(health) {
    this.healthIcons.forEach((icon, index) => {
      if (index < health) {
        icon.setFillStyle(0xd4af37);  // 金色
      } else {
        icon.setFillStyle(0x333333);  // 暗灰
      }
    });
  }

  update(time, delta) {
    if (!this.player || !this.player.isAlive) return;

    // Check for player falling off screen (before update)
    if (this.player.y > 550) {
      console.log('[GameScene] Player fell into pit! y:', this.player.y);
      this.player.takeDamage(1, 0);
      if (this.player.isAlive) {
        this.respawnPlayer();
      }
      return;
    }

    // Update player
    this.player.update(time, delta);

    // Update systems
    this.levelManager.update();
    this.combatSystem.update();
    this.collectibleSystem.update();

    // Update enemies
    this.levelManager.getEnemies().getChildren().forEach(enemy => {
      if (enemy.update) {
        enemy.update(time, delta);
      }
    });

    // Parallax scrolling
    if (this.bgFar) {
      this.bgFar.tilePositionX = this.cameras.main.scrollX * 0.2;
    }
    if (this.bgNear) {
      this.bgNear.tilePositionX = this.cameras.main.scrollX * 0.5;
    }
  }

  respawnPlayer() {
    const spawn = this.levelManager.getSpawnPoint();
    this.player.setPosition(spawn.x, spawn.y - 50);
    this.player.setVelocity(0, 0);
    this.player.isInvincible = true;
    this.player.invincibleTimer = GameConfig.player.invincibleTime;
  }

  onPlayerDeath() {
    // Update high score
    if (window.gameState.score > window.gameState.highScore) {
      window.gameState.highScore = window.gameState.score;
      localStorage.setItem('highScore', window.gameState.highScore.toString());
    }

    // Death animation
    this.cameras.main.shake(300, 0.02);

    // Transition to game over
    this.time.delayedCall(1000, () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameOverScene');
      });
    });
  }

  onLevelComplete() {
    // Victory!
    this.cameras.main.flash(500, 255, 255, 255);

    // Update high score
    if (window.gameState.score > window.gameState.highScore) {
      window.gameState.highScore = window.gameState.score;
    }

    // Show victory message
    const victoryText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'LEVEL COMPLETE!',
      {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#48bb78',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    victoryText.setOrigin(0.5);
    victoryText.setScrollFactor(0);
    victoryText.setDepth(200);

    // Return to menu after delay
    this.time.delayedCall(3000, () => {
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('MenuScene');
      });
    });
  }

  onPause() {
    this.scene.pause();
    this.scene.launch('MenuScene');
  }
}
