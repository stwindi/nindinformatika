import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/authStore';
import useSummaryStore from '../stores/summaryStore';
import useFlashcardStore from '../stores/flashcardStore';
import SummaryCard from '../components/SummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getSummaryById } from '../services/summaryService';
import { generateFlashcards } from '../services/gemini';
import { createDeck, addFlashcards } from '../services/flashcardService';

export default function SummaryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { deleteSummary } = useSummaryStore();
  const { fetchDecks } = useFlashcardStore();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getSummaryById(id).then(data => {
      setSummary(data);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Hapus rangkuman ini?')) return;
    await deleteSummary(id, user.uid);
    toast.success('Rangkuman dihapus.');
    navigate('/summary');
  };

  // Convert summary bullets to flashcards and save to a new deck
  const handleExportFlashcard = async () => {
    if (!summary) return;
    setExporting(true);
    try {
      const matText = summary.points
        ?.flatMap(p => p.bullets)
        .join('\n') || summary.sourceText || summary.title;

      const cards = await generateFlashcards(matText, 10);

      const deckId = await createDeck(user.uid, {
        name: `📝 ${summary.title}`,
        subject: summary.subject,
        color: '#7c3aed',
        icon: '✨',
      });
      await addFlashcards(user.uid, deckId, cards);
      await fetchDecks(user.uid);

      toast.success(`${cards.length} flashcard berhasil dibuat! 🎉`);
    } catch {
      toast.error('Gagal ekspor ke flashcard.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!summary) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center bg-white p-8 rounded-3xl shadow-card border-2 border-gray-200 max-w-sm w-full">
        <div className="text-5xl mb-4">🔍</div>
        <p className="font-extrabold text-gray-900 text-lg">Rangkuman tidak ditemukan</p>
        <p className="text-sm text-gray-500 mt-1 mb-6">Rangkuman ini mungkin sudah dihapus atau URL tidak valid.</p>
        <button
          onClick={() => navigate('/summary')}
          className="w-full py-3 gradient-primary text-white rounded-2xl text-sm font-extrabold shadow-glow"
        >
          Kembali ke Smart Summary
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header bar */}
      <div className="bg-white border-b-2 border-gray-200 px-6 pt-7 pb-5 shadow-xs sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/summary')}
            className="flex items-center gap-2 text-sm font-extrabold text-gray-700 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={18} /> Kembali ke Smart Summary
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleExportFlashcard}
              disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl gradient-primary text-white text-xs font-extrabold shadow-md hover:opacity-95 transition-all disabled:opacity-50 active:scale-95"
            >
              {exporting ? (
                <><Loader2 size={13} className="animate-spin" /> Sedang Membuat…</>
              ) : (
                <><BookOpen size={13} /> Ekspor ke Flashcard</>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-2xl border-2 border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
              title="Hapus rangkuman"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <SummaryCard summary={summary} compact={false} onDelete={handleDelete} />
        </motion.div>
      </div>
    </div>
  );
}
