/**
 * HUD 游戏界面显示
 * 《暗影森林》Shadow Forest
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;

    // HUD 容器
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);

    // 创建各个组件
    this.createHealthBar();
    this.createManaBar();
    this.createExpBar();
    this.createLevelBadge();
    this.createScoreDisplay();
    this.createSkillBar();
  }

  createHealthBar() {
    const config = GAME_CONFIG.UI.HEALTH_BAR;

    // 背景
    this.healthBarBg = this.scene.add.image(config.X, config.Y, 'bar-bg');
    this.healthBarBg.setOrigin(0, 0);
    this.container.add(this.healthBarBg);

    // 填充
    this.healthBarFill = this.scene.add.image(config.X + 2, config.Y + 2, 'health-fill');
    this.healthBarFill.setOrigin(0, 0);
    this.container.add(this.healthBarFill);

    // 文字
    this.healthText = this.scene.add.text(
      config.X + config.WIDTH / 2,
      config.Y + config.HEIGHT / 2,
      '100/100',
      {
        fontFamily: 'Arial',
        fontSize: '12px',
        fill: '#ffffff'
      }
    );
    this.healthText.setOrigin(0.5, 0.5);
    this.container.add(this.healthText);

    // 标签
    const label = this.scene.add.text(config.X, config.Y - 12, 'HP', {
      fontFamily: 'Arial',
      fontSize: '10px',
      fill: '#e74c3c'
    });
    this.container.add(label);
  }

  createManaBar() {
    const config = GAME_CONFIG.UI.MANA_BAR;

    // 背景
    this.manaBarBg = this.scene.add.image(config.X, config.Y, 'bar-bg');
    this.manaBarBg.setOrigin(0, 0);
    this.manaBarBg.setScale(config.WIDTH / 200, config.HEIGHT / 20);
    this.container.add(this.manaBarBg);

    // 填充
    this.manaBarFill = this.scene.add.image(config.X + 2, config.Y + 2, 'mana-fill');
    this.manaBarFill.setOrigin(0, 0);
    this.manaBarFill.setScale(0.98, 0.8);
    this.container.add(this.manaBarFill);

    // 文字
    this.manaText = this.scene.add.text(
      config.X + config.WIDTH / 2,
      config.Y + config.HEIGHT / 2,
      '80/80',
      {
        fontFamily: 'Arial',
        fontSize: '10px',
        fill: '#ffffff'
      }
    );
    this.manaText.setOrigin(0.5, 0.5);
    this.container.add(this.manaText);

    // 标签
    const label = this.scene.add.text(config.X, config.Y - 10, 'MP', {
      fontFamily: 'Arial',
      fontSize: '9px',
      fill: '#3498db'
    });
    this.container.add(label);
  }

  createExpBar() {
    const config = GAME_CONFIG.UI.EXP_BAR;

    // 背景
    this.expBarBg = this.scene.add.rectangle(
      config.X + config.WIDTH / 2,
      config.Y + config.HEIGHT / 2,
      config.WIDTH,
      config.HEIGHT,
      0x1a1a1a
    );
    this.container.add(this.expBarBg);

    // 填充
    this.expBarFill = this.scene.add.rectangle(
      config.X + config.WIDTH / 2,
      config.Y + config.HEIGHT / 2,
      config.WIDTH - 4,
      config.HEIGHT - 4,
      0xf1c40f
    );
    this.expBarFill.setOrigin(0.5, 0.5);
    this.container.add(this.expBarFill);

    // 标签
    this.expText = this.scene.add.text(config.X + config.WIDTH + 5, config.Y, '0/100', {
      fontFamily: 'Arial',
      fontSize: '9px',
      fill: '#f1c40f'
    });
    this.container.add(this.expText);
  }

  createLevelBadge() {
    const x = GAME_CONFIG.UI.HEALTH_BAR.X + GAME_CONFIG.UI.HEALTH_BAR.WIDTH + 20;
    const y = GAME_CONFIG.UI.HEALTH_BAR.Y + 10;

    // 徽章背景
    const badge = this.scene.add.rectangle(x, y, 60, 30, 0xffd700, 0.9);
    badge.setStrokeStyle(2, 0xffffff);
    this.container.add(badge);

    // 等级文字
    this.levelText = this.scene.add.text(x, y, 'Lv.1', {
      fontFamily: 'Arial',
      fontSize: '14px',
      fontStyle: 'bold',
      fill: '#1a1a1a'
    });
    this.levelText.setOrigin(0.5, 0.5);
    this.container.add(this.levelText);
  }

  createScoreDisplay() {
    const { width } = this.scene.cameras.main;

    // 分数
    this.scoreText = this.scene.add.text(width - 20, 20, 'Score: 0', {
      fontFamily: 'Arial',
      fontSize: '20px',
      fontStyle: 'bold',
      fill: '#ffffff'
    });
    this.scoreText.setOrigin(1, 0);
    this.container.add(this.scoreText);

    // 击杀数
    this.killsText = this.scene.add.text(width - 20, 50, 'Kills: 0', {
      fontFamily: 'Arial',
      fontSize: '14px',
      fill: '#e74c3c'
    });
    this.killsText.setOrigin(1, 0);
    this.container.add(this.killsText);
  }

  createSkillBar() {
    const { width } = this.scene.cameras.main;
    const config = GAME_CONFIG.UI.SKILL_BAR;
    const centerX = width / 2;
    const y = config.Y;
    const opacity = config.OPACITY || 0.7;

    // 技能槽
    this.skillSlots = [];

    for (let i = 0; i < 4; i++) {
      const slotX = centerX - ((4 * (config.SLOT_SIZE + config.GAP)) / 2) + i * (config.SLOT_SIZE + config.GAP) + config.SLOT_SIZE / 2;

      // 槽位背景 - 使用透明度
      const slot = this.scene.add.image(slotX, y, 'skill-slot');
      slot.setAlpha(opacity);
      slot.setScale(config.SLOT_SIZE / 64); // 根据配置缩放
      this.container.add(slot);

      // 快捷键提示
      const keyText = this.scene.add.text(slotX, y + config.SLOT_SIZE / 2 + 8, (i + 1).toString(), {
        fontFamily: 'Arial',
        fontSize: '11px',
        fill: '#888888'
      });
      keyText.setOrigin(0.5, 0);
      keyText.setAlpha(opacity);
      this.container.add(keyText);

      this.skillSlots.push({
        slot,
        keyText,
        cooldown: null
      });
    }

    // 攻击和技能提示 - 缩小字体
    const attackHint = this.scene.add.text(centerX - 80, y - 30, 'J: 攻击', {
      fontFamily: 'Arial',
      fontSize: '11px',
      fill: '#ffffff'
    });
    attackHint.setAlpha(opacity);
    this.container.add(attackHint);

    const skillHint = this.scene.add.text(centerX + 40, y - 30, 'K: 技能', {
      fontFamily: 'Arial',
      fontSize: '11px',
      fill: '#3498db'
    });
    skillHint.setAlpha(opacity);
    this.container.add(skillHint);
  }

  update(player) {
    if (!player) return;

    // 更新血条
    this.updateHealthBar(player);

    // 更新魔法条
    this.updateManaBar(player);

    // 更新经验条
    this.updateExpBar(player);

    // 更新等级
    this.updateLevel(player);

    // 更新分数
    this.updateScore();
  }

  updateHealthBar(player) {
    const config = GAME_CONFIG.UI.HEALTH_BAR;
    const ratio = player.maxHealth > 0 ? player.health / player.maxHealth : 0;

    // 更新填充宽度
    const fillWidth = Math.max(0, ratio * (config.WIDTH - 4));
    this.healthBarFill.setScale(fillWidth / 196, 1);

    // 更新文字
    this.healthText.setText(`${Math.ceil(player.health)}/${player.maxHealth}`);

    // 根据血量改变颜色
    if (ratio < 0.3) {
      this.healthText.setFill('#ff0000');
    } else if (ratio < 0.6) {
      this.healthText.setFill('#ffff00');
    } else {
      this.healthText.setFill('#ffffff');
    }
  }

  updateManaBar(player) {
    const config = GAME_CONFIG.UI.MANA_BAR;
    const ratio = player.maxMana > 0 ? player.mana / player.maxMana : 0;

    const fillWidth = Math.max(0, ratio * (config.WIDTH - 4));
    this.manaBarFill.setScale(fillWidth / 196, 0.8);

    this.manaText.setText(`${Math.ceil(player.mana)}/${player.maxMana}`);
  }

  updateExpBar(player) {
    const config = GAME_CONFIG.UI.EXP_BAR;
    const ratio = player.expToNextLevel > 0 ? player.exp / player.expToNextLevel : 0;

    const fillWidth = Math.max(0, ratio * (config.WIDTH - 4));
    this.expBarFill.setSize(fillWidth, config.HEIGHT - 4);

    this.expText.setText(`${player.exp}/${player.expToNextLevel}`);
  }

  updateLevel(player) {
    this.levelText.setText(`Lv.${player.level}`);
  }

  updateScore() {
    this.scoreText.setText(`Score: ${this.scene.score}`);
    this.killsText.setText(`Kills: ${this.scene.enemiesKilled}`);
  }

  // 显示技能冷却
  showSkillCooldown(slotIndex, duration) {
    if (slotIndex < 0 || slotIndex >= this.skillSlots.length) return;

    const slot = this.skillSlots[slotIndex];

    // 创建冷却遮罩
    if (!slot.cooldown) {
      slot.cooldown = this.scene.add.image(
        slot.slot.x,
        slot.slot.y,
        'cooldown-mask'
      );
      this.container.add(slot.cooldown);
    }

    // 冷却动画
    this.scene.tweens.add({
      targets: slot.cooldown,
      scaleY: 0,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        if (slot.cooldown) {
          slot.cooldown.destroy();
          slot.cooldown = null;
        }
      }
    });
  }

  // 隐藏 HUD
  hide() {
    this.container.setVisible(false);
  }

  // 显示 HUD
  show() {
    this.container.setVisible(true);
  }

  // 销毁 HUD
  destroy() {
    this.container.destroy();
  }
}
