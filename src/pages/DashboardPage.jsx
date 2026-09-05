import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, BookOpen, MessageCircle, Plus, ArrowRight, Clock, Flame } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useTaskStore from '../stores/taskStore';
import useFlashcardStore from '../stores/flashcardStore';
import SubjectBadge from '../components/SubjectBadge';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDaysUntilDeadline } from '../services/taskService';

const cardAnim = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function DashboardPage() {
  const { user, profile, updateStreak } = useAuthStore();
  const { tasks, loading: taskLoading, fetchTasks, getUpcomingTasks } = useTaskStore();
  const { decks, loading: deckLoading, fetchDecks } = useFlashcardStore();

  useEffect(() => {
    if (user?.uid) {
      fetchTasks(user.uid);
      fetchDecks(user.uid);
      updateStreak();
    }
  }, [user?.uid]);

  if (taskLoading || deckLoading) return <LoadingSpinner />;

  const upcomingTasks = getUpcomingTasks();
  const urgentTasks = upcomingTasks.filter(t => {
    const d = getDaysUntilDeadline(t.deadline);
    return d !== null && d <= 3;
  });
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const totalCards = decks.reduce((a, d) => a + (d.cardCount || 0), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
  const greetingEmoji = hour < 12 ? '☀️' : hour < 15 ? '🌤️' : hour < 18 ? '🌅' : '🌙';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="gradient-primary px-6 pt-8 pb-16">
        <div className="max-w-2xl mx-auto">
          <motion.div {...cardAnim(0)}>
            <p className="text-white/70 text-sm mb-1">{greetingEmoji} {greeting},</p>
            <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              {profile?.name?.split(' ')[0] || 'StudyBuddy'}! 👋
            </h1>
            <p className="text-white/70 text-sm mt-2">
              {urgentTasks.length > 0
                ? `⚠️ ${urgentTasks.length} tugas mendekati deadline!`
                : tasks.filter(t => t.status !== 'done').length === 0
                ? '🎉 Semua tugas sudah selesai! Luar biasa!'
                : `📋 ${tasks.filter(t => t.status !== 'done').length} tugas menunggu dikerjakan`
              }
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-10 pb-8 space-y-5">
        {/* Stats row */}
        <motion.div {...cardAnim(0.1)} className="grid grid-cols-3 gap-3">
          {[
            { icon: '🔥', label: 'Streak', value: profile?.streak || 0, unit: 'hari', color: 'text-orange-500' },
            { icon: '✅', label: 'Selesai', value: doneTasks, unit: 'tugas', color: 'text-emerald-500' },
            { icon: '🃏', label: 'Kartu', value: totalCards, unit: 'flashcard', color: 'text-primary-500' },
          ].map(({ icon, label, value, unit, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-card text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <p className={`text-xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Urgent tasks */}
        {urgentTasks.length > 0 && (
          <motion.div {...cardAnim(0.15)}>
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-amber-800 text-sm flex items-center gap-1.5">
                  <Clock size={14} /> Deadline Mendekat!
                </h2>
                <Link to="/tasks" className="text-xs text-amber-600 font-medium hover:underline">Lihat semua</Link>
              </div>
              <div className="space-y-2">
                {urgentTasks.slice(0, 3).map(task => {
                  const daysLeft = getDaysUntilDeadline(task.deadline);
                  return (
                    <Link key={task.id} to={`/tasks/${task.id}`}>
                      <div className="bg-white rounded-2xl p-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
                        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                          daysLeft === 0 ? 'bg-red-100 text-red-600'
                          : daysLeft === 1 ? 'bg-red-50 text-red-500'
                          : 'bg-amber-100 text-amber-600'
                        }`}>
                          {daysLeft === 0 ? '!' : daysLeft}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                          <SubjectBadge subject={task.subject} size="xs" />
                        </div>
                        <ProgressBar value={task.progress || 0} size="sm" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <motion.div {...cardAnim(0.2)}>
          <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Aksi Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link to="/tasks" className="block">
              <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mb-3">
                  <CheckSquare size={20} className="text-primary-600" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">Tambah Tugas</p>
                <p className="text-xs text-gray-500 mt-0.5">+ AI breakdown otomatis</p>
              </div>
            </Link>
            <Link to="/flashcards" className="block">
              <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center mb-3">
                  <BookOpen size={20} className="text-cyan-600" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">Review Flashcard</p>
                <p className="text-xs text-gray-500 mt-0.5">{totalCards} kartu tersedia</p>
              </div>
            </Link>
            <Link to="/chat" className="block">
              <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                  <MessageCircle size={20} className="text-emerald-600" />
                </div>
                <p className="font-semibold text-gray-900 text-sm">Chat AI</p>
                <p className="text-xs text-gray-500 mt-0.5">Tanya apa saja</p>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Upcoming tasks */}
        <motion.div {...cardAnim(0.25)}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Tugas Mendatang</h2>
            <Link to="/tasks" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
              Semua <ArrowRight size={12} />
            </Link>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-card">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-gray-600 font-semibold text-sm">Tidak ada tugas aktif!</p>
              <p className="text-gray-400 text-xs mt-1">Waktunya istirahat atau buat tugas baru</p>
              <Link to="/tasks" className="inline-flex items-center gap-1 mt-4 px-4 py-2 gradient-primary text-white text-xs font-semibold rounded-xl">
                <Plus size={12} /> Tambah Tugas
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 4).map(task => {
                const daysLeft = getDaysUntilDeadline(task.deadline);
                return (
                  <Link key={task.id} to={`/tasks/${task.id}`}>
                    <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 hover:shadow-card-hover transition-all">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate mb-1">{task.title}</p>
                          <div className="flex items-center gap-2">
                            <SubjectBadge subject={task.subject} size="xs" />
                            {daysLeft !== null && (
                              <span className={`text-xs ${
                                daysLeft <= 1 ? 'text-red-500 font-semibold'
                                : daysLeft <= 3 ? 'text-amber-600'
                                : 'text-gray-400'
                              }`}>
                                {daysLeft <= 0 ? 'Terlambat!' : daysLeft === 1 ? 'Besok!' : `${daysLeft} hari`}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
                      </div>
                      <div className="mt-3">
                        <ProgressBar value={task.progress || 0} size="sm" />
                        <p className="text-xs text-gray-400 mt-1">{task.progress || 0}% selesai</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Flashcard decks preview */}
        {decks.length > 0 && (
          <motion.div {...cardAnim(0.3)}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Deck Flashcard</h2>
              <Link to="/flashcards" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                Semua <ArrowRight size={12} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {decks.slice(0, 4).map(deck => (
                <Link key={deck.id} to={`/flashcards/${deck.id}`} className="flex-shrink-0">
                  <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 w-36 hover:shadow-card-hover transition-all">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2"
                      style={{ backgroundColor: deck.color + '25' }}
                    >
                      {deck.icon}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{deck.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{deck.cardCount || 0} kartu</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
