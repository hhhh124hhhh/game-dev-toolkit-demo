import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Economy } from '../../src/systems/Economy.js';

describe('Economy', () => {
  let economy;

  beforeEach(() => {
    economy = new Economy();
  });

  describe('initialization', () => {
    it('should start with initial gold from config', () => {
      // 更新后的配置：startGold = 200
      expect(economy.gold).toBe(200);
    });

    it('should have empty listeners array', () => {
      expect(economy.listeners).toEqual([]);
    });

    it('should have totalEarned set to 0', () => {
      expect(economy.totalEarned).toBe(0);
    });
  });

  describe('addGold', () => {
    it('should add gold to current amount', () => {
      economy.addGold(50);
      expect(economy.gold).toBe(250);
    });

    it('should update totalEarned', () => {
      economy.addGold(50);
      expect(economy.totalEarned).toBe(50);
    });

    it('should notify listeners on change', () => {
      const listener = vi.fn();
      economy.onGoldChange(listener);

      economy.addGold(50);

      expect(listener).toHaveBeenCalledWith(250);
    });
  });

  describe('spendGold', () => {
    it('should deduct gold when enough available', () => {
      const result = economy.spendGold(30);

      expect(result).toBe(true);
      expect(economy.gold).toBe(170);
    });

    it('should not deduct gold when not enough available', () => {
      const result = economy.spendGold(300);

      expect(result).toBe(false);
      expect(economy.gold).toBe(200);
    });

    it('should notify listeners on successful spend', () => {
      const listener = vi.fn();
      economy.onGoldChange(listener);

      economy.spendGold(30);

      expect(listener).toHaveBeenCalledWith(170);
    });

    it('should not notify listeners on failed spend', () => {
      const listener = vi.fn();
      economy.onGoldChange(listener);

      economy.spendGold(300);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('canAfford', () => {
    it('should return true when enough gold', () => {
      expect(economy.canAfford(50)).toBe(true);
      expect(economy.canAfford(200)).toBe(true);
    });

    it('should return false when not enough gold', () => {
      expect(economy.canAfford(201)).toBe(false);
      expect(economy.canAfford(300)).toBe(false);
    });
  });

  describe('calculateWaveBonus', () => {
    it('should return bonus gold for wave 1', () => {
      const bonus = economy.calculateWaveBonus(1);
      expect(bonus).toBe(20); // Wave 1 bonusGold = 20
    });

    it('should return higher bonus for later waves', () => {
      const bonus5 = economy.calculateWaveBonus(5);
      expect(bonus5).toBe(40); // Wave 5 bonusGold = 40
    });
  });

  describe('addWaveBonus', () => {
    it('should add wave bonus to gold', () => {
      const bonus = economy.addWaveBonus(1);
      expect(bonus).toBe(20);
      expect(economy.gold).toBe(220);
    });
  });

  describe('calculateInterest', () => {
    it('should calculate 10% interest', () => {
      // 200 gold * 10% = 20, but max is 5
      const interest = economy.calculateInterest();
      expect(interest).toBe(5); // maxInterest = 5
    });

    it('should return correct interest for lower gold', () => {
      economy.gold = 30; // 30 * 10% = 3
      const interest = economy.calculateInterest();
      expect(interest).toBe(3);
    });

    it('should return 0 if no interest config', () => {
      economy.gold = 0;
      const interest = economy.calculateInterest();
      expect(interest).toBe(0);
    });
  });

  describe('addInterest', () => {
    it('should add interest to gold', () => {
      economy.gold = 100; // 100 * 10% = 10, but max is 5
      const interest = economy.addInterest();
      expect(interest).toBe(5);
      expect(economy.gold).toBe(105);
    });
  });

  describe('processWaveEnd', () => {
    it('should return bonus and interest for wave end', () => {
      economy.gold = 100;
      const result = economy.processWaveEnd(1);

      expect(result.bonus).toBe(20); // Wave 1 bonus
      expect(result.interest).toBe(5); // maxInterest
      expect(result.total).toBe(25);
      expect(economy.gold).toBe(125);
    });
  });

  describe('reset', () => {
    it('should reset gold to initial amount', () => {
      economy.addGold(100);
      economy.spendGold(50);

      economy.reset();

      expect(economy.gold).toBe(200);
    });

    it('should reset totalEarned to 0', () => {
      economy.addGold(100);
      economy.reset();

      expect(economy.totalEarned).toBe(0);
    });

    it('should notify listeners on reset', () => {
      const listener = vi.fn();
      economy.onGoldChange(listener);

      economy.reset();

      expect(listener).toHaveBeenCalledWith(200);
    });
  });

  describe('onGoldChange', () => {
    it('should add callback to listeners', () => {
      const callback = vi.fn();

      economy.onGoldChange(callback);

      expect(economy.listeners).toContain(callback);
    });

    it('should support multiple listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      economy.onGoldChange(callback1);
      economy.onGoldChange(callback2);
      economy.addGold(10);

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });
});
