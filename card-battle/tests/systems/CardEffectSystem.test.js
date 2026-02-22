/**
 * CardEffectSystem Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CardEffectSystem } from '../../src/systems/CardEffectSystem.js';
import { EffectType } from '../../src/config.js';

describe('CardEffectSystem', () => {
  let effectSystem;
  let mockScene;
  let mockTarget;

  beforeEach(() => {
    mockScene = {
      events: {
        emit: vi.fn()
      }
    };

    mockTarget = {
      takeDamage: vi.fn(),
      heal: vi.fn(),
      addBlock: vi.fn(),
      addBuff: vi.fn(),
      addDebuff: vi.fn()
    };

    effectSystem = new CardEffectSystem(mockScene);
  });

  describe('initialization', () => {
    it('should have all effect handlers registered', () => {
      expect(effectSystem.effectHandlers[EffectType.DAMAGE]).toBeDefined();
      expect(effectSystem.effectHandlers[EffectType.HEAL]).toBeDefined();
      expect(effectSystem.effectHandlers[EffectType.DRAW]).toBeDefined();
      expect(effectSystem.effectHandlers[EffectType.DISCARD]).toBeDefined();
      expect(effectSystem.effectHandlers[EffectType.BLOCK]).toBeDefined();
    });
  });

  describe('resolve', () => {
    it('should call damage handler for damage effect', () => {
      const card = { name: 'Strike' };
      const effect = { type: EffectType.DAMAGE, value: 10 };

      effectSystem.resolve(card, effect, mockTarget);

      expect(mockTarget.takeDamage).toHaveBeenCalledWith(10);
    });

    it('should call heal handler for heal effect', () => {
      const card = { name: 'Heal' };
      const effect = { type: EffectType.HEAL, value: 5 };

      effectSystem.resolve(card, effect, mockTarget);

      expect(mockTarget.heal).toHaveBeenCalledWith(5);
    });

    it('should emit drawCards event for draw effect', () => {
      const card = { name: 'Draw' };
      const effect = { type: EffectType.DRAW, value: 2 };

      effectSystem.resolve(card, effect, mockTarget);

      expect(mockScene.events.emit).toHaveBeenCalledWith('drawCards', { count: 2 });
    });

    it('should emit discardCards event for discard effect', () => {
      const card = { name: 'Discard' };
      const effect = { type: EffectType.DISCARD, value: 1 };

      effectSystem.resolve(card, effect, mockTarget);

      expect(mockScene.events.emit).toHaveBeenCalledWith('discardCards', { count: 1 });
    });

    it('should call addBlock handler for block effect', () => {
      const card = { name: 'Defend' };
      const effect = { type: EffectType.BLOCK, value: 5 };

      effectSystem.resolve(card, effect, mockTarget);

      expect(mockTarget.addBlock).toHaveBeenCalledWith(5);
    });

    it('should return error for unknown effect type', () => {
      const card = { name: 'Unknown' };
      const effect = { type: 'unknown_type' };

      const result = effectSystem.resolve(card, effect, mockTarget);

      expect(result.success).toBe(false);
    });

    it('should emit effectResolved event', () => {
      const card = { name: 'Strike' };
      const effect = { type: EffectType.DAMAGE, value: 10 };

      effectSystem.resolve(card, effect, mockTarget);

      expect(mockScene.events.emit).toHaveBeenCalledWith(
        'effectResolved',
        expect.objectContaining({
          card,
          effect,
          target: mockTarget
        })
      );
    });
  });

  describe('damage effect', () => {
    it('should deal damage to target', () => {
      const card = { name: 'Strike' };
      const effect = { type: EffectType.DAMAGE, value: 6 };

      const result = effectSystem.resolve(card, effect, mockTarget);

      expect(result.type).toBe('damage');
      expect(result.value).toBe(6);
    });

    it('should emit damageDealt event', () => {
      const card = { name: 'Strike' };
      const effect = { type: EffectType.DAMAGE, value: 6 };

      effectSystem.resolve(card, effect, mockTarget);

      expect(mockScene.events.emit).toHaveBeenCalledWith(
        'damageDealt',
        expect.objectContaining({
          card,
          damage: 6,
          target: mockTarget
        })
      );
    });

    it('should handle missing target gracefully', () => {
      const card = { name: 'Strike' };
      const effect = { type: EffectType.DAMAGE, value: 6 };

      // Should not throw
      const result = effectSystem.resolve(card, effect, null);
      expect(result.type).toBe('damage');
    });
  });

  describe('heal effect', () => {
    it('should heal target', () => {
      const card = { name: 'Heal' };
      const effect = { type: EffectType.HEAL, value: 8 };

      const result = effectSystem.resolve(card, effect, mockTarget);

      expect(result.type).toBe('heal');
      expect(result.value).toBe(8);
    });
  });

  describe('draw effect', () => {
    it('should draw cards', () => {
      const card = { name: 'Draw' };
      const effect = { type: EffectType.DRAW, value: 3 };

      const result = effectSystem.resolve(card, effect, mockTarget);

      expect(result.type).toBe('draw');
      expect(result.count).toBe(3);
    });

    it('should default to 1 card if value not specified', () => {
      const card = { name: 'Draw' };
      const effect = { type: EffectType.DRAW };

      const result = effectSystem.resolve(card, effect, mockTarget);

      expect(result.count).toBe(1);
    });
  });

  describe('validateEffect', () => {
    it('should validate damage effect with value', () => {
      const effect = { type: EffectType.DAMAGE, value: 10 };
      expect(effectSystem.validateEffect(effect)).toBe(true);
    });

    it('should reject damage effect without value', () => {
      const effect = { type: EffectType.DAMAGE };
      expect(effectSystem.validateEffect(effect)).toBe(false);
    });

    it('should reject effect without type', () => {
      const effect = { value: 10 };
      expect(effectSystem.validateEffect(effect)).toBe(false);
    });

    it('should reject unknown effect type', () => {
      const effect = { type: 'unknown', value: 10 };
      expect(effectSystem.validateEffect(effect)).toBe(false);
    });
  });
});
