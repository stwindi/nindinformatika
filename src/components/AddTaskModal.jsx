import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Plus, Clock, Wand2 } from 'lucide-react';
import { breakdownTask } from '../services/gemini';
import useTaskStore from '../stores/taskStore';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const SUBJECTS = [
  'Matematika','Fisika','Kimia','Biologi','Bahasa Indonesia',
  'Bahasa Inggris','Sejarah','Geografi','Ekonomi','Sosiologi',
  'PKN','TIK','Seni','Olahraga','Umum',
];

export default function AddTaskModal({ onClose }) {
  const { addTask } = useTaskStore();
  const { user } = useAuthStore();
  const [mode, setMode] = useState('ai'); // 'ai' | 'manual'
  const [loading, setLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [preview, setPreview] = useState(null);

  const [manual, setManual] = useState({
    title: '', subject: 'Umum', deadline: '', priority: 'medium', description: ''
  });

  const handleAiBreakdown = async () => {
    if (!aiInput.trim()) { toast.error('Deskripsikan tugasmu dulu!'); return; }
    setLoading(true);
    try {
      const result = await breakdownTask(aiInput);
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + (result.estimatedDeadlineDays || 7));
      setPreview({ ...result, deadline: deadlineDate });
    } catch (err) {
      toast.error('AI gagal memproses. Coba lagi!');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAi = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      await addTask(user.uid, preview);
      toast.success('Tugas berhasil ditambahkan! 🎉');
      onClose();
    } catch {
      toast.error('Gagal menyimpan tugas');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    if (!manual.title.trim()) { toast.error('Judul tugas tidak boleh kosong'); return; }
    setLoading(true);
    try {
      await addTask(user.uid, {
        ...manual,
        deadline: manual.deadline ? new Date(manual.deadline) : null,
        subtasks: [],
      });
      toast.success('Tugas berhasil ditambahkan! 🎉');
      onClose();
    } catch {
      toast.error('Gagal menyimpan tugas');
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
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Tambah Tugas Baru
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">AI siap bantu pecah tugasmu jadi langkah kecil</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
              <X size={20} />
            </button>
          </div>

          {/* Mode toggle */}
          <div className="px-6 pt-4 flex gap-2">
            <button
              onClick={() => { setMode('ai'); setPreview(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'ai' ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Wand2 size={15} /> AI Otomatis
            </button>
            <button
              onClick={() => { setMode('manual'); setPreview(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === 'manual' ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Plus size={15} /> Manual
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-5">
            {/* AI MODE — input */}
            {mode === 'ai' && !preview && (
              <div className="space-y-4">
                <div className="p-4 bg-primary-50 rounded-2xl">
                  <p className="text-sm text-primary-700 font-medium mb-1">💡 Contoh input:</p>
                  <p className="text-sm text-primary-600 italic">"Bikin makalah 10 halaman tentang fotosintesis, deadline minggu depan"</p>
                </div>
                <textarea
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder="Ceritakan tugasmu secara bebas dalam bahasa natural..."
                  className="w-full h-32 p-4 rounded-2xl border-2 border-gray-200 text-sm resize-none focus:border-primary-400 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleAiBreakdown}
                  disabled={loading || !aiInput.trim()}
                  className="w-full py-3 gradient-primary text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Memproses...</>
                  ) : (
                    <><Sparkles size={16} /> Breakdown dengan AI</>
                  )}
                </button>
              </div>
            )}

            {/* AI MODE — preview */}
            {mode === 'ai' && preview && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <p className="text-sm font-semibold text-emerald-700 mb-1">✨ AI berhasil memecah tugasmu!</p>
                  <p className="text-sm text-emerald-600">Review dan konfirmasi sebelum disimpan.</p>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Judul</label>
                    <p className="font-semibold text-gray-900">{preview.title}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Mata Pelajaran</label>
                      <p className="text-sm text-gray-700">{preview.subject}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Prioritas</label>
                      <p className="text-sm text-gray-700 capitalize">{preview.priority}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Clock size={14} /> Subtask ({preview.subtasks?.length || 0} langkah)
                  </h4>
                  <div className="space-y-2">
                    {preview.subtasks?.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="w-6 h-6 rounded-full gradient-primary text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{s.title}</p>
                          <p className="text-xs text-gray-400">~{s.estimatedMinutes} menit</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setPreview(null)}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl text-sm hover:bg-gray-50"
                  >
                    Ulangi
                  </button>
                  <button
                    onClick={handleSaveAi}
                    disabled={loading}
                    className="flex-1 py-3 gradient-primary text-white font-semibold rounded-2xl text-sm disabled:opacity-60"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Tugas 🎉'}
                  </button>
                </div>
              </div>
            )}

            {/* MANUAL MODE */}
            {mode === 'manual' && (
              <form onSubmit={handleSaveManual} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Judul Tugas *</label>
                  <input
                    value={manual.title}
                    onChange={e => setManual(m => ({ ...m, title: e.target.value }))}
                    placeholder="Contoh: Makalah Fotosintesis"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mata Pelajaran</label>
                    <select
                      value={manual.subject}
                      onChange={e => setManual(m => ({ ...m, subject: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
                    >
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prioritas</label>
                    <select
                      value={manual.priority}
                      onChange={e => setManual(m => ({ ...m, priority: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
                    >
                      <option value="high">🔴 Tinggi</option>
                      <option value="medium">🟡 Sedang</option>
                      <option value="low">🟢 Rendah</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={manual.deadline}
                    onChange={e => setManual(m => ({ ...m, deadline: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deskripsi (opsional)</label>
                  <textarea
                    value={manual.description}
                    onChange={e => setManual(m => ({ ...m, description: e.target.value }))}
                    placeholder="Detail tambahan..."
                    className="w-full h-24 px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm resize-none focus:border-primary-400 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 gradient-primary text-white font-semibold rounded-2xl text-sm disabled:opacity-60"
                >
                  {loading ? 'Menyimpan...' : 'Tambah Tugas'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
