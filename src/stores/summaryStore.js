import { create } from 'zustand';
import {
  createSummary, getUserSummaries, getSummaryById,
  deleteSummary as deleteSummaryDoc, updateSummary,
} from '../services/summaryService';

const useSummaryStore = create((set, get) => ({
  summaries: [],
  loading:   false,
  error:     null,

  /** Fetch all summaries for the user */
  fetchSummaries: async (userId) => {
    set({ loading: true, error: null });
    try {
      const summaries = await getUserSummaries(userId);
      set({ summaries, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /** Save a new summary and refresh list */
  addSummary: async (userId, data) => {
    const id = await createSummary(userId, data);
    await get().fetchSummaries(userId);
    return id;
  },

  /** Delete a summary */
  deleteSummary: async (id, userId) => {
    await deleteSummaryDoc(id);
    set(s => ({ summaries: s.summaries.filter(x => x.id !== id) }));
  },

  /** Update subject after manual confirmation */
  updateSummarySubject: async (id, subject, userId) => {
    await updateSummary(id, { subject });
    await get().fetchSummaries(userId);
  },

  /**
   * Returns summaries grouped by subject.
   * @returns {{ [subject: string]: Summary[] }}
   */
  getSummariesBySubject: () => {
    const { summaries } = get();
    return summaries.reduce((acc, s) => {
      const sub = s.subject || 'Umum';
      if (!acc[sub]) acc[sub] = [];
      acc[sub].push(s);
      return acc;
    }, {});
  },

  /** Returns the 4 most recent summaries across all subjects */
  getRecentSummaries: (limit = 4) => {
    return get().summaries.slice(0, limit);
  },
}));

export default useSummaryStore;
