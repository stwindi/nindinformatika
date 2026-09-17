import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Folder } from 'lucide-react';
import SummaryCard from './SummaryCard';

const SUBJECT_EMOJI = {
  Matematika: '📐', Fisika: '⚡', Kimia: '🧪', Biologi: '🌿',
  'Bahasa Indonesia': '📖', 'Bahasa Inggris': '🌏', Sejarah: '🏛️',
  Geografi: '🗺️', Ekonomi: '📊', Sosiologi: '🤝', PKN: '🏛️',
  TIK: '💻', Seni: '🎨', Olahraga: '⚽', Umum: '📚',
};

export default function SummarySubjectFolder({ subject, summaries }) {
  const [open, setOpen] = useState(true);
  const emoji = SUBJECT_EMOJI[subject] || '📚';

  return (
    <div className="bg-white rounded-3xl shadow-card border-2 border-gray-200/90 hover:border-primary-300 transition-all overflow-hidden">
      {/* Folder Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/80 transition-colors"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-primary-100 border border-primary-200 flex items-center justify-center text-xl shadow-sm flex-shrink-0">
            {emoji}
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-base" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              {subject}
            </p>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              {summaries.length} materi dirangkum
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-full bg-primary-600 text-white text-xs font-extrabold shadow-sm">
            {summaries.length}
          </span>
          <div className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Accordion Content with contrasting background container */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t-2 border-gray-100 bg-slate-50/60 p-4"
          >
            <div className="space-y-2.5">
              {summaries.map(s => (
                <SummaryCard key={s.id} summary={s} compact />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
