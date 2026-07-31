"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { KnowledgeBase, Workshop, Pesanan, ChatLog, PilihanJawaban, AdminUser, Invoice, Item } from "@/lib/supabase";

// ─── Import components ────────────────────────────────────────────────────────
import { Icons, CustomSelect, Modal, StatCard, Field, InvoiceStatusBadge, fmtRp } from "./components/ui";
import KatalogPage from "./components/KatalogPage";
import StokPage from "./components/StokPage";
import InvoiceListPage from "./components/InvoiceListPage";
import InvoiceFormPage from "./components/InvoiceFormPage";
import InvoiceDetailPage from "./components/InvoiceDetailPage";
import CompanyPage from "./components/CompanyPage";
import AiAssistantPage from "./components/AiAssistantPage";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Page =
  | "dashboard"
  | "katalog" | "stok"
  | "invoice-list" | "invoice-form" | "invoice-detail" | "invoice-types"
  | "knowledge" | "workshops" | "pesanan" | "chatlogs"
  | "company" | "access" | "ai-assistant" | "manual";

// ─── Navigation Structure ──────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    key: "MENU",
    items: [{ id: "dashboard", label: "Dashboard", icon: <Icons.Dashboard /> }],
  },
  {
    key: "PRODUK",
    sub: [
      { label: "Master", items: [{ id: "katalog", label: "Katalog Produk", icon: <Icons.Package /> }] },
      { label: "Stok", items: [{ id: "stok", label: "Stok & Kuota", icon: <Icons.BarChart /> }] },
    ],
  },
  {
    key: "INVOICE",
    sub: [
      {
        label: "Transaksi",
        items: [
          { id: "invoice-list", label: "Daftar Invoice", icon: <Icons.Receipt /> },
          { id: "invoice-form", label: "Buat Invoice", icon: <Icons.Plus /> },
        ],
      },
      {
        label: "Pengaturan",
        items: [{ id: "invoice-types", label: "Tipe Invoice", icon: <Icons.FileText /> }],
      },
    ],
  },
  {
    key: "CHATBOT",
    sub: [
      {
        label: "Data Bot",
        items: [
          { id: "knowledge", label: "Knowledge Base", icon: <Icons.Brain /> },
          { id: "workshops", label: "Workshops", icon: <Icons.Workshop /> },
        ],
      },
      {
        label: "Aktivitas",
        items: [
          { id: "pesanan", label: "Pesanan (Pre-order)", icon: <Icons.Orders /> },
          { id: "chatlogs", label: "Chat Logs", icon: <Icons.Chat /> },
        ],
      },
    ],
  },
  {
    key: "PENGATURAN",
    items: [
      { id: "company", label: "Profil Toko", icon: <Icons.Building /> },
      { id: "access", label: "Access Control", icon: <Icons.Lock /> },
      { id: "ai-assistant", label: "AI Assistant", icon: <span style={{fontSize:14}}>🦖</span> },
      { id: "manual", label: "Buku Panduan", icon: <Icons.Book /> },
    ],
  },
];

// ─── Group accent colours ───────────────────────────────────────────────────────
const GROUP_META: Record<string, { color: string; bg: string; emoji: string }> = {
  PRODUK:     { color: "#a78bfa", bg: "rgba(124,58,237,0.18)",  emoji: "📦" },
  INVOICE:    { color: "#38bdf8", bg: "rgba(56,189,248,0.18)",  emoji: "🧾" },
  CHATBOT:    { color: "#34d399", bg: "rgba(52,211,153,0.18)",  emoji: "🤖" },
  PENGATURAN: { color: "#f59e0b", bg: "rgba(245,158,11,0.18)",  emoji: "⚙️" },
};

function SidebarGroup({ group, currentPage, onNavigate }: { group: typeof NAV_GROUPS[number]; currentPage: Page; onNavigate: (page: Page) => void }) {
  const isActive = (id: string) => currentPage === id || (currentPage === "invoice-detail" && id === "invoice-list");

  const hasActiveChild =
    group.items?.some(i => isActive(i.id)) ||
    group.sub?.some(s => s.items.some(i => isActive(i.id)));

  const [open, setOpen] = useState(true);
  const meta = GROUP_META[group.key];

  // MENU group — no toggle
  if (group.key === "MENU") {
    return (
      <div style={{ marginBottom: 6 }}>
        {group.items?.map((item) => (
          <button key={item.id} className={`nav-item ${isActive(item.id) ? "active" : ""}`}
            style={{ width: "100%", border: "none", background: "none" }}
            onClick={() => onNavigate(item.id as Page)}>
            {item.icon}<span>{item.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 4 }}>
      {/* ── Premium section header ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 10px 7px 8px", borderRadius: 10, marginTop: 6,
          background: open
            ? (hasActiveChild ? `linear-gradient(90deg,${meta.bg},transparent)` : "var(--bg-card-2)")
            : "transparent",
          borderLeft: `3px solid ${open ? meta.color : "transparent"}`,
          transition: "all 0.2s ease",
          boxShadow: open && hasActiveChild ? `0 0 12px ${meta.color}28` : "none",
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "var(--bg-hover)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}
      >
        {/* Emoji icon badge */}
        <span style={{
          width: 22, height: 22, borderRadius: 6,
          background: open ? meta.bg : "var(--bg-card-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, flexShrink: 0, transition: "all 0.2s",
          boxShadow: open ? `0 0 8px ${meta.color}40` : "none",
        }}>{meta.emoji}</span>

        <span style={{
          flex: 1, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
          textTransform: "uppercase", textAlign: "left",
          color: open ? meta.color : (hasActiveChild ? meta.color : "var(--text-muted)"),
          transition: "color 0.2s",
        }}>{group.key}</span>

        {/* Chevron */}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke={open ? meta.color : "var(--text-subtle)"}
          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "transform 0.22s ease", transform: open ? "rotate(0deg)" : "rotate(-90deg)", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Collapsible content ── */}
      <div className={`nav-group-content ${open ? "" : "collapsed"}`}
        style={{ paddingLeft: 4 }}>
        {group.items?.map((item) => (
          <button key={item.id} className={`nav-item ${isActive(item.id) ? "active" : ""}`}
            style={{ width: "100%", border: "none", background: "none" }}
            onClick={() => onNavigate(item.id as Page)}>
            {item.icon}<span>{item.label}</span>
          </button>
        ))}
        {group.sub?.map((sub, si) => (
          <div key={si}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "var(--text-subtle)", paddingLeft: 10, marginTop: 8, marginBottom: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>— {sub.label}</p>
            {sub.items.map((item) => (
              <button key={item.id} className={`nav-item ${isActive(item.id) ? "active" : ""}`}
                style={{ width: "100%", border: "none", background: "none", paddingLeft: 16 }}
                onClick={() => onNavigate(item.id as Page)}>
                {item.icon}<span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}


function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ─── InvoiceTypes page ─────────────────────────────────────────────────────────
type InvoiceTypeRow = { id: number; nama: string; prefix: string; deskripsi: string | null; is_active: boolean };
function InvoiceTypesPage() {
  const [types, setTypes] = useState<InvoiceTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<InvoiceTypeRow | null>(null);
  const [form, setForm] = useState({ nama: "", prefix: "", deskripsi: "", is_active: true });
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { setLoading(true); const r = await fetch("/api/invoice-types"); setTypes(await r.json()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const openAdd = () => { setForm({ nama: "", prefix: "", deskripsi: "", is_active: true }); setAdding(true); setEditing(null); };
  const openEdit = (t: InvoiceTypeRow) => { setForm({ nama: t.nama, prefix: t.prefix, deskripsi: t.deskripsi ?? "", is_active: t.is_active }); setEditing(t); setAdding(false); };
  const save = async () => {
    setSaving(true);
    if (editing) await fetch(`/api/invoice-types/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    else await fetch("/api/invoice-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); setAdding(false); setEditing(null); load();
  };
  const del = async (id: number) => { if (!confirm("Hapus tipe invoice ini?")) return; await fetch(`/api/invoice-types/${id}`, { method: "DELETE" }); load(); };
  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Tipe Invoice</h2><p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Kelola template jenis invoice (Workshop, Produk, Bouquet...)</p></div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><Icons.Plus /> Tambah Tipe</button>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? <div style={{ padding: 20 }}><div className="skeleton" style={{ height: 52 }} /></div> : (
          <table className="data-table">
            <thead><tr><th>Nama</th><th>Prefix</th><th>Deskripsi</th><th>Contoh No.</th><th>Status</th><th style={{ width: 90 }}>Aksi</th></tr></thead>
            <tbody>
              {types.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.nama}</td>
                  <td><code style={{ background: "rgba(56,189,248,0.12)", padding: "2px 8px", borderRadius: 4, color: "#38bdf8", fontSize: 12 }}>{t.prefix}</code></td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{t.deskripsi ?? "—"}</td>
                  <td><code style={{ fontSize: 11, color: "var(--text-secondary)" }}>DNB-{t.prefix}-2608-0001</code></td>
                  <td><span className={`badge ${t.is_active ? "badge-active" : "badge-closed"}`}>{t.is_active ? "Aktif" : "Nonaktif"}</span></td>
                  <td><div style={{ display: "flex", gap: 6 }}><button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(t)}><Icons.Edit /></button><button className="btn btn-danger btn-sm btn-icon" onClick={() => del(t.id)}><Icons.Trash /></button></div></td>
                </tr>
              ))}
              {types.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Belum ada tipe invoice</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {(adding || !!editing) && (
        <Modal title={editing ? "Edit Tipe Invoice" : "Tambah Tipe Invoice"} onClose={() => { setAdding(false); setEditing(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Nama Tipe" required><input className="input" placeholder="Invoice Workshop" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} /></Field>
            <Field label="Prefix (maks 5 huruf)" required><input className="input" placeholder="WSP" maxLength={5} style={{ textTransform: "uppercase" }} value={form.prefix} onChange={e => setForm(f => ({ ...f, prefix: e.target.value.toUpperCase() }))} /></Field>
            <Field label="Deskripsi"><input className="input" placeholder="Untuk pembayaran workshop..." value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} /></Field>
            <Field label="Status"><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div className={`toggle ${form.is_active ? "on" : ""}`} onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} /><span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{form.is_active ? "Aktif" : "Nonaktif"}</span></div></Field>
            {form.prefix && <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", fontSize: 12, color: "#38bdf8" }}>Preview: <code>DNB-{form.prefix}-2608-0001</code></div>}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving || !form.nama || !form.prefix}><Icons.Save /> {saving ? "Menyimpan..." : "Simpan"}</button>
              <button className="btn btn-secondary" onClick={() => { setAdding(false); setEditing(null); }}>Batal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Dashboard Stats (Grid Redesign) ───────────────────────────────────────────

function DashboardPage({ onNavigate }: { onNavigate: (page: Page, data?: unknown) => void }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [invRes, pesRes, itemsRes] = await Promise.all([
          fetch("/api/invoices"), fetch("/api/pesanan"), fetch("/api/items"),
        ]);
        if (invRes.ok) setInvoices(await invRes.json());
        if (pesRes.ok) setPesanan(await pesRes.json());
        if (itemsRes.ok) setItems(await itemsRes.json());
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  const totalPaidRevenue = invoices.filter(i => i.status_pembayaran === "PAID").reduce((s, i) => s + Number(i.grand_total), 0);
  const totalUnpaidAmount = invoices.filter(i => ["UNPAID", "DP"].includes(i.status_pembayaran)).reduce((s, i) => s + Number(i.sisa_tagihan), 0);

  const countPaid = invoices.filter(i => i.status_pembayaran === "PAID").length;
  const countDP = invoices.filter(i => i.status_pembayaran === "DP").length;
  const countUnpaid = invoices.filter(i => i.status_pembayaran === "UNPAID").length;
  const countCancelled = invoices.filter(i => i.status_pembayaran === "CANCELLED").length;

  const lowStockItems = items.filter(i => i.is_active && (i.stock?.qty_available ?? 0) <= 3);

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }} className="gradient-text">Dashboard Semi-POS</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Ringkasan performa toko & transaksi DynoBoo</p>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--bg-card)", padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)" }}>
          🗓️ {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* Top Grid - 4 KPI Cards */}
      <div className="dashboard-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Revenue (PAID)" value={loading ? "—" : fmtRp(totalPaidRevenue)} color="#10b981" bg="rgba(16,185,129,0.15)" icon={<Icons.TrendingUp />} sub="Total dana masuk" />
        <StatCard label="Total Transaksi" value={loading ? "—" : invoices.length} color="#38bdf8" bg="rgba(56,189,248,0.15)" icon={<Icons.Receipt />} sub={`${countPaid} lunas, ${countUnpaid} belum`} />
        <StatCard label="Katalog Produk" value={loading ? "—" : items.length} color="#06b6d4" bg="rgba(6,182,212,0.15)" icon={<Icons.Package />} sub={`${lowStockItems.length} stok kritis`} />
        <StatCard label="Pesanan Pre-Order" value={loading ? "—" : pesanan.length} color="#f59e0b" bg="rgba(245,158,11,0.15)" icon={<Icons.Orders />} sub="dari chatbot" />
      </div>

      {/* Main 2-Column Grid */}
      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
        
        {/* Left Column (60%) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Quick Actions Widget - Neat compact buttons */}
          <div className="card" style={{ padding: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>Aksi Cepat POS</p>
            <div className="pos-actions-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
              <button className="btn btn-primary" style={{ padding: "8px 12px", justifyContent: "center", fontSize: 12, height: 38 }} onClick={() => onNavigate("invoice-form")}>
                <Icons.Plus /> <span>Buat Invoice</span>
              </button>
              <button className="btn btn-secondary" style={{ padding: "8px 12px", justifyContent: "center", fontSize: 12, height: 38 }} onClick={() => onNavigate("katalog")}>
                <Icons.Package /> <span>+ Produk</span>
              </button>
              <button className="btn btn-secondary" style={{ padding: "8px 12px", justifyContent: "center", fontSize: 12, height: 38 }} onClick={() => onNavigate("stok")}>
                <Icons.BarChart /> <span>Cek Stok</span>
              </button>
              <button className="btn btn-secondary" style={{ padding: "8px 12px", justifyContent: "center", fontSize: 12, height: 38 }} onClick={() => onNavigate("ai-assistant")}>
                <span style={{ fontSize: 14 }}>🦖</span> <span>Tanya AI</span>
              </button>
            </div>
          </div>

          {/* Recent Invoices Table Widget */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Transaksi Invoice Terbaru</p>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("invoice-list")}>Semua Invoice →</button>
            </div>
            
            {invoices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: 13 }}>
                Belum ada transaksi invoice recorded.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No Invoice</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th style={{ width: 60 }}>Lihat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 5).map(inv => (
                      <tr key={inv.id} style={{ cursor: "pointer" }} onClick={() => onNavigate("invoice-list")}>
                        <td><span style={{ fontFamily: "monospace", fontSize: 11, color: "#38bdf8", fontWeight: 600 }}>{inv.invoice_no}</span></td>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{inv.customer_name}</td>
                        <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{fmtRp(inv.grand_total)}</td>
                        <td><InvoiceStatusBadge status={inv.status_pembayaran} /></td>
                        <td><button className="btn btn-secondary btn-sm btn-icon"><Icons.Eye /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (40%) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Stok Kritis Alert Widget */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Stok & Kuota Kritis (≤ 3)</p>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("stok")}>Restock →</button>
            </div>
            
            {lowStockItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "14px 0", color: "#34d399", fontSize: 12 }}>
                ✓ Semua stok item dalam kondisi aman!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {lowStockItems.slice(0, 3).map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 12, color: "var(--text-primary)" }}>{item.nama}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Sisa: <strong style={{ color: "#f87171" }}>{item.stock?.qty_available ?? 0} {item.satuan}</strong></p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("stok")}>Update</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pre-Orders Terbaru (Chatbot) */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Pesanan Pre-Order Chatbot</p>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("pesanan")}>Semua →</button>
            </div>

            {pesanan.length === 0 ? (
              <div style={{ textAlign: "center", padding: "14px 0", color: "var(--text-muted)", fontSize: 12 }}>
                Belum ada pesanan pre-order masuk.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pesanan.slice(0, 2).map(p => (
                  <div key={p.id} style={{ padding: "8px 12px", borderRadius: 8, background: "var(--bg-card-2)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                      <p style={{ fontWeight: 600, fontSize: 12, color: "var(--text-primary)" }}>{p.nama}</p>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{fmtDate(p.created_at)}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#38bdf8", marginBottom: 6 }}>🛒 {p.produk}</p>
                    <button className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => onNavigate("invoice-form", p)}>
                      <Icons.Receipt /> Process to Invoice
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Pembayaran breakdown (Moved below Chatbot pre-orders) */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Status Pembayaran</p>
              <button className="btn btn-secondary btn-sm" onClick={() => onNavigate("invoice-list")}>Detail →</button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              <div style={{ padding: 10, borderRadius: 8, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge badge-paid" style={{ fontSize: 10 }}>PAID</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>{countPaid}</span>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{fmtRp(totalPaidRevenue)}</p>
              </div>

              <div style={{ padding: 10, borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge badge-dp" style={{ fontSize: 10 }}>DP</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#f59e0b" }}>{countDP}</span>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Pelunasan</p>
              </div>

              <div style={{ padding: 10, borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge badge-unpaid" style={{ fontSize: 10 }}>UNPAID</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#ef4444" }}>{countUnpaid}</span>
                </div>
                <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{fmtRp(totalUnpaidAmount)}</p>
              </div>

              <div style={{ padding: 10, borderRadius: 8, background: "rgba(100,116,139,0.08)", border: "1px solid rgba(100,116,139,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge badge-cancelled" style={{ fontSize: 10 }}>CANCELLED</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#94a3b8" }}>{countCancelled}</span>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Batal</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// ─── Knowledge, Workshops, Pesanan, ChatLogs, Access pages ────────────────────

function KnowledgePage() {
  const [knowledges, setKnowledges] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<KnowledgeBase | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const emptyForm = { keywords: "", jawaban_utama: "", pilihan_jawaban: [] as PilihanJawaban[], keterangan: "" };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/knowledge");
    setKnowledges(await r.json());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(emptyForm); setAdding(true); setEditing(null); };
  const openEdit = (k: KnowledgeBase) => {
    setForm({ keywords: k.keywords, jawaban_utama: k.jawaban_utama, pilihan_jawaban: k.pilihan_jawaban ?? [], keterangan: k.keterangan ?? "" });
    setEditing(k); setAdding(false);
  };
  const save = async () => {
    setSaving(true);
    const payload = { ...form, pilihan_jawaban: form.pilihan_jawaban.length ? form.pilihan_jawaban : null, edited_by: "superadmin" };
    if (editing) await fetch(`/api/knowledge/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    else await fetch("/api/knowledge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false); setAdding(false); setEditing(null); load();
  };
  const del = async (id: number) => { if (!confirm("Hapus?")) return; await fetch(`/api/knowledge/${id}`, { method: "DELETE" }); load(); };
  const addChoice = () => setForm(f => ({ ...f, pilihan_jawaban: [...f.pilihan_jawaban, { opsi: "", jawaban: "" }] }));
  const updateChoice = (i: number, field: "opsi" | "jawaban", val: string) => setForm(f => ({ ...f, pilihan_jawaban: f.pilihan_jawaban.map((p, idx) => idx === i ? { ...p, [field]: val } : p) }));
  const removeChoice = (i: number) => setForm(f => ({ ...f, pilihan_jawaban: f.pilihan_jawaban.filter((_, idx) => idx !== i) }));

  const filtered = knowledges.filter(k => !search || k.keywords.toLowerCase().includes(search.toLowerCase()) || k.jawaban_utama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Knowledge Base</h2><p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{knowledges.length} entri tersimpan</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={load}><Icons.Refresh /></button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Icons.Plus /> Tambah</button>
        </div>
      </div>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}><Icons.Search /></span>
        <input className="input" style={{ paddingLeft: 36 }} placeholder="Cari keyword atau jawaban..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}</div> : (
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>#</th><th>Keywords</th><th>Jawaban Utama</th><th>Pilihan</th><th>Catatan</th><th style={{ width: 90 }}>Aksi</th></tr></thead>
              <tbody>
                {filtered.map(k => (
                  <tr key={k.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{k.id}</td>
                    <td><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{k.keywords.split(",").map(kw => <span key={kw} className="badge badge-form" style={{ fontSize: 10 }}>{kw.trim()}</span>)}</div></td>
                    <td style={{ maxWidth: 300 }}><p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{k.jawaban_utama}</p></td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{k.pilihan_jawaban?.length ?? 0} opsi</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{k.keterangan ?? "—"}</td>
                    <td><div style={{ display: "flex", gap: 6 }}><button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(k)}><Icons.Edit /></button><button className="btn btn-danger btn-sm btn-icon" onClick={() => del(k.id)}><Icons.Trash /></button></div></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Belum ada data</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {(adding || !!editing) && (
        <Modal title={editing ? "Edit Knowledge" : "Tambah Knowledge"} onClose={() => { setAdding(false); setEditing(null); }} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Keywords (pisah dengan koma)" required><input className="input" placeholder="harga, biaya, berapa harga..." value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))} /></Field>
            <Field label="Jawaban Utama" required><textarea className="input" rows={4} value={form.jawaban_utama} onChange={e => setForm(f => ({ ...f, jawaban_utama: e.target.value }))} /></Field>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Pilihan Jawaban (Opsional)</label>
                <button className="btn btn-secondary btn-sm" onClick={addChoice}><Icons.Plus /> Tambah Opsi</button>
              </div>
              {form.pilihan_jawaban.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input className="input" style={{ width: 120 }} placeholder="Label opsi" value={p.opsi} onChange={e => updateChoice(i, "opsi", e.target.value)} />
                  <input className="input" placeholder="Jawaban untuk opsi ini..." value={p.jawaban} onChange={e => updateChoice(i, "jawaban", e.target.value)} />
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeChoice(i)}><Icons.Trash /></button>
                </div>
              ))}
            </div>
            <Field label="Catatan Internal"><input className="input" placeholder="Catatan untuk admin..." value={form.keterangan} onChange={e => setForm(f => ({ ...f, keterangan: e.target.value }))} /></Field>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving || !form.keywords || !form.jawaban_utama}><Icons.Save /> {saving ? "Menyimpan..." : "Simpan"}</button>
              <button className="btn btn-secondary" onClick={() => { setAdding(false); setEditing(null); }}>Batal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const emptyForm = { nama_workshop: "", tanggal: "", harga_normal: "", harga_promo: "", fasilitas: "", status: "ACTIVE" };
  const [form, setForm] = useState(emptyForm);
  const STATUS_OPTS = [{ value: "ACTIVE", label: "✓ Aktif", color: "#34d399" }, { value: "UPCOMING", label: "◷ Upcoming", color: "#fbbf24" }, { value: "CLOSED", label: "✕ Tutup", color: "#94a3b8" }];

  const load = useCallback(async () => { setLoading(true); const r = await fetch("/api/workshops"); setWorkshops(await r.json()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const openAdd = () => { setForm(emptyForm); setAdding(true); setEditing(null); };
  const openEdit = (w: Workshop) => { setForm({ nama_workshop: w.nama_workshop, tanggal: w.tanggal, harga_normal: w.harga_normal ?? "", harga_promo: w.harga_promo ?? "", fasilitas: w.fasilitas ?? "", status: w.status }); setEditing(w); setAdding(false); };
  const save = async () => {
    setSaving(true);
    const payload = { ...form, edited_by: "superadmin" };
    if (editing) await fetch(`/api/workshops/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    else await fetch("/api/workshops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false); setAdding(false); setEditing(null); load();
  };
  const del = async (id: number) => { if (!confirm("Hapus?")) return; await fetch(`/api/workshops/${id}`, { method: "DELETE" }); load(); };

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Workshops</h2><p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{workshops.length} workshop terdaftar</p></div>
        <div style={{ display: "flex", gap: 8 }}><button className="btn btn-secondary btn-sm" onClick={load}><Icons.Refresh /></button><button className="btn btn-primary btn-sm" onClick={openAdd}><Icons.Plus /> Tambah</button></div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? <div style={{ padding: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />)}</div> : (
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>#</th><th>Nama Workshop</th><th>Tanggal</th><th>Harga Normal</th><th>Harga Promo</th><th>Fasilitas</th><th>Status</th><th style={{ width: 90 }}>Aksi</th></tr></thead>
              <tbody>
                {workshops.map(w => (
                  <tr key={w.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{w.id}</td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{w.nama_workshop}</td>
                    <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(w.tanggal)}</td>
                    <td>{w.harga_normal ? <span style={{ fontWeight: 600 }}>{w.harga_normal}</span> : "—"}</td>
                    <td>{w.harga_promo ? <span style={{ color: "#34d399", fontWeight: 600 }}>{w.harga_promo}</span> : "—"}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12, maxWidth: 200 }}><span style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{w.fasilitas ?? "—"}</span></td>
                    <td><span className={`badge ${w.status === "ACTIVE" ? "badge-active" : w.status === "UPCOMING" ? "badge-upcoming" : "badge-closed"}`}>{w.status}</span></td>
                    <td><div style={{ display: "flex", gap: 6 }}><button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(w)}><Icons.Edit /></button><button className="btn btn-danger btn-sm btn-icon" onClick={() => del(w.id)}><Icons.Trash /></button></div></td>
                  </tr>
                ))}
                {workshops.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Belum ada workshop</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {(adding || !!editing) && (
        <Modal title={editing ? "Edit Workshop" : "Tambah Workshop"} onClose={() => { setAdding(false); setEditing(null); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Nama Workshop" required><input className="input" placeholder="Workshop Animal Pot - Juli 2026" value={form.nama_workshop} onChange={e => setForm(f => ({ ...f, nama_workshop: e.target.value }))} /></Field>
            <Field label="Tanggal" required><input className="input" type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Harga Normal"><input className="input" placeholder="Rp 100.000" value={form.harga_normal} onChange={e => setForm(f => ({ ...f, harga_normal: e.target.value }))} /></Field>
              <Field label="Harga Promo"><input className="input" placeholder="Rp 90.000" value={form.harga_promo} onChange={e => setForm(f => ({ ...f, harga_promo: e.target.value }))} /></Field>
            </div>
            <Field label="Fasilitas"><textarea className="input" rows={3} placeholder="Alat rajut, yarn, pola, sertifikat..." value={form.fasilitas} onChange={e => setForm(f => ({ ...f, fasilitas: e.target.value }))} /></Field>
            <Field label="Status"><CustomSelect value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={STATUS_OPTS} /></Field>
            <div style={{ display: "flex", gap: 8 }}><button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving}><Icons.Save /> {saving ? "Menyimpan..." : "Simpan"}</button><button className="btn btn-secondary" onClick={() => { setAdding(false); setEditing(null); }}>Batal</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PesananPage({ onCreateInvoiceFromPesanan }: { onCreateInvoiceFromPesanan: (p: Pesanan) => void }) {
  const [pesanan, setPesanan] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); const r = await fetch("/api/pesanan"); setPesanan(await r.json()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Pesanan (Pre-order)</h2><p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Dari chatbot Instagram — klik "Buat Invoice" untuk memproses</p></div>
        <button className="btn btn-secondary btn-sm" onClick={load}><Icons.Refresh /></button>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? <div style={{ padding: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />)}</div> : (
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>#</th><th>Nama</th><th>Produk</th><th>No HP</th><th>Alamat</th><th>Waktu</th><th style={{ width: 130 }}>Aksi</th></tr></thead>
              <tbody>
                {pesanan.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{p.id}</td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.nama}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{p.produk}</td>
                    <td style={{ fontSize: 12, fontFamily: "monospace" }}>{p.no_hp}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 160 }}><span style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{p.alamat}</span></td>
                    <td style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtDate(p.created_at)}</td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => onCreateInvoiceFromPesanan(p)}><Icons.Receipt /> Buat Invoice</button></td>
                  </tr>
                ))}
                {pesanan.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Belum ada pesanan</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatLogsPage() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ChatLog | null>(null);
  const [search, setSearch] = useState("");
  const load = useCallback(async () => { setLoading(true); const r = await fetch("/api/chat-logs"); setLogs(await r.json()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const filtered = logs.filter(l => !search || l.user_message.toLowerCase().includes(search.toLowerCase()) || l.sender_id.includes(search));
  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Chat Logs</h2><p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{logs.length} percakapan tercatat</p></div>
        <button className="btn btn-secondary btn-sm" onClick={load}><Icons.Refresh /></button>
      </div>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}><Icons.Search /></span>
        <input className="input" style={{ paddingLeft: 36 }} placeholder="Cari pesan atau sender ID..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? <div style={{ padding: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />)}</div> : (
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>Sender</th><th>Pesan User</th><th>Intent</th><th>Waktu</th><th style={{ width: 60 }}>Detail</th></tr></thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td><code style={{ fontSize: 11, color: "#22d3ee" }}>{l.sender_id.slice(0, 16)}...</code></td>
                    <td style={{ maxWidth: 280, fontSize: 13 }}><span style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{l.user_message}</span></td>
                    <td><span className={`badge ${l.intent === "AI_GEMINI" ? "badge-ai" : l.intent === "FORM_REGISTRATION" ? "badge-form" : "badge-start"}`}>{l.intent}</span></td>
                    <td style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtDate(l.created_at)}</td>
                    <td><button className="btn btn-secondary btn-sm btn-icon" onClick={() => setSelected(l)}><Icons.Eye /></button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Belum ada log</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selected && (
        <Modal title="Detail Chat Log" onClose={() => setSelected(null)} wide>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--bg-card-2)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)" }}>Sender: <code style={{ color: "#22d3ee" }}>{selected.sender_id}</code> • {fmtDate(selected.created_at)}</div>
            <div><p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Pesan User</p><div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", fontSize: 13, lineHeight: 1.6 }}>{selected.user_message}</div></div>
            <div><p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Respons Bot</p><div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selected.bot_response}</div></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AccessPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "admin" });
  const load = useCallback(async () => { setLoading(true); const r = await fetch("/api/admin-users"); if (r.ok) setUsers(await r.json()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const addUser = async () => {
    setSaving(true);
    await fetch("/api/admin-users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false); setAdding(false); load();
  };
  const del = async (id: number) => { if (!confirm("Hapus user ini?")) return; await fetch(`/api/admin-users/${id}`, { method: "DELETE" }); load(); };
  const ROLE_OPTS = [{ value: "admin", label: "👤 Admin" }, { value: "superadmin", label: "⭐ Superadmin" }];
  return (
    <div className="animate-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Access Control</h2><p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Kelola akun admin panel</p></div>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Icons.Plus /> Tambah User</button>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? <div style={{ padding: 20 }}><div className="skeleton" style={{ height: 52 }} /></div> : (
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>#</th><th>Username</th><th>Role</th><th>Dibuat</th><th style={{ width: 70 }}>Aksi</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{u.id}</td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.username}</td>
                    <td><span className={`badge ${u.role === "superadmin" ? "badge-ai" : "badge-form"}`}>{u.role === "superadmin" ? "⭐ Superadmin" : "👤 Admin"}</span></td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(u.created_at)}</td>
                    <td>{u.role !== "superadmin" && <button className="btn btn-danger btn-sm btn-icon" onClick={() => del(u.id)}><Icons.Trash /></button>}</td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Tidak ada data</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {adding && (
        <Modal title="Tambah Admin User" onClose={() => setAdding(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Username" required><input className="input" placeholder="username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></Field>
            <Field label="Password" required><input className="input" type="password" placeholder="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></Field>
            <Field label="Role"><CustomSelect value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} options={ROLE_OPTS} /></Field>
            <div style={{ display: "flex", gap: 8 }}><button className="btn btn-primary" style={{ flex: 1 }} onClick={addUser} disabled={saving}><Icons.Save /> {saving ? "..." : "Tambah"}</button><button className="btn btn-secondary" onClick={() => setAdding(false)}>Batal</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    if (r.ok) onLogin();
    else { const d = await r.json(); setError(d.error ?? "Login gagal"); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg,rgba(56,189,248,0.15),rgba(6,182,212,0.1))", border: "1px solid rgba(56,189,248,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 30px rgba(14,165,233,0.25)" }}>
            <img src="/Logo_DynoBoo.png" alt="DynoBoo" style={{ height: 54, objectFit: "contain" }} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>DynoBoo</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Admin Panel — Semi POS Digital</p>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Username"><input className="input" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="superadmin" /></Field>
            <Field label="Password">
              <div style={{ position: "relative" }}>
                <input className="input" type={showPass ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                  {showPass ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
              </div>
            </Field>
            {error && <p style={{ color: "#f87171", fontSize: 12, background: "rgba(239,68,68,0.08)", padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)" }}>{error}</p>}
            <button className="btn btn-primary" type="submit" style={{ justifyContent: "center", padding: "11px" }} disabled={loading}>{loading ? "Masuk..." : "Masuk"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Notification types ─────────────────────────────────────────────────────────
type Notif = { id: string; type: "pesanan" | "stok" | "invoice" | "info"; title: string; body: string; time: Date; read: boolean; };

const NOTIF_ICONS: Record<Notif["type"], string> = {
  pesanan: "🛒", stok: "📦", invoice: "🧾", info: "ℹ️",
};
const NOTIF_COLORS: Record<Notif["type"], string> = {
  pesanan: "#f59e0b", stok: "#f87171", invoice: "#38bdf8", info: "#a78bfa",
};

type NotifBellProps = {
  notifs: Notif[]; setNotifs: React.Dispatch<React.SetStateAction<Notif[]>>;
  notifOpen: boolean; setNotifOpen: (v: boolean) => void;
  onNavigate: (page: Page) => void;
};

function NotifBell({ notifs, setNotifs, notifOpen, setNotifOpen, onNavigate }: NotifBellProps) {
  const unread = notifs.filter(n => !n.read).length;

  // Auto-fetch notifications on mount and every 60s
  useEffect(() => {
    const fetchNotifs = async () => {
      const newNotifs: Notif[] = [];
      try {
        // Check new pesanan (chatbot pre-orders)
        const pr = await fetch("/api/pesanan");
        if (pr.ok) {
          const pesanan = await pr.json();
          if (pesanan.length > 0) {
            newNotifs.push({
              id: "pesanan-new",
              type: "pesanan",
              title: `${pesanan.length} Pesanan Pre-order Masuk`,
              body: `Terbaru: ${pesanan[0]?.nama ?? "Customer"} — ${pesanan[0]?.produk ?? ""}`,
              time: new Date(pesanan[0]?.created_at ?? Date.now()),
              read: false,
            });
          }
        }
        // Check low stock
        const sr = await fetch("/api/stocks");
        if (sr.ok) {
          const stocks = await sr.json();
          const low = stocks.filter((s: { qty_available: number; item?: { is_active: boolean } }) =>
            s.qty_available <= 3 && s.item?.is_active);
          if (low.length > 0) {
            newNotifs.push({
              id: "stok-low",
              type: "stok",
              title: `${low.length} Item Stok Kritis (≤ 3)`,
              body: low.slice(0, 3).map((s: { item?: { nama: string }; qty_available: number }) =>
                `${s.item?.nama ?? "Item"}: ${s.qty_available} tersisa`).join(" • "),
              time: new Date(),
              read: false,
            });
          }
        }
        // Check unpaid invoices
        const ir = await fetch("/api/invoices?status=UNPAID");
        if (ir.ok) {
          const inv = await ir.json();
          if (inv.length > 0) {
            newNotifs.push({
              id: "invoice-unpaid",
              type: "invoice",
              title: `${inv.length} Invoice Belum Dibayar`,
              body: `Total tagihan pending perlu tindak lanjut segera.`,
              time: new Date(),
              read: false,
            });
          }
        }
      } catch { /* silent */ }
      if (newNotifs.length > 0) {
        setNotifs(prev => {
          // Merge: keep old reads, add new
          const ids = prev.map(n => n.id);
          const merged = [...prev.filter(n => n.read)];
          for (const n of newNotifs) {
            const existing = prev.find(p => p.id === n.id);
            merged.push(existing && existing.read ? { ...n, read: true } : n);
          }
          return merged;
        });
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60_000);
    return () => clearInterval(interval);
  }, [setNotifs]);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearAll = () => setNotifs([]);

  const handleNotifClick = (n: Notif) => {
    markRead(n.id);
    if (n.type === "pesanan") onNavigate("pesanan");
    else if (n.type === "stok") onNavigate("stok");
    else if (n.type === "invoice") onNavigate("invoice-list");
  };

  const timeAgo = (d: Date) => {
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 1) return "Baru saja";
    if (diff < 60) return `${diff} mnt lalu`;
    return `${Math.floor(diff / 60)} jam lalu`;
  };

  return (
    <>
      {/* Bell button */}
      <div style={{ position: "relative" }}>
        <button
          className="theme-btn"
          onClick={() => setNotifOpen(!notifOpen)}
          title="Notifikasi"
          style={{ position: "relative" }}
        >
          {/* Bell icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unread > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4,
              width: 8, height: 8, borderRadius: "50%",
              background: "#f87171",
              border: "1.5px solid var(--bg-card)",
              animation: "pulse-ring 2s infinite",
            }} />
          )}
        </button>
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -2, right: -2,
            minWidth: 16, height: 16, borderRadius: 8,
            background: "linear-gradient(135deg,#ef4444,#f87171)",
            color: "white", fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px", pointerEvents: "none",
            border: "1.5px solid var(--bg-card)",
          }}>{unread > 9 ? "9+" : unread}</span>
        )}
      </div>

      {/* Slide-in notification panel */}
      <div style={{
        position: "fixed", top: 56, right: 0, bottom: 0, zIndex: 500,
        width: notifOpen ? 340 : 0,
        overflow: "hidden",
        transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: notifOpen ? "auto" : "none",
      }}>
        <div style={{
          width: 340, height: "100%",
          background: "var(--bg-sidebar)",
          borderLeft: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.3)",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 18px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(135deg,rgba(56,189,248,0.08),rgba(6,182,212,0.04))",
            flexShrink: 0,
          }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                🔔 Notifikasi
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {unread > 0 ? `${unread} belum dibaca` : "Semua sudah dibaca"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {unread > 0 && (
                <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={markAllRead}>
                  ✓ Baca Semua
                </button>
              )}
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setNotifOpen(false)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {notifs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>🔕</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>Tidak ada notifikasi</p>
                <p style={{ fontSize: 12, marginTop: 4, color: "var(--text-subtle)" }}>
                  Notifikasi pesanan, stok, dan invoice akan muncul di sini
                </p>
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  style={{
                    padding: "12px 18px", cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                    background: n.read ? "transparent" : `${NOTIF_COLORS[n.type]}08`,
                    transition: "background 0.15s",
                    display: "flex", gap: 12, alignItems: "flex-start",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = n.read ? "transparent" : `${NOTIF_COLORS[n.type]}08`)}
                >
                  {/* Icon badge */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `${NOTIF_COLORS[n.type]}18`,
                    border: `1px solid ${NOTIF_COLORS[n.type]}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}>{NOTIF_ICONS[n.type]}</div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <p style={{
                        fontSize: 13, fontWeight: n.read ? 500 : 700,
                        color: "var(--text-primary)", lineHeight: 1.3,
                      }}>{n.title}</p>
                      {!n.read && (
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: NOTIF_COLORS[n.type], flexShrink: 0, marginTop: 4 }} />
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>{n.body}</p>
                    <p style={{ fontSize: 10, color: "var(--text-subtle)", marginTop: 6 }}>{timeAgo(n.time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
              <button className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center", fontSize: 12 }} onClick={clearAll}>
                🗑 Hapus Semua Notifikasi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Thin transparent backdrop to close on outside click (non-blocking) */}
      {notifOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 499 }}
          onClick={() => setNotifOpen(false)}
        />
      )}
    </>
  );
}


// ─── Main App ──────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<number | null>(null);
  const [prefillPesanan, setPrefillPesanan] = useState<Pesanan | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);

  useEffect(() => {
    const check = async () => {
      const r = await fetch("/api/auth");
      setIsLoggedIn(r.ok);
      setCheckingAuth(false);
    };
    check();
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.remove("light");
    else document.documentElement.classList.add("light");
  }, [darkMode]);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setIsLoggedIn(false);
  };

  const handleNavigate = (page: Page, data?: unknown) => {
    if (page === "manual") {
      window.open("/manual", "_blank");
      return;
    }
    if (page === "invoice-form" && data) setPrefillPesanan(data as Pesanan);
    else if (page === "invoice-form") setPrefillPesanan(null);
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const goToInvoiceDetail = (id: number) => { setCurrentInvoiceId(id); setCurrentPage("invoice-detail"); setMobileMenuOpen(false); };
  const goToInvoiceForm = () => { setPrefillPesanan(null); setCurrentPage("invoice-form"); setMobileMenuOpen(false); };
  const createInvoiceFromPesanan = (p: Pesanan) => { setPrefillPesanan(p); setCurrentPage("invoice-form"); setMobileMenuOpen(false); };
  const handleInvoiceCreated = (id: number) => { setCurrentPage("invoice-detail"); setCurrentInvoiceId(id); setMobileMenuOpen(false); };

  if (checkingAuth) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(56,189,248,0.3)", borderTopColor: "#38bdf8", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Memuat...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;

  const PAGE_TITLES: Record<Page, string> = {
    dashboard: "Dashboard", katalog: "Katalog Produk", stok: "Stok & Kuota",
    "invoice-list": "Daftar Invoice", "invoice-form": "Buat Invoice",
    "invoice-detail": "Detail Invoice", "invoice-types": "Tipe Invoice",
    knowledge: "Knowledge Base", workshops: "Workshops",
    pesanan: "Pesanan", chatlogs: "Chat Logs",
    company: "Profil Toko", access: "Access Control", "ai-assistant": "AI Assistant",
    manual: "Buku Panduan",
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard": return <DashboardPage onNavigate={handleNavigate} />;
      case "katalog": return <KatalogPage />;
      case "stok": return <StokPage />;
      case "invoice-list": return <InvoiceListPage onViewInvoice={goToInvoiceDetail} onCreateInvoice={goToInvoiceForm} />;
      case "invoice-form": return <InvoiceFormPage onSuccess={handleInvoiceCreated} onCancel={() => setCurrentPage("invoice-list")} prefillPesanan={prefillPesanan} />;
      case "invoice-detail": return currentInvoiceId ? <InvoiceDetailPage invoiceId={currentInvoiceId} onBack={() => setCurrentPage("invoice-list")} /> : null;
      case "invoice-types": return <InvoiceTypesPage />;
      case "knowledge": return <KnowledgePage />;
      case "workshops": return <WorkshopsPage />;
      case "pesanan": return <PesananPage onCreateInvoiceFromPesanan={createInvoiceFromPesanan} />;
      case "chatlogs": return <ChatLogsPage />;
      case "company": return <CompanyPage />;
      case "access": return <AccessPage />;
      case "ai-assistant": return <AiAssistantPage />;
      default: return null;
    }
  };

  return (
    <div className={`admin-layout ${darkMode ? "" : "light"}`}>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999 }} onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img src="/Logo_DynoBoo.png" alt="DynoBoo" style={{ height: 26, objectFit: "contain" }} />
            </div>
            <div>
              <p className="gradient-text" style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>DynoBoo</p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>Admin Panel</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm btn-icon" style={{ display: "none" }} onClick={() => setMobileMenuOpen(false)}>
            <Icons.X />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <SidebarGroup
              key={group.key}
              group={group}
              currentPage={currentPage}
              onNavigate={handleNavigate}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="nav-item" style={{ width: "100%", color: "#f87171" }} onClick={logout}>
            <Icons.Logout /><span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="theme-btn mobile-menu-btn" style={{ display: "none" }} onClick={() => setMobileMenuOpen(m => !m)}>
              <span style={{ fontSize: 16 }}>☰</span>
            </button>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{PAGE_TITLES[currentPage]}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Theme toggle */}
            <button className="theme-btn" onClick={() => setDarkMode(d => !d)} title="Toggle theme">
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>

            {/* Notification Bell */}
            <NotifBell notifs={notifs} setNotifs={setNotifs} notifOpen={notifOpen} setNotifOpen={setNotifOpen} onNavigate={handleNavigate} />

            <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 2px" }} />
            <div style={{ padding: "4px 12px", borderRadius: 6, background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)", fontSize: 12, color: "#38bdf8", fontWeight: 600 }}>superadmin</div>
          </div>
        </div>

        {/* Page content */}
        <main className="page-content">
          {renderPage()}
        </main>
      </div>

      {/* ── Floating AI Chat Bubble ───────────────────────────────────────── */}
      {aiOpen && (
        <div className="ai-chat-panel" style={{
          position: "fixed", bottom: 88, right: 24, zIndex: 9998,
          width: 380, height: 560,
          background: "var(--bg-card)", border: "1px solid var(--border-2)",
          borderRadius: 18, boxShadow: "0 16px 60px rgba(0,0,0,0.55)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "chatBubbleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          {/* Panel header */}
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid var(--border)",
            background: "linear-gradient(135deg,rgba(2,132,199,0.2),rgba(6,182,212,0.12))",
            display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#0284c7,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🦖</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", lineHeight: 1 }}>AI Assistant DynoBoo</p>
              <p style={{ fontSize: 10, color: "#38bdf8", marginTop: 2 }}>Powered by Gemini ✨</p>
            </div>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setAiOpen(false)}><Icons.X /></button>
          </div>
          {/* Chat content */}
          <div style={{ flex: 1, overflow: "hidden", padding: "0 4px 4px" }}>
            <AiAssistantPage />
          </div>
        </div>
      )}

      {/* Bubble button */}
      <button
        onClick={() => setAiOpen(o => !o)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: "50%", border: "none",
          background: aiOpen ? "linear-gradient(135deg,#0284c7,#06b6d4)" : "linear-gradient(135deg,#0ea5e9,#06b6d4)",
          boxShadow: "0 4px 24px rgba(14,165,233,0.55)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          transform: aiOpen ? "rotate(180deg) scale(1.05)" : "rotate(0deg) scale(1)",
        }}
        title={aiOpen ? "Tutup AI Assistant" : "Buka AI Assistant"}
      >
        {aiOpen ? "✕" : "🦖"}
      </button>

      <style>{`
        @keyframes chatBubbleIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); transform-origin: bottom right; }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}