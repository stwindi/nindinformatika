import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';

const ANSWER_GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#6d28d9)',
  'linear-gradient(135deg,#06b6d4,#0891b2)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#8b5cf6,#06b6d4)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
  'linear-gradient(135deg,#f59e0b,#10b981)',
  'linear-gradient(135deg,#3b82f6,#8b5cf6)',
  'linear-gradient(135deg,#06b6d4,#10b981)',
];

export default function FlashcardSwiper({ cards = [], onComplete }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [dragX, setDragX] = useState(0);
  const dragStart = useRef(null);
  const dragging = useRef(false);

  const total = cards.length;
  const done = index >= total;

  // Auto-redirect after completion
  useEffect(() => {
    if (!done || total === 0) return;
    const t = setTimeout(() => onComplete?.(), 4000);
    return () => clearTimeout(t);
  }, [done]);

  // ---- EMPTY ----
  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🃏</div>
        <h3 style={{ fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Deck masih kosong</h3>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Tambah flashcard dulu!</p>
      </div>
    );
  }

  // ---- COMPLETION ----
  if (done) {
    const pct = total > 0 ? Math.round((known / total) * 100) : 0;
    const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    const msg = pct === 100 ? 'Sempurna! Kamu hafal semuanya!'
              : pct >= 80   ? 'Keren banget! Hampir hafal semua!'
              : pct >= 50   ? 'Bagus! Terus semangat!'
                            : 'Ayo ulangi, pasti bisa!';
    const barColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#7c3aed';

    const reset = () => {
      setIndex(0);
      setFlipped(false);
      setKnown(0);
      setDragX(0);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          borderRadius: '1.5rem 1.5rem 0 0',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>{emoji}</div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem', fontFamily: 'Plus Jakarta Sans,sans-serif', marginBottom: '0.25rem' }}>
            Sesi Selesai!
          </div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>{msg}</div>
        </div>

        {/* Body */}
        <div style={{ background: '#fff', borderRadius: '0 0 1.5rem 1.5rem', padding: '1.5rem', boxShadow: '0 8px 30px rgba(124,58,237,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Kartu dihafal</span>
            <span style={{ fontWeight: 700, color: '#111' }}>{known}/{total}</span>
          </div>
          <div style={{ background: '#f3f4f6', borderRadius: 999, height: 12, overflow: 'hidden', marginBottom: '0.5rem' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
              style={{ height: '100%', background: barColor, borderRadius: 999 }}
            />
          </div>
          <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.4rem', color: barColor, marginBottom: '0.75rem' }}>
            {pct}%
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1.25rem' }}>
            Otomatis kembali dalam 4 detik...
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={reset} style={{
              flex: 1, padding: '0.75rem', border: '2px solid #e5e7eb',
              background: '#fff', color: '#374151', fontWeight: 600,
              borderRadius: '0.875rem', cursor: 'pointer', fontSize: '0.875rem',
            }}>🔁 Ulangi</button>
            <button onClick={() => onComplete?.()} style={{
              flex: 1, padding: '0.75rem',
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              color: '#fff', fontWeight: 600, borderRadius: '0.875rem',
              border: 'none', cursor: 'pointer', fontSize: '0.875rem',
            }}>Selesai ✓</button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ---- CARD ----
  const card = cards[index];
  if (!card) return null;

  const gradient = ANSWER_GRADIENTS[index % ANSWER_GRADIENTS.length];

  const getPos = (e) => e.touches ? e.touches[0].clientX : e.clientX;

  const onStart = (e) => {
    dragStart.current = getPos(e);
    dragging.current = false;
  };
  const onMove = (e) => {
    if (dragStart.current === null) return;
    const dx = getPos(e) - dragStart.current;
    if (Math.abs(dx) > 8) dragging.current = true;
    setDragX(dx);
  };
  const onEnd = () => {
    if (Math.abs(dragX) > 90) {
      const wasKnown = dragX > 0;
      if (wasKnown) setKnown(k => k + 1);
      setIndex(i => i + 1);
      setFlipped(false);
      setDragX(0);
    } else {
      setDragX(0);
    }
    dragStart.current = null;
  };

  const handleTap = () => {
    if (!dragging.current) setFlipped(f => !f);
    dragging.current = false;
  };

  const swipeAmt = Math.min(Math.abs(dragX) / 90, 1);
  const showRight = dragX > 30;
  const showLeft  = dragX < -30;

  const renderFace = (text, imgData, emoji, grad, isAnswer) => {
    if (emoji && grad) return (
      <div style={{ width: '100%', height: '100%', background: grad, borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{emoji}</div>
        {text && <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{text}</p>}
      </div>
    );
    if (imgData) return (
      <div style={{ width: '100%', height: '100%', borderRadius: '1.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <img src={imgData} alt="" style={{ flex: 1, objectFit: 'contain', background: '#f9fafb' }} />
        {text && <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>{text}</div>}
      </div>
    );
    if (isAnswer) return (
      <div style={{ width: '100%', height: '100%', background: gradient, borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{text}</p>
      </div>
    );
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#1f2937', fontWeight: 600, fontSize: '1.2rem', lineHeight: 1.4 }}>{text}</p>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
      {/* Progress */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ flex: 1, height: 10, background: '#f3f4f6', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${(index / total) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', borderRadius: 999, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 600, flexShrink: 0 }}>{index + 1}/{total}</span>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', gap: '1.5rem' }}>
        <span>← Belum hafal</span><span>· Tap balik ·</span><span>Hafal →</span>
      </div>

      {/* Card area */}
      <div
        style={{ width: '100%', maxWidth: 360, height: 280, position: 'relative', userSelect: 'none' }}
        onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
      >
        <motion.div
          key={index}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, x: dragX, rotate: dragX / 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          style={{ position: 'absolute', inset: 0, cursor: 'grab' }}
          onClick={handleTap}
        >
          {/* Swipe indicators */}
          {showRight && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: '1.5rem', border: '3px solid #10b981', background: `rgba(16,185,129,${swipeAmt * 0.15})`, zIndex: 10, display: 'flex', alignItems: 'center', paddingLeft: '1.25rem', pointerEvents: 'none' }}>
              <span style={{ background: '#10b981', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: 999, fontWeight: 700, fontSize: '0.875rem', transform: 'rotate(-10deg)' }}>HAFAL ✓</span>
            </div>
          )}
          {showLeft && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: '1.5rem', border: '3px solid #ef4444', background: `rgba(239,68,68,${swipeAmt * 0.15})`, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '1.25rem', pointerEvents: 'none' }}>
              <span style={{ background: '#ef4444', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: 999, fontWeight: 700, fontSize: '0.875rem', transform: 'rotate(10deg)' }}>ULANG ✕</span>
            </div>
          )}

          {/* 3D flip */}
          <div style={{ width: '100%', height: '100%', perspective: 1200 }}>
            <div style={{
              width: '100%', height: '100%', position: 'relative',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.5s cubic-bezier(0.4,0.2,0.2,1)',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}>
              {/* Front */}
              <div style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: '1.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 10, left: 14, fontSize: '0.7rem', fontWeight: 700, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.1em', zIndex: 1 }}>Depan</div>
                {renderFace(card.front, card.frontImage, card.frontEmoji, card.frontGradient, false)}
                <div style={{ position: 'absolute', bottom: 10, width: '100%', textAlign: 'center', fontSize: '0.7rem', color: '#d1d5db' }}>Tap untuk lihat jawaban 👆</div>
              </div>

              {/* Back */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '1.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 10, left: 14, fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', zIndex: 1 }}>Jawaban</div>
                {renderFace(card.back, card.backImage, null, null, true)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: 360 }}>
        <button
          onClick={() => { setIndex(i => i + 1); setFlipped(false); setDragX(0); }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', padding: '1rem', background: '#fff', border: '2px solid #fee2e2', color: '#ef4444', fontWeight: 600, borderRadius: '1rem', cursor: 'pointer' }}
        >
          <ThumbsDown size={22} />
          <span style={{ fontSize: '0.75rem' }}>Belum hafal</span>
        </button>
        <button
          onClick={() => { dragging.current = false; setFlipped(f => !f); }}
          style={{ padding: '1rem 1.25rem', background: '#fff', border: '2px solid #f3f4f6', color: '#6b7280', fontWeight: 600, borderRadius: '1rem', cursor: 'pointer', fontSize: '0.75rem' }}
        >
          Balik<br/>Kartu
        </button>
        <button
          onClick={() => { setKnown(k => k + 1); setIndex(i => i + 1); setFlipped(false); setDragX(0); }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', padding: '1rem', background: '#fff', border: '2px solid #d1fae5', color: '#10b981', fontWeight: 600, borderRadius: '1rem', cursor: 'pointer' }}
        >
          <ThumbsUp size={22} />
          <span style={{ fontSize: '0.75rem' }}>Hafal!</span>
        </button>
      </div>
    </div>
  );
}
