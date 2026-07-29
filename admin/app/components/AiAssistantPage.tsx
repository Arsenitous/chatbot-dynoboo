"use client";
import { useState, useRef, useEffect } from "react";
import { Icons } from "./ui";

type Message = { role: "user" | "assistant"; content: string };

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Halo! Saya asisten pribadi DynoBoo 🦖✨\n\nSaya siap membantu kamu dengan:\n• Pengelolaan produk & stok\n• Pembuatan invoice & laporan\n• Strategi marketing & caption IG\n• Pertanyaan seputar bisnis\n\nAda yang bisa saya bantu hari ini?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${data.error || "Gagal mendapatkan balasan dari AI. Coba periksa GEMINI_API_KEY."}` }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Maaf, terjadi kesalahan koneksi server. Coba lagi ya! 🙏" }]);
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const QUICK_PROMPTS = [
    "Buatkan caption Instagram untuk promosi workshop terbaru",
    "Tips cara mengelola stok produk rajut yang efisien",
    "Template pesan WhatsApp follow-up invoice yang belum dibayar",
    "Ide konten untuk meningkatkan penjualan bouquet rajut",
  ];

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: "linear-gradient(135deg,#0ea5e9,#06b6d4)", borderRadius: 8, padding: "4px 8px", fontSize: 16 }}>🦖</span>
          AI Assistant DynoBoo
          <span className="badge badge-ai" style={{ fontSize: 10 }}>Powered by Gemini</span>
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Asisten pribadi yang memahami konteks bisnis DynoBoo</p>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 16 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#0ea5e9,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8, fontSize: 14, alignSelf: "flex-end" }}>🦖</div>
            )}
            <div style={{
              maxWidth: "72%",
              padding: "10px 14px",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
              background: msg.role === "user" ? "linear-gradient(135deg,#0284c7,#06b6d4)" : "var(--bg-card)",
              color: msg.role === "user" ? "white" : "var(--text-primary)",
              border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
              fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap",
              boxShadow: msg.role === "user" ? "0 4px 16px rgba(14,165,233,0.3)" : "var(--shadow-card)",
            }}>
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8, fontSize: 14, alignSelf: "flex-end" }}>👤</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#0ea5e9,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
            <div style={{ padding: "10px 16px", borderRadius: "4px 16px 16px 16px", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8", animation: `bounce 1.2s ${i*0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, flexShrink: 0 }}>
          {QUICK_PROMPTS.map((p, i) => (
            <button key={i} className="btn btn-secondary btn-sm" style={{ fontSize: 12 }} onClick={() => { setInput(p); inputRef.current?.focus(); }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={{ flexShrink: 0, display: "flex", gap: 10, background: "var(--bg-card)", border: "1px solid var(--border-2)", borderRadius: 12, padding: "8px 12px" }}>
        <textarea
          ref={inputRef}
          className="input"
          style={{ flex: 1, border: "none", background: "transparent", resize: "none", fontSize: 14, padding: "4px 0", minHeight: 40, maxHeight: 120 }}
          placeholder="Ketik pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button className="btn btn-primary btn-sm btn-icon" style={{ alignSelf: "flex-end", padding: "8px 12px" }} onClick={send} disabled={loading || !input.trim()}>
          <Icons.Send />
        </button>
      </div>
      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "center", flexShrink: 0 }}>AI dapat membuat kesalahan. Selalu verifikasi informasi penting.</p>

      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}
