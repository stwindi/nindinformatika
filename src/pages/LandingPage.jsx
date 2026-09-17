import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, BookOpen, MessageCircle, ArrowRight, Star, Sparkles } from 'lucide-react';
import MagicalHeroBackground from '../components/MagicalHeroBackground';

const features = [
  {
    icon: '📋',
    title: 'Task Manager AI',
    desc: 'Ketik tugasmu dalam bahasa natural, AI langsung pecah jadi langkah-langkah kecil. Deadline nggak terasa menakutkan lagi!',
    color: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    icon: '✨',
    title: 'Smart Summary AI',
    desc: 'Rangkum materi sekolah dan diperkaya materi pendukung dari sumber tepercaya otomatis ke folder mata pelajaran!',
    color: 'from-indigo-500 to-violet-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  {
    icon: '🃏',
    title: 'AI Flashcard Generator',
    desc: 'Paste materi pelajaranmu, AI langsung bikin flashcard swipeable. Belajar kayak main game, bukan scrolling TikTok!',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
  },
  {
    icon: '🍀',
    title: 'Clova AI Companion',
    desc: 'Teman belajar AI yang ramah, bisa diajak ngobrol santai, tanya materi, minta motivasi, atau minta dibuatkan ringkasan.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
];

const testimonials = [
  { name: 'Aisha, Kelas 11', text: '"Tugas makalah 10 halaman jadi nggak takut lagi! AI langsung pecah jadi langkah-langkah kecil yang gampang dicicil."', avatar: '👩‍🎓' },
  { name: 'Rizki, Kelas 10', text: '"Flashcard-nya kaya swipe TikTok tapi buat belajar. Belajar jadi seru banget kayak petualangan!"', avatar: '👨‍🎓' },
  { name: 'Nadia, Kelas 12', text: '"Fitur Smart Summary bikin materi ujian langsung rapi per mapel. Belajar jadi super efisien!"', avatar: '👩‍🎓' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Navbar with Magical Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Clova Logo"
              className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(147,197,253,0.7)]"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                Clova
              </span>
              <span className="text-[10px] text-sky-300 font-medium tracking-widest uppercase -mt-1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                belajar jadi petualangan
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5"
            >
              Masuk
            </Link>
            <Link
              to="/auth"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-[0_0_16px_rgba(99,102,241,0.4)] border border-white/20 hover:scale-105"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animated Magical Background */}
      <MagicalHeroBackground />

      {/* Features Section */}
      <section id="fitur" className="py-24 px-6 bg-slate-900/90 relative border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles size={13} />
              Fitur Petualangan Belajar
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Semua yang kamu butuhkan untuk belajar pintar 💪
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
              Fitur canggih berbasis AI yang saling terintegrasi, dirancang khusus supaya belajar terasa seru, produktif, dan bebas stres.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-slate-950/60 backdrop-blur-md rounded-3xl p-8 border border-white/10 hover:border-indigo-500/40 hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)] transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-5 shadow-lg shadow-indigo-500/20`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                  {f.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-slate-950 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Kata Sahabat Petualang... ⭐
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Kisah nyata dari pelajar yang berhasil meningkatkan nilai dan semangat belajar mereka.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-slate-900/70 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-indigo-500/30 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                    {t.text}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-base">
                    {t.avatar}
                  </div>
                  <span className="text-sm font-semibold text-slate-200">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-6 relative">
        <motion.div
          {...fadeUp}
          className="max-w-3xl mx-auto bg-gradient-to-r from-violet-900/90 via-indigo-900/90 to-slate-900/90 border border-indigo-500/30 rounded-3xl p-10 md:p-14 text-center text-white shadow-[0_0_50px_rgba(99,102,241,0.25)] relative overflow-hidden"
        >
          {/* Subtle glow orb */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full filter blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4">
              <img src="/logo.png" alt="Clova" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Siap Menjelajah &amp; Belajar Lebih Pintar? 🎓
            </h2>
            <p className="text-slate-300 mb-8 text-base sm:text-lg max-w-xl mx-auto">
              100% Gratis. Akses Task Manager, Smart Summary, Flashcard, dan AI Chat sekarang juga!
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-900 font-extrabold rounded-2xl text-base sm:text-lg hover:bg-sky-50 hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Daftar Gratis Sekarang <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 text-center bg-slate-950">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
          <span className="text-sm font-semibold text-slate-300 tracking-wide" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Clova
          </span>
        </div>
        <p className="text-slate-500 text-xs sm:text-sm">
          © 2025 Clova · Belajar jadi petualangan seru untuk pelajar Indonesia 🇮🇩
        </p>
      </footer>
    </div>
  );
}
