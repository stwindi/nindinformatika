import { create } from 'zustand';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, onAuthStateChanged, updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  initAuth: () => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Try to load Firestore profile, but don't crash if it fails
          let profile = {
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'StudyBuddy',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || null,
            streak: 0,
            lastStudyDate: null,
          };
          try {
            const profileRef = doc(db, 'users', firebaseUser.uid);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
              profile = profileSnap.data();
            } else {
              await setDoc(profileRef, { ...profile, createdAt: serverTimestamp() });
            }
          } catch (firestoreErr) {
            console.warn('Firestore profile load failed, using defaults:', firestoreErr.message);
          }
          set({ user: firebaseUser, profile, loading: false, error: null });
        } else {
          set({ user: null, profile: null, loading: false });
        }
      } catch (err) {
        console.error('Auth init error:', err);
        set({ user: null, profile: null, loading: false });
      }
    });
  },

  loginEmail: async (email, password) => {
    set({ error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? 'Email atau password salah'
        : err.code === 'auth/invalid-credential'
        ? 'Email atau password tidak valid'
        : 'Gagal login. Coba lagi.';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  registerEmail: async (email, password, name) => {
    set({ error: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Email sudah digunakan'
        : err.code === 'auth/weak-password'
        ? 'Password minimal 6 karakter'
        : 'Gagal daftar. Coba lagi.';
      set({ error: msg });
      throw new Error(msg);
    }
  },

  loginGoogle: async () => {
    set({ error: null });
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        set({ error: 'Gagal login dengan Google' });
        throw err;
      }
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, profile: null });
  },

  updateStreak: async () => {
    const { user, profile } = get();
    if (!user || !profile) return;
    const today = new Date().toDateString();
    const lastDate = profile.lastStudyDate;
    if (lastDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = lastDate === yesterday ? (profile.streak || 0) + 1 : 1;
    const updated = { ...profile, streak: newStreak, lastStudyDate: today };
    await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
    set({ profile: updated });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
