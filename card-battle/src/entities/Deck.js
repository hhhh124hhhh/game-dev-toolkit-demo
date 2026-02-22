/**
 * Deck - Card deck management with draw and discard piles
 */

export class Deck {
  constructor(cards = []) {
    // CRITICAL: Initialize all state variables
    this.cards = [...cards];
    this.discardPile = [];
  }

  /**
   * Shuffle the deck using Fisher-Yates algorithm
   */
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    return this;
  }

  /**
   * Draw cards from the deck
   * @param {number} count - Number of cards to draw
   * @returns {Array} - Array of drawn cards
   */
  draw(count = 1) {
    const drawn = [];

    for (let i = 0; i < count; i++) {
      // If deck is empty, reshuffle discard pile
      if (this.cards.length === 0) {
        if (this.discardPile.length === 0) {
          console.log('[Deck] No more cards to draw');
          break;
        }

        console.log('[Deck] Reshuffling discard pile into deck');
        this.cards = [...this.discardPile];
        this.discardPile = [];
        this.shuffle();
      }

      drawn.push(this.cards.pop());
    }

    return drawn;
  }

  /**
   * Add a card to the discard pile
   * @param {Object} card - Card to discard
   */
  addToDiscard(card) {
    this.discardPile.push(card);
  }

  /**
   * Add multiple cards to discard pile
   * @param {Array} cards - Cards to discard
   */
  addMultipleToDiscard(cards) {
    this.discardPile.push(...cards);
  }

  /**
   * Get remaining cards in deck
   * @returns {number}
   */
  getRemaining() {
    return this.cards.length;
  }

  /**
   * Get discard pile count
   * @returns {number}
   */
  getDiscardCount() {
    return this.discardPile.length;
  }

  /**
   * Add card to top of deck
   * @param {Object} card - Card to add
   */
  addToTop(card) {
    this.cards.push(card);
  }

  /**
   * Add card to bottom of deck
   * @param {Object} card - Card to add
   */
  addToBottom(card) {
    this.cards.unshift(card);
  }

  /**
   * Check if deck is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.cards.length === 0 && this.discardPile.length === 0;
  }

  /**
   * Get total card count (deck + discard)
   * @returns {number}
   */
  getTotalCount() {
    return this.cards.length + this.discardPile.length;
  }
}
