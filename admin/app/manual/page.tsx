"use client";
import React from "react";
import Image from "next/image";

export default function ManualBookPage() {
  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "#f8fafc", fontFamily: "sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Background Animated Blobs */}
      <div style={{ position: "absolute", top: -150, left: -100, width: 500, height: 500, background: "rgba(56,189,248,0.15)", filter: "blur(100px)", borderRadius: "50%", animation: "float 10s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: -100, right: -100, width: 400, height: 400, background: "rgba(14,165,233,0.1)", filter: "blur(80px)", borderRadius: "50%", animation: "float 8s ease-in-out infinite reverse" }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 900, margin: "0 auto", padding: "60px 20px" }}>
        
        {/* Header Glassmorphism */}
        <div style={{ textAlign: "center", background: "rgba(30,41,59,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: "50px 30px", marginBottom: 40, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
          <div style={{ width: 80, height: 80, margin: "0 auto 20px", borderRadius: 20, background: "linear-gradient(135deg, #0ea5e9, #0284c7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, boxShadow: "0 10px 30px rgba(14,165,233,0.4)" }}>
            🦖
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, background: "linear-gradient(to right, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Buku Panduan Penggunaan</h1>
          <p style={{ fontSize: 16, color: "#94a3b8", marginTop: 12, letterSpacing: "0.5px" }}>DynoBoo Admin Panel — Sistem Manajemen Cerdas</p>
          
          <button 
            onClick={() => window.print()}
            style={{ marginTop: 30, padding: "12px 28px", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, transition: "all 0.3s", boxShadow: "0 8px 25px rgba(14,165,233,0.3)" }}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            className="print-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Export to PDF
          </button>
        </div>

        {/* Content Modules */}
        <div style={{ display: "grid", gap: 24 }}>
          
          <Section num="1" title="Halaman Dashboard Utama">
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: 16 }}>Dashboard adalah halaman pertama yang Anda lihat setelah login. Halaman ini memberikan ringkasan singkat tentang aktivitas bisnis Anda secara real-time.</p>
            <ul style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 1.8 }}>
              <li><strong style={{ color: "#e2e8f0" }}>Statistik Ringkas:</strong> Memonitor total pendapatan, jumlah tagihan (invoice) bulan ini, dan total invoice yang belum terbayar.</li>
              <li><strong style={{ color: "#e2e8f0" }}>Aksi Cepat POS:</strong> Tombol akses cepat (shortcut) untuk membuat pesanan baru dan bertanya pada AI.</li>
              <li><strong style={{ color: "#e2e8f0" }}>Tabel Transaksi:</strong> Pantauan langsung status pembayaran (LUNAS, DP, BELUM BAYAR).</li>
            </ul>
          </Section>

          <Section num="2" title="Manajemen Katalog & Stok">
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: 16 }}>Kelola seluruh data produk, layanan, dan inventaris Anda di satu tempat yang tersinkronisasi.</p>
            <ul style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 1.8 }}>
              <li><strong style={{ color: "#e2e8f0" }}>Katalog Produk:</strong> Tambahkan produk dengan informasi harga, gambar, dan kategori. Data ini akan langsung terhubung ke sistem kasir (POS).</li>
              <li><strong style={{ color: "#e2e8f0" }}>Peringatan Stok Tipis:</strong> Sistem pintar akan memberi indikator visual merah jika stok menipis (di bawah 10) agar Anda tidak pernah kehabisan barang.</li>
            </ul>
          </Section>

          <Section num="3" title="Invoice & Transaksi (POS)">
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: 16 }}>Ini adalah pusat pencatatan penjualan dan penerbitan faktur tagihan.</p>
            <ol style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 1.8 }}>
              <li>Buka menu <strong>Buat Invoice</strong>.</li>
              <li>Masukkan data Pelanggan (Nama, Email, WhatsApp).</li>
              <li>Pilih produk yang dipesan. Sistem otomatis menghitung total bayar.</li>
              <li>Setelah disimpan, Anda bisa langsung mencatat pembayaran (DP/Lunas).</li>
            </ol>
            <div style={{ marginTop: 16, padding: 16, background: "rgba(56,189,248,0.1)", borderRadius: 12, border: "1px solid rgba(56,189,248,0.2)" }}>
              <p style={{ color: "#38bdf8", margin: 0, fontSize: 14 }}>💡 <strong>Pro-Tip:</strong> Anda dapat membagikan invoice langsung via WhatsApp tanpa perlu mengetik ulang, atau mengirimkannya sebagai email resmi dengan template profesional bawaan!</p>
            </div>
          </Section>

          <Section num="4" title="AI Assistant DynoBoo (T-Rex)">
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: 16 }}>DynoBoo dilengkapi asisten AI pintar (Google Gemini) yang dirancang khusus untuk memandu dan menganalisa data Anda.</p>
            <ul style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 1.8 }}>
              <li><strong>Membuka AI:</strong> Klik ikon melayang 🦖 di pojok kanan bawah.</li>
              <li><strong>Fungsi:</strong> Tanyakan apa pun! Mulai dari "Bagaimana cara merestart stok?" hingga "Buatkan saya draft email promo untuk produk X".</li>
            </ul>
          </Section>

        </div>
      </div>
      
      {/* Print CSS hiding UI elements during print */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @media print {
          body { background: white !important; color: black !important; }
          .print-btn { display: none !important; }
          div { box-shadow: none !important; backdrop-filter: none !important; border: none !important; }
          * { background: transparent !important; color: black !important; -webkit-text-fill-color: black !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(30,41,59,0.5)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 32, transition: "transform 0.3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(14,165,233,0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>
          {num}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f8fafc", margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
