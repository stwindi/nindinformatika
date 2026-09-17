import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const COL = 'summaries';

/**
 * Simpan rangkuman baru ke Firestore.
 * @param {string} userId
 * @param {object} data  { title, subject, sourceText, points, formulas, references, youtubeQuery, subjectConfidence }
 * @returns {string} id dokumen baru
 */
export async function createSummary(userId, data) {
  const docRef = await addDoc(collection(db, COL), {
    userId,
    title:             data.title             || 'Rangkuman',
    subject:           data.subject           || 'Umum',
    sourceText:        (data.sourceText        || '').slice(0, 8000),
    points:            data.points            || [],
    formulas:          data.formulas          || [],
    references:        data.references        || [],
    youtubeQuery:      data.youtubeQuery      || null,
    subjectConfidence: data.subjectConfidence ?? 1,
    createdAt:         serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Ambil semua rangkuman milik user, diurutkan terbaru dulu.
 */
export async function getUserSummaries(userId) {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Ambil satu rangkuman by ID.
 */
export async function getSummaryById(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Hapus rangkuman.
 */
export async function deleteSummary(id) {
  await deleteDoc(doc(db, COL, id));
}

/**
 * Update field tertentu pada rangkuman (misal subject setelah konfirmasi manual).
 */
export async function updateSummary(id, updates) {
  await updateDoc(doc(db, COL, id), updates);
}
