import { TOWER_CONFIG } from '../config.js';

/**
 * UIScene - UI 覆盖场景
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // 获取游戏场景引用
    this.gameScene = this.scene.get('GameScene');

    // 创建HUD
    this.createHUD();

    // 创建塔选择面板
    this.createTowerPanel();

    // 监听游戏事件
    this.setupListeners();
  }

  /**
   * 创建HUD
   */
  createHUD() {
    // 顶部信息栏背景
    const topBar = this.add.graphics();
    topBar.fillStyle(0x000000, 0.7);
    topBar.fillRect(0, 0, 800, 50);

    // 金币显示
    this.add.image(30, 25, 'icon_gold').setScale(0.8);
    this.goldText = this.add.text(50, 12, '200', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    });

    // 生命显示
    this.add.image(150, 25, 'icon_heart').setScale(0.8);
    this.livesText = this.add.text(170, 12, '30', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    });

    // 波次显示
    this.add.image(760, 25, 'banner_wave').setOrigin(1, 0.5).setScale(0.8);
    this.waveText = this.add.text(760, 12, 'Wave 0/10', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      fontStyle: 'bold'
    }).setOrigin(1, 0);
  }

  /**
   * 创建塔选择面板
   */
  createTowerPanel() {
    // 底部面板背景 - 更高更清晰
    const bottomPanel = this.add.graphics();
    bottomPanel.fillStyle(0x1a1a2e, 0.95);
    bottomPanel.fillRect(0, 470, 800, 130);
    // 顶部边框线
    bottomPanel.lineStyle(3, 0x4a4a6a, 1);
    bottomPanel.lineBetween(0, 470, 800, 470);

    // 塔按钮配置
    const towerTypes = ['arrow', 'mage', 'cannon', 'slow'];
    const startX = 110;
    const spacing = 170;

    this.towerButtons = [];

    towerTypes.forEach((type, index) => {
      const config = TOWER_CONFIG[type];
      const x = startX + index * spacing;
      const y = 535;

      // 按钮背景容器 - 自定义绘制
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x2a2a4a, 1);
      btnBg.fillRoundedRect(x - 70, y - 50, 140, 100, 10);
      btnBg.lineStyle(2, 0x6a6aaa, 1);
      btnBg.strokeRoundedRect(x - 70, y - 50, 140, 100, 10);

      // 按钮交互区域
      const hitArea = this.add.rectangle(x, y, 140, 100, 0x000000, 0).setInteractive();

      // 塔图标 - 左侧
      const icon = this.add.image(x - 30, y - 10, `tower_${type}`).setScale(1.1);

      // 塔名称 - 右侧上方
      const nameText = this.add.text(x + 15, y - 20, config.name, {
        fontSize: '22px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 塔价格 - 右侧下方
      const priceText = this.add.text(x + 15, y + 15, `${config.cost} G`, {
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 交互
      hitArea.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x3a3a5a, 1);
        btnBg.fillRoundedRect(x - 70, y - 50, 140, 100, 10);
        btnBg.lineStyle(3, 0x8888ff, 1);
        btnBg.strokeRoundedRect(x - 70, y - 50, 140, 100, 10);
        this.showTowerInfo(type);
      });

      hitArea.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x2a2a4a, 1);
        btnBg.fillRoundedRect(x - 70, y - 50, 140, 100, 10);
        btnBg.lineStyle(2, 0x6a6aaa, 1);
        btnBg.strokeRoundedRect(x - 70, y - 50, 140, 100, 10);
        this.hideTowerInfo();
      });

      hitArea.on('pointerdown', () => {
        this.selectTower(type);
        // 选中效果
        btnBg.clear();
        btnBg.fillStyle(0x2a4a2a, 1);
        btnBg.fillRoundedRect(x - 70, y - 50, 140, 100, 10);
        btnBg.lineStyle(3, 0x00ff00, 1);
        btnBg.strokeRoundedRect(x - 70, y - 50, 140, 100, 10);
      });

      this.towerButtons.push({ hitArea, btnBg, type, x, y });
    });

    // 取消选择按钮 - 更醒目
    const cancelBtn = this.add.graphics();
    cancelBtn.fillStyle(0x4a2a2a, 1);
    cancelBtn.fillRoundedRect(700, 490, 80, 90, 8);
    cancelBtn.lineStyle(2, 0xaa6666, 1);
    cancelBtn.strokeRoundedRect(700, 490, 80, 90, 8);

    const cancelText = this.add.text(740, 535, '取消', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff8888',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const cancelHitArea = this.add.rectangle(740, 535, 80, 90, 0x000000, 0).setInteractive();
    cancelHitArea.on('pointerdown', () => {
      this.deselectTower();
    });
  }

  /**
   * 选择塔
   */
  selectTower(type) {
    // 重置所有按钮样式
    this.towerButtons.forEach(tb => {
      tb.btnBg.clear();
      tb.btnBg.fillStyle(0x2a2a4a, 1);
      tb.btnBg.fillRoundedRect(tb.x - 70, tb.y - 50, 140, 100, 10);
      tb.btnBg.lineStyle(2, 0x6a6aaa, 1);
      tb.btnBg.strokeRoundedRect(tb.x - 70, tb.y - 50, 140, 100, 10);
    });

    // 高亮当前选择
    const selected = this.towerButtons.find(tb => tb.type === type);
    if (selected) {
      selected.btnBg.clear();
      selected.btnBg.fillStyle(0x2a4a2a, 1);
      selected.btnBg.fillRoundedRect(selected.x - 70, selected.y - 50, 140, 100, 10);
      selected.btnBg.lineStyle(3, 0x00ff00, 1);
      selected.btnBg.strokeRoundedRect(selected.x - 70, selected.y - 50, 140, 100, 10);
    }

    this.selectedTowerType = type;
    this.gameScene.selectedTowerType = type;
  }

  /**
   * 取消选择
   */
  deselectTower() {
    // 重置所有按钮样式
    this.towerButtons.forEach(tb => {
      tb.btnBg.clear();
      tb.btnBg.fillStyle(0x2a2a4a, 1);
      tb.btnBg.fillRoundedRect(tb.x - 70, tb.y - 50, 140, 100, 10);
      tb.btnBg.lineStyle(2, 0x6a6aaa, 1);
      tb.btnBg.strokeRoundedRect(tb.x - 70, tb.y - 50, 140, 100, 10);
    });
    this.selectedTowerType = null;
    this.gameScene.selectedTowerType = null;
  }

  /**
   * 显示塔信息
   */
  showTowerInfo(type) {
    const config = TOWER_CONFIG[type];

    if (this.infoPanel) {
      this.infoPanel.destroy();
    }

    this.infoPanel = this.add.container(400, 90);

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.9);
    bg.fillRoundedRect(-180, -45, 360, 90, 8);
    this.infoPanel.add(bg);

    // 信息
    const infoText = this.add.text(0, -25, config.description, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.infoPanel.add(infoText);

    const statsText = this.add.text(0, 10,
      `伤害: ${config.damage} | 范围: ${config.range} | 射速: ${config.fireRate}ms`, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.infoPanel.add(statsText);
  }

  /**
   * 隐藏塔信息
   */
  hideTowerInfo() {
    if (this.infoPanel) {
      this.infoPanel.destroy();
      this.infoPanel = null;
    }
  }

  /**
   * 设置事件监听
   */
  setupListeners() {
    // 延迟设置监听器，确保游戏场景已完全初始化
    this.time.delayedCall(100, () => {
      // 初始化显示
      if (this.gameScene.economy) {
        this.goldText.setText(this.gameScene.economy.gold.toString());
      }
      if (this.gameScene.lives !== undefined) {
        this.livesText.setText(this.gameScene.lives.toString());
      }

      // 监听经济变化
      if (this.gameScene.economy) {
        this.gameScene.economy.onGoldChange((gold) => {
          if (this.goldText && this.goldText.active) {
            this.goldText.setText(gold.toString());
          }
        });
      }
    });

    // 金币变化
    this.gameScene.events.on('gold-changed', (gold) => {
      if (this.goldText && this.goldText.active) {
        this.goldText.setText(gold.toString());
      }
    });

    // 生命变化
    this.gameScene.events.on('lives-changed', (lives) => {
      if (this.livesText && this.livesText.active) {
        this.livesText.setText(lives.toString());
      }
    });

    // 波次开始
    this.gameScene.events.on('wave-started', (data) => {
      if (this.waveText && this.waveText.active) {
        this.waveText.setText(`Wave ${data.wave}/${this.gameScene.waveManager.totalWaves}`);
      }

      // Boss波警告
      if (data.isBossWave) {
        this.showBossWarning();
      }
    });

    // 游戏准备
    this.gameScene.events.on('game-ready', (data) => {
      if (this.goldText && this.goldText.active) {
        this.goldText.setText(data.gold.toString());
      }
      if (this.livesText && this.livesText.active) {
        this.livesText.setText(data.lives.toString());
      }
    });
  }

  /**
   * 显示Boss警告
   */
  showBossWarning() {
    const warning = this.add.text(400, 300, '⚠ BOSS来袭! ⚠', {
      fontSize: '48px',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: warning,
      alpha: 0,
      scale: 2,
      duration: 2000,
      onComplete: () => warning.destroy()
    });
  }
}
