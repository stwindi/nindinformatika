import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Log key prefix for debug (safe - only shows first 10 chars)
console.log('[Gemini] API key prefix:', API_KEY?.slice(0, 10));

const genAI = new GoogleGenerativeAI(API_KEY);

function getModel() {
  return genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
}

// ---- TASK BREAKDOWN WITH DOCUMENT ----
// docData: { type: 'pdf'|'image'|'text', base64?: string, mimeType?: string, text?: string }
export async function breakdownTaskWithDocument(userDescription, docData) {
  const promptText = `
Kamu adalah asisten AI untuk aplikasi belajar remaja Indonesia.
Analisis dokumen/materi yang diberikan user, lalu buat breakdown tugas yang sangat detail dan spesifik berdasarkan ISI DOKUMEN tersebut.

Deskripsi tugas dari user: "${userDescription || 'Tidak ada deskripsi tambahan'}"

Instruksi:
- Baca seluruh isi dokumen dengan teliti
- Buat subtask yang spesifik berdasarkan konten dokumen (bukan generik)
- Estimasi waktu yang realistis untuk remaja SMA
- Identifikasi mata pelajaran dari isi dokumen

Balas HANYA dengan JSON valid (tanpa markdown, tanpa teks lain):
{
  "title": "judul singkat tugas berdasarkan dokumen",
  "subject": "Mata Pelajaran yang teridentifikasi",
  "estimatedDeadlineDays": 7,
  "priority": "high|medium|low",
  "summary": "ringkasan singkat isi dokumen dalam 1-2 kalimat",
  "subtasks": [
    { "title": "langkah spesifik berdasarkan isi dokumen", "estimatedMinutes": 30 },
    { "title": "langkah 2", "estimatedMinutes": 45 }
  ]
}
`.trim();

  try {
    const m = getModel();
    let result;

    if (docData.type === 'pdf' || docData.type === 'image') {
      // Send PDF/image directly to Gemini (native multimodal)
      result = await m.generateContent([
        { inlineData: { data: docData.base64, mimeType: docData.mimeType } },
        promptText,
      ]);
    } else {
      // Text-based (DOCX extracted text, TXT)
      result = await m.generateContent(
        `${promptText}\n\nISI DOKUMEN:\n${docData.text}`
      );
    }

    const text = result.response.text().trim();
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('[Gemini] breakdownTaskWithDocument error:', err);
    throw err;
  }
}



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

  try {
    const m = getModel();
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('[Gemini] breakdownTask error:', err);
    throw err;
  }
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
  { "front": "pertanyaan atau konsep", "back": "jawaban singkat" }
]
`.trim();

  try {
    const m = getModel();
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('[Gemini] generateFlashcards error:', err);
    throw err;
  }
}

// ---- AI VISUAL FLASHCARD ----
export async function generateVisualFlashcard(topic) {
  const prompt = `
Kamu adalah asisten AI untuk aplikasi belajar remaja Indonesia.
Buat satu visual flashcard menarik untuk topik: "${topic}"

Balas HANYA dengan JSON valid (tanpa markdown):
{
  "front": "konsep/pertanyaan singkat (maks 8 kata)",
  "back": "penjelasan singkat dan mudah dipahami (maks 30 kata)",
  "emoji": "satu emoji yang paling relevan dengan topik",
  "gradient": "CSS linear-gradient string yang menarik, contoh: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
}

Pilih warna gradient yang cerah, menarik, dan sesuai tema topiknya.
`.trim();

  try {
    const m = getModel();
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('[Gemini] generateVisualFlashcard error:', err);
    throw err;
  }
}


// ---- CHAT COMPANION ----
// systemInstruction disertakan sebagai pesan pertama supaya kompatibel dengan semua versi API
const SYSTEM_PROMPT = `Kamu adalah StudyBuddy, teman belajar AI yang ramah dan suportif untuk remaja SMP/SMA Indonesia.
Karakter kamu:
- Bahasa santai, friendly, cocok untuk remaja. Gunakan bahasa Indonesia yang kasual tapi sopan.
- Suportif, memotivasi, tidak menggurui, tidak menghakimi.
- Bisa bantu: jawab pertanyaan materi pelajaran, breakdown tugas, generate flashcard, kasih motivasi.
- Kalau user minta breakdown tugas, jawab dulu lalu tambahkan [ACTION:BREAKDOWN_TASK] di akhir response.
- Kalau user minta generate flashcard dari materi, jawab dulu lalu tambahkan [ACTION:GENERATE_FLASHCARD] di akhir response.
- Jaga respons tetap ringkas, maksimal 3-4 paragraf kecuali diminta detail.
- Sesekali pakai emoji yang relevan supaya lebih hidup 😊📚✨`;

export function createChatSession() {
  const m = getModel();
  // Gunakan history dengan system prompt sebagai model message pertama
  // supaya kompatibel dengan semua tipe API key
  const chat = m.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: 'Halo, siapa kamu dan apa yang bisa kamu bantu?' }],
      },
      {
        role: 'model',
        parts: [{ text: `${SYSTEM_PROMPT}\n\nHey! Aku StudyBuddy 👋 Teman belajar AI-mu! Aku bisa bantu breakdown tugas, bikin flashcard, jawab soal pelajaran, atau sekedar kasih semangat. Mau mulai dari mana? 😊` }],
      },
    ],
  });
  return chat;
}

export async function sendChatMessage(chat, message) {
  try {
    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (err) {
    console.error('[Gemini] sendChatMessage error:', err.message, err);
    throw err;
  }
}
