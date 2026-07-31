"use client";
import { useState, useCallback, useEffect } from "react";
import type { CompanyProfile } from "@/lib/supabase";
import { Icons, Field, fmtRp } from "./ui";

type RekeningItem = { bank: string; no_rek: string; atas_nama: string };

export default function CompanyPage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [form, setForm] = useState({
    nama_toko: "", tagline: "", alamat: "", kota: "", no_hp: "", email: "", instagram: "", logo_url: "",
    rekening: [] as RekeningItem[],
  });

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/company");
    if (r.ok) {
      const data: CompanyProfile | null = await r.json();
      if (data) {
        setProfile(data);
        setForm({
          nama_toko: data.nama_toko ?? "",
          tagline: data.tagline ?? "",
          alamat: data.alamat ?? "",
          kota: data.kota ?? "",
          no_hp: data.no_hp ?? "",
          email: data.email ?? "",
          instagram: data.instagram ?? "",
          logo_url: data.logo_url ?? "",
          rekening: (data.rekening as RekeningItem[]) ?? [],
        });
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.nama_toko.trim()) {
      showToast("Nama toko tidak boleh kosong!", "err");
      return;
    }
    setSaving(true);
    const r = await fetch("/api/company", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      showToast("✓ Profil toko berhasil disimpan!");
      load();
    } else {
      const d = await r.json();
      showToast(d.error ?? "Gagal menyimpan profil toko", "err");
    }
    setSaving(false);
  };

  const addRek = () => setForm(f => ({ ...f, rekening: [...f.rekening, { bank: "", no_rek: "", atas_nama: "" }] }));
  const updateRek = (i: number, field: keyof RekeningItem, val: string) => {
    setForm(f => ({ ...f, rekening: f.rekening.map((r, idx) => idx === i ? { ...r, [field]: val } : r) }));
  };
  const removeRek = (i: number) => setForm(f => ({ ...f, rekening: f.rekening.filter((_, idx) => idx !== i) }));

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Memuat profil toko...</div>;

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
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Profil Toko</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Identitas toko yang tampil di header invoice cetak</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          <Icons.Save /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>Identitas Toko</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Nama Toko" required><input className="input" value={form.nama_toko} onChange={e => setForm(f => ({ ...f, nama_toko: e.target.value }))} placeholder="DynoBoo" /></Field>
              <Field label="Tagline"><input className="input" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Handmade Crochet Dolls & Beaded Accessories" /></Field>
              <Field label="Kota"><input className="input" value={form.kota} onChange={e => setForm(f => ({ ...f, kota: e.target.value }))} placeholder="Jakarta, Indonesia" /></Field>
              <Field label="Alamat Lengkap"><textarea className="input" rows={2} value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} placeholder="Jl. ..." /></Field>
              <Field label="URL Logo (opsional)"><input className="input" value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." /></Field>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>Kontak</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="No HP / WhatsApp"><input className="input" value={form.no_hp} onChange={e => setForm(f => ({ ...f, no_hp: e.target.value }))} placeholder="08xxxxxxxxxx" /></Field>
              <Field label="Email"><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="dynoboo@email.com" /></Field>
              <Field label="Instagram"><input className="input" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} placeholder="@dynoboo" /></Field>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Rekening Pembayaran</p>
              <button className="btn btn-secondary btn-sm" onClick={addRek}><Icons.Plus /> Tambah</button>
            </div>
            {form.rekening.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Belum ada rekening. Klik + Tambah.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {form.rekening.map((rek, i) => (
                  <div key={i} style={{ padding: 14, borderRadius: 8, background: "var(--bg-card-2)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Rekening #{i + 1}</span>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeRek(i)}><Icons.Trash /></button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input className="input" placeholder="Nama Bank (BCA, BRI, Mandiri...)" value={rek.bank} onChange={e => updateRek(i, "bank", e.target.value)} />
                      <input className="input" placeholder="Nomor Rekening" value={rek.no_rek} onChange={e => updateRek(i, "no_rek", e.target.value)} style={{ fontFamily: "monospace" }} />
                      <input className="input" placeholder="Atas Nama" value={rek.atas_nama} onChange={e => updateRek(i, "atas_nama", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>Preview di Invoice</p>
            <div style={{ padding: 16, borderRadius: 8, background: "white", border: "1px solid #e2e8f0", color: "#1e293b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 10, color: "#6ca0a8", fontWeight: 600, marginBottom: 2 }}>Bill To :</p>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>Nama Konsumen</p>
                  <p style={{ fontSize: 11, color: "#6ca0a8", marginTop: 8 }}>Type : <strong>Invoice Workshop</strong></p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <img
                    src={form.logo_url || "/Logo_DynoBoo.png"}
                    alt="Logo"
                    style={{ maxHeight: 60, maxWidth: 120, objectFit: "contain" }}
                    onError={e => { (e.target as HTMLImageElement).src = "/Logo_DynoBoo.png"; }}
                  />
                  <p style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>{form.tagline || "CROCHET DOLLS & BEADED ACCESSORIES"}</p>
                </div>
                <div style={{ textAlign: "right", fontSize: 11, color: "#475569" }}>
                  <p>Invoice Date : <strong>{new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</strong></p>
                  <p>Invoice No : <strong style={{ fontFamily: "monospace" }}>DNB-WSP-2608-0001</strong></p>
                </div>
              </div>
              <hr style={{ margin: "12px 0", borderColor: "#e2e8f0" }} />
              <p style={{ fontSize: 10, color: "#94a3b8", textAlign: "center" }}>{form.nama_toko} {form.instagram && `• ${form.instagram}`} {form.no_hp && `• ${form.no_hp}`}</p>
            </div>
          </div>

          {/* Save button (bottom) */}
          <button className="btn btn-primary" style={{ justifyContent: "center", padding: "12px" }} onClick={save} disabled={saving}>
            <Icons.Save /> {saving ? "Menyimpan..." : "Simpan Semua Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
