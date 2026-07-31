"use client";
import { useState, useCallback, useEffect } from "react";
import { Icons, Modal, Field } from "./ui";

type ItemTypeRow = { id: number; nama: string; icon: string; deskripsi: string | null };

const DEFAULT_TYPES = [
  { nama: "Workshop", icon: "🎨", deskripsi: "Kegiatan workshop DIY & kerajinan" },
  { nama: "Kerajinan Tangan", icon: "✂️", deskripsi: "Produk handmade & kerajinan tangan" },
];

export default function TipeItemPage() {
  const [types, setTypes] = useState<ItemTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ItemTypeRow | null>(null);
  const [form, setForm] = useState({ nama: "", icon: "📦", deskripsi: "" });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/item-types");
    if (r.ok) setTypes(await r.json());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ nama: "", icon: "📦", deskripsi: "" }); setAdding(true); setEditing(null); };
  const openEdit = (t: ItemTypeRow) => { setForm({ nama: t.nama, icon: t.icon, deskripsi: t.deskripsi ?? "" }); setEditing(t); setAdding(false); };

  const save = async () => {
    if (!form.nama.trim()) return;
    setSaving(true);
    const payload = { nama: form.nama.trim(), icon: form.icon.trim() || "📦", deskripsi: form.deskripsi.trim() || null };
    if (editing) {
      const r = await fetch(`/api/item-types/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (r.ok) { showToast(`Tipe "${form.nama}" berhasil diupdate!`); }
      else { const d = await r.json(); showToast(d.error ?? "Gagal update", "err"); }
    } else {
      const r = await fetch("/api/item-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (r.ok) { showToast(`Tipe "${form.nama}" berhasil ditambahkan!`); }
      else { const d = await r.json(); showToast(d.error ?? "Gagal tambah", "err"); }
    }
    setSaving(false); setAdding(false); setEditing(null); load();
  };

  const del = async (id: number, nama: string) => {
    if (!confirm(`Hapus tipe "${nama}"? Produk yang menggunakan tipe ini akan kehilangan keterangan tipe.`)) return;
    const r = await fetch(`/api/item-types/${id}`, { method: "DELETE" });
    if (r.ok) { showToast(`Tipe "${nama}" dihapus.`); load(); }
    else { const d = await r.json(); showToast(d.error ?? "Gagal hapus", "err"); }
  };

  // Seed default types
  const seedDefaults = async () => {
    setSeeding(true);
    let count = 0;
    for (const t of DEFAULT_TYPES) {
      const exists = types.some(x => x.nama.toLowerCase() === t.nama.toLowerCase());
      if (!exists) {
        const r = await fetch("/api/item-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) });
        if (r.ok) count++;
      }
    }
    setSeeding(false);
    if (count > 0) { showToast(`${count} tipe default berhasil ditambahkan!`); load(); }
    else showToast("Tipe default sudah ada semua.", "ok");
  };

  const ICON_OPTIONS = ["📦","🎨","✂️","🧶","🪡","🖼️","🎁","🌸","🧸","🪀","🎪","🛍️","💐","🎀","🏺","🪆","🎭"];

  return (
    <div className="animate-in">
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: toast.type === "ok" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
          border: `1px solid ${toast.type === "ok" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
          color: toast.type === "ok" ? "#34d399" : "#f87171",
          backdropFilter: "blur(8px)",
        }}>
          {toast.type === "ok" ? "✓ " : "⚠ "}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Tipe Item Produk</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Kategori produk yang bisa dipilih saat menambah katalog
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {types.length === 0 && (
            <button className="btn btn-secondary btn-sm" onClick={seedDefaults} disabled={seeding}>
              {seeding ? "Menambahkan..." : "⚡ Tambah Default"}
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={load}><Icons.Refresh /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Icons.Plus /> Tambah Tipe</button>
        </div>
      </div>

      {/* Empty state with seed CTA */}
      {!loading && types.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 24px", borderRadius: 16, background: "var(--bg-card)", border: "1px dashed var(--border-2)", marginBottom: 20 }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📂</p>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Belum ada tipe item</p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Tambahkan tipe default (Workshop &amp; Kerajinan Tangan) atau buat tipe kustom sendiri.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={seedDefaults} disabled={seeding}>
              ⚡ {seeding ? "Menambahkan..." : "Tambah Default (Workshop + Kerajinan Tangan)"}
            </button>
            <button className="btn btn-secondary" onClick={openAdd}><Icons.Plus /> Tambah Kustom</button>
          </div>
        </div>
      )}

      {/* Table */}
      {(loading || types.length > 0) && (
        <div className="card" style={{ overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}
            </div>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th style={{ width: 60 }}>Icon</th>
                <th>Nama Tipe</th>
                <th>Deskripsi</th>
                <th style={{ width: 100 }}>Aksi</th>
              </tr></thead>
              <tbody>
                {types.map(t => (
                  <tr key={t.id}>
                    <td style={{ textAlign: "center", fontSize: 22 }}>{t.icon}</td>
                    <td style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{t.nama}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{t.deskripsi ?? "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(t)}><Icons.Edit /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(t.id, t.nama)}><Icons.Trash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal */}
      {(adding || !!editing) && (
        <Modal title={editing ? `Edit: ${editing.nama}` : "Tambah Tipe Item"} onClose={() => { setAdding(false); setEditing(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Nama Tipe" required>
              <input className="input" placeholder="Workshop, Kerajinan Tangan, Bouquet..." value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} autoFocus />
            </Field>

            <Field label="Icon">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                {ICON_OPTIONS.map(ico => (
                  <button key={ico} onClick={() => setForm(f => ({ ...f, icon: ico }))}
                    style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${form.icon === ico ? "#38bdf8" : "var(--border)"}`, background: form.icon === ico ? "rgba(56,189,248,0.12)" : "var(--bg-card-2)", fontSize: 18, cursor: "pointer", transition: "all 0.15s" }}>
                    {ico}
                  </button>
                ))}
              </div>
              <input className="input" placeholder="Atau ketik emoji kustom..." value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} style={{ fontSize: 18 }} />
            </Field>

            <Field label="Deskripsi">
              <input className="input" placeholder="Deskripsi singkat tipe ini..." value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} />
            </Field>

            {/* Preview */}
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--bg-card-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>{form.icon || "📦"}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{form.nama || "Nama Tipe"}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{form.deskripsi || "—"}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving || !form.nama.trim()}>
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
