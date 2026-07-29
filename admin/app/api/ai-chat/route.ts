import { NextRequest } from "next/server";

const MODELS_TO_TRY = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-pro",
];

const SYSTEM_PROMPT = `Kamu adalah asisten pribadi admin DynoBoo, sebuah toko kerajinan tangan yang menjual produk rajut, boneka crochet, aksesori manik-manik, dan menyelenggarakan workshop.

Tugas kamu:
- Membantu admin dalam pengelolaan toko (produk, invoice, workshop, pesanan)
- Menjawab pertanyaan seputar bisnis DynoBoo
- Memberikan saran pemasaran dan pengelolaan stok
- Membantu membuat teks promosi, caption Instagram, atau pesan WhatsApp
- Menjelaskan cara penggunaan fitur admin panel

Selalu jawab dalam Bahasa Indonesia yang ramah dan profesional. Jika ada pertanyaan di luar konteks toko/bisnis, tetap bantu dengan sopan.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY belum diisi di .env.local" }, { status: 400 });
    }

    // Filter and map messages for Gemini format
    const contents = (messages || [])
      .filter((m: { role: string; content: string }) => m.content && m.content.trim() !== "")
      .map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // Ensure conversation starts with user turn
    if (contents.length > 0 && contents[0].role === "model") {
      contents.shift();
    }

    const payload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: contents.length > 0 ? contents : [{ role: "user", parts: [{ text: "Halo" }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    };

    let lastError = "";

    // Try models in fallback order
    for (const modelName of MODELS_TO_TRY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        const parts = result?.candidates?.[0]?.content?.parts || [];
        const text = parts.map((p: any) => p.text).join("");
        if (text) {
          return Response.json({ reply: text, model: modelName });
        }
      }

      lastError = result?.error?.message || `Error ${res.status}`;
      // If error is 404 / model not found, loop continues to next model
    }

    return Response.json({ error: lastError || "Gagal menghubungi model Gemini." }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    return Response.json({ error: error.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
