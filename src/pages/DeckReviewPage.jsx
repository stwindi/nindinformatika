import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Sparkles, X } from 'lucide-react';
import useFlashcardStore from '../stores/flashcardStore';
import useAuthStore from '../stores/authStore';
import FlashcardSwiper from '../components/FlashcardSwiper';
import { generateFlashcards } from '../services/gemini';
import toast from 'react-hot-toast';

export default function DeckReviewPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { decks, currentDeckCards, loading, fetchDeckCards, addCards } = useFlashcardStore();
  const { user } = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState('ai'); // 'ai' | 'manual'
  const [aiText, setAiText] = useState('');
  const [manualFront, setManualFront] = useState('');
  const [manualBack, setManualBack] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);

  const deck = decks.find(d => d.id === deckId);

  useEffect(() => {
    if (deckId) fetchDeckCards(deckId);
  }, [deckId]);

  const handleAiGenerate = async () => {
    if (!aiText.trim()) { toast.error('Masukkan materi dulu!'); return; }
    setAiGenerating(true);
    try {
      const cards = await generateFlashcards(aiText, 8);
      setAiPreview(cards);
    } catch {
      toast.error('Gagal generate flashcard. Coba lagi!');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveAiCards = async () => {
    if (!aiPreview) return;
    setSaving(true);
    try {
      await addCards(user.uid, deckId, aiPreview);
      toast.success(`${aiPreview.length} flashcard ditambahkan! 🎉`);
      setShowAddModal(false);
      setAiText('');
      setAiPreview(null);
    } catch {
      toast.error('Gagal menyimpan flashcard');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveManual = async () => {
    if (!manualFront.trim() || !manualBack.trim()) {
      toast.error('Pertanyaan dan jawaban tidak boleh kosong');
      return;
    }
    setSaving(true);
    try {
      await addCards(user.uid, deckId, [{ front: manualFront, back: manualBack }]);
      toast.success('Flashcard ditambahkan!');
      setManualFront('');
      setManualBack('');
    } catch {
      toast.error('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate('/flashcards')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{deck?.icon || '📚'}</span>
                <h1 className="text-xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  {deck?.name || 'Deck'}
                </h1>
              </div>
              <p className="text-sm text-gray-500">{currentDeckCards.length} kartu</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white text-sm font-semibold rounded-2xl"
            >
              <Plus size={16} /> Tambah Kartu
            </button>
          </div>
        </div>
      </div>

      {/* Swiper */}
      <div className="max-w-lg mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" /></div>
        ) : (
          <FlashcardSwiper
            cards={currentDeckCards}
            onComplete={() => navigate('/flashcards')}
          />
        )}
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Tambah Flashcard</h2>
                <button onClick={() => { setShowAddModal(false); setAiPreview(null); }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-2 px-6 pt-4">
                {['ai', 'manual'].map(m => (
                  <button
                    key={m}
                    onClick={() => { setAddMode(m); setAiPreview(null); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      addMode === m ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {m === 'ai' ? '✨ Generate AI' : '✏️ Manual'}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto flex-1 px-6 py-5">
                {addMode === 'ai' && !aiPreview && (
                  <div className="space-y-4">
                    <textarea
                      value={aiText}
                      onChange={e => setAiText(e.target.value)}
                      placeholder="Paste materi pelajaranmu di sini. AI akan generate flashcard otomatis..."
                      className="w-full h-40 p-4 rounded-2xl border-2 border-gray-200 text-sm resize-none focus:border-primary-400 focus:outline-none"
                    />
                    <button
                      onClick={handleAiGenerate}
                      disabled={aiGenerating || !aiText.trim()}
                      className="w-full py-3 gradient-primary text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {aiGenerating ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles size={16} /> Generate Flashcard</>
                      )}
                    </button>
                  </div>
                )}

                {addMode === 'ai' && aiPreview && (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <p className="text-sm text-emerald-700 font-medium">{aiPreview.length} flashcard berhasil di-generate!</p>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {aiPreview.map((card, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs font-semibold text-gray-400 uppercase">Depan</p>
                          <p className="text-sm text-gray-800 mb-1">{card.front}</p>
                          <p className="text-xs font-semibold text-gray-400 uppercase">Belakang</p>
                          <p className="text-sm text-primary-700">{card.back}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setAiPreview(null)} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-2xl text-sm font-semibold">
                        Ulangi
                      </button>
                      <button onClick={handleSaveAiCards} disabled={saving} className="flex-1 py-2.5 gradient-primary text-white rounded-2xl text-sm font-semibold disabled:opacity-60">
                        {saving ? 'Menyimpan...' : 'Simpan Semua'}
                      </button>
                    </div>
                  </div>
                )}

                {addMode === 'manual' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pertanyaan (Depan)</label>
                      <textarea
                        value={manualFront}
                        onChange={e => setManualFront(e.target.value)}
                        placeholder="Apa yang ingin kamu tanyakan?"
                        className="w-full h-24 p-4 rounded-2xl border-2 border-gray-200 text-sm resize-none focus:border-primary-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jawaban (Belakang)</label>
                      <textarea
                        value={manualBack}
                        onChange={e => setManualBack(e.target.value)}
                        placeholder="Jawaban singkat dan padat..."
                        className="w-full h-24 p-4 rounded-2xl border-2 border-gray-200 text-sm resize-none focus:border-primary-400 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleSaveManual}
                      disabled={saving}
                      className="w-full py-3 gradient-primary text-white font-semibold rounded-2xl text-sm disabled:opacity-60"
                    >
                      {saving ? 'Menyimpan...' : 'Tambah Kartu'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
