"use client";
import { useState, useCallback, useEffect } from "react";
import type { InvoiceType, Item } from "@/lib/supabase";
import { Icons, Field, CustomSelect, fmtRp } from "./ui";
import type { Pesanan } from "@/lib/supabase";

type LineItem = { item_id?: number; description: string; qty: number; satuan: string; harga_satuan: number };

type Props = {
  onSuccess: (invoiceId: number) => void;
  onCancel: () => void;
  prefillPesanan?: Pesanan | null;
};

const STATUS_OPTIONS = [
  { value: "UNPAID", label: "○ UNPAID", color: "#f87171" },
  { value: "DP", label: "◑ DP", color: "#fbbf24" },
  { value: "PAID", label: "✓ PAID", color: "#34d399" },
  { value: "CANCELLED", label: "✕ CANCELLED", color: "#94a3b8" },
];

export default function InvoiceFormPage({ onSuccess, onCancel, prefillPesanan }: Props) {
  const [types, setTypes] = useState<InvoiceType[]>([]);
  const [katalog, setKatalog] = useState<Item[]>([]);
  const [saving, setSaving] = useState(false);
  const [showKatalog, setShowKatalog] = useState(false);

  const [form, setForm] = useState({
    invoice_type_id: "",
    invoice_date: new Date().toISOString().split("T")[0],
    customer_name: prefillPesanan?.nama ?? "",
    customer_contact: prefillPesanan?.no_hp ?? "",
    customer_address: prefillPesanan?.alamat ?? "",
    customer_email: "",
    discount: "0",
    status_pembayaran: "UNPAID",
    catatan: "Dengan melakukan pembayaran, peserta dianggap telah membaca dan menyetujui seluruh syarat dan ketentuan yang berlaku.\n\nPeserta yang telah melakukan pembayaran namun berhalangan hadir wajib menginformasikan kepada penyelenggara paling lambat H-2 sebelum workshop. Apabila tidak ada konfirmasi hingga melewati batas waktu tersebut atau peserta tidak hadir, maka biaya yang telah dibayarkan dinyatakan hangus (non-refundable).",
    pesanan_id: prefillPesanan?.id ?? null,
  });
  const [items, setItems] = useState<LineItem[]>([]);

  const load = useCallback(async () => {
    const [tRes, kRes] = await Promise.all([fetch("/api/invoice-types"), fetch("/api/items")]);
    const t = await tRes.json();
    setTypes(t);
    setKatalog(await kRes.json());
    if (t.length > 0) setForm(f => ({ ...f, invoice_type_id: String(t[0].id) }));
  }, []);

  useEffect(() => { load(); }, [load]);

  const addCustomItem = () => setItems(prev => [...prev, { description: "", qty: 1, satuan: "Pcs", harga_satuan: 0 }]);
  const addFromKatalog = (item: Item) => {
    const price = item.harga_promo ?? item.harga_normal;
    setItems(prev => [...prev, { item_id: item.id, description: item.nama, qty: 1, satuan: item.satuan, harga_satuan: price }]);
    setShowKatalog(false);
  };
  const updateItem = (idx: number, field: keyof LineItem, val: string | number) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  };
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, it) => s + Number(it.qty) * Number(it.harga_satuan), 0);
  const discount = Number(form.discount) || 0;
  const grandTotal = subtotal - discount;

  const save = async () => {
    if (!form.invoice_type_id || !form.customer_name) return;
    setSaving(true);
    const payload = {
      invoice_type_id: Number(form.invoice_type_id),
      invoice_date: form.invoice_date,
      customer_name: form.customer_name,
      customer_contact: form.customer_contact || null,
      customer_address: form.customer_address || null,
      customer_email: form.customer_email || null,
      discount,
      status_pembayaran: form.status_pembayaran,
      catatan: form.catatan || null,
      pesanan_id: form.pesanan_id || null,
      subtotal,
      grand_total: grandTotal,
      items,
    };
    const res = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (res.ok && data.id) onSuccess(data.id);
  };

  const typeOptions = types.map(t => ({ value: String(t.id), label: t.nama }));

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Buat Invoice Baru</h2>
          {prefillPesanan && <p style={{ fontSize: 13, color: "#a78bfa", marginTop: 4 }}>📦 Pre-fill dari pesanan #{prefillPesanan.id}: {prefillPesanan.produk}</p>}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onCancel}><Icons.X /> Batal</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left - Customer & Invoice Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>Info Invoice</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Tipe Invoice" required>
                <CustomSelect value={form.invoice_type_id} onChange={v => setForm(f => ({ ...f, invoice_type_id: v }))} options={typeOptions.length ? typeOptions : [{ value: "", label: "— Pilih —" }]} />
              </Field>
              <Field label="Tanggal Invoice" required>
                <input className="input" type="date" value={form.invoice_date} onChange={e => setForm(f => ({ ...f, invoice_date: e.target.value }))} />
              </Field>
              <Field label="Status Pembayaran">
                <CustomSelect value={form.status_pembayaran} onChange={v => setForm(f => ({ ...f, status_pembayaran: v }))} options={STATUS_OPTIONS} />
              </Field>
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>Data Customer</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Nama Customer" required><input className="input" placeholder="Nama lengkap..." value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} /></Field>
              <Field label="No HP / Instagram"><input className="input" placeholder="08xx / @username" value={form.customer_contact} onChange={e => setForm(f => ({ ...f, customer_contact: e.target.value }))} /></Field>
              <Field label="Email"><input className="input" type="email" placeholder="email@example.com" value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} /></Field>
              <Field label="Alamat"><textarea className="input" rows={2} placeholder="Alamat pengiriman (opsional)..." value={form.customer_address} onChange={e => setForm(f => ({ ...f, customer_address: e.target.value }))} /></Field>
            </div>
          </div>
        </div>

        {/* Right - Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Item / Produk</p>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowKatalog(true)}><Icons.Package /> Dari Katalog</button>
                <button className="btn btn-secondary btn-sm" onClick={addCustomItem}><Icons.Plus /> Custom</button>
              </div>
            </div>

            {items.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 13 }}>
                <Icons.Receipt />
                <p style={{ marginTop: 8 }}>Belum ada item. Tambah dari katalog atau buat custom.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((it, idx) => (
                  <div key={idx} style={{ padding: 12, borderRadius: 8, background: "var(--bg-card-2)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input className="input" style={{ flex: 1 }} placeholder="Deskripsi item..." value={it.description} onChange={e => updateItem(idx, "description", e.target.value)} />
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeItem(idx)}><Icons.Trash /></button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "80px 80px 1fr", gap: 8 }}>
                      <input className="input" type="number" min="1" placeholder="Qty" value={it.qty} onChange={e => updateItem(idx, "qty", Number(e.target.value))} />
                      <input className="input" placeholder="Satuan" value={it.satuan} onChange={e => updateItem(idx, "satuan", e.target.value)} />
                      <input className="input" type="number" min="0" placeholder="Harga satuan" value={it.harga_satuan} onChange={e => updateItem(idx, "harga_satuan", Number(e.target.value))} />
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "right" }}>
                      Total: <strong style={{ color: "#a78bfa" }}>{fmtRp(Number(it.qty) * Number(it.harga_satuan))}</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            {items.length > 0 && (
              <div style={{ borderTop: "1px solid var(--border)", marginTop: 16, paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                  <span>Subtotal</span><span>{fmtRp(subtotal)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", flex: 1 }}>Diskon</span>
                  <input className="input" style={{ width: 120, textAlign: "right" }} type="number" min="0" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <span style={{ fontWeight: 700, color: "#a78bfa", fontSize: 15 }}>Grand Total</span>
                  <span style={{ fontWeight: 700, color: "#a78bfa", fontSize: 15 }}>{fmtRp(grandTotal)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Catatan */}
          <div className="card" style={{ padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>Catatan</p>
            <textarea className="input" rows={4} value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} />
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={save} disabled={saving || !form.invoice_type_id || !form.customer_name}>
            <Icons.Save /> {saving ? "Membuat Invoice..." : "Buat Invoice"}
          </button>
        </div>
      </div>

      {/* Katalog Modal */}
      {showKatalog && (
        <div className="modal-overlay" onClick={() => setShowKatalog(false)}>
          <div className="modal-box" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>Pilih dari Katalog</h3>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowKatalog(false)}><Icons.X /></button>
            </div>
            <div style={{ padding: 16, maxHeight: "65vh", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {katalog.filter(k => k.is_active).map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8, background: "var(--bg-card-2)", border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.15s" }}
                    onClick={() => addFromKatalog(item)} className="catalog-row">
                    <span style={{ fontSize: 20 }}>{item.item_type?.icon ?? "📦"}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{item.nama}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.item_type?.nama} • Stok: {item.stock?.qty_available ?? 0} {item.satuan}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {item.harga_promo ? (
                        <>
                          <p style={{ fontWeight: 700, color: "#34d399" }}>{fmtRp(item.harga_promo)}</p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "line-through" }}>{fmtRp(item.harga_normal)}</p>
                        </>
                      ) : <p style={{ fontWeight: 700, color: "var(--text-primary)" }}>{fmtRp(item.harga_normal)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
