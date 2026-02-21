/**
 * Player Entity
 * 玩家实体 - 包含跳跃手感优化和战斗系统
 *
 * 跳跃优化技术 (来自最佳实践):
 * - Coyote Time: 离开平台后短暂仍可跳跃
 * - Jump Buffering: 落地前按跳跃，落地瞬间自动跳
 * - Variable Jump: 按住时间长跳得高
 * - Faster Falling: 下落比上升更快
 */

import { GameConfig, PlayerState, GameEvents } from '../config.js';
import { StateMachine } from '../utils/StateMachine.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_idle');

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Store scene reference
    this.scene = scene;

    // Physics setup
    // 不使用世界边界碰撞，在 update 中手动处理左右边界
    this.setCollideWorldBounds(false);
    this.setBounce(GameConfig.player.bounce);
    this.setSize(24, 32); // Hitbox size
    this.setOffset(4, 0); // Center the hitbox
    this.setDepth(10);

    // Stats
    this.health = GameConfig.player.maxHealth;
    this.maxHealth = GameConfig.player.maxHealth;
    this.isAlive = true;

    // Jump feel variables
    this.groundTime = 0;        // Time since last on ground (for coyote time)
    this.jumpBufferTime = 0;    // Time since jump button pressed (for jump buffering)
    this.isJumping = false;     // Is currently in a jump
    this.jumpHeld = false;      // Is jump button being held

    // Combat variables
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.attackHitbox = null;

    // Projectile shooting
    this.shootCooldown = 0;
    this.shootCooldownTime = 300; // 300ms between shots
    this.projectiles = null; // Will be set by GameScene

    // Invincibility
    this.isInvincible = false;
    this.invincibleTimer = 0;

    // Animation lock for preventing flickering during state transitions
    this.animationLocked = false;
    this.currentAnimation = null;

    // State change debounce
    this.stateChangeCooldown = 0;

    // Input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.jumpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Setup state machine
    this.setupStateMachine();

    // Listen for events
    this.setupEvents();
  }

  setupStateMachine() {
    this.stateMachine = new StateMachine(PlayerState.IDLE, {
      [PlayerState.IDLE]: {
        onEnter: () => this.onIdleEnter(),
        onUpdate: (time, delta) => this.onIdleUpdate(time, delta)
      },
      [PlayerState.RUNNING]: {
        onEnter: () => this.onRunningEnter(),
        onUpdate: (time, delta) => this.onRunningUpdate(time, delta)
      },
      [PlayerState.JUMPING]: {
        onEnter: () => this.onJumpingEnter(),
        onUpdate: (time, delta) => this.onJumpingUpdate(time, delta)
      },
      [PlayerState.FALLING]: {
        onEnter: () => this.onFallingEnter(),
        onUpdate: (time, delta) => this.onFallingUpdate(time, delta)
      },
      [PlayerState.ATTACKING]: {
        onEnter: () => this.onAttackingEnter(),
        onUpdate: (time, delta) => this.onAttackingUpdate(time, delta)
      },
      [PlayerState.HURT]: {
        onEnter: () => this.onHurtEnter(),
        onUpdate: (time, delta) => this.onHurtUpdate(time, delta)
      },
      [PlayerState.DEAD]: {
        onEnter: () => this.onDeadEnter(),
        onUpdate: () => {}
      }
    });
  }

  setupEvents() {
    // Jump key events for variable jump
    this.scene.input.keyboard.on('keydown-SPACE', () => {
      this.jumpBufferTime = GameConfig.jump.jumpBufferTime;
      this.jumpHeld = true;
    });

    this.scene.input.keyboard.on('keyup-SPACE', () => {
      this.jumpHeld = false;
      // Variable jump: cut velocity when releasing jump button
      if (this.body.velocity.y < 0) {
        this.body.velocity.y *= GameConfig.jump.jumpCutMultiplier;
      }
    });
  }

  // ============ Main Update ============
  update(time, delta) {
    if (!this.isAlive) return;

    // Update timers
    this.updateTimers(delta);

    // Handle input
    this.handleInput();

    // Update state machine
    this.stateMachine.update(time, delta);

    // Apply faster falling
    this.applyFasterFalling();

    // Update invincibility visuals
    this.updateInvincibility(delta);

    // 手动处理左右边界（不处理底部，允许掉坑）
    const worldBounds = this.scene.physics.world.bounds;
    if (this.x < 16) {
      this.x = 16;
      this.setVelocityX(0);
    } else if (this.x > worldBounds.width - 16) {
      this.x = worldBounds.width - 16;
      this.setVelocityX(0);
    }
  }

  /**
   * 安全播放动画 - 防止动画卡顿和重复播放
   */
  playAnimation(key) {
    // 如果动画被锁定，不切换
    if (this.animationLocked) return;

    // 如果已经在播放相同的动画，不重复
    if (this.currentAnimation === key) return;

    // 播放新动画 (使用 ignoreIfPlaying=true 避免重复播放导致的卡顿)
    if (this.scene.anims.exists(key)) {
      // 直接播放，不先 stop，避免闪烁
      this.play(key, true);
      this.currentAnimation = key;
    }
  }

  /**
   * 检查是否可以切换状态（防抖）
   */
  canChangeState() {
    return this.stateChangeCooldown <= 0 && !this.animationLocked;
  }

  updateTimers(delta) {
    // Ground time (for coyote time)
    if (this.body.touching.down) {
      this.groundTime = GameConfig.jump.coyoteTime;
    } else {
      this.groundTime = Math.max(0, this.groundTime - delta);
    }

    // Jump buffer time
    this.jumpBufferTime = Math.max(0, this.jumpBufferTime - delta);

    // Attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    // State change debounce cooldown
    if (this.stateChangeCooldown > 0) {
      this.stateChangeCooldown -= delta;
    }
  }

  handleInput() {
    // Horizontal movement
    const speed = this.body.touching.down ? GameConfig.player.speed : GameConfig.player.airSpeed;

    if (this.cursors.left.isDown) {
      this.setVelocityX(-speed);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(speed);
      this.setFlipX(false);
    } else {
      // Deceleration
      this.setVelocityX(this.body.velocity.x * 0.8);
    }

    // Jump with coyote time and jump buffering
    const canJump = this.groundTime > 0 && !this.isJumping;
    const wantsJump = this.jumpBufferTime > 0;

    if (wantsJump && canJump) {
      this.performJump();
    }

    // Attack
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && this.attackCooldown <= 0) {
      this.attack();
    }
  }

  // ============ Jump System ============
  performJump() {
    this.setVelocityY(GameConfig.player.jumpForce);
    this.groundTime = 0;
    this.jumpBufferTime = 0;
    this.isJumping = true;
    this.stateMachine.setState(PlayerState.JUMPING);

    // 播放跳跃音效
    if (this.scene.sound.get('jump')) {
      this.scene.sound.play('jump', { volume: 0.5 });
    }
  }

  applyFasterFalling() {
    // Apply stronger gravity when falling for snappier feel
    if (this.body.velocity.y > 0) {
      this.body.setGravityY(GameConfig.gravity * (GameConfig.jump.fallGravityMultiplier - 1));
    } else {
      this.body.setGravityY(0);
    }

    // Clamp max fall speed
    if (this.body.velocity.y > GameConfig.jump.maxFallSpeed) {
      this.body.velocity.y = GameConfig.jump.maxFallSpeed;
    }
  }

  // ============ Combat System ============
  attack() {
    if (this.isAttacking || this.attackCooldown > 0) return;

    this.isAttacking = true;
    this.attackCooldown = GameConfig.combat.attackCooldown;
    this.stateMachine.setState(PlayerState.ATTACKING);

    // 播放攻击音效
    if (this.scene.sound.get('attack')) {
      this.scene.sound.play('attack', { volume: 0.4 });
    }

    // Create attack hitbox
    this.createAttackHitbox();

    // Attack duration
    this.scene.time.delayedCall(200, () => {
      this.isAttacking = false;
      this.destroyAttackHitbox();
    });
  }

  createAttackHitbox() {
    const offsetX = this.flipX ? -GameConfig.combat.attackRange : 20;
    const x = this.x + offsetX;
    const y = this.y;

    // Create invisible hitbox for attack
    // 增加高度到 48，让玩家更容易打到飞行怪
    this.attackHitbox = this.scene.add.rectangle(
      x, y,
      GameConfig.combat.attackRange, 48,
      0xff0000, 0.3 // Semi-transparent red for debug
    );
    this.scene.physics.add.existing(this.attackHitbox);
    this.attackHitbox.body.setAllowGravity(false);

    // 创建斩击轨迹效果
    this.createSlashEffect(x, y);

    // Emit attack event for combat system to handle
    this.scene.events.emit('player:attack', this.attackHitbox);
  }

  /**
   * 创建斩击轨迹视觉效果
   */
  createSlashEffect(x, y) {
    // 检查纹理是否存在
    if (!this.scene.textures.exists('slash_particle')) {
      return;
    }

    // 创建斩击粒子发射器
    const slashParticles = this.scene.add.particles(x, y, 'slash_particle', {
      speed: { min: 100, max: 250 },
      // 根据朝向设置角度范围
      angle: this.flipX
        ? { min: 150, max: 210 }  // 面向左
        : { min: -30, max: 30 },  // 面向右
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 180,
      quantity: 12,
      blendMode: 'ADD',
      emitting: false
    });

    // 一次性爆发
    slashParticles.explode(12);

    // 创建斩击弧线
    const arc = this.scene.add.graphics();
    arc.lineStyle(3, 0x00ffff, 0.8);

    // 根据朝向绘制弧线
    if (this.flipX) {
      arc.beginPath();
      arc.arc(this.x, y, 40, Phaser.Math.DegToRad(150), Phaser.Math.DegToRad(210), false);
      arc.strokePath();
    } else {
      arc.beginPath();
      arc.arc(this.x, y, 40, Phaser.Math.DegToRad(-30), Phaser.Math.DegToRad(30), false);
      arc.strokePath();
    }

    // 弧线淡出动画
    this.scene.tweens.add({
      targets: arc,
      alpha: 0,
      duration: 150,
      onComplete: () => arc.destroy()
    });

    // 自动销毁粒子
    this.scene.time.delayedCall(250, () => {
      slashParticles.destroy();
    });
  }

  destroyAttackHitbox() {
    if (this.attackHitbox) {
      this.attackHitbox.destroy();
      this.attackHitbox = null;
    }
  }

  // ============ Hurt System ============
  takeDamage(amount = 1, knockbackDirection = 0) {
    console.log('[Player] takeDamage called - isInvincible:', this.isInvincible, 'isAlive:', this.isAlive, 'currentHealth:', this.health);

    // 无敌模式检查 (调试用)
    if (GameConfig.debug.godMode) {
      console.log('[Player] 🛡️ God mode active - damage ignored');
      return;
    }

    if (this.isInvincible || !this.isAlive) {
      console.log('[Player] Damage blocked - invincible or dead');
      return;
    }

    this.health -= amount;
    console.log('[Player] Health after damage:', this.health);
    this.scene.events.emit(GameEvents.PLAYER_HURT, this.health);

    // 播放受伤音效
    if (this.scene.sound.get('hurt')) {
      this.scene.sound.play('hurt', { volume: 0.5 });
    }

    if (this.health <= 0) {
      console.log('[Player] Player died!');
      this.die();
      return;
    }

    // Enter hurt state
    this.stateMachine.setState(PlayerState.HURT);

    // Apply knockback
    const knockbackX = knockbackDirection * GameConfig.combat.knockbackForce;
    this.setVelocity(knockbackX, -200);

    // Start invincibility
    this.isInvincible = true;
    this.invincibleTimer = GameConfig.player.invincibleTime;
  }

  heal(amount = 1) {
    this.health = Math.min(this.health + amount, this.maxHealth);
    this.scene.events.emit(GameEvents.PLAYER_HEAL, this.health);
  }

  die() {
    this.isAlive = false;
    this.stateMachine.setState(PlayerState.DEAD);
    this.scene.events.emit(GameEvents.PLAYER_DIE);

    // 播放死亡音效
    if (this.scene.sound.get('death')) {
      this.scene.sound.play('death', { volume: 0.6 });
    }
  }

  updateInvincibility(delta) {
    if (!this.isInvincible) return;

    this.invincibleTimer -= delta;

    // Flashing effect
    this.setAlpha(Math.sin(this.invincibleTimer * 0.02) > 0 ? 1 : 0.3);

    if (this.invincibleTimer <= 0) {
      this.isInvincible = false;
      this.setAlpha(1);
    }
  }

  // ============ State Callbacks ============
  onIdleEnter() {
    // Play idle animation
    this.playAnimation('player_idle');
    this.setVelocityX(0);
  }

  onIdleUpdate(time, delta) {
    // Check for state transitions with debounce
    if (!this.body.touching.down) {
      if (this.body.velocity.y < 0) {
        this.stateMachine.setState(PlayerState.JUMPING);
      } else {
        this.stateMachine.setState(PlayerState.FALLING);
      }
    } else if (Math.abs(this.body.velocity.x) > 10) {
      if (this.canChangeState()) {
        this.stateChangeCooldown = 50;
        this.stateMachine.setState(PlayerState.RUNNING);
      }
    }
  }

  onRunningEnter() {
    // Play run animation
    this.playAnimation('player_walk');
  }

  onRunningUpdate(time, delta) {
    if (!this.body.touching.down) {
      this.stateMachine.setState(PlayerState.FALLING);
    } else if (Math.abs(this.body.velocity.x) < 10) {
      if (this.canChangeState()) {
        this.stateChangeCooldown = 50;
        this.stateMachine.setState(PlayerState.IDLE);
      }
    }
  }

  onJumpingEnter() {
    // Play jump animation
    this.playAnimation('player_jump');
  }

  onJumpingUpdate(time, delta) {
    if (this.body.velocity.y >= 0) {
      this.stateMachine.setState(PlayerState.FALLING);
    }
  }

  onFallingEnter() {
    // Play fall animation (reuse jump animation for now)
    this.playAnimation('player_jump');
  }

  onFallingUpdate(time, delta) {
    if (this.body.touching.down) {
      this.isJumping = false;
      if (Math.abs(this.body.velocity.x) > 10) {
        this.stateMachine.setState(PlayerState.RUNNING);
      } else {
        this.stateMachine.setState(PlayerState.IDLE);
      }
    }
  }

  onAttackingEnter() {
    // Lock animation during attack to prevent flickering
    this.animationLocked = true;
    this.playAnimation('player_attack');

    // Unlock animation after attack completes
    this.scene.time.delayedCall(250, () => {
      this.animationLocked = false;
    });
  }

  onAttackingUpdate(time, delta) {
    // Attack state is ended by the delayed call in attack()
    // After attack animation completes, restore to appropriate state
    if (!this.animationLocked && !this.isAttacking) {
      if (!this.body.touching.down) {
        this.stateMachine.setState(PlayerState.FALLING);
      } else if (Math.abs(this.body.velocity.x) > 10) {
        this.stateMachine.setState(PlayerState.RUNNING);
      } else {
        this.stateMachine.setState(PlayerState.IDLE);
      }
    }
  }

  onHurtEnter() {
    // Play hurt animation (placeholder)
    this.setTint(0xff0000);
    // Unlock animation when hurt
    this.animationLocked = false;
  }

  onHurtUpdate(time, delta) {
    if (this.body.touching.down && Math.abs(this.body.velocity.x) < 10) {
      this.clearTint();
      this.stateMachine.setState(PlayerState.IDLE);
    }
  }

  onDeadEnter() {
    // Play death animation (placeholder)
    this.setTint(0x666666);
    this.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.animationLocked = false;
  }

  // ============ Getters ============
  getState() {
    return this.stateMachine.getState();
  }

  isGrounded() {
    return this.body.touching.down;
  }
}
