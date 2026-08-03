"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import type { Invoice, Payment, CompanyProfile } from "@/lib/supabase";
import { Icons, Modal, Field, CustomSelect, InvoiceStatusBadge, fmtRp } from "./ui";
import { useAccess } from "./AccessContext";

type Props = { invoiceId: number; onBack: () => void; onEdit?: (id: number) => void; };

const METODE_OPTIONS = [
  { value: "Transfer", label: "🏦 Transfer Bank" },
  { value: "Cash", label: "💵 Cash" },
  { value: "QRIS", label: "📱 QRIS" },
  { value: "Other", label: "🔄 Lainnya" },
];
const TIPE_OPTIONS = [
  { value: "DP", label: "◑ DP (Uang Muka)" },
  { value: "Pelunasan", label: "✓ Pelunasan" },
  { value: "Full", label: "✓✓ Bayar Penuh" },
];

export default function InvoiceDetailPage({ invoiceId, onBack }: Props) {
  const hasAccess = useAccess();
  const canUpdate = hasAccess("invoice", "update");
  const canDelete = hasAccess("invoice", "delete");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [emailAddr, setEmailAddr] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [payForm, setPayForm] = useState({ tanggal_bayar: new Date().toISOString().split("T")[0], jumlah: "", metode: "Transfer", tipe: "DP", catatan: "" });
  const [savingPay, setSavingPay] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [invRes, compRes] = await Promise.all([fetch(`/api/invoices/${invoiceId}`), fetch("/api/company")]);
    if (invRes.ok) { const data = await invRes.json(); setInvoice(data); setEmailAddr(data.customer_email ?? ""); }
    if (compRes.ok) setCompany(await compRes.json());
    setLoading(false);
  }, [invoiceId]);

  useEffect(() => { load(); }, [load]);

  const savePayment = async () => {
    if (!invoice || !payForm.jumlah) return;
    setSavingPay(true);
    await fetch("/api/payments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payForm, jumlah: Number(payForm.jumlah), invoice_id: invoiceId }),
    });
    setSavingPay(false); setShowPayment(false); load();
  };

  const deletePayment = async () => {
    if (!deletingPayment) return;
    await fetch(`/api/payments/${deletingPayment.id}`, { method: "DELETE" }); 
    setDeletingPayment(null);
    load();
  };

  const sendEmail = async () => {
    if (!emailAddr) return;
    setSendingEmail(true);
    const res = await fetch(`/api/invoices/${invoiceId}/send-email`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_email: emailAddr }),
    });
    setSendingEmail(false);
    if (res.ok) { setEmailSent(true); setTimeout(() => { setEmailSent(false); setShowEmail(false); }, 3000); }
    else { const e = await res.json(); alert(e.error ?? "Gagal mengirim email"); }
  };

  const sendWhatsApp = () => {
    if (!invoice) return;
    let phone = invoice.customer_contact?.replace(/\D/g, "") ?? "";
    if (phone.startsWith("0")) phone = "62" + phone.slice(1);
    const grandTotalVal = invoice.subtotal - invoice.discount;
    const sisaVal = Math.max(0, grandTotalVal - totalPaid);
    const isLunas = totalPaid >= grandTotalVal && grandTotalVal > 0;

    // Format items tanpa emoji agar tidak korup karakter
    const itemsText = (invoice.invoice_items ?? []).map(
      it => `  * ${it.description}\n    ${it.qty} ${it.satuan} x ${fmtRp(it.harga_satuan)} = *${fmtRp(it.total_harga)}*`
    ).join("\n");

    const tgl = new Date(invoice.invoice_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    const msg = [
      `Halo *${invoice.customer_name}*,`,
      ``,
      `Berikut detail invoice dari *${company?.nama_toko ?? "DynoBoo"}*:`,
      `-----------------------------------`,
      `[INVOICE] *${invoice.invoice_no}*`,
      `Tanggal : ${tgl}`,
      `Tipe    : ${invoice.invoice_type?.nama ?? "Invoice"}`,
      `-----------------------------------`,
      `*Item Pesanan:*`,
      itemsText,
      `-----------------------------------`,
      ...(invoice.discount > 0 ? [`Subtotal    : ${fmtRp(invoice.subtotal)}`, `Diskon      : -${fmtRp(invoice.discount)}`] : []),
      `*Grand Total : ${fmtRp(grandTotalVal)}*`,
      ...(totalPaid > 0 ? [
        `DP Dibayar  : ${fmtRp(totalPaid)}`,
        isLunas
          ? `*Status      : LUNAS [OK]*`
          : `*Sisa Tagihan: ${fmtRp(sisaVal)}*`,
      ] : [
        `Status      : ${invoice.status_pembayaran}`,
      ]),
      `-----------------------------------`,
      isLunas
        ? `Terima kasih atas pembayaran Anda!\nPesanan Anda sedang kami proses.`
        : `Mohon segera lakukan pembayaran ya Kak.\nTerima kasih!`,
      ``,
      `_${company?.nama_toko ?? "DynoBoo"}_`,
      `_${company?.tagline ?? "Handmade Crochet Dolls & Beaded Accessories"}_`,
    ].join("\n");

    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => window.print();

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Memuat invoice...</div>;
  if (!invoice) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Invoice tidak ditemukan.</div>;

  const fmt = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const payments = invoice.payments ?? [];
  const totalPaid = payments.reduce((s, p) => s + Number(p.jumlah), 0);

  return (
    <div className="animate-in">
      {/* Topbar - hidden on print */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>← Kembali</button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={sendWhatsApp}><Icons.Whatsapp /> WhatsApp</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowEmail(true)}><Icons.Mail /> Email</button>
          {canUpdate && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowPayment(true)}><Icons.CreditCard /> Catat Bayar</button>
          )}
          <button className="btn btn-primary btn-sm" onClick={handlePrint}><Icons.Printer /> Print / PDF</button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div ref={printRef} className="invoice-preview">
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-bill-to">
            <p className="invoice-label">Bill To :</p>
            <p className="invoice-customer-name">{invoice.customer_name}</p>
            {invoice.customer_contact && <p className="invoice-customer-sub">{invoice.customer_contact}</p>}
            {invoice.customer_address && <p className="invoice-customer-sub">{invoice.customer_address}</p>}
            <p className="invoice-type-label">Type : <strong>{invoice.invoice_type?.nama ?? "Invoice"}</strong></p>
          </div>
          <div className="invoice-logo-center">
            <img src="/Logo_DynoBoo.png" alt="DynoBoo" style={{ maxHeight: 80, maxWidth: 160, objectFit: "contain" }} />
            <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, textAlign: "center" }}>CROCHET DOLLS & BEADED ACCESSORIES</p>
          </div>
          <div className="invoice-meta">
            <p><span>Invoice Date : </span><strong>{fmt(invoice.invoice_date)}</strong></p>
            <p><span>Invoice No : </span><strong style={{ fontFamily: "monospace" }}>{invoice.invoice_no}</strong></p>
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#475569" }}>Status Pembayaran</p>
              <div className={`invoice-status-badge inv-status-${invoice.status_pembayaran.toLowerCase()}`}>{invoice.status_pembayaran}</div>
            </div>
          </div>
        </div>
        <div className="invoice-divider" />

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th>QTY.</th>
              <th>PRICE</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.invoice_items ?? []).map(item => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td style={{ textAlign: "center" }}>{item.qty} {item.satuan}</td>
                <td style={{ textAlign: "right" }}>{fmtRp(item.harga_satuan)}</td>
                <td style={{ textAlign: "right" }}>{fmtRp(item.total_harga)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="invoice-divider" />

        {/* Totals */}
        <div className="invoice-totals">
          <div className="invoice-totals-row"><span>Total</span><span>{fmtRp(invoice.subtotal)}</span></div>
          {invoice.discount > 0 && (
            <div className="invoice-totals-row"><span>Discount</span><span style={{ color: "#ef4444" }}>- {fmtRp(invoice.discount)}</span></div>
          )}
          <div className="invoice-grand-total" style={{ background: "#e8f4f6" }}>
            <span>Grand Total</span>
            <span>{fmtRp(invoice.subtotal - invoice.discount)}</span>
          </div>
          {totalPaid > 0 && (
            <>
              <div className="invoice-totals-row" style={{ marginTop: 8 }}>
                <span style={{ color: "#10b981" }}>DP Dibayar ({payments.length}x)</span>
                <span style={{ color: "#10b981" }}>- {fmtRp(totalPaid)}</span>
              </div>
              <div className="invoice-grand-total" style={{ background: totalPaid >= (invoice.subtotal - invoice.discount) ? "rgba(16,185,129,0.12)" : "#fff3cd", borderRadius: 8, marginTop: 4 }}>
                <span style={{ color: totalPaid >= (invoice.subtotal - invoice.discount) ? "#10b981" : "#d97706" }}>
                  {totalPaid >= (invoice.subtotal - invoice.discount) ? "✓ LUNAS" : "Sisa Tagihan"}
                </span>
                <span style={{ color: totalPaid >= (invoice.subtotal - invoice.discount) ? "#10b981" : "#d97706" }}>
                  {fmtRp(Math.max(0, invoice.subtotal - invoice.discount - totalPaid))}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Catatan */}
        {invoice.catatan && (
          <div className="invoice-catatan">
            <p><strong>Catatan :</strong></p>
            <p style={{ whiteSpace: "pre-line" }}>{invoice.catatan}</p>
          </div>
        )}
      </div>

      {/* Payment History - no print */}
      <div className="no-print" style={{ marginTop: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>Riwayat Pembayaran</h3>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Total dibayar: <strong style={{ color: "#34d399" }}>{fmtRp(totalPaid)}</strong> / {fmtRp(invoice.grand_total)}</div>
          </div>
          {payments.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Belum ada pembayaran tercatat.</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>Tanggal</th><th>Jumlah</th><th>Tipe</th><th>Metode</th><th>Catatan</th>{canDelete && <th style={{ width: 60 }}>Aksi</th>}</tr></thead>
              <tbody>
                {payments.map((p: Payment) => (
                  <tr key={p.id}>
                    <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{new Date(p.tanggal_bayar).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td style={{ fontWeight: 700, color: "#34d399" }}>{fmtRp(p.jumlah)}</td>
                    <td><span className="badge badge-ai">{p.tipe}</span></td>
                    <td style={{ fontSize: 12 }}>{p.metode}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.catatan ?? "—"}</td>
                    {canDelete && <td><button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeletingPayment(p)}><Icons.Trash /></button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <Modal title="Catat Pembayaran" onClose={() => setShowPayment(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", fontSize: 13 }}>
              Sisa tagihan: <strong style={{ color: "#a78bfa" }}>{fmtRp(invoice.sisa_tagihan)}</strong>
            </div>
            <Field label="Tanggal Bayar" required><input className="input" type="date" value={payForm.tanggal_bayar} onChange={e => setPayForm(f => ({ ...f, tanggal_bayar: e.target.value }))} /></Field>
            <Field label="Jumlah Bayar (Rp)" required><input className="input" type="number" placeholder={String(invoice.sisa_tagihan)} value={payForm.jumlah} onChange={e => setPayForm(f => ({ ...f, jumlah: e.target.value }))} /></Field>
            <Field label="Tipe Pembayaran"><CustomSelect value={payForm.tipe} onChange={v => setPayForm(f => ({ ...f, tipe: v }))} options={TIPE_OPTIONS} /></Field>
            <Field label="Metode"><CustomSelect value={payForm.metode} onChange={v => setPayForm(f => ({ ...f, metode: v }))} options={METODE_OPTIONS} /></Field>
            <Field label="Catatan"><input className="input" placeholder="Catatan opsional..." value={payForm.catatan} onChange={e => setPayForm(f => ({ ...f, catatan: e.target.value }))} /></Field>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={savePayment} disabled={savingPay || !payForm.jumlah}>
                <Icons.Save /> {savingPay ? "Menyimpan..." : "Simpan Pembayaran"}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPayment(false)}>Batal</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Email Modal */}
      {showEmail && (
        <Modal title="Kirim Invoice via Email" onClose={() => setShowEmail(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {emailSent ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <p style={{ fontSize: 32 }}>✅</p>
                <p style={{ fontWeight: 600, color: "#34d399", marginTop: 8 }}>Email berhasil dikirim!</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>ke: {emailAddr}</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Invoice <strong style={{ color: "var(--text-primary)" }}>{invoice.invoice_no}</strong> akan dikirim ke email customer berikut:</p>
                <Field label="Email Customer" required>
                  <input className="input" type="email" placeholder="customer@email.com" value={emailAddr} onChange={e => setEmailAddr(e.target.value)} />
                </Field>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={sendEmail} disabled={sendingEmail || !emailAddr}>
                    <Icons.Send /> {sendingEmail ? "Mengirim..." : "Kirim Email"}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowEmail(false)}>Batal</button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {deletingPayment && (
        <Modal title="Hapus Riwayat Pembayaran" onClose={() => setDeletingPayment(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🗑️</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{fmtRp(deletingPayment.jumlah)}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{new Date(deletingPayment.tanggal_bayar).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} • {deletingPayment.tipe}</p>
                </div>
              </div>
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", fontSize: 13, color: "#f59e0b", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <span>Anda yakin ingin menghapus pembayaran ini? Total terbayar dan status invoice akan dihitung ulang.</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-sm" style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg,rgba(239,68,68,0.2),rgba(220,38,38,0.15))", color: "#ef4444", border: "1px solid rgba(239,68,68,0.4)", padding: "10px 0", fontWeight: 700 }} onClick={deletePayment}>Ya, Hapus</button>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center", padding: "10px 0" }} onClick={() => setDeletingPayment(null)}>Batal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
