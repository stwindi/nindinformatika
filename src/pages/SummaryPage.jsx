import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, FileText, Search, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/authStore';
import useSummaryStore from '../stores/summaryStore';
import SmartSummaryUploader from '../components/SmartSummaryUploader';
import SummarySubjectFolder from '../components/SummarySubjectFolder';
import LoadingSpinner from '../components/LoadingSpinner';

const cardAnim = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay },
});

export default function SummaryPage() {
  const { user } = useAuthStore();
  const { summaries, loading, fetchSummaries, addSummary, getSummariesBySubject } = useSummaryStore();
  const [showUploader, setShowUploader] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    if (user?.uid) fetchSummaries(user.uid);
  }, [user?.uid]);

  const handleSummaryReady = async (summaryData) => {
    setShowUploader(false);
    setSaving(true);
    try {
      await addSummary(user.uid, summaryData);
      toast.success('✨ Rangkuman berhasil disimpan!');
    } catch {
      toast.error('Gagal menyimpan rangkuman.');
    } finally {
      setSaving(false);
    }
  };

  const bySubject = getSummariesBySubject();
  const allSubjects = Object.keys(bySubject).sort();

  // Filter summaries by search text and subject tab
  const filteredSummaries = summaries.filter(s => {
    const matchSearch =
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.subject?.toLowerCase().includes(search.toLowerCase()) ||
      s.points?.some(p =>
        p.heading?.toLowerCase().includes(search.toLowerCase()) ||
        p.bullets?.some(b => b.toLowerCase().includes(search.toLowerCase()))
      );
    const matchSubject = selectedSubject === 'all' || s.subject === selectedSubject;
    return matchSearch && matchSubject;
  });

  // Re-group filtered summaries by subject
  const filteredBySubject = filteredSummaries.reduce((acc, s) => {
    const subj = s.subject || 'Umum';
    if (!acc[subj]) acc[subj] = [];
    acc[subj].push(s);
    return acc;
  }, {});
  const displaySubjectKeys = Object.keys(filteredBySubject).sort();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Header with high contrast gradient-primary */}
      <div className="gradient-primary px-6 pt-8 pb-16 shadow-md">
        <div className="max-w-2xl mx-auto">
          <motion.div {...cardAnim(0)} className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm mb-2">
                <Sparkles size={13} className="text-yellow-300" /> AI Study Assistant
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Smart Summary
              </h1>
              <p className="text-white/85 text-sm mt-1 max-w-md leading-relaxed font-medium">
                Rangkum materi pelajaran secara otomatis, rapi, dan terstruktur per mata pelajaran.
              </p>
            </div>

            <button
              onClick={() => setShowUploader(v => !v)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary-700 hover:bg-gray-50 font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex-shrink-0 active:scale-95"
            >
              <Plus size={18} className="text-primary-600" />
              {showUploader ? 'Tutup' : 'Rangkum'}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Main Container overlapping the hero header */}
      <div className="max-w-2xl mx-auto px-6 -mt-10 space-y-6">
        {/* Stats Row */}
        <motion.div {...cardAnim(0.08)} className="grid grid-cols-3 gap-3">
          {[
            {
              icon: '📚',
              label: 'Total Rangkuman',
              value: summaries.length,
              color: 'text-primary-600',
              bg: 'bg-primary-50 border-primary-100',
            },
            {
              icon: '📂',
              label: 'Folder Mapel',
              value: allSubjects.length,
              color: 'text-cyan-600',
              bg: 'bg-cyan-50 border-cyan-100',
            },
            {
              icon: '📌',
              label: 'Mapel Terbaru',
              value: summaries[0]?.subject || '—',
              color: 'text-emerald-600',
              bg: 'bg-emerald-50 border-emerald-100',
            },
          ].map(s => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 text-center flex flex-col items-center justify-center hover:shadow-card-hover transition-all"
            >
              <div className={`w-9 h-9 rounded-xl ${s.bg} border flex items-center justify-center text-lg mb-1.5 shadow-sm`}>
                {s.icon}
              </div>
              <p className={`text-lg sm:text-xl font-extrabold ${s.color} truncate max-w-full px-1`}>
                {s.value}
              </p>
              <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Uploader Panel */}
        <AnimatePresence>
          {showUploader && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SmartSummaryUploader onSummaryReady={handleSummaryReady} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saving Indicator */}
        {saving && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-card border-2 border-primary-200 flex items-center gap-3.5"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} className="text-primary-600 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Menyimpan rangkuman…</p>
              <p className="text-xs text-primary-600 font-medium">Mengelompokkan ke folder mata pelajaran otomatis</p>
            </div>
          </motion.div>
        )}

        {/* Search & Subject Filter with High Contrast */}
        {summaries.length > 0 && (
          <motion.div {...cardAnim(0.12)} className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Cari rangkuman, topik, atau kata kunci materi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 focus:border-primary-500 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Subject Tabs */}
            {allSubjects.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
                <button
                  onClick={() => setSelectedSubject('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedSubject === 'all'
                      ? 'gradient-primary text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Semua ({summaries.length})
                </button>
                {allSubjects.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedSubject === sub
                        ? 'gradient-primary text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {sub} ({bySubject[sub]?.length || 0})
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Content Section: Folders or Empty State */}
        {displaySubjectKeys.length > 0 ? (
          <motion.div {...cardAnim(0.15)} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-extrabold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={13} className="text-primary-600" />
                Folder Mata Pelajaran ({filteredSummaries.length} Rangkuman)
              </h2>
            </div>

            <div className="space-y-3.5">
              {displaySubjectKeys.map((subject, i) => (
                <motion.div key={subject} {...cardAnim(0.15 + i * 0.04)}>
                  <SummarySubjectFolder subject={subject} summaries={filteredBySubject[subject]} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : search || selectedSubject !== 'all' ? (
          <motion.div {...cardAnim(0.15)} className="bg-white rounded-3xl p-10 text-center shadow-card border border-gray-200">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center text-2xl mx-auto mb-3">
              🔍
            </div>
            <p className="text-gray-900 font-extrabold text-base" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Tidak ditemukan rangkuman
            </p>
            <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto">
              Tidak ada hasil yang sesuai dengan filter pencarian &quot;{search}&quot;.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedSubject('all'); }}
              className="mt-4 px-4 py-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-xl text-xs font-bold hover:bg-primary-100 transition-colors"
            >
              Reset Filter & Pencarian
            </button>
          </motion.div>
        ) : (
          !saving && (
            <motion.div
              {...cardAnim(0.15)}
              className="bg-white rounded-3xl shadow-card border border-gray-200 text-center py-16 px-6"
            >
              <div className="w-16 h-16 rounded-3xl bg-primary-50 border-2 border-primary-100 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                📖
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Belum ada rangkuman materi
              </h3>
              <p className="text-sm text-gray-500 mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
                Tempel materi teks atau upload dokumen untuk dirangkum dan dikelompokkan secara otomatis oleh AI.
              </p>
              <button
                onClick={() => setShowUploader(true)}
                className="px-6 py-3 gradient-primary text-white text-sm font-bold rounded-2xl shadow-glow hover:opacity-95 transition-all inline-flex items-center gap-2 active:scale-95"
              >
                <Plus size={18} /> Rangkum Materi Pertama
              </button>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
