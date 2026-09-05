import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Sparkles, X, Pen, Image } from 'lucide-react';
import useFlashcardStore from '../stores/flashcardStore';
import useAuthStore from '../stores/authStore';
import FlashcardSwiper from '../components/FlashcardSwiper';
import DrawingCanvas from '../components/DrawingCanvas';
import { generateFlashcards, generateVisualFlashcard } from '../services/gemini';
import toast from 'react-hot-toast';

export default function DeckReviewPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { decks, currentDeckCards, loading, fetchDeckCards, addCards } = useFlashcardStore();
  const { user } = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  // tabs: 'ai' | 'manual' | 'draw' | 'aiimage'
  const [addMode, setAddMode] = useState('ai');
  const [aiText, setAiText] = useState('');
  const [manualFront, setManualFront] = useState('');
  const [manualBack, setManualBack] = useState('');
  const [manualFrontImage, setManualFrontImage] = useState(null); // base64
  const [manualBackImage, setManualBackImage] = useState(null);
  const [drawTarget, setDrawTarget] = useState('front'); // 'front' | 'back'
  const [showCanvas, setShowCanvas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  // AI Visual
  const [aiVisualTopic, setAiVisualTopic] = useState('');
  const [aiVisualPreview, setAiVisualPreview] = useState(null);
  const [aiVisualGenerating, setAiVisualGenerating] = useState(false);

  const deck = decks.find(d => d.id === deckId);

  useEffect(() => {
    if (deckId) fetchDeckCards(deckId);
  }, [deckId]);

  // ---- AI TEXT FLASHCARDS ----
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
      setShowAddModal(false); setAiText(''); setAiPreview(null);
    } catch { toast.error('Gagal menyimpan flashcard'); }
    finally { setSaving(false); }
  };

  // ---- MANUAL + DRAWING ----
  const handleDrawSave = (imageData) => {
    if (drawTarget === 'front') setManualFrontImage(imageData);
    else setManualBackImage(imageData);
    setShowCanvas(false);
  };

  const handleSaveManual = async () => {
    if (!manualFront.trim() && !manualFrontImage) {
      toast.error('Isi bagian depan kartu dulu!'); return;
    }
    setSaving(true);
    try {
      await addCards(user.uid, deckId, [{
        front: manualFront,
        back: manualBack,
        frontImage: manualFrontImage || null,
        backImage: manualBackImage || null,
      }]);
      toast.success('Flashcard ditambahkan!');
      setManualFront(''); setManualBack('');
      setManualFrontImage(null); setManualBackImage(null);
    } catch { toast.error('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  // ---- AI VISUAL FLASHCARD ----
  const handleAiVisual = async () => {
    if (!aiVisualTopic.trim()) { toast.error('Masukkan topik dulu!'); return; }
    setAiVisualGenerating(true);
    try {
      const result = await generateVisualFlashcard(aiVisualTopic);
      setAiVisualPreview(result);
    } catch {
      toast.error('Gagal generate visual. Coba lagi!');
    } finally {
      setAiVisualGenerating(false);
    }
  };

  const handleSaveAiVisual = async () => {
    if (!aiVisualPreview) return;
    setSaving(true);
    try {
      await addCards(user.uid, deckId, [{
        front: aiVisualPreview.front,
        back: aiVisualPreview.back,
        frontEmoji: aiVisualPreview.emoji,
        frontGradient: aiVisualPreview.gradient,
      }]);
      toast.success('Visual flashcard disimpan! 🎨');
      setShowAddModal(false); setAiVisualTopic(''); setAiVisualPreview(null);
    } catch { toast.error('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const resetModal = () => {
    setShowAddModal(false);
    setAiPreview(null); setAiVisualPreview(null);
    setManualFrontImage(null); setManualBackImage(null);
    setShowCanvas(false);
  };

  const TABS = [
    { key: 'ai',      label: '✨ AI Teks',    icon: Sparkles },
    { key: 'aiimage', label: '🎨 AI Visual',  icon: Image },
    { key: 'manual',  label: '✏️ Manual',     icon: Pen },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <button onClick={() => navigate('/flashcards')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-4 transition-colors">
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
              className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity"
            >
              <Plus size={16} /> Tambah Kartu
            </button>
          </div>
        </div>
      </div>

      {/* Swiper */}
      <div className="max-w-lg mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : (
          <FlashcardSwiper cards={currentDeckCards} onComplete={() => navigate('/flashcards')} />
        )}
      </div>

      {/* ===== ADD CARD MODAL ===== */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && resetModal()}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
            >
              {/* Modal header */}
              <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-900">Tambah Flashcard</h2>
                <button onClick={resetModal} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              {!showCanvas && (
                <div className="flex gap-1.5 px-6 pt-4 flex-shrink-0">
                  {TABS.map(t => (
                    <button
                      key={t.key}
                      onClick={() => { setAddMode(t.key); setAiPreview(null); setAiVisualPreview(null); }}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                        addMode === t.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="overflow-y-auto flex-1 px-6 py-5">

                {/* ---- DRAWING CANVAS ---- */}
                {showCanvas && (
                  <DrawingCanvas
                    onSave={handleDrawSave}
                    onCancel={() => setShowCanvas(false)}
                  />
                )}

                {/* ---- AI TEXT TAB ---- */}
                {!showCanvas && addMode === 'ai' && !aiPreview && (
                  <div className="space-y-4">
                    <textarea
                      value={aiText}
                      onChange={e => setAiText(e.target.value)}
                      placeholder="Paste materi pelajaranmu di sini. AI akan generate flashcard teks otomatis..."
                      className="w-full h-40 p-4 rounded-2xl border-2 border-gray-200 text-sm resize-none focus:border-primary-400 focus:outline-none"
                    />
                    <button
                      onClick={handleAiGenerate}
                      disabled={aiGenerating || !aiText.trim()}
                      className="w-full py-3 gradient-primary text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
                    >
                      {aiGenerating ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                      ) : <><Sparkles size={16} /> Generate Flashcard</>}
                    </button>
                  </div>
                )}

                {!showCanvas && addMode === 'ai' && aiPreview && (
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
                      <button onClick={() => setAiPreview(null)} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-2xl text-sm font-semibold">Ulangi</button>
                      <button onClick={handleSaveAiCards} disabled={saving} className="flex-1 py-2.5 gradient-primary text-white rounded-2xl text-sm font-semibold disabled:opacity-60">
                        {saving ? 'Menyimpan...' : 'Simpan Semua'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ---- AI VISUAL TAB ---- */}
                {!showCanvas && addMode === 'aiimage' && !aiVisualPreview && (
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-2xl">
                      <p className="text-sm text-purple-700 font-medium mb-1">🎨 AI Visual Flashcard</p>
                      <p className="text-sm text-purple-600">AI akan membuat flashcard dengan visual menarik (emoji besar + warna) berdasarkan topik yang kamu minta!</p>
                    </div>
                    <input
                      value={aiVisualTopic}
                      onChange={e => setAiVisualTopic(e.target.value)}
                      placeholder="Contoh: Proses fotosintesis, Rumus pythagoras, Penjajahan Belanda..."
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none"
                    />
                    <button
                      onClick={handleAiVisual}
                      disabled={aiVisualGenerating || !aiVisualTopic.trim()}
                      className="w-full py-3 gradient-primary text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
                    >
                      {aiVisualGenerating ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                      ) : <><Image size={16} /> Buat Visual Flashcard</>}
                    </button>
                  </div>
                )}

                {!showCanvas && addMode === 'aiimage' && aiVisualPreview && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-gray-700">Preview:</p>
                    {/* Front preview */}
                    <div
                      className="rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-32"
                      style={{ background: aiVisualPreview.gradient }}
                    >
                      <div className="text-6xl mb-2">{aiVisualPreview.emoji}</div>
                      <p className="font-bold text-white text-lg drop-shadow">{aiVisualPreview.front}</p>
                    </div>
                    {/* Back preview */}
                    <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Jawaban</p>
                      <p className="text-sm text-gray-800">{aiVisualPreview.back}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setAiVisualPreview(null)} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-2xl text-sm font-semibold">Ulangi</button>
                      <button onClick={handleSaveAiVisual} disabled={saving} className="flex-1 py-2.5 gradient-primary text-white rounded-2xl text-sm font-semibold disabled:opacity-60">
                        {saving ? 'Menyimpan...' : 'Simpan 🎨'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ---- MANUAL + DRAW TAB ---- */}
                {!showCanvas && addMode === 'manual' && (
                  <div className="space-y-4">
                    {/* Front */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-gray-600">Depan Kartu (Pertanyaan)</label>
                        <button
                          onClick={() => { setDrawTarget('front'); setShowCanvas(true); }}
                          className="flex items-center gap-1 text-xs text-primary-600 font-semibold hover:text-primary-700"
                        >
                          <Pen size={12} /> {manualFrontImage ? 'Gambar ulang' : 'Tambah gambar'}
                        </button>
                      </div>
                      {manualFrontImage && (
                        <div className="relative mb-2 rounded-2xl overflow-hidden border border-gray-200">
                          <img src={manualFrontImage} alt="front" className="w-full max-h-40 object-contain bg-gray-50" />
                          <button
                            onClick={() => setManualFrontImage(null)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                          >×</button>
                        </div>
                      )}
                      <textarea
                        value={manualFront}
                        onChange={e => setManualFront(e.target.value)}
                        placeholder={manualFrontImage ? 'Tambah teks (opsional)...' : 'Pertanyaan atau konsep...'}
                        className="w-full h-20 p-3 rounded-2xl border-2 border-gray-200 text-sm resize-none focus:border-primary-400 focus:outline-none"
                      />
                    </div>

                    {/* Back */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-gray-600">Belakang Kartu (Jawaban)</label>
                        <button
                          onClick={() => { setDrawTarget('back'); setShowCanvas(true); }}
                          className="flex items-center gap-1 text-xs text-primary-600 font-semibold hover:text-primary-700"
                        >
                          <Pen size={12} /> {manualBackImage ? 'Gambar ulang' : 'Tambah gambar'}
                        </button>
                      </div>
                      {manualBackImage && (
                        <div className="relative mb-2 rounded-2xl overflow-hidden border border-gray-200">
                          <img src={manualBackImage} alt="back" className="w-full max-h-40 object-contain bg-gray-50" />
                          <button
                            onClick={() => setManualBackImage(null)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                          >×</button>
                        </div>
                      )}
                      <textarea
                        value={manualBack}
                        onChange={e => setManualBack(e.target.value)}
                        placeholder={manualBackImage ? 'Tambah teks (opsional)...' : 'Jawaban singkat dan padat...'}
                        className="w-full h-20 p-3 rounded-2xl border-2 border-gray-200 text-sm resize-none focus:border-primary-400 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleSaveManual}
                      disabled={saving || (!manualFront.trim() && !manualFrontImage)}
                      className="w-full py-3 gradient-primary text-white font-semibold rounded-2xl text-sm disabled:opacity-60 hover:opacity-90 transition-opacity"
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
