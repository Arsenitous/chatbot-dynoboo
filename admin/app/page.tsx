"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { KnowledgeBase, Workshop, Pesanan, ChatLog, PilihanJawaban, AdminUser } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "dashboard" | "knowledge" | "workshops" | "pesanan" | "chatlogs" | "access";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Dashboard: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  Brain: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></svg>,
  Workshop: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  Orders: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" x2="21" y1="6" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
  Chat: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  Lock: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>,
  Edit: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
  Save: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
  X: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>,
  Refresh: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
  Sun: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>,
  Moon: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
  Logout: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>,
  ChevDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></svg>,
  Key: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>,
  Eye: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
};

// ─── Custom Select ────────────────────────────────────────────────────────────
type SelectOption = { value: string; label: string; color?: string };
function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: SelectOption[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="custom-select-wrapper">
      <div className={`custom-select-trigger ${open ? "open" : ""}`} onClick={() => setOpen(v => !v)}>
        <span style={{ color: selected?.color }}>{selected?.label ?? value}</span>
        <span style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "var(--text-muted)" }}>
          <Icons.ChevDown />
        </span>
      </div>
      {open && (
        <div className="custom-select-dropdown">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`custom-select-option ${opt.value === value ? "selected" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.value === value && <Icons.Check />}
              {opt.value !== value && <span style={{ width: 13 }} />}
              <span style={{ color: opt.color }}>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{title}</h3>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={onClose}><Icons.X /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, bg, icon, sub }: { label: string; value: number; color: string; bg: string; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="stat-card animate-in">
      <div className="stat-icon" style={{ background: bg, boxShadow: `0 0 20px ${color}40` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color, marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, letterSpacing: "0.03em" }}>
        {label} {required && <span style={{ color: "#f472b6" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
function DashboardPage({ stats }: { stats: { knowledge: number; workshops: number; pesanan: number; chatlogs: number } }) {
  return (
    <div className="animate-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Dashboard</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Ringkasan data DynoBoo chatbot</p>
      </div>
      <div className="stat-cards-sticky">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <StatCard label="Knowledge Base" value={stats.knowledge} color="#a78bfa" bg="rgba(124,58,237,0.15)" icon={<Icons.Brain />} sub="Entri QnA aktif" />
          <StatCard label="Workshops" value={stats.workshops} color="#f472b6" bg="rgba(236,72,153,0.15)" icon={<Icons.Workshop />} sub="Event terdaftar" />
          <StatCard label="Pesanan Masuk" value={stats.pesanan} color="#22d3ee" bg="rgba(6,182,212,0.15)" icon={<Icons.Orders />} sub="Via form DM" />
          <StatCard label="Chat Logs" value={stats.chatlogs} color="#34d399" bg="rgba(16,185,129,0.15)" icon={<Icons.Chat />} sub="200 log terbaru" />
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "var(--text-primary)" }}>ℹ️ Panduan Cepat</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: "🧠", title: "Knowledge Base", desc: "Kelola QnA dan pilihan jawaban yang digunakan oleh DynoMin." },
            { icon: "📅", title: "Workshops", desc: "Tambah atau ubah event workshop yang aktif, akan otomatis dibaca oleh bot." },
            { icon: "📦", title: "Pesanan", desc: "Lihat pesanan yang masuk dari form otomatis via Instagram DM." },
            { icon: "💬", title: "Chat Logs", desc: "Monitor percakapan antara pelanggan dan DynoMin." },
            { icon: "🔐", title: "Access Control", desc: "Lihat informasi akun SuperAdmin yang sedang aktif." },
          ].map(item => (
            <div key={item.title} style={{ display: "flex", gap: 12, padding: "10px 14px", borderRadius: 8, background: "var(--bg-card-2)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{item.title}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Knowledge Base Page ──────────────────────────────────────────────────────
function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<KnowledgeBase | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const emptyForm = { keywords: "", jawaban_utama: "", keterangan: "", pilihan_jawaban_raw: "[]" };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/knowledge");
    setItems(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(emptyForm); setAdding(true); setEditing(null); };
  const openEdit = (item: KnowledgeBase) => {
    setForm({ keywords: item.keywords, jawaban_utama: item.jawaban_utama, keterangan: item.keterangan ?? "", pilihan_jawaban_raw: item.pilihan_jawaban ? JSON.stringify(item.pilihan_jawaban, null, 2) : "[]" });
    setEditing(item); setAdding(false);
  };

  let parsedPilihan: PilihanJawaban[] = [];
  try { parsedPilihan = JSON.parse(form.pilihan_jawaban_raw) || []; } catch { /* noop */ }

  const addPilihan = () => {
    const arr = [...parsedPilihan, { opsi: "", jawaban: "" }];
    setForm({ ...form, pilihan_jawaban_raw: JSON.stringify(arr, null, 2) });
  };
  const updatePilihan = (i: number, field: "opsi" | "jawaban", v: string) => {
    const arr = [...parsedPilihan]; arr[i][field] = v;
    setForm({ ...form, pilihan_jawaban_raw: JSON.stringify(arr, null, 2) });
  };
  const removePilihan = (i: number) => {
    const arr = parsedPilihan.filter((_, idx) => idx !== i);
    setForm({ ...form, pilihan_jawaban_raw: JSON.stringify(arr, null, 2) });
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      keywords: form.keywords, jawaban_utama: form.jawaban_utama,
      keterangan: form.keterangan || null,
      pilihan_jawaban: parsedPilihan.length > 0 ? parsedPilihan : null,
    };
    if (editing) await fetch(`/api/knowledge/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    else await fetch("/api/knowledge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false); setAdding(false); setEditing(null); load();
  };

  const del = async (id: number) => {
    if (!confirm("Hapus entri ini?")) return;
    await fetch(`/api/knowledge/${id}`, { method: "DELETE" }); load();
  };

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Knowledge Base</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{items.length} entri QnA terdaftar</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={load}><Icons.Refresh /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Icons.Plus /> Tambah Entri</button>
        </div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
          </div>
        ) : (
          <table className="data-table">
            <thead><tr>
              <th style={{ width: 44 }}>#</th>
              <th style={{ width: "25%" }}>Keywords</th>
              <th>Jawaban Utama</th>
              <th style={{ width: 90 }}>Pilihan</th>
              <th style={{ width: 90 }}>Aksi</th>
            </tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{item.id}</td>
                  <td>
                    <span style={{ color: "#a78bfa", fontWeight: 500, fontSize: 13 }}>{item.keywords}</span>
                    {item.keterangan && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, fontStyle: "italic" }}>{item.keterangan}</p>}
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>👤 Edited by: <span style={{ color: "var(--text-secondary)" }}>{item.edited_by ?? "superadmin"}</span></p>
                  </td>
                  <td style={{ maxWidth: 320 }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.jawaban_utama}
                    </p>
                  </td>
                  <td>
                    {item.pilihan_jawaban?.length ? <span className="badge badge-ai">{item.pilihan_jawaban.length} opsi</span> : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(item)}><Icons.Edit /></button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(item.id)}><Icons.Trash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Belum ada data knowledge base</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {(adding || !!editing) && (
        <Modal title={editing ? "Edit Knowledge Base" : "Tambah Knowledge Base"} onClose={() => { setAdding(false); setEditing(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Keywords / Topik" required><input className="input" placeholder="Mau nanya harga, harga produk..." value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} /></Field>
            <Field label="Jawaban Utama" required><textarea className="input" rows={4} placeholder="Jawaban default yang diberikan bot..." value={form.jawaban_utama} onChange={e => setForm({ ...form, jawaban_utama: e.target.value })} /></Field>
            <Field label="Keterangan (opsional)"><input className="input" placeholder="Catatan tambahan konteks..." value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} /></Field>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Pilihan Jawaban (opsional)</label>
                <button className="btn btn-secondary btn-sm" onClick={addPilihan}><Icons.Plus /> Tambah Opsi</button>
              </div>
              {parsedPilihan.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Tidak ada pilihan — bot hanya balas dengan jawaban utama.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {parsedPilihan.map((p, i) => (
                    <div key={i} style={{ padding: 12, borderRadius: 8, background: "var(--bg-card-2)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 20 }}>#{i + 1}</span>
                        <input className="input" style={{ flex: 1 }} placeholder="Label opsi (contoh: Workshop)" value={p.opsi} onChange={e => updatePilihan(i, "opsi", e.target.value)} />
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => removePilihan(i)}><Icons.Trash /></button>
                      </div>
                      <textarea className="input" rows={2} placeholder="Jawaban jika user pilih opsi ini..." value={p.jawaban} onChange={e => updatePilihan(i, "jawaban", e.target.value)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving || !form.keywords || !form.jawaban_utama}>
                <Icons.Save /> {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button className="btn btn-secondary" onClick={() => { setAdding(false); setEditing(null); }}>Batal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Workshops Page ───────────────────────────────────────────────────────────
const STATUS_OPTIONS: SelectOption[] = [
  { value: "ACTIVE", label: "🟢 ACTIVE", color: "#34d399" },
  { value: "UPCOMING", label: "🟡 UPCOMING", color: "#fbbf24" },
  { value: "CLOSED", label: "⚪ CLOSED", color: "#94a3b8" },
];
function WorkshopsPage() {
  const [items, setItems] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const emptyForm = { nama_workshop: "", tanggal: "", harga_promo: "", harga_normal: "", fasilitas: "", status: "ACTIVE" };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/workshops");
    setItems(await r.json());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(emptyForm); setAdding(true); setEditing(null); };
  const openEdit = (w: Workshop) => {
    setForm({ nama_workshop: w.nama_workshop, tanggal: w.tanggal, harga_promo: w.harga_promo ?? "", harga_normal: w.harga_normal ?? "", fasilitas: w.fasilitas ?? "", status: w.status });
    setEditing(w); setAdding(false);
  };
  const save = async () => {
    setSaving(true);
    const payload = { ...form, harga_promo: form.harga_promo || null, harga_normal: form.harga_normal || null, fasilitas: form.fasilitas || null };
    if (editing) await fetch(`/api/workshops/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    else await fetch("/api/workshops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false); setAdding(false); setEditing(null); load();
  };
  const del = async (id: number) => {
    if (!confirm("Hapus workshop ini?")) return;
    await fetch(`/api/workshops/${id}`, { method: "DELETE" }); load();
  };

  const statusBadge = (s: string) => {
    if (s === "ACTIVE") return <span className="badge badge-active">● Active</span>;
    if (s === "UPCOMING") return <span className="badge badge-upcoming">◐ Upcoming</span>;
    return <span className="badge badge-closed">○ Closed</span>;
  };

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Workshops</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{items.length} workshop terdaftar</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={load}><Icons.Refresh /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Icons.Plus /> Tambah Workshop</button>
        </div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>{[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}</div>
        ) : (
          <table className="data-table">
            <thead><tr>
              <th style={{ width: 44 }}>#</th>
              <th>Nama Workshop</th>
              <th>Tanggal</th>
              <th>Harga Promo</th>
              <th>Harga Normal</th>
              <th>Status</th>
              <th style={{ width: 90 }}>Aksi</th>
            </tr></thead>
            <tbody>
              {items.map(w => (
                <tr key={w.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{w.id}</td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {w.nama_workshop}
                    <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 400, marginTop: 4 }}>👤 Edited by: <span style={{ color: "var(--text-secondary)" }}>{w.edited_by ?? "superadmin"}</span></p>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{w.tanggal}</td>
                  <td style={{ color: "#34d399", fontWeight: 600 }}>{w.harga_promo ?? "—"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{w.harga_normal ?? "—"}</td>
                  <td>{statusBadge(w.status)}</td>
                  <td><div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(w)}><Icons.Edit /></button>
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(w.id)}><Icons.Trash /></button>
                  </div></td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>Belum ada workshop</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {(adding || !!editing) && (
        <Modal title={editing ? "Edit Workshop" : "Tambah Workshop"} onClose={() => { setAdding(false); setEditing(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Nama Workshop" required><input className="input" placeholder="Penguin Beading Workshop" value={form.nama_workshop} onChange={e => setForm({ ...form, nama_workshop: e.target.value })} /></Field>
            <Field label="Tanggal" required><input className="input" placeholder="Minggu, 5 Juli 2026 (Pukul 10:00 WIB)" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Harga Promo"><input className="input" placeholder="Rp60.000" value={form.harga_promo} onChange={e => setForm({ ...form, harga_promo: e.target.value })} /></Field>
              <Field label="Harga Normal"><input className="input" placeholder="Rp65.000" value={form.harga_normal} onChange={e => setForm({ ...form, harga_normal: e.target.value })} /></Field>
            </div>
            <Field label="Fasilitas"><textarea className="input" rows={2} placeholder="Bahan dan alat, tutor, konsumsi, e-certificate..." value={form.fasilitas} onChange={e => setForm({ ...form, fasilitas: e.target.value })} /></Field>
            <Field label="Status">
              <CustomSelect value={form.status} onChange={v => setForm({ ...form, status: v })} options={STATUS_OPTIONS} />
            </Field>
            <div style={{ display: "flex", gap: 8, paddingTop: 6 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving || !form.nama_workshop || !form.tanggal}>
                <Icons.Save /> {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button className="btn btn-secondary" onClick={() => { setAdding(false); setEditing(null); }}>Batal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Pesanan Page ─────────────────────────────────────────────────────────────
function PesananPage() {
  const [items, setItems] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); const r = await fetch("/api/pesanan"); setItems(await r.json()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const fmt = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Pesanan</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{items.length} pesanan masuk via Instagram DM</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}><Icons.Refresh /> Refresh</button>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}</div>
        ) : (
          <table className="data-table">
            <thead><tr>
              <th style={{ width: 44 }}>#</th>
              <th>Nama</th>
              <th>Produk/Workshop</th>
              <th>No. HP</th>
              <th>Alamat</th>
              <th>Waktu</th>
            </tr></thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{p.id}</td>
                  <td>
                    <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.nama}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 2 }}>{p.sender_id}</p>
                  </td>
                  <td><span className="badge badge-form">{p.produk}</span></td>
                  <td style={{ color: "#22d3ee", fontFamily: "monospace", fontSize: 12 }}>{p.no_hp}</td>
                  <td style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 180 }}>{p.alamat}</td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmt(p.created_at)}</td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>📭 Belum ada pesanan masuk</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Chat Logs Page ───────────────────────────────────────────────────────────
function ChatLogsPage() {
  const [items, setItems] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const load = useCallback(async () => { setLoading(true); const r = await fetch("/api/chat-logs"); setItems(await r.json()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const fmt = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const filtered = items.filter(i => !search || i.user_message.toLowerCase().includes(search.toLowerCase()) || i.sender_id.includes(search));

  const intentBadge = (intent: string) => {
    if (intent === "AI_GEMINI") return <span className="badge badge-ai">🤖 AI</span>;
    if (intent === "FORM_REGISTRATION") return <span className="badge badge-form">📋 Form</span>;
    return <span className="badge badge-start">🚀 Start</span>;
  };

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Chat Logs</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{filtered.length} dari {items.length} log (200 terbaru)</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}><Icons.Refresh /> Refresh</button>
      </div>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}><Icons.Search /></span>
        <input className="input" style={{ paddingLeft: 36 }} placeholder="Cari pesan atau sender ID..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(item => (
            <div key={item.id} className="card animate-in" style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {intentBadge(item.intent)}
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{item.sender_id}</span>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmt(item.created_at)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>User</p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.user_message}</p>
                </div>
                <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 12 }}>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>DynoMin</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.bot_response}</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: 64, color: "var(--text-muted)" }}>💬 Tidak ada log ditemukan</div>}
        </div>
      )}
    </div>
  );
}

// ─── Access Control Page ──────────────────────────────────────────────────────
const ROLE_OPTIONS: SelectOption[] = [
  { value: "superadmin", label: "👑 SuperAdmin", color: "#a78bfa" },
  { value: "admin", label: "🛡️ Admin", color: "#22d3ee" },
];

function AccessPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { username: "", password: "", role: "admin" };
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-users");
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openAdd = () => {
    setForm(emptyForm);
    setError("");
    setAdding(true);
    setEditing(null);
  };

  const openEdit = (u: AdminUser) => {
    setForm({ username: u.username, password: "", role: u.role });
    setError("");
    setEditing(u);
    setAdding(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editing) {
        const res = await fetch(`/api/admin-users/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: form.role, password: form.password || undefined }),
        });
        if (res.ok) {
          setEditing(null);
          loadUsers();
        } else {
          const err = await res.json();
          setError(err.error || "Gagal mengubah user");
        }
      } else {
        const res = await fetch("/api/admin-users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setAdding(false);
          loadUsers();
        } else {
          const err = await res.json();
          setError(err.error || "Gagal membuat user");
        }
      }
    } catch (e) {
      setError("Terjadi kesalahan koneksi");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus user ini?")) return;
    try {
      const res = await fetch(`/api/admin-users/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus user");
      }
    } catch (e) {
      alert("Terjadi kesalahan koneksi");
    }
  };

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Access Control</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Kelola akun yang memiliki akses ke Admin Panel</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={loadUsers}><Icons.Refresh /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Icons.Plus /> Tambah User</button>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Username</th>
                <th>Role</th>
                <th>Dibuat Pada</th>
                <th style={{ width: 90 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{u.id}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.username}</span>
                  </td>
                  <td>
                    {u.role === "superadmin" ? (
                      <span className="badge badge-active" style={{ background: "rgba(124,58,237,0.12)", color: "#a78bfa", borderColor: "rgba(124,58,237,0.25)" }}>👑 SuperAdmin</span>
                    ) : (
                      <span className="badge badge-form">🛡️ Admin</span>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(u)}><Icons.Edit /></button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(u.id)}><Icons.Trash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
                    Belum ada user di database Supabase. Silakan kunjungi /api/setup sekali untuk inisialisasi SuperAdmin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {(adding || !!editing) && (
        <Modal title={editing ? `Edit User: ${editing.username}` : "Tambah User Baru"} onClose={() => { setAdding(false); setEditing(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!editing && (
              <Field label="Username" required>
                <input
                  className="input"
                  placeholder="Masukkan username..."
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                />
              </Field>
            )}

            <Field label={editing ? "Password Baru (kosongkan jika tidak diubah)" : "Password"} required={!editing}>
              <input
                type="password"
                className="input"
                placeholder={editing ? "••••••••" : "Masukkan password..."}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </Field>

            <Field label="Role" required>
              <CustomSelect
                value={form.role}
                onChange={v => setForm({ ...form, role: v })}
                options={ROLE_OPTIONS}
              />
            </Field>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg" style={{ padding: "8px 12px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleSave}
                disabled={saving || (!editing && (!form.username || !form.password))}
              >
                <Icons.Save /> {saving ? "Saving..." : "Simpan"}
              </button>
              <button className="btn btn-secondary" onClick={() => { setAdding(false); setEditing(null); }}>Batal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [page, setPage] = useState<Page>("dashboard");
  const [dark, setDark] = useState(true);
  const [stats, setStats] = useState({ knowledge: 0, workshops: 0, pesanan: 0, chatlogs: 0 });

  useEffect(() => {
    document.documentElement.classList.toggle("light", !dark);
  }, [dark]);

  useEffect(() => {
    Promise.all([
      fetch("/api/knowledge").then(r => r.json()),
      fetch("/api/workshops").then(r => r.json()),
      fetch("/api/pesanan").then(r => r.json()),
      fetch("/api/chat-logs").then(r => r.json()),
    ]).then(([kb, ws, ps, cl]) => {
      setStats({ knowledge: kb.length, workshops: ws.length, pesanan: ps.length, chatlogs: cl.length });
    }).catch(() => { });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  };

  const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode; section?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: <Icons.Dashboard />, section: "MENU" },
    { id: "knowledge", label: "Knowledge Base", icon: <Icons.Brain />, section: "" },
    { id: "workshops", label: "Workshops", icon: <Icons.Workshop />, section: "" },
    { id: "pesanan", label: "Pesanan", icon: <Icons.Orders />, section: "" },
    { id: "chatlogs", label: "Chat Logs", icon: <Icons.Chat />, section: "ADMIN" },
    { id: "access", label: "Access Control", icon: <Icons.Lock />, section: "" },
  ];

  const PAGE_TITLES: Record<Page, string> = {
    dashboard: "Dashboard", knowledge: "Knowledge Base", workshops: "Workshops",
    pesanan: "Pesanan", chatlogs: "Chat Logs", access: "Access Control",
  };

  return (
    <div className="admin-layout">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "white", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              <img src="/Logo_DynoBoo.png" alt="DynoBoo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", lineHeight: 1.2 }}>DynoBoo</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item, idx) => (
            <div key={item.id}>
              {item.section !== undefined && item.section !== "" && (
                <p className="nav-section-label">{item.section}</p>
              )}
              {item.section === "" && idx > 0 && NAV_ITEMS[idx - 1].section === "" && null}
              <div
                id={`nav-${item.id}`}
                className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => setPage(item.id)}
              >
                {item.icon}
                {item.label}
                {item.id === "pesanan" && stats.pesanan > 0 && (
                  <span style={{ marginLeft: "auto", background: "rgba(6,182,212,0.2)", color: "#22d3ee", borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>
                    {stats.pesanan}
                  </span>
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, marginBottom: 6 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 12 }}>👑</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>SuperAdmin</p>
              <p style={{ fontSize: 10, color: "var(--text-muted)" }}>Full Access</p>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={handleLogout}
          >
            <Icons.Logout /> Keluar
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <h1 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
            {PAGE_TITLES[page]}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Connection status */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} className="pulse-ring" />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Supabase</span>
            </div>
            {/* Dark/Light toggle */}
            <button
              id="theme-toggle"
              className="theme-btn"
              onClick={() => setDark(v => !v)}
              title={dark ? "Light Mode" : "Dark Mode"}
            >
              {dark ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="page-content">
          {page === "dashboard" && <DashboardPage stats={stats} />}
          {page === "knowledge" && <KnowledgePage />}
          {page === "workshops" && <WorkshopsPage />}
          {page === "pesanan" && <PesananPage />}
          {page === "chatlogs" && <ChatLogsPage />}
          {page === "access" && <AccessPage />}
        </main>
      </div>
    </div>
  );
}
