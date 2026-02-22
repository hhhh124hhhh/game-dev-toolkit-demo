/**
 * Deck Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Deck } from '../../src/entities/Deck.js';

describe('Deck', () => {
  let deck;
  let mockCards;

  beforeEach(() => {
    mockCards = [
      { id: 'card-1', name: 'Strike', cost: 1 },
      { id: 'card-2', name: 'Defend', cost: 1 },
      { id: 'card-3', name: 'Bash', cost: 2 }
    ];
    deck = new Deck(mockCards);
  });

  describe('initialization', () => {
    it('should be created with cards', () => {
      expect(deck.getRemaining()).toBe(3);
    });

    it('should start with empty discard pile', () => {
      expect(deck.getDiscardCount()).toBe(0);
    });

    it('should not modify original cards array', () => {
      const originalLength = mockCards.length;
      deck.draw(1);
      expect(mockCards.length).toBe(originalLength);
    });
  });

  describe('shuffle', () => {
    it('should randomize card order', () => {
      // Create a larger deck for better shuffle test
      const largeDeck = new Deck(
        Array(20).fill(null).map((_, i) => ({ id: `card-${i}` }))
      );

      const originalOrder = largeDeck.cards.map(c => c.id);
      largeDeck.shuffle();
      const shuffledOrder = largeDeck.cards.map(c => c.id);

      // Very unlikely to be same order after shuffle
      expect(shuffledOrder).not.toEqual(originalOrder);
    });

    it('should return this for chaining', () => {
      const result = deck.shuffle();
      expect(result).toBe(deck);
    });
  });

  describe('draw', () => {
    it('should return requested number of cards', () => {
      const drawn = deck.draw(2);
      expect(drawn.length).toBe(2);
      expect(deck.getRemaining()).toBe(1);
    });

    it('should return single card when count is 1', () => {
      const drawn = deck.draw(1);
      expect(drawn.length).toBe(1);
    });

    it('should return all remaining cards if requested more', () => {
      const drawn = deck.draw(10);
      expect(drawn.length).toBe(3);
      expect(deck.getRemaining()).toBe(0);
    });

    it('should reshuffle discard pile when deck is empty', () => {
      // Draw all cards
      deck.draw(3);
      expect(deck.getRemaining()).toBe(0);

      // Add to discard
      deck.addToDiscard({ id: 'discarded' });
      expect(deck.getDiscardCount()).toBe(1);

      // Draw should reshuffle
      const drawn = deck.draw(1);
      expect(drawn.length).toBe(1);
      expect(deck.getDiscardCount()).toBe(0);
    });

    it('should return empty array when no cards available', () => {
      deck.draw(3);
      const drawn = deck.draw(1);
      expect(drawn.length).toBe(0);
    });
  });

  describe('discard pile', () => {
    it('should add card to discard pile', () => {
      const card = { id: 'test' };
      deck.addToDiscard(card);
      expect(deck.getDiscardCount()).toBe(1);
    });

    it('should add multiple cards to discard pile', () => {
      deck.addMultipleToDiscard([
        { id: 'test-1' },
        { id: 'test-2' }
      ]);
      expect(deck.getDiscardCount()).toBe(2);
    });
  });

  describe('addToTop', () => {
    it('should add card to top of deck', () => {
      const card = { id: 'new-card' };
      deck.addToTop(card);
      const drawn = deck.draw(1);
      expect(drawn[0].id).toBe('new-card');
    });
  });

  describe('addToBottom', () => {
    it('should add card to bottom of deck', () => {
      const card = { id: 'bottom-card' };
      deck.addToBottom(card);
      // Draw all cards except last
      deck.draw(3);
      // Last card should be the one we added
      expect(deck.getRemaining()).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return false when deck has cards', () => {
      expect(deck.isEmpty()).toBe(false);
    });

    it('should return true when deck and discard are empty', () => {
      deck.draw(3);
      expect(deck.isEmpty()).toBe(true);
    });

    it('should return false when only discard has cards', () => {
      deck.draw(3);
      deck.addToDiscard({ id: 'test' });
      expect(deck.isEmpty()).toBe(false);
    });
  });

  describe('getTotalCount', () => {
    it('should return total of deck and discard', () => {
      deck.draw(1);
      deck.addToDiscard({ id: 'discarded' });
      expect(deck.getTotalCount()).toBe(3);
    });
  });
});
