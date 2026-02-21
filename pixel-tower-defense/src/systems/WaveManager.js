import { WAVE_CONFIG, ENEMY_CONFIG, GAME_CONFIG } from '../config.js';
import { Enemy } from '../entities/Enemy.js';

/**
 * WaveManager - 波次管理系统
 */
export class WaveManager {
  constructor(scene, spawnCallback) {
    this.scene = scene;
    this.spawnCallback = spawnCallback;

    // 状态初始化（防止 undefined）
    this.currentWave = 0;
    this.enemiesToSpawn = [];
    this.spawnTimer = null;
    this.isWaveActive = false;
    this.totalWaves = WAVE_CONFIG.length;
  }

  /**
   * 开始下一波
   */
  startNextWave() {
    if (this.currentWave >= this.totalWaves) {
      // 所有波次完成
      this.scene.events.emit('waves-complete');
      return;
    }

    this.currentWave++;
    const waveConfig = WAVE_CONFIG[this.currentWave - 1];

    // 复制敌人列表
    this.enemiesToSpawn = [...waveConfig.enemies];
    this.isWaveActive = true;

    // 通知UI
    this.scene.events.emit('wave-started', {
      wave: this.currentWave,
      isBossWave: waveConfig.isBossWave || false,
      enemyCount: this.enemiesToSpawn.length
    });

    // 开始生成敌人
    this.scheduleNextSpawn(waveConfig.delay || GAME_CONFIG.balance.spawnDelay);
  }

  /**
   * 安排下一个敌人生成
   */
  scheduleNextSpawn(delay) {
    if (this.enemiesToSpawn.length === 0) {
      this.isWaveActive = false;
      this.scene.events.emit('wave-enemies-spawned', this.currentWave);
      return;
    }

    this.spawnTimer = this.scene.time.delayedCall(delay, () => {
      this.spawnNextEnemy();
    });
  }

  /**
   * 生成下一个敌人
   */
  spawnNextEnemy() {
    if (this.enemiesToSpawn.length === 0) return;

    const enemyType = this.enemiesToSpawn.shift();

    // 调用回调生成敌人
    if (this.spawnCallback) {
      this.spawnCallback(enemyType);
    }

    // 安排下一个
    this.scheduleNextSpawn(GAME_CONFIG.balance.spawnDelay);
  }

  /**
   * 获取当前波次信息
   */
  getWaveInfo() {
    return {
      current: this.currentWave,
      total: this.totalWaves,
      enemiesRemaining: this.enemiesToSpawn.length,
      isActive: this.isWaveActive
    };
  }

  /**
   * 检查是否所有波次完成
   */
  isComplete() {
    return this.currentWave >= this.totalWaves;
  }

  /**
   * 重置波次管理器
   */
  reset() {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
    this.currentWave = 0;
    this.enemiesToSpawn = [];
    this.isWaveActive = false;
  }
}
