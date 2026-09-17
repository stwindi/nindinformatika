import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, Mail, Flame, CheckSquare, BookOpen, Award, Camera, Pencil, Check, X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../services/firebase';
import useAuthStore from '../stores/authStore';
import useTaskStore from '../stores/taskStore';
import useFlashcardStore from '../stores/flashcardStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, logout, updateStreak } = useAuthStore();
  const { tasks } = useTaskStore();
  const { decks } = useFlashcardStore();
  const fileInputRef = useRef(null);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.name || '');
  const [savingName, setSavingName] = useState(false);
  // Local preview state
  const [localPhotoURL, setLocalPhotoURL] = useState(profile?.photoURL || null);

  const handleLogout = async () => {
    await logout();
    toast.success('Sampai jumpa! 👋');
    navigate('/auth');
  };

  // ---- PHOTO UPLOAD ----
  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar!');
      return;
    }

    // Compress to base64 (max 200x200, JPEG 0.7)
    setUploadingPhoto(true);
    try {
      const base64 = await compressImage(file, 200, 200, 0.7);

      // Save to Firestore
      await updateDoc(doc(db, 'users', user.uid), { photoURL: base64 });

      // Update Firebase Auth profile (won't accept base64 as photoURL but we store in Firestore)
      setLocalPhotoURL(base64);

      // Update local store state
      useAuthStore.setState(s => ({
        profile: { ...s.profile, photoURL: base64 }
      }));

      toast.success('Foto profil diperbarui! 📸');
    } catch (err) {
      console.error(err);
      toast.error('Gagal upload foto. Coba lagi!');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const compressImage = (file, maxW, maxH, quality) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxW || h > maxH) {
            const ratio = Math.min(maxW / w, maxH / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ---- EDIT NAME ----
  const handleSaveName = async () => {
    if (!newName.trim()) { toast.error('Nama tidak boleh kosong'); return; }
    setSavingName(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { name: newName.trim() });
      await updateProfile(auth.currentUser, { displayName: newName.trim() });
      useAuthStore.setState(s => ({
        profile: { ...s.profile, name: newName.trim() }
      }));
      toast.success('Nama diperbarui!');
      setEditingName(false);
    } catch {
      toast.error('Gagal menyimpan nama');
    } finally {
      setSavingName(false);
    }
  };

  const displayPhoto = localPhotoURL || profile?.photoURL;
  const displayName = profile?.name || user?.displayName || 'StudyBuddy User';
  const initial = (displayName)[0].toUpperCase();

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const totalCards = decks.reduce((a, d) => a + (d.cardCount || 0), 0);
  const totalDecks = decks.length;

  const stats = [
    { icon: Flame,       label: 'Streak Belajar',  value: profile?.streak || 0, unit: 'hari',              color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: CheckSquare, label: 'Tugas Selesai',    value: doneTasks,            unit: `dari ${totalTasks}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: BookOpen,    label: 'Total Flashcard',  value: totalCards,           unit: 'kartu',             color: 'text-primary-600', bg: 'bg-primary-50' },
    { icon: Award,       label: 'Deck Dibuat',      value: totalDecks,           unit: 'deck',              color: 'text-cyan-600',   bg: 'bg-cyan-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoChange}
      />

      {/* Header */}
      <div className="gradient-primary px-6 pt-8 pb-20">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-extrabold text-white" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Profil Saya
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-12 pb-8 space-y-5">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-card border border-gray-100 text-center"
        >
          {/* Avatar with upload button */}
          <div className="relative w-24 h-24 mx-auto mb-4">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="Avatar"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-primary-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center text-4xl text-white font-bold border-4 border-primary-100">
                {initial}
              </div>
            )}

            {/* Camera overlay button */}
            <button
              onClick={handlePhotoClick}
              disabled={uploadingPhoto}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-primary-200 rounded-xl flex items-center justify-center shadow-md hover:bg-primary-50 transition-colors"
            >
              {uploadingPhoto ? (
                <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={14} className="text-primary-600" />
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-3">Ketuk ikon kamera untuk ganti foto</p>

          {/* Editable name */}
          {editingName ? (
            <div className="flex items-center gap-2 justify-center mb-1">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                autoFocus
                className="text-lg font-extrabold text-gray-900 text-center border-b-2 border-primary-400 outline-none bg-transparent w-48"
                style={{ fontFamily: 'Plus Jakarta Sans' }}
              />
              <button onClick={handleSaveName} disabled={savingName} className="p-1 text-emerald-500 hover:text-emerald-600">
                <Check size={18} />
              </button>
              <button onClick={() => { setEditingName(false); setNewName(displayName); }} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center mb-1">
              <h2 className="text-xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {displayName}
              </h2>
              <button
                onClick={() => { setEditingName(true); setNewName(displayName); }}
                className="p-1 text-gray-300 hover:text-primary-500 transition-colors"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}

          <p className="text-sm text-gray-500">{user?.email}</p>

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
              <div className="flex-1">
                <p className="text-xs text-gray-400">Nama</p>
                <p className="text-sm font-medium text-gray-800">{displayName}</p>
              </div>
              <button
                onClick={() => { setEditingName(true); setNewName(displayName); }}
                className="text-xs text-primary-500 font-semibold hover:text-primary-700"
              >
                Edit
              </button>
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
