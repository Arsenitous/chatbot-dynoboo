"use client";
import { useState, useCallback, useEffect } from "react";
import { Icons, Modal, Field, fmtRp } from "./ui";

type StockRow = {
  id: number;
  item_id: number;
  qty_available: number;
  qty_sold: number;
  qty_reserved: number;
  updated_at: string;
  item: { id: number; nama: string; satuan: string; harga_normal: number; harga_promo: number | null; is_active: boolean; item_type: { nama: string; icon: string } | null };
};

type EditMode = "set" | "add" | "subtract";

export default function StokPage() {
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StockRow | null>(null);
  const [qty, setQty] = useState("");
  const [editMode, setEditMode] = useState<EditMode>("set");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/stocks");
    if (r.ok) setStocks(await r.json());
    else showToast("Gagal memuat data stok", "err");
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openEdit = (s: StockRow) => {
    setEditing(s);
    setQty("0");
    setEditMode("add");
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const body = editMode === "set"
      ? { qty_available: Number(qty) }
      : { mode: "adjust", adjust_by: editMode === "add" ? Number(qty) : -Number(qty) };

    const r = await fetch(`/api/stocks/${editing.item_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      showToast(`Stok ${editing.item?.nama} berhasil diupdate!`);
      setEditing(null);
      load();
    } else {
      const d = await r.json();
      showToast(d.error ?? "Gagal update stok", "err");
    }
    setSaving(false);
  };

  const resetStok = async (item_id: number, nama: string) => {
    if (!confirm(`Reset stok "${nama}" ke 0? Tindakan ini tidak bisa dibatalkan.`)) return;
    setResetting(item_id);
    const r = await fetch(`/api/stocks/${item_id}`, { method: "DELETE" });
    if (r.ok) showToast(`Stok ${nama} direset ke 0`);
    else showToast("Gagal reset stok", "err");
    setResetting(null);
    load();
  };

  // Preview qty result
  const previewQty = () => {
    if (!editing) return null;
    const n = Number(qty) || 0;
    if (editMode === "set") return n;
    if (editMode === "add") return editing.qty_available + n;
    return Math.max(0, editing.qty_available - n);
  };

  const filtered = stocks.filter(s => !search || s.item?.nama?.toLowerCase().includes(search.toLowerCase()));
  const lowStock = stocks.filter(s => s.qty_available <= 3 && s.item?.is_active).length;
  const totalItems = stocks.length;
  const totalSold = stocks.reduce((sum, s) => sum + s.qty_sold, 0);

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
          animation: "fadeSlideUp 0.2s ease",
          backdropFilter: "blur(8px)",
        }}>
          {toast.type === "ok" ? "✓ " : "⚠ "}{toast.msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Stok & Kuota</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{totalItems} item terlacak • {totalSold} total terjual</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}><Icons.Refresh /> Refresh</button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div className="stat-card"><div className="stat-icon" style={{ background: "rgba(124,58,237,0.15)", boxShadow: "0 0 20px rgba(124,58,237,0.2)" }}><span style={{ color: "#a78bfa" }}><Icons.Package /></span></div><div><p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{totalItems}</p><p style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Item</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: "rgba(52,211,153,0.15)", boxShadow: "0 0 20px rgba(52,211,153,0.2)" }}><span style={{ color: "#34d399" }}><Icons.TrendingUp /></span></div><div><p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{totalSold}</p><p style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Terjual</p></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: "rgba(239,68,68,0.15)", boxShadow: "0 0 20px rgba(239,68,68,0.2)" }}><span style={{ color: "#f87171" }}><Icons.AlertTriangle /></span></div><div><p style={{ fontSize: 22, fontWeight: 700, color: lowStock > 0 ? "#f87171" : "var(--text-primary)" }}>{lowStock}</p><p style={{ fontSize: 12, color: "var(--text-muted)" }}>Stok Kritis (≤3)</p></div></div>
      </div>

      {lowStock > 0 && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: "#f87171", fontSize: 13 }}>
          <Icons.AlertTriangle /> <strong>{lowStock} item</strong> memiliki stok ≤ 3. Segera restock!
        </div>
      )}

      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}><Icons.Search /></span>
        <input className="input" style={{ paddingLeft: 36 }} placeholder="Cari nama item..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}
          </div>
        ) : (
          <table className="data-table">
            <thead><tr>
              <th>Item</th>
              <th>Tipe</th>
              <th>Harga</th>
              <th style={{ textAlign: "center" }}>Tersedia</th>
              <th style={{ textAlign: "center" }}>Terjual</th>
              <th style={{ textAlign: "center" }}>Reserved</th>
              <th style={{ width: 130 }}>Aksi</th>
            </tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <p style={{ fontWeight: 600, color: s.item?.is_active ? "var(--text-primary)" : "var(--text-muted)" }}>{s.item?.nama ?? `Item #${s.item_id}`}</p>
                    {!s.item?.is_active && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>nonaktif</span>}
                  </td>
                  <td style={{ fontSize: 12 }}>{s.item?.item_type ? `${s.item.item_type.icon} ${s.item.item_type.nama}` : "—"}</td>
                  <td style={{ fontSize: 12 }}>
                    {s.item?.harga_promo ? (
                      <>
                        <span style={{ color: "#34d399", fontWeight: 600 }}>{fmtRp(s.item.harga_promo)}</span>
                        <span style={{ color: "var(--text-muted)", textDecoration: "line-through", marginLeft: 6, fontSize: 11 }}>{fmtRp(s.item.harga_normal)}</span>
                      </>
                    ) : <span style={{ fontWeight: 600 }}>{fmtRp(s.item?.harga_normal ?? 0)}</span>}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{ fontWeight: 700, color: s.qty_available <= 3 ? "#f87171" : s.qty_available <= 10 ? "#fbbf24" : "#34d399", fontSize: 16 }}>{s.qty_available}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", display: "block" }}>{s.item?.satuan ?? "Pcs"}</span>
                  </td>
                  <td style={{ textAlign: "center", color: "var(--text-secondary)" }}>{s.qty_sold}</td>
                  <td style={{ textAlign: "center", color: "#fbbf24" }}>{s.qty_reserved}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => openEdit(s)}>
                        <Icons.Edit /> Update
                      </button>
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        title="Reset ke 0"
                        disabled={resetting === s.item_id}
                        onClick={() => resetStok(s.item_id, s.item?.nama)}
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>📦 Tidak ada data stok</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <Modal title={`Update Stok: ${editing.item?.nama}`} onClose={() => setEditing(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Current info */}
            <div style={{ padding: 14, borderRadius: 8, background: "var(--bg-card-2)", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Stok saat ini: <strong style={{ color: "var(--text-primary)", fontSize: 16 }}>{editing.qty_available} {editing.item?.satuan}</strong></p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Terjual: {editing.qty_sold} • Reserved: {editing.qty_reserved}</p>
            </div>

            {/* Mode selector */}
            <Field label="Mode Update">
              <div style={{ display: "flex", gap: 8 }}>
                {([["set", "⚙ Set Langsung"], ["add", "+ Tambah"], ["subtract", "− Kurangi"]] as [EditMode, string][]).map(([m, label]) => (
                  <button
                    key={m}
                    className={`btn btn-sm ${editMode === m ? "btn-primary" : "btn-secondary"}`}
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => setEditMode(m)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={editMode === "set" ? "Jumlah Stok Baru" : editMode === "add" ? "Tambah Berapa?" : "Kurangi Berapa?"} required>
              <input
                className="input"
                type="number"
                min="0"
                value={qty}
                onChange={e => setQty(e.target.value)}
                placeholder={editMode === "set" ? "Masukkan jumlah stok baru..." : "Masukkan jumlah..."}
              />
            </Field>

            {/* Preview */}
            {qty !== "" && (
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", fontSize: 13 }}>
                Hasil: <strong style={{ color: "#38bdf8" }}>{previewQty()} {editing.item?.satuan}</strong>
                {editMode !== "set" && <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>(dari {editing.qty_available})</span>}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving || qty === ""}>
                <Icons.Save /> {saving ? "Menyimpan..." : "Update Stok"}
              </button>
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Batal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
