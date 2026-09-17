import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useFlashcardStore from '../stores/flashcardStore';
import useAuthStore from '../stores/authStore';
import CreateDeckModal from '../components/CreateDeckModal';
import LoadingSpinner from '../components/LoadingSpinner';
import SubjectBadge from '../components/SubjectBadge';
import toast from 'react-hot-toast';

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const { decks, loading, fetchDecks, deleteDeck } = useFlashcardStore();
  const { user, updateStreak } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchDecks(user.uid);
      updateStreak();
    }
  }, [user?.uid]);

  const handleDeleteDeck = async (e, deckId, deckName) => {
    e.stopPropagation();
    if (confirm(`Hapus deck "${deckName}"? Semua kartu dalam deck ini juga akan dihapus.`)) {
      await deleteDeck(deckId, user.uid);
      toast.success('Deck dihapus');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 pt-8 pb-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>🃏 Flashcard</h1>
              <p className="text-sm text-gray-500 mt-0.5">{decks.length} deck · {decks.reduce((a, d) => a + (d.cardCount || 0), 0)} kartu total</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white text-sm font-semibold rounded-2xl shadow-glow hover:opacity-90 transition-all"
            >
              <Plus size={18} /> Deck Baru
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Tip card */}
        <div className="mb-5 p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-start gap-3">
          <Sparkles size={18} className="text-cyan-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-cyan-700">
            <span className="font-semibold">Tips:</span> Pergi ke <strong>Chat AI</strong> dan minta Clova untuk generate flashcard dari materimu!
          </p>
        </div>

        {decks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🃏</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada deck</h3>
            <p className="text-gray-500 text-sm mb-6">Buat deck pertamamu dan mulai belajar dengan flashcard!</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 gradient-primary text-white font-semibold rounded-2xl text-sm"
            >
              + Buat Deck Pertama
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {decks.map((deck, i) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  onClick={() => navigate(`/flashcards/${deck.id}`)}
                  className="bg-white rounded-3xl p-5 shadow-card border border-gray-100 cursor-pointer hover:shadow-card-hover transition-all"
                >
                  {/* Deck header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                      style={{ backgroundColor: deck.color + '25' }}
                    >
                      {deck.icon}
                    </div>
                    <button
                      onClick={(e) => handleDeleteDeck(e, deck.id, deck.name)}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-300 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm mb-1">{deck.name}</h3>
                  <SubjectBadge subject={deck.subject} size="xs" />

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <BookOpen size={12} />
                      <span>{deck.cardCount || 0} kartu</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>

                  {/* Color strip */}
                  <div className="mt-3 h-1.5 rounded-full" style={{ backgroundColor: deck.color + '50' }}>
                    <div className="h-full rounded-full w-full" style={{ backgroundColor: deck.color }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {showModal && <CreateDeckModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
