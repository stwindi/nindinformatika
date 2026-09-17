import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ExternalLink, Play, ChevronDown, ChevronUp, Trash2, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import SubjectBadge from './SubjectBadge';

const SUBJECT_EMOJI = {
  Matematika: '📐', Fisika: '⚡', Kimia: '🧪', Biologi: '🌿',
  'Bahasa Indonesia': '📖', 'Bahasa Inggris': '🌏', Sejarah: '🏛️',
  Geografi: '🗺️', Ekonomi: '📊', Sosiologi: '🤝', PKN: '🏛️',
  TIK: '💻', Seni: '🎨', Olahraga: '⚽', Umum: '📚',
};

/**
 * SummaryCard — High contrast card design
 */
export default function SummaryCard({ summary, compact = false, onDelete }) {
  const navigate = useNavigate();
  const [expandedPoints, setExpandedPoints] = useState({});

  const emoji = SUBJECT_EMOJI[summary.subject] || '📚';
  const togglePoint = (id) =>
    setExpandedPoints(prev => ({ ...prev, [id]: !prev[id] }));

  const askAI = (pointHeading, bullet) => {
    const q = encodeURIComponent(`Jelaskan lebih lanjut: "${bullet}" (${pointHeading}, ${summary.subject})`);
    navigate(`/chat?q=${q}`);
  };

  const ytUrl = summary.youtubeQuery
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(summary.youtubeQuery)}`
    : null;

  // ── Compact card (used in lists / subject folder / dashboard) ─────────────
  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2, scale: 1.005 }}
        whileTap={{ scale: 0.99 }}
        className="bg-white rounded-2xl p-4 shadow-sm border-2 border-gray-200 hover:border-primary-400 hover:shadow-md cursor-pointer select-none transition-all group"
        onClick={() => navigate(`/summary/${summary.id}`)}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate group-hover:text-primary-600 transition-colors" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              {summary.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <SubjectBadge subject={summary.subject} size="xs" />
              <span className="text-xs font-semibold text-gray-500">
                {summary.points?.length || 0} topik materi
              </span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-primary-50 flex items-center justify-center text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0">
            <ArrowRight size={15} />
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Full detail card ───────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-3xl shadow-card border-2 border-gray-200 overflow-hidden">
      {/* Card Hero Header */}
      <div className="gradient-primary px-6 py-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
              {emoji}
            </div>
            <div>
              <h1 className="font-extrabold text-white text-xl leading-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {summary.title}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-white text-primary-800 shadow-sm">
                  {summary.subject}
                </span>
                <span className="text-xs font-medium text-white/80">
                  {summary.points?.length || 0} Bagian Materi
                </span>
              </div>
            </div>
          </div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-red-500 hover:text-white text-white/80 transition-colors flex-shrink-0 border border-white/20"
              title="Hapus rangkuman"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Summary Points Sections */}
      <div className="p-6 space-y-3.5">
        <h2 className="text-xs font-extrabold text-gray-600 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Sparkles size={13} className="text-primary-600" />
          Poin-Poin Rangkuman Terstruktur
        </h2>

        {summary.points?.map((point, idx) => {
          const isExpanded = expandedPoints[point.id] !== false;
          return (
            <div
              key={point.id}
              className="border-2 border-gray-200 hover:border-primary-300 rounded-2xl overflow-hidden transition-colors bg-white shadow-xs"
            >
              <button
                onClick={() => togglePoint(point.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left bg-gray-50/70 hover:bg-primary-50/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0 shadow-sm">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-gray-900 text-sm sm:text-base" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                    {point.heading}
                  </span>
                </div>
                <div className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="px-5 py-4 space-y-2.5 border-t-2 border-gray-100 bg-white">
                      {point.bullets?.map((bullet, bi) => (
                        <li key={bi} className="group flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-800 flex-1 leading-relaxed">
                            {bullet}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); askAI(point.heading, bullet); }}
                            className="opacity-90 sm:opacity-0 group-hover:opacity-100 flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-600 hover:text-white text-[11px] font-bold transition-all shadow-xs active:scale-95"
                            title="Tanyakan ke AI"
                          >
                            <MessageCircle size={11} /> Tanya AI
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* High Contrast Formulas Box (Math/Science) */}
      {summary.formulas?.length > 0 && (
        <div className="px-6 pb-5">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-md">
            <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              🔢 Rumus & Konsep Penting
            </p>
            <div className="flex flex-wrap gap-2.5">
              {summary.formulas.map((f, i) => (
                <code
                  key={i}
                  className="px-3.5 py-2 bg-slate-800 border border-slate-700 text-cyan-300 rounded-xl text-sm font-mono font-bold shadow-sm"
                >
                  {f}
                </code>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* High Contrast YouTube Video Link */}
      {ytUrl && (
        <div className="px-6 pb-5">
          <a
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-red-50 border-2 border-red-200 hover:bg-red-100 transition-all group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Play size={16} className="text-white fill-white ml-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-red-900 uppercase tracking-wide">Video Pembelajaran Terkait</p>
              <p className="text-sm font-bold text-red-700 truncate mt-0.5">{summary.youtubeQuery}</p>
            </div>
            <ExternalLink size={16} className="text-red-500 group-hover:text-red-700 transition-colors flex-shrink-0" />
          </a>
        </div>
      )}

      {/* High Contrast References */}
      {summary.references?.length > 0 && (
        <div className="px-6 pb-6">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border-2 border-indigo-100">
            <p className="text-xs font-extrabold text-indigo-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <BookOpen size={13} className="text-indigo-600" /> Referensi Terpercaya & Edukatif
            </p>
            <div className="space-y-2">
              {summary.references.map((ref, i) => (
                <a
                  key={i}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-indigo-200/70 hover:border-primary-400 hover:shadow-xs transition-all group"
                >
                  <ExternalLink size={14} className="text-indigo-500 flex-shrink-0 mt-0.5 group-hover:text-primary-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate group-hover:text-primary-700">{ref.title}</p>
                    <p className="text-[11px] font-medium text-gray-500 mt-0.5">{ref.source}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
