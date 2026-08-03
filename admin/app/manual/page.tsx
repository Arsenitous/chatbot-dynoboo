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
          <p style={{ fontSize: 16, color: "#94a3b8", marginTop: 12, letterSpacing: "0.5px" }}>DynoBoo Admin Panel — Logbook & Prosedur Operasional Standar</p>
          
          <button 
            onClick={() => window.print()}
            style={{ marginTop: 30, padding: "12px 28px", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, transition: "all 0.3s", boxShadow: "0 8px 25px rgba(14,165,233,0.3)" }}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            className="print-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Export to PDF / Cetak
          </button>
        </div>

        {/* Content Modules */}
        <div style={{ display: "grid", gap: 24 }}>
          
          <Section num="1" title="Pengenalan & Dashboard Utama">
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: 16 }}>
              Dashboard adalah pusat kontrol utama yang merangkum kesehatan bisnis DynoBoo secara *real-time*. Halaman ini difokuskan pada pemantauan metrik penjualan dan peringatan kritis.
            </p>
            <ol style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 1.8 }}>
              <li><strong>Membaca Metrik Statistik:</strong> Perhatikan 3 blok utama di bagian atas. 
                <br/>- <em>Total Pendapatan</em> menunjukkan akumulasi pembayaran yang sudah masuk (Lunas & DP) pada bulan berjalan.
                <br/>- <em>Tagihan Dibuat</em> menunjukkan jumlah total invoice yang diterbitkan.
                <br/>- <em>Belum Terbayar</em> adalah total sisa tagihan dari invoice yang berstatus DP atau Belum Bayar. Angka ini adalah piutang yang harus ditagih.
              </li>
              <li><strong>Peringatan Stok Tipis:</strong> Jika ada item dengan stok tersisa &le; 3 pcs, tabel peringatan stok tipis akan muncul otomatis di sebelah kanan metrik. Segera lakukan restock jika tabel ini muncul.</li>
              <li><strong>Aksi Cepat (Shortcut):</strong> Gunakan tombol "Buat Pesanan/Invoice Baru" untuk akses instan ke halaman pembuatan pesanan tanpa perlu menavigasi menu sebelah kiri.</li>
              <li><strong>Tabel Transaksi Terkini:</strong> Memantau 5 invoice terbaru. Anda bisa melihat status secara instan melalui kode warna (Hijau = Lunas, Kuning = DP, Merah = Belum Bayar).</li>
            </ol>
          </Section>

          <Section num="2" title="Manajemen Katalog Produk">
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: 16 }}>
              Katalog Produk adalah *master data* dari semua barang atau jasa yang Anda jual. Master data ini wajib diperbarui agar proses pembuatan invoice berjalan lancar.
            </p>
            <ol style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 1.8 }}>
              <li><strong>Membuat Tipe Item Baru (Kategori):</strong>
                <br/>- Buka menu <em>Katalog Produk</em>.
                <br/>- Pada pop-up "Tambah Item", klik tombol <strong>(+)</strong> di samping pilihan "Tipe Item".
                <br/>- Masukkan nama kategori (misal: "Boneka Crochet", "Aksesoris", "Workshop") dan pilih emoji sebagai ikon representatif.
                <br/>- Klik <em>Tambah Tipe Baru</em>.
              </li>
              <li><strong>Menambahkan Produk Baru ke Katalog:</strong>
                <br/>- Klik tombol <strong>+ Tambah Item Katalog</strong> di sudut kanan atas halaman Katalog.
                <br/>- Pilih <em>Tipe Item</em> dari dropdown.
                <br/>- Isi <em>Nama Item</em> secara spesifik (misal: "Boneka Beruang 15cm").
                <br/>- Masukkan <em>Harga Normal</em> (wajib) dan <em>Harga Promo</em> (jika ada). Jika Harga Promo diisi, sistem akan menggunakan harga ini pada saat transaksi.
                <br/>- Tentukan <em>Satuan</em> (Pcs, Set, Slot, Paket).
                <br/>- Klik <strong>Simpan Item</strong>.
              </li>
              <li><strong>Menonaktifkan Produk:</strong>
                <br/>- Jika produk sudah tidak diproduksi lagi namun Anda tidak ingin menghapus riwayatnya, klik tombol edit (ikon pensil).
                <br/>- Ubah status "Aktif" menjadi "Tutup/Nonaktif". Produk tersebut tidak akan bisa dipilih lagi saat pembuatan invoice.
              </li>
            </ol>
            <div style={{ marginTop: 16, padding: 16, background: "rgba(245,158,11,0.08)", borderRadius: 12, border: "1px solid rgba(245,158,11,0.25)" }}>
              <p style={{ color: "#f59e0b", margin: 0, fontSize: 14 }}>⚠️ <strong>Peringatan Hapus Tipe/Item:</strong> Menghapus Tipe Item akan membuat produk di dalamnya kehilangan kategori. Menghapus Produk akan <strong>secara permanen menghapus riwayat stoknya</strong>. Lakukan dengan hati-hati.</p>
            </div>
          </Section>

          <Section num="3" title="Manajemen Stok & Inventaris">
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: 16 }}>
              Modul ini untuk melacak jumlah barang fisik yang tersedia di toko. Produk yang baru dibuat di katalog <strong>tidak otomatis masuk ke stok</strong> sampai Anda menginisialisasinya.
            </p>
            <ol style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 1.8 }}>
              <li><strong>Inisialisasi Stok Awal (Untuk Produk Baru):</strong>
                <br/>- Buka menu <em>Stok & Kuota</em>.
                <br/>- Pada tabel "Item Belum Punya Stok", cari produk baru Anda dan klik tombol <strong>+ Inisialisasi Stok</strong>.
                <br/>- Masukkan jumlah barang aktual yang ada di tangan (misal: 10). Klik Simpan. Produk kini pindah ke tabel "Stok Tersedia".
              </li>
              <li><strong>Update Stok Fisik:</strong>
                <br/>- Pada tabel "Stok Tersedia", klik tombol edit (ikon pensil) di baris produk yang ingin diubah.
                <br/>- Pilih <strong>Mode Update</strong>:
                  <ul style={{ paddingLeft: 20, marginTop: 4, marginBottom: 4 }}>
                    <li><strong>Set Langsung:</strong> Mengubah jumlah stok menjadi angka spesifik (berguna untuk hasil *stock opname*).</li>
                    <li><strong>+ Tambah:</strong> Menambah stok masuk (barang baru jadi/masuk gudang).</li>
                    <li><strong>− Kurangi:</strong> Mengurangi stok (misal ada barang cacat/rusak di luar penjualan).</li>
                  </ul>
                <br/>- Perhatikan kotak biru <em>Preview Hasil</em> untuk memastikan angka akhir sudah benar sebelum menekan tombol Simpan.
              </li>
              <li><strong>Reset Stok:</strong>
                <br/>- Klik ikon tempat sampah (warna merah).
                <br/>- Tindakan ini akan memaksa sisa stok menjadi "0" <strong>tanpa menghapus riwayat angka penjualan (Terjual)</strong>. Cocok digunakan pada akhir sesi produksi besar jika barang ditarik.
              </li>
            </ol>
          </Section>

          <Section num="4" title="Transaksi, POS, dan Invoice">
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: 16 }}>
              Pusat kasir dan pencatatan tagihan. DynoBoo mendesain alurnya untuk menangani pembayaran lunas maupun bertahap (cicilan/DP).
            </p>
            <ol style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 1.8 }}>
              <li><strong>Membuat Pesanan (Draft):</strong>
                <br/>- Buka menu <em>Pesanan</em> lalu klik <strong>+ Buat Pesanan / Invoice</strong>.
                <br/>- Isi kelengkapan data Customer (Nama, Email, WhatsApp, Alamat).
                <br/>- Pada bagian "Item Pesanan", klik <strong>+ Tambah Item</strong>, pilih produk dari dropdown, dan tentukan kuantitasnya. Sistem akan menghitung subtotal secara otomatis berdasarkan harga normal/promo dari katalog.
                <br/>- (Opsional) Masukkan Diskon dalam bentuk nominal Rupiah.
                <br/>- Klik <strong>Simpan Pesanan</strong>. Status awal adalah <em>BELUM BAYAR</em>.
              </li>
              <li><strong>Mencatat Pembayaran (Catat Bayar):</strong>
                <br/>- Masuk ke detail pesanan dengan mengklik baris pesanan tersebut.
                <br/>- Klik <strong>Catat Bayar</strong> di pojok kanan atas.
                <br/>- Masukkan nominal yang diterima. (Sistem memberikan sugesti nominal sejumlah "Sisa tagihan" di kotak ungu).
                <br/>- Pilih Tipe (DP, Pelunasan, atau Full) dan Metode Pembayaran (Transfer, Cash, QRIS).
                <br/>- Klik <em>Simpan Pembayaran</em>. Status tagihan akan berubah otomatis menjadi <em>DP</em> atau <em>LUNAS</em> sesuai kalkulasi nominal.
              </li>
              <li><strong>Distribusi Invoice ke Pelanggan:</strong>
                <br/>- Di halaman Detail Invoice, tersedia 3 cara mendistribusikan tagihan:
                  <ul style={{ paddingLeft: 20, marginTop: 4, marginBottom: 4 }}>
                    <li><strong>WhatsApp:</strong> Membuka *web WhatsApp* dengan template pesan rapi yang berisi detail pesanan, total harga, dan sisa tagihan.</li>
                    <li><strong>Email:</strong> Mengirim invoice formal via Email langsung dari sistem ke email pelanggan.</li>
                    <li><strong>Print / PDF:</strong> Mencetak struk secara fisik atau menyimpannya sebagai file PDF (sistem akan otomatis menyembunyikan tombol UI saat masuk mode print).</li>
                  </ul>
              </li>
            </ol>
          </Section>

          <Section num="5" title="Manajemen Workshop (Kelas & Acara)">
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: 16 }}>
              Untuk bisnis DynoBoo yang mengadakan kelas keterampilan merajut atau merangkai manik-manik (*beads*).
            </p>
            <ol style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 1.8 }}>
              <li><strong>Menjadwalkan Workshop Baru:</strong>
                <br/>- Masuk ke menu <em>Workshops</em>. Klik <strong>+ Buat Workshop Baru</strong>.
                <br/>- Masukkan Tema Kelas, Tanggal, Jam, Lokasi, Harga Tiket, dan Kuota Maksimal.
                <br/>- Setelah disimpan, workshop akan berstatus <em>Tersedia</em> jika tanggalnya masih di masa depan dan kuota masih ada. Jika lewat tanggal, status berubah menjadi <em>Selesai</em>.
              </li>
              <li><strong>Manajemen Pendaftar / Peserta:</strong>
                <br/>- Fitur ini terhubung dengan pembuatan Invoice. Jika Anda membuat Invoice dengan Tipe Item "Workshop", pelanggan akan otomatis dapat didaftarkan (apabila integrasi sudah dikonfigurasi).
                <br/>- Anda dapat mengklik tombol "Peserta" (ikon orang) di baris workshop untuk melihat daftar nama orang yang mendaftar.
              </li>
            </ol>
          </Section>

          <Section num="6" title="Knowledge Base (Database AI Chatbot)">
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: 16 }}>
              Sistem AI Chatbot DynoBoo membutuhkan pengetahuan untuk membalas pesan secara cerdas. Knowledge Base adalah *otak* dari Chatbot Anda.
            </p>
            <ol style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 1.8 }}>
              <li><strong>Menambahkan Pengetahuan Baru:</strong>
                <br/>- Masuk ke menu <em>Knowledge Base</em>.
                <br/>- Klik <strong>+ Tambah Data</strong>.
                <br/>- Pada <em>Topik/Pertanyaan</em>, tulis garis besar masalah (misal: "Apakah bisa request warna custom?").
                <br/>- Pada <em>Isi Penjelasan/Jawaban</em>, tuliskan aturan operasional DynoBoo (misal: "Tentu bisa! Minimal order untuk custom warna adalah 3 pcs dengan waktu pengerjaan 5 hari.").
                <br/>- Tambahkan <em>Tags</em> untuk mempermudah pencarian (misal: "custom", "PO").
              </li>
              <li><strong>Pengaruh Terhadap AI:</strong>
                <br/>- Setiap kali sistem (seperti T-Rex Assistant) menerima pesan, ia akan mencari kecocokan dari database ini.
                <br/>- Pastikan untuk **selalu mengupdate** Knowledge Base jika ada perubahan kebijakan toko (seperti jam buka, harga minimal PO) agar AI tidak memberikan informasi usang kepada tim atau pelanggan.
              </li>
            </ol>
          </Section>

          <Section num="7" title="Access Control (PBAC) & Pengaturan Toko">
            <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: 16 }}>
              Demi keamanan, Anda bisa mengatur siapa saja yang berhak melihat, mengubah, atau menghapus data sensitif toko.
            </p>
            <ol style={{ paddingLeft: 20, color: "#94a3b8", lineHeight: 1.8 }}>
              <li><strong>Pengaturan Profil Toko:</strong>
                <br/>- Navigasi ke menu <em>Pengaturan {">"} Profil Toko</em>.
                <br/>- Di sini Anda dapat mengubah informasi dasar (Nama Toko, Tagline, Instagram, WhatsApp, Alamat). Data ini akan langsung <strong>tercetak di kop surat Invoice pelanggan</strong>.
              </li>
              <li><strong>Manajemen User Admin & Hak Akses:</strong>
                <br/>- Navigasi ke menu <em>Pengaturan {">"} Access Control</em>.
                <br/>- Jika Anda menggunakan akun dengan hak akses untuk melihat pengguna, Anda dapat menambah akun *staff* baru (contoh: Kasir, Gudang).
                <br/>- Saat menambah/mengedit user, atur hak akses (*Permissions*) per modul:
                  <ul style={{ paddingLeft: 20, marginTop: 4, marginBottom: 4 }}>
                    <li><strong>Read:</strong> Hanya bisa melihat tabel dan detail data (Tombol Tambah/Edit/Hapus akan hilang dari UI).</li>
                    <li><strong>Create & Update:</strong> Diizinkan menambah atau mengubah data, tapi tidak bisa menghapus (menghindari kerugian akibat kehilangan data).</li>
                    <li><strong>Delete:</strong> Diizinkan menghapus data secara permanen. Berikan dengan sangat selektif.</li>
                  </ul>
              </li>
            </ol>
            <div style={{ marginTop: 16, padding: 16, background: "rgba(56,189,248,0.1)", borderRadius: 12, border: "1px solid rgba(56,189,248,0.2)" }}>
              <p style={{ color: "#38bdf8", margin: 0, fontSize: 14 }}>💡 <strong>Superadmin Role:</strong> Akun dengan *role* "superadmin" memiliki kekebalan sistem. Mereka mengabaikan centang kotak izin dan memiliki akses penuh ke seluruh fitur dan penghapusan data secara *default*.</p>
            </div>
          </Section>

        </div>
        
        {/* Back to top helper */}
        <div className="no-print" style={{ textAlign: "center", marginTop: 60, paddingBottom: 40 }}>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 20, cursor: "pointer", fontSize: 14, transition: "all 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            ↑ Kembali ke Atas
          </button>
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
          .print-btn, .no-print { display: none !important; }
          div { box-shadow: none !important; backdrop-filter: none !important; border: none !important; }
          * { background: transparent !important; color: black !important; -webkit-text-fill-color: black !important; }
          @page { margin: 1.5cm; }
          
          /* Prevent page break inside sections for better reading */
          .section-module {
            page-break-inside: avoid;
            margin-bottom: 30px !important;
            padding: 0 !important;
            border: none !important;
          }
          .section-title {
            color: #000 !important;
            border-bottom: 2px solid #ccc;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          .section-icon {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="section-module" style={{ background: "rgba(30,41,59,0.5)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 32, transition: "transform 0.3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div className="section-icon" style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(14,165,233,0.15)", color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>
          {num}
        </div>
        <h2 className="section-title" style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#f8fafc" }}>{title}</h2>
      </div>
      <div style={{ fontSize: 15 }}>
        {children}
      </div>
    </div>
  );
}
