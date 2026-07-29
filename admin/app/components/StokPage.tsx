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

export default function StokPage() {
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StockRow | null>(null);
  const [qty, setQty] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/stocks");
    setStocks(await r.json());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openEdit = (s: StockRow) => { setEditing(s); setQty(String(s.qty_available)); };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    await fetch(`/api/stocks/${editing.item_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty_available: Number(qty) }),
    });
    setSaving(false); setEditing(null); load();
  };

  const filtered = stocks.filter(s => !search || s.item?.nama?.toLowerCase().includes(search.toLowerCase()));
  const lowStock = stocks.filter(s => s.qty_available <= 3 && s.item?.is_active).length;
  const totalItems = stocks.length;
  const totalSold = stocks.reduce((sum, s) => sum + s.qty_sold, 0);

  return (
    <div className="animate-in">
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
              <th style={{ width: 80 }}>Aksi</th>
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
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>Restock</button>
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
            <div style={{ padding: 14, borderRadius: 8, background: "var(--bg-card-2)", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Stok saat ini: <strong style={{ color: "var(--text-primary)" }}>{editing.qty_available} {editing.item?.satuan}</strong></p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Total terjual: {editing.qty_sold} • Reserved: {editing.qty_reserved}</p>
            </div>
            <Field label="Stok / Kuota Baru" required>
              <input className="input" type="number" min="0" value={qty} onChange={e => setQty(e.target.value)} placeholder="Masukkan jumlah stok baru..." />
            </Field>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving}><Icons.Save /> {saving ? "Menyimpan..." : "Update Stok"}</button>
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Batal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
