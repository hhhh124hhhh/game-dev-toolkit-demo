/**
 * Settings Manager
 * 设置管理器 - 使用 localStorage 保存和加载游戏设置
 *
 * 功能:
 * - 默认设置管理
 * - localStorage 读写
 * - 设置变更事件
 * - 重置为默认值
 *
 * 存储结构:
 * localStorage['pixel_adventure_settings_v1'] = { ...settings }
 */

const STORAGE_KEY = 'pixel_adventure_settings_v1';

export class SettingsManager {
  // 默认设置
  static defaults = {
    // 音频设置
    masterVolume: 0.8,
    musicVolume: 0.5,
    sfxVolume: 0.7,

    // 显示设置
    fullscreen: false,
    particles: true,
    screenShake: true,

    // 控制设置
    showControls: true,

    // 游戏进度
    introPlayed: false,
    tutorialComplete: false,

    // 最高分
    highScore: 0
  };

  // 当前设置 (运行时缓存)
  static _settings = null;

  /**
   * 获取所有设置
   */
  static getSettings() {
    if (this._settings) {
      return this._settings;
    }

    // 从 localStorage 加载
    this._settings = this.load();
    return this._settings;
  }

  /**
   * 获取单个设置
   */
  static get(key) {
    const settings = this.getSettings();
    return settings[key] !== undefined ? settings[key] : this.defaults[key];
  }

  /**
   * 设置单个值
   */
  static set(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    this.save();

    // 发出设置变更事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('settingsChanged', {
        detail: { key, value }
      }));
    }
  }

  /**
   * 从 localStorage 加载设置
   */
  static load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 合并默认值 (处理新增设置项)
        return { ...this.defaults, ...parsed };
      }
    } catch (e) {
      console.warn('[SettingsManager] Failed to load settings:', e);
    }

    // 返回默认值的副本
    return { ...this.defaults };
  }

  /**
   * 保存设置到 localStorage
   */
  static save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._settings));
      console.log('[SettingsManager] Settings saved');
    } catch (e) {
      console.error('[SettingsManager] Failed to save settings:', e);
    }
  }

  /**
   * 重置为默认设置
   */
  static reset() {
    this._settings = { ...this.defaults };
    this.save();
    console.log('[SettingsManager] Settings reset to defaults');
  }

  /**
   * 重置特定类别
   */
  static resetCategory(category) {
    const settings = this.getSettings();

    switch (category) {
      case 'audio':
        settings.masterVolume = this.defaults.masterVolume;
        settings.musicVolume = this.defaults.musicVolume;
        settings.sfxVolume = this.defaults.sfxVolume;
        break;
      case 'display':
        settings.fullscreen = this.defaults.fullscreen;
        settings.particles = this.defaults.particles;
        settings.screenShake = this.defaults.screenShake;
        break;
      case 'controls':
        settings.showControls = this.defaults.showControls;
        break;
      case 'progress':
        settings.introPlayed = this.defaults.introPlayed;
        settings.tutorialComplete = this.defaults.tutorialComplete;
        settings.highScore = this.defaults.highScore;
        break;
      default:
        console.warn(`[SettingsManager] Unknown category: ${category}`);
        return;
    }

    this.save();
  }

  /**
   * 应用设置到场景
   */
  static applyToScene(scene) {
    const settings = this.getSettings();

    // 应用音量设置
    if (scene.sound) {
      scene.sound.setVolume(settings.masterVolume);

      // 如果有背景音乐，单独设置音乐音量
      if (scene.bgm) {
        scene.bgm.setVolume(settings.musicVolume * settings.masterVolume);
      }
    }

    // 应用全屏设置
    if (settings.fullscreen && scene.scale) {
      scene.scale.startFullscreen().catch(() => {
        // 全屏请求可能被拒绝
      });
    }

    console.log('[SettingsManager] Settings applied to scene');
  }

  /**
   * 更新最高分
   */
  static updateHighScore(score) {
    const current = this.get('highScore');
    if (score > current) {
      this.set('highScore', score);
      return true; // 新纪录
    }
    return false;
  }

  /**
   * 标记开场动画已播放
   */
  static markIntroPlayed() {
    this.set('introPlayed', true);
  }

  /**
   * 检查是否需要播放开场动画
   */
  static shouldPlayIntro() {
    return !this.get('introPlayed');
  }

  /**
   * 导出设置 (用于调试或备份)
   */
  static export() {
    return JSON.stringify(this.getSettings(), null, 2);
  }

  /**
   * 导入设置 (用于恢复)
   */
  static import(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this._settings = { ...this.defaults, ...imported };
      this.save();
      return true;
    } catch (e) {
      console.error('[SettingsManager] Failed to import settings:', e);
      return false;
    }
  }
}

// 导出默认实例方法
export default SettingsManager;
