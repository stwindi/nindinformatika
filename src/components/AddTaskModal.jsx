import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Plus, Clock, Wand2, Upload, FileText, FileImage, File, Trash2 } from 'lucide-react';
import { breakdownTask, breakdownTaskWithDocument } from '../services/gemini';
import useTaskStore from '../stores/taskStore';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const SUBJECTS = [
  'Matematika','Fisika','Kimia','Biologi','Bahasa Indonesia',
  'Bahasa Inggris','Sejarah','Geografi','Ekonomi','Sosiologi',
  'PKN','TIK','Seni','Olahraga','Umum',
];

// Convert ArrayBuffer → base64 string
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// Get file icon & type info
function getFileInfo(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext))                       return { icon: FileText, color: '#ef4444', label: 'PDF', type: 'pdf' };
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return { icon: FileImage, color: '#8b5cf6', label: 'Gambar', type: 'image' };
  if (['docx','doc'].includes(ext))               return { icon: FileText, color: '#3b82f6', label: 'Word', type: 'docx' };
  if (['txt'].includes(ext))                      return { icon: FileText, color: '#10b981', label: 'Teks', type: 'txt' };
  return { icon: File, color: '#6b7280', label: ext.toUpperCase(), type: 'other' };
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function AddTaskModal({ onClose }) {
  const { addTask } = useTaskStore();
  const { user } = useAuthStore();
  const [mode, setMode] = useState('ai'); // 'ai' | 'manual'
  const [loading, setLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null); // { file, info, status }
  const [processingFile, setProcessingFile] = useState(false);
  const fileInputRef = useRef(null);

  const [manual, setManual] = useState({
    title: '', subject: 'Umum', deadline: '', priority: 'medium', description: ''
  });

  // ---- FILE UPLOAD ----
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File terlalu besar! Maksimal 10MB.');
      return;
    }

    const info = getFileInfo(file);
    if (info.type === 'other') {
      toast.error('Format tidak didukung. Gunakan PDF, DOCX, TXT, atau gambar.');
      return;
    }

    setUploadedFile({ file, info, status: 'ready' });
    e.target.value = '';
  };

  // ---- AI BREAKDOWN ----
  const handleAiBreakdown = async () => {
    if (!aiInput.trim() && !uploadedFile) {
      toast.error('Deskripsikan tugas atau upload dokumen dulu!');
      return;
    }

    setLoading(true);
    try {
      let result;

      if (uploadedFile) {
        setProcessingFile(true);
        const { file, info } = uploadedFile;
        let docData;

        if (info.type === 'pdf' || info.type === 'image') {
          // Send directly to Gemini as base64 (multimodal)
          const buffer = await file.arrayBuffer();
          const base64 = arrayBufferToBase64(buffer);
          docData = {
            type: info.type,
            base64,
            mimeType: file.type || (info.type === 'pdf' ? 'application/pdf' : 'image/jpeg'),
          };
        } else if (info.type === 'docx') {
          // Extract text via mammoth
          const mammoth = await import('mammoth');
          const buffer = await file.arrayBuffer();
          const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
          docData = { type: 'text', text: value };
        } else if (info.type === 'txt') {
          const text = await file.text();
          docData = { type: 'text', text };
        }

        setProcessingFile(false);
        result = await breakdownTaskWithDocument(aiInput, docData);
      } else {
        result = await breakdownTask(aiInput);
      }

      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + (result.estimatedDeadlineDays || 7));
      setPreview({ ...result, deadline: deadlineDate });
    } catch (err) {
      console.error(err);
      toast.error('AI gagal memproses. Coba lagi!');
    } finally {
      setLoading(false);
      setProcessingFile(false);
    }
  };

  const handleSaveAi = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      await addTask(user.uid, preview);
      toast.success('Tugas berhasil ditambahkan! 🎉');
      onClose();
    } catch {
      toast.error('Gagal menyimpan tugas');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    if (!manual.title.trim()) { toast.error('Judul tugas tidak boleh kosong'); return; }
    setLoading(true);
    try {
      await addTask(user.uid, {
        ...manual,
        deadline: manual.deadline ? new Date(manual.deadline) : null,
        subtasks: [],
      });
      toast.success('Tugas berhasil ditambahkan! 🎉');
      onClose();
    } catch {
      toast.error('Gagal menyimpan tugas');
    } finally {
      setLoading(false);
    }
  };

  const loadingText = processingFile
    ? `Membaca ${uploadedFile?.info?.label || 'dokumen'}...`
    : 'AI sedang menganalisis...';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Tambah Tugas Baru
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">AI siap bantu pecah tugasmu jadi langkah kecil</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
              <X size={20} />
            </button>
          </div>

          {/* Mode toggle */}
          <div className="px-6 pt-4 flex gap-2">
            <button
              onClick={() => { setMode('ai'); setPreview(null); }}
              style={mode === 'ai' ? { background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff' } : {}}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode !== 'ai' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : ''
              }`}
            >
              <Wand2 size={15} /> AI Otomatis
            </button>
            <button
              onClick={() => { setMode('manual'); setPreview(null); }}
              style={mode === 'manual' ? { background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: '#fff' } : {}}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode !== 'manual' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : ''
              }`}
            >
              <Plus size={15} /> Manual
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-5">

            {/* ===== AI MODE — INPUT ===== */}
            {mode === 'ai' && !preview && (
              <div className="space-y-4">

                {/* Describe task */}
                <textarea
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  placeholder='Ceritakan tugasmu... contoh: "Bikin makalah 10 halaman tentang fotosintesis, deadline minggu depan"'
                  className="w-full h-28 p-4 rounded-2xl border-2 border-gray-200 text-sm resize-none focus:border-primary-400 focus:outline-none transition-colors"
                />

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 font-medium">+ Upload Dokumen (opsional)</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* File upload area */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {!uploadedFile ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center gap-2 hover:border-primary-300 hover:bg-primary-50/50 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                      <Upload size={20} className="text-gray-400 group-hover:text-primary-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-600 group-hover:text-primary-600">Upload Materi / Soal</p>
                      <p className="text-xs text-gray-400 mt-0.5">PDF, DOCX, TXT, atau Gambar · Maks 10MB</p>
                    </div>
                    <div className="flex gap-2 mt-1">
                      {['PDF', 'DOCX', 'TXT', 'JPG'].map(f => (
                        <span key={f} className="px-2 py-0.5 bg-gray-100 rounded-lg text-xs text-gray-500 font-medium">{f}</span>
                      ))}
                    </div>
                  </button>
                ) : (
                  /* File preview card */
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: uploadedFile.info.color + '20' }}>
                      <uploadedFile.info.icon size={20} style={{ color: uploadedFile.info.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{uploadedFile.file.name}</p>
                      <p className="text-xs text-gray-400">{uploadedFile.info.label} · {formatBytes(uploadedFile.file.size)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg">Siap ✓</span>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                )}

                {uploadedFile && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-xs text-amber-700">
                      💡 AI akan membaca isi {uploadedFile.info.label} dan membuat breakdown tugas yang spesifik berdasarkan materinya!
                    </p>
                  </div>
                )}

                <button
                  onClick={handleAiBreakdown}
                  disabled={loading || (!aiInput.trim() && !uploadedFile)}
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}
                  className="w-full py-3.5 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {loadingText}</>
                  ) : (
                    <><Sparkles size={16} /> {uploadedFile ? 'Analisis Dokumen & Breakdown' : 'Breakdown dengan AI'}</>
                  )}
                </button>
              </div>
            )}

            {/* ===== AI MODE — PREVIEW ===== */}
            {mode === 'ai' && preview && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <p className="text-sm font-semibold text-emerald-700 mb-1">✨ AI berhasil menganalisis!</p>
                  {preview.summary && (
                    <p className="text-xs text-emerald-600 italic">"{preview.summary}"</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Judul</label>
                    <p className="font-semibold text-gray-900">{preview.title}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Mata Pelajaran</label>
                      <p className="text-sm text-gray-700">{preview.subject}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Prioritas</label>
                      <p className="text-sm text-gray-700 capitalize">{preview.priority}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Clock size={14} /> Subtask ({preview.subtasks?.length || 0} langkah)
                  </h4>
                  <div className="space-y-2">
                    {preview.subtasks?.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{s.title}</p>
                          <p className="text-xs text-gray-400">~{s.estimatedMinutes} menit</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setPreview(null)}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl text-sm hover:bg-gray-50"
                  >
                    Ulangi
                  </button>
                  <button
                    onClick={handleSaveAi}
                    disabled={loading}
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}
                    className="flex-1 py-3 text-white font-semibold rounded-2xl text-sm disabled:opacity-60"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Tugas 🎉'}
                  </button>
                </div>
              </div>
            )}

            {/* ===== MANUAL MODE ===== */}
            {mode === 'manual' && (
              <form onSubmit={handleSaveManual} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Judul Tugas *</label>
                  <input
                    value={manual.title}
                    onChange={e => setManual(m => ({ ...m, title: e.target.value }))}
                    placeholder="Contoh: Makalah Fotosintesis"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mata Pelajaran</label>
                    <select
                      value={manual.subject}
                      onChange={e => setManual(m => ({ ...m, subject: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
                    >
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prioritas</label>
                    <select
                      value={manual.priority}
                      onChange={e => setManual(m => ({ ...m, priority: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
                    >
                      <option value="high">🔴 Tinggi</option>
                      <option value="medium">🟡 Sedang</option>
                      <option value="low">🟢 Rendah</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={manual.deadline}
                    onChange={e => setManual(m => ({ ...m, deadline: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm focus:border-primary-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deskripsi (opsional)</label>
                  <textarea
                    value={manual.description}
                    onChange={e => setManual(m => ({ ...m, description: e.target.value }))}
                    placeholder="Detail tambahan..."
                    className="w-full h-24 px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm resize-none focus:border-primary-400 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}
                  className="w-full py-3 text-white font-semibold rounded-2xl text-sm disabled:opacity-60"
                >
                  {loading ? 'Menyimpan...' : 'Tambah Tugas'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
