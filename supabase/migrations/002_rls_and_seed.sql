-- ============================================================
-- JALANKAN INI DI SUPABASE SQL EDITOR
-- (Tabel sudah ada, ini hanya menambah RLS Policy + Seed Data)
-- ============================================================

-- 1. Aktifkan RLS dan buat policy agar anon key bisa baca & tulis
-- (Jalankan per tabel jika ada error "policy already exists")

DO $$
BEGIN
  -- knowledge_base
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'knowledge_base' AND policyname = 'Allow public all') THEN
    ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public all" ON knowledge_base FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- workshops
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workshops' AND policyname = 'Allow public all') THEN
    ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public all" ON workshops FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- pesanan
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pesanan' AND policyname = 'Allow public all') THEN
    ALTER TABLE pesanan ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public all" ON pesanan FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- chat_logs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_logs' AND policyname = 'Allow public all') THEN
    ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public all" ON chat_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;


-- 2. Seed Data Workshop
INSERT INTO workshops (nama_workshop, tanggal, harga_promo, harga_normal, fasilitas, status) VALUES
(
  'Penguin Beading Workshop',
  'Minggu, 5 Juli 2026 (Pukul 10:00 WIB)',
  'Rp60.000 (Khusus s.d. Minggu ini)',
  'Rp65.000 (Penutupan 4 Juli 2026 pukul 15.00 WIB)',
  'Bahan dan alat, tutor, konsumsi, dan e-certificate eksklusif dari DynoBoo',
  'ACTIVE'
);


-- 3. Seed Data Knowledge Base
INSERT INTO knowledge_base (keywords, jawaban_utama, pilihan_jawaban, keterangan) VALUES
(
  'Mau nanya harga',
  'Halo, Kak! Kira-kira kakak mau nanya harga untuk barang/jasa apa ya?',
  '[{"opsi":"Produk","jawaban":"Produk kita beragam yah harganya. Untuk menanyakan harga lebih detail mengenai produk spesifik, silakan tunggu jawaban langsung dari admin ya!"},{"opsi":"Workshop","jawaban":"Workshop yang sedang berjalan saat ini adalah Penguin Beading workshop dengan harga Rp60k aja sampai hari minggu ini! Setelah itu harga akan naik ke Rp65k sampai tanggal penutupan di 4 Juli 2026 pukul 3 sore!"},{"opsi":"Kelas","jawaban":"Kelas kita sedang dalam tahap pembuatan, admin akan kabarin kamu jika kelas kerajinan tangan sudah dibuka ya!!"}]'::jsonb,
  '(tergantung dari workshop yang sedang berjalan)'
),
(
  'Info tentang workshop donk',
  'Untuk workshop kita dengan tema Penguin Beading workshop akan dimulai pada Minggu, 5 Juli 2026 dari pukul 10 pagi yah! Dengan harga pendaftaran yaitu 60k khusus hingga hari minggu ini, dan 65k setelahnya!',
  NULL,
  '(tergantung dari workshop yang sedang berjalan)'
),
(
  'Private workshop',
  'DynoBoo ada sediain jasa workshop khusus untuk kamu dengan temen-temenmu sendiri! Harga tergantung dari produk yang dibuat, tingkat kesulitan, jumlah pendaftar, dan urgensi ya!',
  NULL,
  NULL
),
(
  'Ada produk khusus untuk wisuda gak?',
  'Ada banget! Kita punya bouquet edisi wisuda, naik kelas, sampai kelulusan sekolah. Tinggal pilih model bouquet yang kamu mau (dapat dilihat di highlight)!',
  '[{"opsi":"Berapaan harga bouquet wisudanya?","jawaban":"Harga bouquet bunga wisuda kita start dari Rp40k sampai Rp45k yah~"},{"opsi":"Bisa request bunga gak?","jawaban":"Maaf kak, untuk bunga sudah ditentukan yah. Namun untuk warna yang kakak mau masih bisa direquest yaah"}]'::jsonb,
  NULL
),
(
  'Gimana cara ordernya?',
  'Untuk order, simpel aja kak! Kakak bisa langsung ketik "pesan" untuk mengisi form pemesanan otomatis di sini, atau pesan via WhatsApp (0851-9591-6540) dengan format: Nama, Alamat, No. HP, dan Produk.',
  NULL,
  NULL
),
(
  'Lokasi di mana / Kirim dari mana?',
  'Lokasi DynoBoo dan pengiriman kami ada di Kota Pontianak yah kak~ Pengiriman bisa menggunakan ojol (biaya ditanggung pembeli) atau kami antarkan langsung (gratis ongkir untuk jarak 2-4km)!',
  '[{"opsi":"Ojol","jawaban":"Biaya pengiriman menggunakan ojol akan ditanggung oleh pembeli ya!"},{"opsi":"Diantarkan","jawaban":"Pengiriman oleh kami gratis untuk dalam range 2-4km dari lokasi pengantaran, selebih dari itu hanya kami terima menggunakan ojol ya!"}]'::jsonb,
  NULL
),
(
  'Bayar lewat apa?',
  'Pembayaran bisa dilakukan dengan transfer ke rekening BCA: 0293142481 (a.n. Franciska Angelica). Setelah itu, bukti transfer dikirimkan kembali ke kami ya!',
  NULL,
  '(jika transaksi via online wajib transfer BCA)'
),
(
  'Bisa custom gak?',
  'Bisa banget! Kamu tinggal kirimin foto produk yang pengen DynoBoo buatkan. Namun tidak semua produk dapat kami lakukan dikarenakan bahan yang terbatas ya! DynoMin bakal kabarin kamu mengenai produk custom yang kamu mau yaah!',
  NULL,
  NULL
);
