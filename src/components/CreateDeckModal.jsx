import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import useFlashcardStore from '../stores/flashcardStore';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const DECK_COLORS = [
  '#7c3aed', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6',
];

const DECK_ICONS = ['📚', '🧪', '🔬', '📐', '🌍', '📝', '🎨', '💻', '🏃', '🎵'];

const SUBJECTS = ['Matematika','Fisika','Kimia','Biologi','Bahasa Indonesia','Bahasa Inggris','Sejarah','Geografi','Ekonomi','Sosiologi','PKN','TIK','Seni','Olahraga','Umum'];

export default function CreateDeckModal({ onClose, onCreated }) {
  const { createDeck } = useFlashcardStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    subject: 'Umum',
    color: DECK_COLORS[0],
    icon: DECK_ICONS[0],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nama deck tidak boleh kosong'); return; }
    setLoading(true);
    try {
      const id = await createDeck(user.uid, form);
      toast.success('Deck berhasil dibuat! 🎉');
      onCreated?.(id);
      onClose();
    } catch {
      toast.error('Gagal membuat deck');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>Buat Deck Baru</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Preview */}
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ backgroundColor: form.color + '20' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                style={{ backgroundColor: form.color }}
              >
                {form.icon}
              </div>
              <div>
                <p className="font-bold text-gray-900">{form.name || 'Nama Deck'}</p>
                <p className="text-sm text-gray-500">{form.subject}</p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Deck *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Contoh: Biologi Kelas 11"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mata Pelajaran</label>
              <select
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
              >
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {DECK_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`w-10 h-10 rounded-xl text-xl transition-all ${
                      form.icon === icon
                        ? 'ring-2 ring-primary-500 ring-offset-1 scale-110'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Warna</label>
              <div className="flex gap-2">
                {DECK_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color }))}
                    className={`w-8 h-8 rounded-full transition-all ${
                      form.color === color ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 gradient-primary text-white font-semibold rounded-2xl text-sm disabled:opacity-60"
            >
              {loading ? 'Membuat...' : 'Buat Deck'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
