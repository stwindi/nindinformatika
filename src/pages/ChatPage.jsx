import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, BookOpen, CheckSquare, Smile } from 'lucide-react';
import { createChatSession, sendChatMessage } from '../services/gemini';
import useAuthStore from '../stores/authStore';
import useTaskStore from '../stores/taskStore';
import useFlashcardStore from '../stores/flashcardStore';
import { breakdownTask } from '../services/gemini';
import { generateFlashcards } from '../services/gemini';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  { label: '🎯 Breakdown tugas', text: 'Tolong bantu aku breakdown tugas ini: ' },
  { label: '🃏 Buat flashcard', text: 'Tolong buatkan flashcard dari materi ini: ' },
  { label: '💪 Motivasi dong', text: 'Aku lagi males belajar, kasih motivasi dong!' },
  { label: '📚 Tanya materi', text: 'Aku mau tanya tentang materi ' },
];

export default function ChatPage() {
  const { user, profile, updateStreak } = useAuthStore();
  const { addTask } = useTaskStore();
  const { decks, createDeck, addCards, fetchDecks } = useFlashcardStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const [searchParams] = useSearchParams();

  // Init chat session
  useEffect(() => {
    const session = createChatSession();
    setChatSession(session);
    updateStreak();
    if (user?.uid) fetchDecks(user.uid);

    // Welcome message
    const welcomeMsg = {
      role: 'assistant',
      content: `Heyy ${profile?.name?.split(' ')[0] || 'kamu'}! 👋 Aku Clova, teman belajar AI-mu.\n\nAku bisa bantu kamu:\n• 📋 Breakdown tugas jadi langkah kecil\n• 🃏 Generate flashcard dari materi\n• 💡 Jawab pertanyaan seputar pelajaran\n• 💪 Kasih semangat saat kamu capek\n\nMau mulai dari mana? 😊`,
      id: 'welcome',
    };
    setMessages([welcomeMsg]);

    // Auto-fill from ?q= param (from "Ask AI" button on summary)
    const qParam = new URLSearchParams(window.location.search).get('q');
    if (qParam) {
      setInput(decodeURIComponent(qParam));
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || sending) return;

    const userMsg = { role: 'user', content: messageText, id: Date.now().toString() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setSending(true);

    try {
      const response = await sendChatMessage(chatSession, messageText);

      // Check for action triggers
      const hasBreakdown = response.includes('[ACTION:BREAKDOWN_TASK]');
      const hasFlashcard = response.includes('[ACTION:GENERATE_FLASHCARD]');
      const cleanResponse = response
        .replace('[ACTION:BREAKDOWN_TASK]', '')
        .replace('[ACTION:GENERATE_FLASHCARD]', '')
        .trim();

      const aiMsg = {
        role: 'assistant',
        content: cleanResponse,
        id: Date.now().toString() + '_ai',
      };
      setMessages(m => [...m, aiMsg]);

      // Handle breakdown action
      if (hasBreakdown) {
        setTimeout(async () => {
          try {
            const result = await breakdownTask(messageText);
            const deadlineDate = new Date();
            deadlineDate.setDate(deadlineDate.getDate() + (result.estimatedDeadlineDays || 7));
            await addTask(user.uid, { ...result, deadline: deadlineDate });
            setMessages(m => [...m, {
              role: 'assistant',
              content: `✅ Aku sudah otomatis menambahkan tugas **"${result.title}"** ke Task Manager kamu dengan ${result.subtasks?.length || 0} subtask! Cek di halaman Tugas ya 📋`,
              id: Date.now().toString() + '_action',
              type: 'success',
            }]);
          } catch (err) {
            console.error('Auto breakdown failed:', err);
          }
        }, 500);
      }

      // Handle flashcard action
      if (hasFlashcard) {
        setTimeout(async () => {
          try {
            const cards = await generateFlashcards(messageText, 6);
            // Find or create a default deck
            let deckId;
            const existingDeck = decks.find(d => d.name === 'Dari Chat AI');
            if (existingDeck) {
              deckId = existingDeck.id;
            } else {
              deckId = await createDeck(user.uid, {
                name: 'Dari Chat AI',
                subject: 'Umum',
                color: '#7c3aed',
                icon: '🍀',
              });
            }
            await addCards(user.uid, deckId, cards);
            setMessages(m => [...m, {
              role: 'assistant',
              content: `🃏 Mantap! Aku sudah generate **${cards.length} flashcard** dan disimpan ke deck **"Dari Chat AI"**. Cek di halaman Flashcard untuk mulai review ya!`,
              id: Date.now().toString() + '_fc',
              type: 'success',
            }]);
          } catch (err) {
            console.error('Auto flashcard failed:', err);
          }
        }, 500);
      }

    } catch (err) {
      toast.error('Koneksi ke AI gagal. Coba lagi!');
      setMessages(m => [...m, {
        role: 'assistant',
        content: 'Aduh, aku lagi gangguan koneksi nih 😅 Coba kirim ulang pesannya ya!',
        id: Date.now().toString() + '_err',
      }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Render message content with basic markdown (bold)
  const renderContent = (content) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-glow border border-emerald-200 bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <img src="/bot-avatar.png" alt="Clova Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>Clova</h1>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-gray-500">Online · Siap membantu belajar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-end gap-2 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm flex-shrink-0 mb-1 border border-emerald-200 bg-white">
                    <img src="/bot-avatar.png" alt="Clova" className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'chat-bubble-user'
                      : msg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl rounded-bl-sm'
                        : 'chat-bubble-ai'
                  }`}
                >
                  {renderContent(msg.content)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {sending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm flex-shrink-0 mb-1 border border-emerald-200 bg-white">
                <img src="/bot-avatar.png" alt="Clova" className="w-full h-full object-cover" />
              </div>
              <div className="chat-bubble-ai px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick prompts */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                onClick={() => setInput(qp.text)}
                className="flex-shrink-0 px-3 py-1.5 bg-white border-2 border-gray-100 text-gray-600 text-xs font-medium rounded-xl hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesanmu... (Shift+Enter untuk baris baru)"
              className="w-full px-4 py-3 pr-4 rounded-2xl border-2 border-gray-200 text-sm resize-none focus:border-primary-400 focus:outline-none transition-colors max-h-32"
              rows={1}
              style={{ resize: 'none' }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
            className="w-12 h-12 gradient-primary text-white rounded-2xl flex items-center justify-center shadow-glow hover:opacity-90 disabled:opacity-40 transition-all flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="max-w-2xl mx-auto text-xs text-gray-400 mt-2 text-center">
          Clova bisa salah. Selalu verifikasi informasi penting ya! 🙏
        </p>
      </div>
    </div>
  );
}
