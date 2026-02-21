import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WaveManager } from '../../src/systems/WaveManager.js';
import { createMockScene } from '../setup.js';

describe('WaveManager', () => {
  let scene;
  let waveManager;
  let spawnCallback;

  beforeEach(() => {
    scene = createMockScene();
    spawnCallback = vi.fn();
    waveManager = new WaveManager(scene, spawnCallback);
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(waveManager.currentWave).toBe(0);
      expect(waveManager.enemiesToSpawn).toEqual([]);
      expect(waveManager.isWaveActive).toBe(false);
    });

    it('should have totalWaves from config', () => {
      expect(waveManager.totalWaves).toBe(10);
    });
  });

  describe('startNextWave', () => {
    it('should increment currentWave', () => {
      waveManager.startNextWave();

      expect(waveManager.currentWave).toBe(1);
    });

    it('should set isWaveActive to true', () => {
      waveManager.startNextWave();

      expect(waveManager.isWaveActive).toBe(true);
    });

    it('should populate enemiesToSpawn from wave config', () => {
      waveManager.startNextWave();

      expect(waveManager.enemiesToSpawn.length).toBeGreaterThan(0);
    });

    it('should emit wave-started event', () => {
      waveManager.startNextWave();

      expect(scene.events.emit).toHaveBeenCalledWith('wave-started', expect.objectContaining({
        wave: 1,
        isBossWave: false,
        enemyCount: expect.any(Number)
      }));
    });

    it('should mark boss wave correctly', () => {
      // 跳到第9波（下一波是Boss波 - Wave 10）
      waveManager.currentWave = 9;
      waveManager.startNextWave();

      expect(scene.events.emit).toHaveBeenCalledWith('wave-started', expect.objectContaining({
        isBossWave: true
      }));
    });
  });

  describe('getWaveInfo', () => {
    it('should return current wave info', () => {
      const info = waveManager.getWaveInfo();

      expect(info).toEqual({
        current: 0,
        total: 10,
        enemiesRemaining: 0,
        isActive: false
      });
    });

    it('should reflect active wave state', () => {
      waveManager.startNextWave();

      const info = waveManager.getWaveInfo();

      expect(info.isActive).toBe(true);
      expect(info.current).toBe(1);
    });
  });

  describe('isComplete', () => {
    it('should return false when waves remain', () => {
      expect(waveManager.isComplete()).toBe(false);
    });

    it('should return true when all waves done', () => {
      waveManager.currentWave = waveManager.totalWaves;

      expect(waveManager.isComplete()).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      waveManager.startNextWave();
      waveManager.reset();

      expect(waveManager.currentWave).toBe(0);
      expect(waveManager.enemiesToSpawn).toEqual([]);
      expect(waveManager.isWaveActive).toBe(false);
    });
  });
});
