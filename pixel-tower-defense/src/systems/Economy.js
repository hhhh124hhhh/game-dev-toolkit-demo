import { GAME_CONFIG, WAVE_CONFIG } from '../config.js';

/**
 * Economy - 经济系统
 * 支持多种收入来源：击杀奖励、波次奖励、利息
 */
export class Economy {
  constructor() {
    this.gold = GAME_CONFIG.balance.startGold;
    this.listeners = [];
    this.totalEarned = 0;  // 追踪总收入
  }

  /**
   * 添加金币变化监听器
   */
  onGoldChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * 通知所有监听器
   */
  notify() {
    this.listeners.forEach(cb => cb(this.gold));
  }

  /**
   * 添加金币
   * @param {number} amount - 数量
   * @param {string} source - 来源（可选，用于调试）
   */
  addGold(amount, source = 'unknown') {
    this.gold += amount;
    this.totalEarned += amount;
    console.log(`[Economy] +${amount} gold (${source}), total: ${this.gold}`);
    this.notify();
  }

  /**
   * 花费金币
   * @param {number} amount - 数量
   * @returns {boolean} 是否成功
   */
  spendGold(amount) {
    if (this.gold >= amount) {
      this.gold -= amount;
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * 检查是否有足够金币
   */
  canAfford(amount) {
    return this.gold >= amount;
  }

  /**
   * 计算波次完成奖励
   * @param {number} waveNumber - 波次编号（从1开始）
   * @returns {number} 奖励金币数量
   */
  calculateWaveBonus(waveNumber) {
    // 从波次配置中获取奖励，如果没有则使用默认值
    const waveConfig = WAVE_CONFIG[waveNumber - 1];
    const baseBonus = waveConfig?.bonusGold ?? GAME_CONFIG.balance.waveBonusGold;
    return baseBonus;
  }

  /**
   * 添加波次完成奖励
   * @param {number} waveNumber - 波次编号
   */
  addWaveBonus(waveNumber) {
    const bonus = this.calculateWaveBonus(waveNumber);
    this.addGold(bonus, `wave ${waveNumber} bonus`);
    return bonus;
  }

  /**
   * 计算利息
   * 利息 = min(当前金币 × 利率, 最大利息)
   * @returns {number} 利息金额
   */
  calculateInterest() {
    const interestRate = GAME_CONFIG.balance.interestRate || 0;
    const maxInterest = GAME_CONFIG.balance.maxInterest || 0;

    if (interestRate === 0 || maxInterest === 0) {
      return 0;
    }

    const rawInterest = Math.floor(this.gold * interestRate);
    return Math.min(rawInterest, maxInterest);
  }

  /**
   * 添加利息
   */
  addInterest() {
    const interest = this.calculateInterest();
    if (interest > 0) {
      this.addGold(interest, 'interest');
    }
    return interest;
  }

  /**
   * 处理波次结束（奖励 + 利息）
   * @param {number} waveNumber - 波次编号
   * @returns {{ bonus: number, interest: number, total: number }}
   */
  processWaveEnd(waveNumber) {
    const bonus = this.addWaveBonus(waveNumber);
    const interest = this.addInterest();

    return {
      bonus,
      interest,
      total: bonus + interest
    };
  }

  /**
   * 重置经济
   */
  reset() {
    this.gold = GAME_CONFIG.balance.startGold;
    this.totalEarned = 0;
    this.notify();
  }
}
