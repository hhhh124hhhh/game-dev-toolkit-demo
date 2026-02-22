/**
 * CardEffectSystem - Card effect resolution
 */

import { EffectType } from '../config.js';

export class CardEffectSystem {
  constructor(scene) {
    this.scene = scene;

    // Register effect handlers
    this.effectHandlers = {
      [EffectType.DAMAGE]: this.handleDamage.bind(this),
      [EffectType.HEAL]: this.handleHeal.bind(this),
      [EffectType.DRAW]: this.handleDraw.bind(this),
      [EffectType.DISCARD]: this.handleDiscard.bind(this),
      [EffectType.BLOCK]: this.handleBlock.bind(this),
      [EffectType.BUFF]: this.handleBuff.bind(this),
      [EffectType.DEBUFF]: this.handleDebuff.bind(this)
    };
  }

  /**
   * Resolve a card effect
   * @param {Object} card - Card being played
   * @param {Object} effect - Effect to resolve
   * @param {Object} target - Target of effect
   * @returns {Object} - Effect result
   */
  resolve(card, effect, target) {
    const handler = this.effectHandlers[effect.type];

    if (!handler) {
      console.warn(`[CardEffectSystem] Unknown effect type: ${effect.type}`);
      return { success: false, error: 'Unknown effect type' };
    }

    const result = handler(card, effect, target);

    // Emit effect resolved event
    this.scene.events.emit('effectResolved', {
      card,
      effect,
      target,
      result
    });

    return result;
  }

  /**
   * Handle damage effect
   */
  handleDamage(card, effect, target) {
    const damage = effect.value;

    if (target && typeof target.takeDamage === 'function') {
      target.takeDamage(damage);
    }

    // Visual feedback
    this.scene.events.emit('damageDealt', {
      card,
      damage,
      target
    });

    console.log(`[CardEffectSystem] ${card.name} dealt ${damage} damage`);

    return { type: 'damage', value: damage };
  }

  /**
   * Handle heal effect
   */
  handleHeal(card, effect, target) {
    const heal = effect.value;

    if (target && typeof target.heal === 'function') {
      target.heal(heal);
    }

    this.scene.events.emit('healApplied', {
      card,
      heal,
      target
    });

    console.log(`[CardEffectSystem] ${card.name} healed ${heal}`);

    return { type: 'heal', value: heal };
  }

  /**
   * Handle draw effect
   */
  handleDraw(card, effect, target) {
    const count = effect.value || 1;

    this.scene.events.emit('drawCards', { count });

    console.log(`[CardEffectSystem] ${card.name} draws ${count} cards`);

    return { type: 'draw', count };
  }

  /**
   * Handle discard effect
   */
  handleDiscard(card, effect, target) {
    const count = effect.value || 1;

    this.scene.events.emit('discardCards', { count });

    console.log(`[CardEffectSystem] ${card.name} discards ${count} cards`);

    return { type: 'discard', count };
  }

  /**
   * Handle block effect
   */
  handleBlock(card, effect, target) {
    const block = effect.value;

    if (target && typeof target.addBlock === 'function') {
      target.addBlock(block);
    }

    this.scene.events.emit('blockGained', {
      card,
      block,
      target
    });

    console.log(`[CardEffectSystem] ${card.name} gained ${block} block`);

    return { type: 'block', value: block };
  }

  /**
   * Handle buff effect
   */
  handleBuff(card, effect, target) {
    const buff = effect.buff;

    if (target && typeof target.addBuff === 'function') {
      target.addBuff(buff);
    }

    this.scene.events.emit('buffApplied', {
      card,
      buff,
      target
    });

    console.log(`[CardEffectSystem] ${card.name} applied buff: ${buff.type}`);

    return { type: 'buff', buff };
  }

  /**
   * Handle debuff effect
   */
  handleDebuff(card, effect, target) {
    const debuff = effect.debuff;

    if (target && typeof target.addDebuff === 'function') {
      target.addDebuff(debuff);
    }

    this.scene.events.emit('debuffApplied', {
      card,
      debuff,
      target
    });

    console.log(`[CardEffectSystem] ${card.name} applied debuff: ${debuff.type}`);

    return { type: 'debuff', debuff };
  }

  /**
   * Validate effect data
   * @param {Object} effect - Effect to validate
   * @returns {boolean} - Whether effect is valid
   */
  validateEffect(effect) {
    if (!effect.type) {
      return false;
    }

    if (!Object.values(EffectType).includes(effect.type)) {
      return false;
    }

    // Check required fields per effect type
    switch (effect.type) {
      case EffectType.DAMAGE:
      case EffectType.HEAL:
      case EffectType.BLOCK:
      case EffectType.DRAW:
      case EffectType.DISCARD:
        return typeof effect.value === 'number';

      case EffectType.BUFF:
        return effect.buff !== undefined;

      case EffectType.DEBUFF:
        return effect.debuff !== undefined;

      default:
        return false;
    }
  }
}
