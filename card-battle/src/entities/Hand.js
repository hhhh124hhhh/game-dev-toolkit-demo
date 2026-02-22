/**
 * Hand - Player's hand management
 */

export class Hand {
  constructor(config = {}) {
    // CRITICAL: Initialize all state variables
    this.maxCards = config.maxCards || 10;
    this.cards = [];
    this.selectedCard = null;
    this.selectedIndex = -1;
  }

  /**
   * Add a card to hand
   * @param {Object} card - Card to add
   * @returns {boolean} - Whether card was added
   */
  addCard(card) {
    if (this.cards.length >= this.maxCards) {
      console.log('[Hand] Hand is full, cannot add card');
      return false;
    }

    this.cards.push(card);
    return true;
  }

  /**
   * Add multiple cards to hand
   * @param {Array} cards - Cards to add
   * @returns {number} - Number of cards actually added
   */
  addCards(cards) {
    let added = 0;
    for (const card of cards) {
      if (this.addCard(card)) {
        added++;
      } else {
        break;
      }
    }
    return added;
  }

  /**
   * Remove a card from hand
   * @param {Object} card - Card to remove
   * @returns {Object|null} - Removed card or null
   */
  removeCard(card) {
    const index = this.cards.indexOf(card);
    if (index > -1) {
      this.cards.splice(index, 1);

      // Clear selection if removed card was selected
      if (this.selectedCard === card) {
        this.clearSelection();
      }

      return card;
    }
    return null;
  }

  /**
   * Remove card at index
   * @param {number} index - Index of card to remove
   * @returns {Object|null} - Removed card or null
   */
  removeAt(index) {
    if (index >= 0 && index < this.cards.length) {
      const card = this.cards.splice(index, 1)[0];

      if (this.selectedIndex === index) {
        this.clearSelection();
      }

      return card;
    }
    return null;
  }

  /**
   * Select a card
   * @param {Object} card - Card to select
   * @returns {boolean} - Whether selection was successful
   */
  selectCard(card) {
    const index = this.cards.indexOf(card);
    if (index > -1) {
      this.selectedCard = card;
      this.selectedIndex = index;
      return true;
    }
    return false;
  }

  /**
   * Select card at index
   * @param {number} index - Index of card to select
   * @returns {boolean} - Whether selection was successful
   */
  selectAt(index) {
    if (index >= 0 && index < this.cards.length) {
      this.selectedCard = this.cards[index];
      this.selectedIndex = index;
      return true;
    }
    return false;
  }

  /**
   * Clear current selection
   */
  clearSelection() {
    this.selectedCard = null;
    this.selectedIndex = -1;
  }

  /**
   * Get card at index
   * @param {number} index - Index of card
   * @returns {Object|null} - Card or null
   */
  getCardAt(index) {
    return this.cards[index] || null;
  }

  /**
   * Check if hand is full
   * @returns {boolean}
   */
  isFull() {
    return this.cards.length >= this.maxCards;
  }

  /**
   * Check if hand is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.cards.length === 0;
  }

  /**
   * Get card count
   * @returns {number}
   */
  getCount() {
    return this.cards.length;
  }

  /**
   * Get all cards
   * @returns {Array}
   */
  getAllCards() {
    return [...this.cards];
  }

  /**
   * Clear entire hand
   * @returns {Array} - Removed cards
   */
  clear() {
    const removed = [...this.cards];
    this.cards = [];
    this.clearSelection();
    return removed;
  }

  /**
   * Find cards by type
   * @param {string} type - Card type to find
   * @returns {Array} - Matching cards
   */
  findByType(type) {
    return this.cards.filter(card => card.type === type);
  }

  /**
   * Sort cards by cost
   * @param {boolean} ascending - Sort order
   */
  sortByCost(ascending = true) {
    this.cards.sort((a, b) => {
      return ascending ? a.cost - b.cost : b.cost - a.cost;
    });
  }
}
