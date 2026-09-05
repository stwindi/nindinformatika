import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs,
  query, where, orderBy, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

const DECKS = 'decks';
const CARDS = 'flashcards';

// DECK OPERATIONS
export async function createDeck(userId, deckData) {
  const docRef = await addDoc(collection(db, DECKS), {
    userId,
    name: deckData.name,
    subject: deckData.subject || 'Umum',
    color: deckData.color || '#7c3aed',
    icon: deckData.icon || '📚',
    cardCount: 0,
    reviewCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserDecks(userId) {
  const q = query(
    collection(db, DECKS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteDeck(deckId) {
  await deleteDoc(doc(db, DECKS, deckId));
}

// FLASHCARD OPERATIONS
export async function addFlashcards(userId, deckId, cards) {
  const batch = writeBatch(db);
  cards.forEach(card => {
    const ref = doc(collection(db, CARDS));
    batch.set(ref, {
      userId,
      deckId,
      front: card.front,
      back: card.back,
      reviewCount: 0,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();

  // Update deck card count
  const deckCards = await getDeckCards(deckId);
  await updateDoc(doc(db, DECKS, deckId), {
    cardCount: deckCards.length,
  });
}

export async function getDeckCards(deckId) {
  const q = query(
    collection(db, CARDS),
    where('deckId', '==', deckId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteFlashcard(cardId) {
  await deleteDoc(doc(db, CARDS, cardId));
}
