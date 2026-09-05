import { create } from 'zustand';
import { getUserDecks, createDeck, getDeckCards, addFlashcards, deleteDeck } from '../services/flashcardService';

const useFlashcardStore = create((set, get) => ({
  decks: [],
  currentDeckCards: [],
  loading: false,
  error: null,

  fetchDecks: async (userId) => {
    set({ loading: true, error: null });
    try {
      const decks = await getUserDecks(userId);
      set({ decks, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createDeck: async (userId, deckData) => {
    const id = await createDeck(userId, deckData);
    await get().fetchDecks(userId);
    return id;
  },

  deleteDeck: async (deckId, userId) => {
    await deleteDeck(deckId);
    set(s => ({ decks: s.decks.filter(d => d.id !== deckId) }));
  },

  fetchDeckCards: async (deckId) => {
    set({ loading: true });
    try {
      const cards = await getDeckCards(deckId);
      set({ currentDeckCards: cards, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addCards: async (userId, deckId, cards) => {
    await addFlashcards(userId, deckId, cards);
    await get().fetchDeckCards(deckId);
    await get().fetchDecks(userId);
  },
}));

export default useFlashcardStore;
