# DynoBoo Instagram Chatbot 🦖🤖

DynoBoo Instagram Chatbot adalah asisten virtual cerdas (chatbot) berbasis AI yang dirancang untuk melayani pelanggan bisnis kerajinan tangan **DynoBoo**. Chatbot ini, yang dikenal dengan persona **DynoMin**, terintegrasi langsung dengan Instagram Direct Messages (DM) dan menggunakan kecerdasan buatan dari Google Gemini untuk menjawab pertanyaan pelanggan secara otomatis, ramah, dan solutif.

Pengetahuan (knowledge base) chatbot ini mengambil data secara dinamis dari **Google Sheets**, sehingga admin dapat memperbarui informasi produk, harga, dan FAQ dengan mudah tanpa perlu mengubah kode atau mematikan server.

## 🌟 Fitur Utama
- **Integrasi Instagram DM**: Membaca dan membalas pesan secara otomatis melalui Facebook Graph API / Webhook.
- **Kecerdasan Buatan (Google Gemini 2.5 Flash)**: Menghasilkan balasan yang natural, santai, namun tetap profesional berdasarkan data toko.
- **Database Dinamis (Google Sheets)**: Mengambil data panduan jawaban secara langsung dari spreadsheet, memudahkan pembaruan konten.
- **Persona Kustom**: Berperan sebagai "DynoMin" yang menyapa pelanggan dengan panggilan akrab "Kak".

## 🛠️ Teknologi yang Digunakan
- **Python 3**
- **Flask**: Framework web untuk menangani Webhook dari Meta (Instagram).
- **Google GenAI (Gemini)**: Model LLM untuk meracik balasan pesan pelanggan.
- **Gspread & Google Drive API**: Membaca data dari Google Sheets.
- **Meta Graph API**: Berkomunikasi dengan platform Instagram Messaging.

## 📋 Prasyarat
Sebelum menjalankan proyek ini, pastikan Anda memiliki:
1. Akun Meta Developer (Facebook Developer) yang sudah dihubungkan ke akun Instagram Bisnis Anda untuk mendapatkan `INSTAGRAM_ACCESS_TOKEN` dan mengatur Webhook.
2. Akun [Google Gemini API](https://aistudio.google.com/) untuk mendapatkan API Key.
3. Akun [Google Cloud Console](https://console.cloud.google.com/) dengan Service Account (berupa file `credentials.json`) yang memiliki akses ke Google Sheets API.
4. Python 3.8+ terinstal di komputer.

## ⚙️ Cara Instalasi & Menjalankan

### 1. Clone Repositori
```bash
git clone https://github.com/Arsenitous/chatbot-dynoboo.git
cd chatbot-dynoboo/Instagram_Chatbot
```

### 2. Buat & Aktifkan Virtual Environment
**Untuk Windows (PowerShell/CMD):**
```bash
python -m venv venv
.\venv\Scripts\activate
```
**Untuk macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instal Dependensi
```bash
pip install -r requirements.txt
```

### 4. Konfigurasi Environment Variables
Buat file bernama `.env` di dalam folder `Instagram_Chatbot` (sejajar dengan `app.py`) dan isi dengan konfigurasi berikut:
```env
INSTAGRAM_ACCESS_TOKEN=token_akses_halaman_meta_anda
PAGE_ID=id_halaman_anda
META_VERIFY_TOKEN=token_verifikasi_webhook_anda_bebas
GEMINI_API_KEY=api_key_gemini_anda
```

### 5. Konfigurasi Google Sheets
1. Simpan file kredensial dari Google Service Account ke dalam folder ini dengan nama **`credentials.json`**.
2. Buka Google Sheet pengetahuan bisnis Anda.
3. Klik "Share" (Bagikan), lalu masukkan alamat email dari Google Service Account Anda agar bot dapat membaca dokumen tersebut.

### 6. Jalankan Server
```bash
python app.py
```
Server akan berjalan di port `5000` (http://localhost:5000/). 

> **Catatan Webhook:** Untuk menguji Webhook dari Meta API di komputer lokal, Anda perlu mengekspos localhost Anda ke internet menggunakan alat seperti **Ngrok** atau **Cloudflare Tunnel** (misal: `ngrok http 5000`). URL *https* yang dihasilkan kemudian dimasukkan ke pengaturan Webhook di Dashboard Meta Developer.

## 🔒 Keamanan
- File `.env` dan `credentials.json` bersifat rahasia dan sudah diatur agar diabaikan di Git melalui file `.gitignore`. 
- **Penting:** Jangan pernah mengunggah (`git push`) kedua file tersebut ke repositori publik!
