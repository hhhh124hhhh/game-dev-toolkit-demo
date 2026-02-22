/**
 * Hand Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hand } from '../../src/entities/Hand.js';

describe('Hand', () => {
  let hand;
  let mockCard;

  beforeEach(() => {
    hand = new Hand({ maxCards: 5 });
    mockCard = { id: 'card-1', name: 'Strike', cost: 1 };
  });

  describe('initialization', () => {
    it('should initialize with empty cards array', () => {
      expect(hand.cards).toEqual([]);
    });

    it('should initialize with default max cards', () => {
      const defaultHand = new Hand();
      expect(defaultHand.maxCards).toBe(10);
    });

    it('should initialize with custom max cards', () => {
      expect(hand.maxCards).toBe(5);
    });

    it('should initialize with no selection', () => {
      expect(hand.selectedCard).toBeNull();
      expect(hand.selectedIndex).toBe(-1);
    });
  });

  describe('addCard', () => {
    it('should add card to hand', () => {
      const result = hand.addCard(mockCard);
      expect(result).toBe(true);
      expect(hand.getCount()).toBe(1);
    });

    it('should not add card when hand is full', () => {
      // Fill hand
      for (let i = 0; i < 5; i++) {
        hand.addCard({ id: `card-${i}` });
      }
      // Try to add one more
      const result = hand.addCard(mockCard);
      expect(result).toBe(false);
      expect(hand.getCount()).toBe(5);
    });
  });

  describe('addCards', () => {
    it('should add multiple cards', () => {
      const cards = [
        { id: 'card-1' },
        { id: 'card-2' },
        { id: 'card-3' }
      ];
      const added = hand.addCards(cards);
      expect(added).toBe(3);
      expect(hand.getCount()).toBe(3);
    });

    it('should only add cards up to max', () => {
      const cards = Array(10).fill(null).map((_, i) => ({ id: `card-${i}` }));
      const added = hand.addCards(cards);
      expect(added).toBe(5);
      expect(hand.getCount()).toBe(5);
    });
  });

  describe('removeCard', () => {
    beforeEach(() => {
      hand.addCard(mockCard);
    });

    it('should remove card from hand', () => {
      const removed = hand.removeCard(mockCard);
      expect(removed).toBe(mockCard);
      expect(hand.getCount()).toBe(0);
    });

    it('should return null if card not found', () => {
      const removed = hand.removeCard({ id: 'nonexistent' });
      expect(removed).toBeNull();
    });

    it('should clear selection if removed card was selected', () => {
      hand.selectCard(mockCard);
      hand.removeCard(mockCard);
      expect(hand.selectedCard).toBeNull();
    });
  });

  describe('removeAt', () => {
    beforeEach(() => {
      hand.addCard({ id: 'card-1' });
      hand.addCard({ id: 'card-2' });
      hand.addCard({ id: 'card-3' });
    });

    it('should remove card at index', () => {
      const removed = hand.removeAt(1);
      expect(removed.id).toBe('card-2');
      expect(hand.getCount()).toBe(2);
    });

    it('should return null for invalid index', () => {
      const removed = hand.removeAt(10);
      expect(removed).toBeNull();
    });
  });

  describe('selection', () => {
    beforeEach(() => {
      hand.addCard(mockCard);
    });

    it('should select card', () => {
      const result = hand.selectCard(mockCard);
      expect(result).toBe(true);
      expect(hand.selectedCard).toBe(mockCard);
    });

    it('should not select card not in hand', () => {
      const result = hand.selectCard({ id: 'nonexistent' });
      expect(result).toBe(false);
    });

    it('should select at index', () => {
      const result = hand.selectAt(0);
      expect(result).toBe(true);
      expect(hand.selectedIndex).toBe(0);
    });

    it('should clear selection', () => {
      hand.selectCard(mockCard);
      hand.clearSelection();
      expect(hand.selectedCard).toBeNull();
      expect(hand.selectedIndex).toBe(-1);
    });
  });

  describe('query methods', () => {
    beforeEach(() => {
      hand.addCard({ id: 'card-1', type: 'attack', cost: 1 });
      hand.addCard({ id: 'card-2', type: 'defense', cost: 2 });
      hand.addCard({ id: 'card-3', type: 'attack', cost: 0 });
    });

    it('should check if hand is full', () => {
      expect(hand.isFull()).toBe(false);
      hand.addCard({ id: 'card-4' });
      hand.addCard({ id: 'card-5' });
      expect(hand.isFull()).toBe(true);
    });

    it('should check if hand is empty', () => {
      expect(hand.isEmpty()).toBe(false);
      hand.clear();
      expect(hand.isEmpty()).toBe(true);
    });

    it('should get card at index', () => {
      const card = hand.getCardAt(1);
      expect(card.id).toBe('card-2');
    });

    it('should return null for invalid index', () => {
      const card = hand.getCardAt(10);
      expect(card).toBeNull();
    });

    it('should find cards by type', () => {
      const attacks = hand.findByType('attack');
      expect(attacks.length).toBe(2);
    });

    it('should get all cards', () => {
      const allCards = hand.getAllCards();
      expect(allCards.length).toBe(3);
    });
  });

  describe('clear', () => {
    it('should remove all cards', () => {
      hand.addCard({ id: 'card-1' });
      hand.addCard({ id: 'card-2' });
      const removed = hand.clear();
      expect(removed.length).toBe(2);
      expect(hand.getCount()).toBe(0);
    });

    it('should clear selection', () => {
      hand.addCard(mockCard);
      hand.selectCard(mockCard);
      hand.clear();
      expect(hand.selectedCard).toBeNull();
    });
  });

  describe('sortByCost', () => {
    beforeEach(() => {
      hand.addCard({ id: 'card-1', cost: 3 });
      hand.addCard({ id: 'card-2', cost: 1 });
      hand.addCard({ id: 'card-3', cost: 2 });
    });

    it('should sort by cost ascending', () => {
      hand.sortByCost(true);
      expect(hand.cards[0].cost).toBe(1);
      expect(hand.cards[2].cost).toBe(3);
    });

    it('should sort by cost descending', () => {
      hand.sortByCost(false);
      expect(hand.cards[0].cost).toBe(3);
      expect(hand.cards[2].cost).toBe(1);
    });
  });
});
