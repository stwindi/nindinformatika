import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginEmail, registerEmail, loginGoogle, loading } = useAuthStore();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'login') {
        await loginEmail(form.email, form.password);
        toast.success('Selamat datang kembali! 👋');
      } else {
        if (!form.name.trim()) { toast.error('Nama tidak boleh kosong'); setBusy(false); return; }
        await registerEmail(form.email, form.password, form.name);
        toast.success('Akun berhasil dibuat! Selamat belajar 🎉');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      await loginGoogle();
      toast.success('Login berhasil! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Login Google gagal');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-cyan-50 flex">
      {/* Left decoration — hidden on mobile */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-16">
        <div className="text-white max-w-md">
          <div className="text-6xl mb-6 animate-float">📚</div>
          <h2 className="text-4xl font-extrabold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Belajar lebih smart,<br />bukan lebih keras 💡
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            AI bantu kamu pecah tugas besar, bikin flashcard instan, dan jaga streak belajar harianmu.
          </p>
          <div className="mt-10 space-y-3">
            {['✅ Task Manager dengan AI Breakdown','🃏 Flashcard Generator Otomatis','🤖 Chatbot Pendamping Belajar','🔥 Streak & Progress Tracker'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 rounded-full bg-white/60" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-8 transition-colors">
            <ArrowLeft size={16} /> Kembali ke beranda
          </Link>

          <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-8">
            {/* Logo */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📚</div>
              <h1 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>StudyBuddy AI</h1>
              <p className="text-gray-500 text-sm mt-1">Teman belajar AI-mu</p>
            </div>

            {/* Tab */}
            <div className="flex rounded-2xl bg-gray-100 p-1 mb-6">
              {['login','register'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    mode === m ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m === 'login' ? 'Masuk' : 'Daftar'}
                </button>
              ))}
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={busy}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 mb-5 disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Lanjutkan dengan Google
            </button>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">atau dengan email</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {mode === 'register' && (
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nama kamu"
                      value={form.name}
                      onChange={e => setField('name', e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email kamu"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password (min. 6 karakter)"
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 gradient-primary text-white font-bold rounded-2xl text-sm hover:opacity-90 hover:shadow-glow transition-all duration-200 disabled:opacity-60"
                >
                  {busy ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Buat Akun'}
                </button>
              </motion.form>
            </AnimatePresence>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Dengan mendaftar, kamu menyetujui syarat & ketentuan StudyBuddy AI.
          </p>
        </div>
      </div>
    </div>
  );
}
