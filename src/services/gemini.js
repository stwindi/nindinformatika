import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ---- TASK BREAKDOWN ----
export async function breakdownTask(naturalLanguageInput) {
  const prompt = `
Kamu adalah asisten AI untuk aplikasi belajar remaja Indonesia.
User menginput deskripsi tugas dalam bahasa alami. Pecah menjadi subtask dan estimasi waktu.

Input user: "${naturalLanguageInput}"

Balas HANYA dengan JSON valid seperti ini (tanpa markdown, tanpa teks lain):
{
  "title": "judul singkat tugas",
  "subject": "Mata Pelajaran (contoh: Biologi, Matematika, Bahasa Indonesia)",
  "estimatedDeadlineDays": 7,
  "priority": "high|medium|low",
  "subtasks": [
    { "title": "langkah 1", "estimatedMinutes": 30 },
    { "title": "langkah 2", "estimatedMinutes": 45 }
  ]
}
`.trim();

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
}

// ---- FLASHCARD GENERATOR ----
export async function generateFlashcards(materialText, maxCards = 10) {
  const prompt = `
Kamu adalah asisten AI untuk belajar remaja Indonesia.
Dari materi berikut, buat ${maxCards} flashcard pertanyaan-jawaban yang padat dan efektif untuk active recall.
Jawaban harus singkat dan mudah dipahami remaja SMA.

Materi:
"${materialText}"

Balas HANYA dengan JSON array valid (tanpa markdown, tanpa teks lain):
[
  { "front": "pertanyaan atau konsep", "back": "jawaban singkat" },
  ...
]
`.trim();

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
}

// ---- CHAT COMPANION ----
export function createChatSession() {
  const systemInstruction = `
Kamu adalah StudyBuddy, teman belajar AI yang ramah dan suportif untuk remaja SMP/SMA Indonesia.
Karakter kamu:
- Bahasa santai, friendly, cocok untuk remaja. Gunakan bahasa Indonesia yang kasual tapi sopan.
- Suportif, memotivasi, tidak menggurui, tidak menghakimi.
- Bisa bantu: jawab pertanyaan materi pelajaran, breakdown tugas, generate flashcard, kasih motivasi.
- Kalau user minta breakdown tugas, jawab dulu lalu tambahkan [ACTION:BREAKDOWN_TASK] di akhir response.
- Kalau user minta generate flashcard dari materi, jawab dulu lalu tambahkan [ACTION:GENERATE_FLASHCARD] di akhir response.
- Jaga respons tetap ringkas, maksimal 3-4 paragraf kecuali diminta detail.
- Sesekali pakai emoji yang relevan supaya lebih hidup 😊📚✨
`.trim();

  const chat = model.startChat({
    history: [],
    systemInstruction,
  });
  return chat;
}

export async function sendChatMessage(chat, message) {
  const result = await chat.sendMessage(message);
  return result.response.text();
}
