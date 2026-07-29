"use client";
import { useState, useCallback, useEffect } from "react";
import type { Invoice, InvoiceType } from "@/lib/supabase";
import { Icons, CustomSelect, InvoiceStatusBadge, fmtRp } from "./ui";

type Props = {
  onViewInvoice: (id: number) => void;
  onCreateInvoice: () => void;
};

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "UNPAID", label: "○ UNPAID", color: "#f87171" },
  { value: "DP", label: "◑ DP", color: "#fbbf24" },
  { value: "PAID", label: "✓ PAID", color: "#34d399" },
  { value: "CANCELLED", label: "✕ CANCELLED", color: "#94a3b8" },
];

export default function InvoiceListPage({ onViewInvoice, onCreateInvoice }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [types, setTypes] = useState<InvoiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterType) params.set("type_id", filterType);
    const [invRes, typRes] = await Promise.all([fetch("/api/invoices?" + params), fetch("/api/invoice-types")]);
    setInvoices(await invRes.json());
    setTypes(await typRes.json());
    setLoading(false);
  }, [filterStatus, filterType]);

  useEffect(() => { load(); }, [load]);

  const filtered = invoices.filter(inv => !search || inv.invoice_no.includes(search) || inv.customer_name.toLowerCase().includes(search.toLowerCase()));

  const totalRevenue = invoices.filter(i => i.status_pembayaran === "PAID").reduce((s, i) => s + Number(i.grand_total), 0);
  const totalUnpaid = invoices.filter(i => ["UNPAID", "DP"].includes(i.status_pembayaran)).reduce((s, i) => s + Number(i.sisa_tagihan), 0);
  const countCancelled = invoices.filter(i => i.status_pembayaran === "CANCELLED").length;

  const fmt = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const rows = filtered.map(inv => `
      <tr>
        <td>${inv.invoice_no}</td>
        <td>${fmt(inv.invoice_date)}</td>
        <td>${inv.customer_name}</td>
        <td>${inv.invoice_type?.nama ?? "—"}</td>
        <td style="text-align:right">${fmtRp(inv.grand_total)}</td>
        <td><span style="color:${inv.status_pembayaran === "PAID" ? "#10b981" : inv.status_pembayaran === "DP" ? "#f59e0b" : inv.status_pembayaran === "CANCELLED" ? "#94a3b8" : "#ef4444"}">${inv.status_pembayaran}</span></td>
      </tr>`).join("");
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Laporan Penjualan DynoBoo</title>
    <style>body{font-family:Arial,sans-serif;padding:32px;color:#1e293b}h1{color:#7c3aed;margin-bottom:4px}p{color:#64748b;margin:0 0 24px}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;padding:10px 12px;text-align:left;font-size:12px;color:#64748b;border-bottom:2px solid #e2e8f0}td{padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px}.footer{margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8}</style>
    </head><body>
    <h1>DynoBoo — Laporan Penjualan</h1>
    <p>Periode: ${filterStatus || "Semua Status"} • Dicetak: ${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</p>
    <table><thead><tr><th>No Invoice</th><th>Tanggal</th><th>Customer</th><th>Tipe</th><th>Grand Total</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="footer"><strong>Total Invoice:</strong> ${filtered.length} &nbsp;|&nbsp; <strong>Revenue (PAID):</strong> ${fmtRp(totalRevenue)} &nbsp;|&nbsp; <strong>Belum Lunas:</strong> ${fmtRp(totalUnpaid)}</div>
    </body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const typeOptions = [{ value: "", label: "Semua Tipe" }, ...types.map(t => ({ value: String(t.id), label: t.nama }))];

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Daftar Invoice</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>History penjualan DynoBoo</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrintReport}><Icons.Printer /> Laporan PDF</button>
          <button className="btn btn-secondary btn-sm" onClick={load}><Icons.Refresh /> Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={onCreateInvoice}><Icons.Plus /> Buat Invoice</button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Invoice", value: String(invoices.length), color: "#a78bfa", bg: "rgba(124,58,237,0.12)" },
          { label: "Revenue (PAID)", value: fmtRp(totalRevenue), color: "#34d399", bg: "rgba(52,211,153,0.12)" },
          { label: "Belum Lunas", value: fmtRp(totalUnpaid), color: "#fbbf24", bg: "rgba(245,158,11,0.12)" },
          { label: "Dibatalkan", value: String(countCancelled), color: "#94a3b8", bg: "rgba(100,116,139,0.12)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "12px 16px" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}><Icons.Search /></span>
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Cari no invoice atau nama customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ width: 160 }}><CustomSelect value={filterStatus} onChange={setFilterStatus} options={STATUS_OPTIONS} /></div>
        <div style={{ width: 180 }}><CustomSelect value={filterType} onChange={setFilterType} options={typeOptions} /></div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}</div>
        ) : (
          <table className="data-table">
            <thead><tr>
              <th>No Invoice</th>
              <th>Tanggal</th>
              <th>Customer</th>
              <th>Tipe</th>
              <th>Grand Total</th>
              <th>Status</th>
              <th style={{ width: 80 }}>Aksi</th>
            </tr></thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} style={{ cursor: "pointer" }} onClick={() => onViewInvoice(inv.id)}>
                  <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>{inv.invoice_no}</span></td>
                  <td style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmt(inv.invoice_date)}</td>
                  <td>
                    <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{inv.customer_name}</p>
                    {inv.customer_contact && <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{inv.customer_contact}</p>}
                  </td>
                  <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{inv.invoice_type?.nama ?? "—"}</td>
                  <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{fmtRp(inv.grand_total)}</td>
                  <td><InvoiceStatusBadge status={inv.status_pembayaran} /></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onViewInvoice(inv.id)}><Icons.Eye /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>🧾 Belum ada invoice</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
