import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ThumbsUp, ThumbsDown, Trophy } from 'lucide-react';

export default function FlashcardSwiper({ cards, onComplete }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [done, setDone] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [exiting, setExiting] = useState(null); // 'left' | 'right'
  const dragStartX = useRef(null);

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🃏</div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">Deck masih kosong</h3>
        <p className="text-gray-500 text-sm">Tambah flashcard dulu untuk mulai review!</p>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((known / cards.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <Trophy size={64} className="text-amber-400 mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Sesi Selesai! 🎉</h2>
        <p className="text-gray-500 mb-6">Kamu hafal {known} dari {cards.length} kartu</p>
        <div className="w-full max-w-xs mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Skor</span>
            <span className="font-bold text-primary-600">{pct}%</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-primary-500'}`}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setIndex(0); setFlipped(false); setKnown(0); setDone(false); setDragX(0); setExiting(null); }}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={16} /> Ulangi
          </button>
          <button
            onClick={onComplete}
            className="px-6 py-3 gradient-primary text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity"
          >
            Selesai ✓
          </button>
        </div>
      </motion.div>
    );
  }

  const card = cards[index];

  const advance = (wasKnown) => {
    setExiting(wasKnown ? 'right' : 'left');
    if (wasKnown) setKnown(k => k + 1);
    setTimeout(() => {
      if (index + 1 >= cards.length) {
        setDone(true);
      } else {
        setIndex(i => i + 1);
        setFlipped(false);
        setDragX(0);
        setExiting(null);
      }
    }, 350);
  };

  // Drag handlers
  const onDragStart = (e) => {
    dragStartX.current = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  };
  const onDragMove = (e) => {
    if (dragStartX.current === null) return;
    const x = (e.type === 'touchmove' ? e.touches[0].clientX : e.clientX) - dragStartX.current;
    setDragX(x);
  };
  const onDragEnd = () => {
    if (Math.abs(dragX) > 80) {
      advance(dragX > 0);
    } else {
      setDragX(0);
    }
    dragStartX.current = null;
  };

  // Render card face content (text + image/emoji support)
  const renderCardContent = (text, imageData, emoji, gradient) => {
    // AI visual card (emoji + gradient)
    if (emoji && gradient) {
      return (
        <div
          className="w-full h-full rounded-3xl flex flex-col items-center justify-center p-6 text-center"
          style={{ background: gradient }}
        >
          <div className="text-7xl mb-4 drop-shadow-lg">{emoji}</div>
          {text && <p className="text-white font-bold text-xl drop-shadow-md leading-snug">{text}</p>}
        </div>
      );
    }
    // Drawing/image card
    if (imageData) {
      return (
        <div className="w-full h-full rounded-3xl overflow-hidden flex flex-col">
          <img src={imageData} alt="card" className="w-full flex-1 object-contain bg-gray-50" />
          {text && (
            <div className="px-4 py-3 text-center">
              <p className="text-gray-800 font-semibold text-sm">{text}</p>
            </div>
          )}
        </div>
      );
    }
    // Plain text card
    return (
      <div className="w-full h-full flex items-center justify-center p-8 text-center">
        <p className="text-gray-800 font-semibold text-xl leading-snug">{text}</p>
      </div>
    );
  };

  const swipeOpacity = Math.min(Math.abs(dragX) / 80, 1);
  const swipeDirection = dragX > 0 ? 'right' : dragX < 0 ? 'left' : null;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-300"
            style={{ width: `${((index) / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-500 font-medium flex-shrink-0">{index + 1}/{cards.length}</span>
      </div>

      {/* Swipe hint */}
      <div className="flex gap-6 text-xs text-gray-400">
        <span>← Belum hafal</span>
        <span>Tap balik kartu</span>
        <span>Sudah hafal →</span>
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-sm select-none"
        style={{ height: 320 }}
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
      >
        <AnimatePresence>
          <motion.div
            key={index}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: 1, opacity: 1,
              x: exiting === 'right' ? 300 : exiting === 'left' ? -300 : dragX,
              rotate: exiting ? (exiting === 'right' ? 15 : -15) : dragX / 20,
            }}
            transition={exiting ? { duration: 0.35 } : { type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onClick={() => !dragX && setFlipped(f => !f)}
          >
            {/* Swipe indicator overlays */}
            {swipeDirection === 'right' && (
              <div className="absolute inset-0 rounded-3xl bg-emerald-400/20 border-4 border-emerald-400 z-10 flex items-center justify-start pl-6 pointer-events-none"
                style={{ opacity: swipeOpacity }}>
                <div className="bg-emerald-500 text-white px-3 py-1 rounded-full font-bold text-sm rotate-[-15deg]">HAFAL ✓</div>
              </div>
            )}
            {swipeDirection === 'left' && (
              <div className="absolute inset-0 rounded-3xl bg-red-400/20 border-4 border-red-400 z-10 flex items-center justify-end pr-6 pointer-events-none"
                style={{ opacity: swipeOpacity }}>
                <div className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm rotate-[15deg]">ULANG ✕</div>
              </div>
            )}

            {/* Flip card container */}
            <div
              className="w-full h-full"
              style={{
                perspective: 1200,
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                style={{
                  width: '100%', height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1)',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div className="absolute top-3 left-4 text-xs font-semibold text-gray-300 uppercase tracking-wide">Depan</div>
                  {renderCardContent(card.front, card.frontImage, card.frontEmoji, card.frontGradient)}
                  <div className="absolute bottom-3 right-4 text-xs text-gray-300">Tap untuk balik</div>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 rounded-3xl shadow-xl overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: card.frontGradient ? 'linear-gradient(135deg, #f8f4ff, #f0f9ff)' : '#fafafa',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div className="absolute top-3 left-4 text-xs font-semibold text-primary-400 uppercase tracking-wide">Jawaban</div>
                  {renderCardContent(card.back, card.backImage, null, null)}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 w-full max-w-sm">
        <button
          onClick={() => advance(false)}
          className="flex-1 flex flex-col items-center gap-1 py-4 bg-white border-2 border-red-100 text-red-500 font-semibold rounded-2xl hover:bg-red-50 hover:border-red-300 transition-all active:scale-95"
        >
          <ThumbsDown size={22} />
          <span className="text-xs">Belum hafal</span>
        </button>
        <button
          onClick={() => setFlipped(f => !f)}
          className="px-6 py-4 bg-white border-2 border-gray-100 text-gray-500 font-semibold rounded-2xl hover:bg-gray-50 transition-all text-sm active:scale-95"
        >
          Balik
        </button>
        <button
          onClick={() => advance(true)}
          className="flex-1 flex flex-col items-center gap-1 py-4 bg-white border-2 border-emerald-100 text-emerald-500 font-semibold rounded-2xl hover:bg-emerald-50 hover:border-emerald-300 transition-all active:scale-95"
        >
          <ThumbsUp size={22} />
          <span className="text-xs">Hafal!</span>
        </button>
      </div>
    </div>
  );
}
