import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, BookOpen, MessageCircle, ArrowRight, Star } from 'lucide-react';

const features = [
  {
    icon: '📋',
    title: 'Task Manager AI',
    desc: 'Ketik tugasmu dalam bahasa natural, AI langsung pecah jadi langkah-langkah kecil. Deadline nggak terasa menakutkan lagi!',
    color: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-50',
  },
  {
    icon: '🃏',
    title: 'AI Flashcard Generator',
    desc: 'Paste materi pelajaranmu, AI langsung bikin flashcard swipeable. Belajar kayak main game, bukan scrolling TikTok!',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50',
  },
  {
    icon: '🤖',
    title: 'AI Study Companion',
    desc: 'Teman belajar AI yang ramah, bisa diajak ngobrol santai, tanya materi, minta motivasi, atau minta dibuatkan ringkasan.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: '🔥',
    title: 'Streak & Progress',
    desc: 'Tracking streak belajar harian, progress bar per tugas, dan reminder otomatis H-7, H-3, H-1 biar nggak terlambat!',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
  },
];

const testimonials = [
  { name: 'Aisha, Kelas 11', text: '"Tugas makalah 10 halaman jadi nggak takut lagi! AI langsung pecah jadi 8 langkah kecil."', avatar: '👩🎓' },
  { name: 'Rizki, Kelas 10', text: '"Flashcard-nya kaya swipe TikTok tapi buat belajar. Addicting banget!"', avatar: '👨🎓' },
  { name: 'Nadia, Kelas 12', text: '"Streak 30 hari! Sekarang tiap hari buka StudyBuddy bukan Instagram dulu."', avatar: '👩🎓' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-lg font-bold gradient-text" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              StudyBuddy <span className="text-primary-600">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Masuk
            </Link>
            <Link
              to="/auth"
              className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-glow"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 relative overflow-hidden">
        {/* BG decoration */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6"
          >
            <Zap size={14} className="text-amber-500" />
            Teman belajar AI untuk remaja SMP &amp; SMA
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
            style={{ fontFamily: 'Plus Jakarta Sans' }}
          >
            Stop Scrolling,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-cyan-500">
              Mulai Belajar
            </span>{' '}
            🚀
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            StudyBuddy AI membantu kamu manage tugas sekolah, belajar dengan flashcard interaktif,
            dan nggak burnout deadline. AI yang ngerti dunia pelajar Indonesia!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 gradient-primary text-white font-bold rounded-2xl text-lg shadow-glow hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Mulai Gratis Sekarang <ArrowRight size={20} />
            </Link>
            <a
              href="#fitur"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:border-primary-300 hover:text-primary-700 transition-all duration-200"
            >
              Lihat Fitur
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-2"
          >
            <div className="flex -space-x-2">
              {['👩🎓','👨🎓','👩🎓','👨🎓','👩🎓'].map((a, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-sm">{a}</div>
              ))}
            </div>
            <p className="text-sm text-gray-500 ml-2">
              <span className="font-semibold text-gray-700">1,000+</span> pelajar sudah bergabung ✨
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Semua yang kamu butuhkan untuk belajar 💪
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">4 fitur utama yang saling terintegrasi, dirancang khusus supaya belajar terasa fun dan nggak stres.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`${f.bg} rounded-3xl p-8 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-5 shadow-md`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Kata mereka... ⭐
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-lg">{t.avatar}</div>
                  <span className="text-sm font-semibold text-gray-700">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          {...fadeUp}
          className="max-w-3xl mx-auto gradient-primary rounded-3xl p-12 text-center text-white"
        >
          <h2 className="text-3xl font-extrabold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Siap belajar lebih smart? 🎓
          </h2>
          <p className="text-white/80 mb-8 text-lg">Gratis. Nggak perlu kartu kredit. Daftar dalam 30 detik.</p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl text-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Daftar Gratis <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center">
        <p className="text-gray-500 text-sm">© 2025 StudyBuddy AI · Dibuat dengan ❤️ untuk pelajar Indonesia</p>
      </footer>
    </div>
  );
}
