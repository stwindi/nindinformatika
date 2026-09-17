import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Loader2, Sparkles, ChevronDown, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { detectSubject, generateSmartSummary } from '../services/gemini';

const SUBJECTS = [
  'Matematika','Fisika','Kimia','Biologi','Bahasa Indonesia','Bahasa Inggris',
  'Sejarah','Geografi','Ekonomi','Sosiologi','PKN','TIK','Seni','Olahraga','Umum',
];

export default function SmartSummaryUploader({ onSummaryReady }) {
  const [tab, setTab]              = useState('paste');
  const [text, setText]            = useState('');
  const [fileName, setFileName]    = useState('');
  const [step, setStep]            = useState('idle');
  const [detected, setDetected]    = useState(null);
  const [chosenSubject, setChosen] = useState('');
  const fileRef                    = useRef();

  const sourceText = text.trim();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'txt') {
      setText(await file.text());
      return;
    }
    if (ext === 'pdf') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result.split(',')[1];
        setText(`__PDF__${base64}__MIME__application/pdf`);
      };
      reader.readAsDataURL(file);
      return;
    }
    if (ext === 'docx') {
      const mammoth = (await import('mammoth')).default;
      const buf = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buf });
      setText(result.value);
      return;
    }
    toast.error('Format didukung: TXT, PDF, DOCX');
  };

  const getPlainText = () => {
    if (sourceText.startsWith('__PDF__'))
      return fileName + ' (PDF file)';
    return sourceText;
  };

  const handleDetect = async () => {
    if (!sourceText) { toast.error('Tempel atau upload materi dulu!'); return; }
    setStep('detecting');
    try {
      const result = await detectSubject(getPlainText());
      setDetected(result);
      if (result.confidence >= 0.75) {
        setChosen(result.subject);
        await runSummary(result.subject);
      } else {
        setChosen(result.subject);
        setStep('confirm');
      }
    } catch {
      toast.error('Gagal mendeteksi mata pelajaran. Coba lagi.');
      setStep('idle');
    }
  };

  const runSummary = async (subject) => {
    setStep('summarizing');
    try {
      const summaryData = await generateSmartSummary(
        sourceText.startsWith('__PDF__')
          ? `[PDF: ${fileName}] Buat rangkuman berdasarkan judul file dan mata pelajaran.`
          : sourceText,
        subject,
      );
      onSummaryReady({
        ...summaryData,
        subject,
        sourceText: getPlainText().slice(0, 8000),
        subjectConfidence: detected?.confidence ?? 1,
      });
      setStep('done');
    } catch {
      toast.error('Gagal membuat rangkuman. Coba lagi.');
      setStep('idle');
    }
  };

  const reset = () => {
    setText(''); setFileName(''); setStep('idle');
    setDetected(null); setChosen('');
  };

  const isLoading = step === 'detecting' || step === 'summarizing';

  return (
    <div className="bg-white rounded-3xl shadow-card border-2 border-gray-200 p-6">
      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 bg-gray-100 p-1.5 rounded-2xl border border-gray-200/80">
        {[
          { id: 'paste',  label: '📝 Tempel Teks Catatan' },
          { id: 'upload', label: '📎 Upload File (PDF/DOCX)' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); reset(); }}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              tab === t.id
                ? 'gradient-primary text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <AnimatePresence mode="wait">
        {tab === 'paste' ? (
          <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={isLoading}
              placeholder="Tempel materi pelajaran di sini… (catatan guru, bab buku, ringkasan teori, atau soal pembahasan)"
              className="w-full h-40 px-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-gray-50/50 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 resize-none transition-all leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1.5 px-1 font-semibold">
              <span>💡 Tips: Semakin lengkap materinya, semakin rapi rangkumannya</span>
              <span>{text.length.toLocaleString()} karakter</span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <input ref={fileRef} type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={isLoading}
              className="w-full h-40 rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50/30 hover:bg-primary-50/70 hover:border-primary-500 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              {fileName ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
                    <FileText size={28} />
                  </div>
                  <p className="text-sm font-extrabold text-gray-900">{fileName}</p>
                  <p className="text-xs font-bold text-primary-600">Klik untuk ganti file lain</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-primary-200 text-primary-500 group-hover:scale-110 flex items-center justify-center transition-transform shadow-xs">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-extrabold text-gray-900">Pilih file materi dari komputermu</p>
                  <p className="text-xs font-semibold text-gray-500">Mendukung format TXT, PDF, DOCX</p>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subject confirmation (low confidence) */}
      <AnimatePresence>
        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300"
          >
            <div className="flex items-start gap-2.5 mb-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-extrabold text-amber-900">Konfirmasi Mata Pelajaran</p>
                <p className="text-xs font-medium text-amber-700 mt-0.5">
                  AI mendeteksi kemungkinan mata pelajaran <strong>{detected?.subject}</strong> ({Math.round((detected?.confidence || 0) * 100)}% keyakinan). Silakan pilih jika ingin mengubah:
                </p>
              </div>
            </div>
            <div className="relative">
              <select
                value={chosenSubject}
                onChange={e => setChosen(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-xl border-2 border-amber-300 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:border-primary-500 appearance-none shadow-xs"
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            <button
              onClick={() => runSummary(chosenSubject)}
              className="mt-3.5 w-full py-3 rounded-xl gradient-primary text-white text-sm font-extrabold shadow-md hover:opacity-95 transition-opacity"
            >
              Konfirmasi & Rangkum Sekarang
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state with clear visuals */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-3.5 p-4 rounded-2xl bg-primary-50 border-2 border-primary-200"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Loader2 size={20} className="animate-spin" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-primary-950">
                {step === 'detecting' ? 'Mendeteksi mata pelajaran & struktur materi…' : 'AI sedang merangkum dan memperkaya materi…'}
              </p>
              <p className="text-xs font-semibold text-primary-700 mt-0.5">
                {step === 'summarizing' ? 'Menyiapkan referensi edukatif resmi & poin inti ✨' : 'Mohon tunggu sebentar…'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main CTA */}
      {step !== 'confirm' && (
        <button
          onClick={step === 'done' ? reset : handleDetect}
          disabled={isLoading || (!sourceText && !fileName)}
          className="mt-5 w-full py-3.5 rounded-2xl gradient-primary text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-all shadow-glow active:scale-98"
        >
          {isLoading ? (
            <><Loader2 size={18} className="animate-spin" /> Sedang Memproses…</>
          ) : step === 'done' ? (
            '🔄 Rangkum Materi Lain'
          ) : (
            <><Sparkles size={18} /> Mulai Rangkum Materi Ini</>
          )}
        </button>
      )}
    </div>
  );
}
