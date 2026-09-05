import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, Mail, Flame, CheckSquare, BookOpen, Award } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import useTaskStore from '../stores/taskStore';
import useFlashcardStore from '../stores/flashcardStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuthStore();
  const { tasks } = useTaskStore();
  const { decks } = useFlashcardStore();

  const handleLogout = async () => {
    await logout();
    toast.success('Sampai jumpa! 👋');
    navigate('/auth');
  };

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const totalCards = decks.reduce((a, d) => a + (d.cardCount || 0), 0);
  const totalDecks = decks.length;

  const stats = [
    { icon: Flame,       label: 'Streak Belajar',    value: profile?.streak || 0,   unit: 'hari',     color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: CheckSquare, label: 'Tugas Selesai',      value: doneTasks,              unit: `dari ${totalTasks}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: BookOpen,    label: 'Total Flashcard',    value: totalCards,             unit: 'kartu',    color: 'text-primary-600', bg: 'bg-primary-50' },
    { icon: Award,       label: 'Deck Dibuat',        value: totalDecks,             unit: 'deck',     color: 'text-cyan-600',   bg: 'bg-cyan-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-primary px-6 pt-8 pb-20">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-extrabold text-white" style={{ fontFamily: 'Plus Jakarta Sans' }}>Profil Saya</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-12 pb-8 space-y-5">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 text-center"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover border-4 border-primary-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl mx-auto mb-4 gradient-primary flex items-center justify-center text-4xl">
              {(profile?.name || user?.email || '?')[0].toUpperCase()}
            </div>
          )}
          <h2 className="text-xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {profile?.name || 'StudyBuddy User'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-orange-600">{profile?.streak || 0} hari streak!</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          {stats.map(({ icon: Icon, label, value, unit, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4`}>
              <Icon size={20} className={`${color} mb-2`} />
              <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
              <p className="text-xs text-gray-600 font-medium mt-0.5">{label}</p>
              <p className="text-xs text-gray-400">{unit}</p>
            </div>
          ))}
        </motion.div>

        {/* Account info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-5 shadow-card border border-gray-100"
        >
          <h3 className="text-sm font-bold text-gray-700 mb-3">Informasi Akun</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Nama</p>
                <p className="text-sm font-medium text-gray-800">{profile?.name || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail size={16} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800">{user?.email || '-'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-5 shadow-card border border-gray-100"
        >
          <h3 className="text-sm font-bold text-gray-700 mb-2">Tentang StudyBuddy AI</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            StudyBuddy AI adalah teman belajar berbasis AI untuk remaja SMP &amp; SMA Indonesia.
            Dirancang untuk membantu kamu manage tugas, belajar dengan flashcard interaktif,
            dan menghindari burnout akibat deadline menumpuk. 📚✨
          </p>
          <p className="text-xs text-gray-400 mt-3">Powered by Google Gemini AI</p>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-red-200 text-red-600 font-semibold rounded-2xl hover:bg-red-50 transition-all"
          >
            <LogOut size={18} /> Keluar dari Akun
          </button>
        </motion.div>
      </div>
    </div>
  );
}
