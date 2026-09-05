import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, Trophy } from 'lucide-react';

export default function FlashcardSwiper({ cards, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDir, setSwipeDir] = useState(null); // 'right' | 'left'
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const [done, setDone] = useState(false);
  const [dragX, setDragX] = useState(0);
  const startX = useRef(null);

  const current = cards[currentIndex];

  const handleFlip = () => setIsFlipped(f => !f);

  const handleSwipe = (dir) => {
    if (swipeDir) return;
    setSwipeDir(dir);
    if (dir === 'right') setKnown(k => k + 1);
    else setUnknown(u => u + 1);

    setTimeout(() => {
      setSwipeDir(null);
      setIsFlipped(false);
      setDragX(0);
      if (currentIndex + 1 >= cards.length) {
        setDone(true);
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, 400);
  };

  const handleDragStart = (e) => {
    startX.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  };

  const handleDragMove = (e) => {
    if (startX.current === null) return;
    const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    setDragX(x - startX.current);
  };

  const handleDragEnd = () => {
    if (Math.abs(dragX) > 80) {
      handleSwipe(dragX > 0 ? 'right' : 'left');
    } else {
      setDragX(0);
    }
    startX.current = null;
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSwipeDir(null);
    setDragX(0);
    setKnown(0);
    setUnknown(0);
    setDone(false);
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-gray-500">Deck ini belum punya kartu.</p>
      </div>
    );
  }

  if (done) {
    const score = Math.round((known / cards.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center py-12 px-6"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Review Selesai!
        </h2>
        <div className="my-6 grid grid-cols-3 gap-4 w-full max-w-xs">
          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{cards.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{known}</p>
            <p className="text-xs text-emerald-600 mt-1">Paham ✓</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{unknown}</p>
            <p className="text-xs text-red-500 mt-1">Perlu Ulang</p>
          </div>
        </div>
        <div className="w-full max-w-xs mb-6">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-center text-sm font-semibold text-gray-600 mt-2">{score}% dipahami</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl text-sm hover:border-primary-300 hover:text-primary-700 transition-all"
          >
            <RotateCcw size={16} /> Ulangi
          </button>
          {onComplete && (
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-6 py-3 gradient-primary text-white font-semibold rounded-2xl text-sm"
            >
              <Trophy size={16} /> Selesai
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  const swipeIndicatorOpacity = Math.min(Math.abs(dragX) / 100, 1);
  const rotation = dragX * 0.05;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Progress */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{currentIndex + 1} / {cards.length}</span>
          <span className="text-emerald-500 font-medium">{known} paham</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full">
          <div
            className="h-full gradient-emerald rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm h-72">
        {/* Next card peek */}
        {currentIndex + 1 < cards.length && (
          <div className="absolute inset-0 bg-white rounded-3xl shadow-card border border-gray-100 -translate-y-2 scale-95 z-0" />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className={`absolute inset-0 z-10 ${swipeDir === 'right' ? 'swipe-right' : swipeDir === 'left' ? 'swipe-left' : ''}`}
            style={{
              transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
              transition: swipeDir ? undefined : dragX === 0 ? 'transform 0.3s ease' : undefined,
            }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {/* Swipe indicators */}
            {dragX > 20 && (
              <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-sm font-bold"
                style={{ opacity: swipeIndicatorOpacity }}>
                Paham ✓
              </div>
            )}
            {dragX < -20 && (
              <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-red-500 text-white rounded-xl text-sm font-bold"
                style={{ opacity: swipeIndicatorOpacity }}>
                Ulang ✗
              </div>
            )}

            {/* The card itself */}
            <div className="flashcard-scene w-full h-full">
              <div
                className={`flashcard-card w-full h-full ${isFlipped ? 'flipped' : ''}`}
                onClick={handleFlip}
              >
                {/* Front */}
                <div className="flashcard-face bg-white border-2 border-primary-100 shadow-card">
                  <div className="text-xs font-semibold text-primary-400 uppercase tracking-wide mb-4">Pertanyaan</div>
                  <p className="text-center text-gray-900 font-semibold text-lg leading-snug">{current?.front}</p>
                  <div className="mt-6 flex items-center gap-1 text-xs text-gray-400">
                    <span>Tap untuk lihat jawaban</span>
                  </div>
                </div>

                {/* Back */}
                <div className="flashcard-back flashcard-face bg-gradient-to-br from-primary-600 to-cyan-500">
                  <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-4">Jawaban</div>
                  <p className="text-center text-white font-semibold text-lg leading-snug">{current?.back}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-400 mt-4 mb-6">Tap untuk flip · Swipe kanan = paham · Swipe kiri = perlu ulang</p>

      {/* Action buttons */}
      <div className="flex gap-6">
        <button
          onClick={() => handleSwipe('left')}
          className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 text-red-500 flex items-center justify-center hover:bg-red-100 hover:scale-110 transition-all"
        >
          <X size={24} />
        </button>
        <button
          onClick={handleFlip}
          className="w-14 h-14 rounded-full bg-gray-100 border-2 border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-200 hover:scale-110 transition-all"
        >
          <RotateCcw size={20} />
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-500 flex items-center justify-center hover:bg-emerald-100 hover:scale-110 transition-all"
        >
          <Check size={24} />
        </button>
      </div>
    </div>
  );
}
