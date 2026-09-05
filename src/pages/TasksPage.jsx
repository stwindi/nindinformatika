import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import useTaskStore from '../stores/taskStore';
import useAuthStore from '../stores/authStore';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TasksPage() {
  const { tasks, loading, fetchTasks } = useTaskStore();
  const { user, updateStreak } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.uid) {
      fetchTasks(user.uid);
      updateStreak();
    }
  }, [user?.uid]);

  const filtered = tasks.filter(t => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.subject?.toLowerCase() || '').includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all:           tasks.length,
    todo:          tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done:          tasks.filter(t => t.status === 'done').length,
  };

  const filterTabs = [
    { key: 'all',          label: 'Semua' },
    { key: 'todo',         label: 'Belum' },
    { key: 'in-progress',  label: 'Proses' },
    { key: 'done',         label: 'Selesai' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 pt-8 pb-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                📋 Tugas Saya
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {counts.all} tugas total · {counts['in-progress']} sedang berjalan
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 gradient-primary text-white text-sm font-semibold rounded-2xl shadow-glow hover:opacity-90 transition-all"
            >
              <Plus size={18} /> Tambah
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari tugas atau mata pelajaran..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-sm focus:border-primary-300 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterTabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filter === key
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label} <span className="opacity-70">({counts[key]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">{search ? '🔍' : '📭'}</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              {search ? 'Tugas tidak ditemukan' : 'Belum ada tugas'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {search
                ? 'Coba kata kunci lain'
                : 'Tambah tugas pertamamu dan biarkan AI memecahnya!'}
            </p>
            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 gradient-primary text-white font-semibold rounded-2xl text-sm"
              >
                + Tambah Tugas Pertama
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {filtered.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          </AnimatePresence>
        )}
      </div>

      {showModal && <AddTaskModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
