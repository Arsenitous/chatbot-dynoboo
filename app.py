import os
import json
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from google import genai
# pyrefly: ignore [missing-import]
from google.genai import types

# ─── Load .env ───────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)

app = Flask(__name__)

# ─── Config ──────────────────────────────────────────────────────────────────
PAGE_ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN")
META_VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN")
GEMINI_API_KEY    = os.getenv("GEMINI_API_KEY")
SUPABASE_URL      = os.getenv("SUPABASE_URL")
SUPABASE_KEY      = os.getenv("SUPABASE_KEY")

# ─── Gemini Client ───────────────────────────────────────────────────────────
client_ai = genai.Client(api_key=GEMINI_API_KEY)

# ─── In-memory session: menyimpan state form registrasi per user ─────────────
# Format: { sender_id: { "step": "nama"|"alamat"|"no_hp"|"produk", "data": {...} } }
user_sessions: dict = {}

# ─── Supabase Helper ─────────────────────────────────────────────────────────
def sb_headers() -> dict:
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

def sb_get(table: str, params: str = "") -> list:
    url = f"{SUPABASE_URL}/rest/v1/{table}?{params}"
    r = requests.get(url, headers=sb_headers(), timeout=10)
    r.raise_for_status()
    return r.json()

def sb_post(table: str, payload: dict) -> dict:
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    r = requests.post(url, headers={**sb_headers(), "Prefer": "return=representation"},
                      json=payload, timeout=10)
    r.raise_for_status()
    result = r.json()
    return result[0] if isinstance(result, list) else result


# ─── 1. Build Knowledge Base dari Supabase ───────────────────────────────────
def get_knowledge_base() -> str:
    try:
        # Ambil knowledge_base
        kb_rows = sb_get("knowledge_base", "order=id.asc")

        # Ambil workshop yang ACTIVE / UPCOMING
        ws_rows = sb_get("workshops", "status=in.(ACTIVE,UPCOMING)&order=id.asc")

        knowledge = (
            "Berikut adalah data bisnis DynoBoo (Gunakan ini sebagai acuan menjawab):\n\n"
        )

        # Tambahkan data workshop ke knowledge
        if ws_rows:
            knowledge += "## DATA WORKSHOP AKTIF:\n"
            for ws in ws_rows:
                knowledge += f"- Workshop: {ws.get('nama_workshop')}\n"
                knowledge += f"  Tanggal: {ws.get('tanggal')}\n"
                if ws.get("harga_promo"):
                    knowledge += f"  Harga Promo: {ws.get('harga_promo')}\n"
                if ws.get("harga_normal"):
                    knowledge += f"  Harga Normal: {ws.get('harga_normal')}\n"
                if ws.get("fasilitas"):
                    knowledge += f"  Fasilitas: {ws.get('fasilitas')}\n"
                knowledge += f"  Status: {ws.get('status')}\n\n"

        # Tambahkan QnA knowledge base
        knowledge += "## QnA KNOWLEDGE BASE:\n"
        for row in kb_rows:
            knowledge += f"- Topik/Keywords: {row.get('keywords')}\n"
            knowledge += f"  Jawaban Utama: {row.get('jawaban_utama')}\n"

            pilihan = row.get("pilihan_jawaban")
            if pilihan:
                # pilihan bisa berupa list atau string JSON
                if isinstance(pilihan, str):
                    pilihan = json.loads(pilihan)
                for opt in pilihan:
                    knowledge += f"  Jika pilihan '{opt.get('opsi')}': {opt.get('jawaban')}\n"

            if row.get("keterangan"):
                knowledge += f"  Catatan: {row.get('keterangan')}\n"
            knowledge += "\n"

        return knowledge

    except Exception as e:
        print(f"❌ Error membaca Supabase: {e}", flush=True)
        return "Informasi toko DynoBoo sedang disiapkan admin."


# ─── 2. Log chat ke Supabase ─────────────────────────────────────────────────
def log_chat(sender_id: str, user_message: str, bot_response: str, intent: str = "AI_GEMINI"):
    try:
        sb_post("chat_logs", {
            "sender_id":    sender_id,
            "user_message": user_message,
            "bot_response": bot_response,
            "intent":       intent,
        })
    except Exception as e:
        print(f"⚠️ Gagal log chat: {e}", flush=True)


# ─── 3. Simpan pesanan ke Supabase ───────────────────────────────────────────
def save_pesanan(sender_id: str, data: dict):
    sb_post("pesanan", {
        "sender_id": sender_id,
        "nama":      data["nama"],
        "alamat":    data["alamat"],
        "no_hp":     data["no_hp"],
        "produk":    data["produk"],
    })


# ─── 4. Generate balasan via Gemini ──────────────────────────────────────────
def generate_ai_reply(user_message: str) -> str:
    knowledge_base = get_knowledge_base()

    system_instruction = (
        "Kamu adalah 'DynoMin', admin chatbot pintar, ramah, dan solutif untuk"
        " bisnis kerajinan tangan 'DynoBoo' yang berlokasi di Kota Pontianak."
        " Tugasmu adalah menjawab pertanyaan customer dengan sopan menggunakan"
        " bahasa Indonesia yang santai tapi profesional (gunakan panggilan 'Kak')."
        " JAWABLAH HANYA berdasarkan informasi dari data bisnis yang disediakan."
        " Jika ditanya hal yang tidak ada di data, minta customer menunggu balasan"
        " langsung dari admin fisik dengan sopan.\n\n"
        "PENTING: Jika customer ingin memesan, arahkan mereka untuk ketik 'pesan'"
        " agar bisa mengisi form pemesanan otomatis.\n\n"
        f"{knowledge_base}"
    )

    response = client_ai.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_message,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
        ),
    )
    return response.text


# ─── 5. Kirim pesan balik via Graph API ──────────────────────────────────────
def send_instagram_message(recipient_id: str, text_reply: str):
    if not PAGE_ACCESS_TOKEN:
        print("⚠️ PAGE_ACCESS_TOKEN belum di-set di .env", flush=True)
        return

    url = "https://graph.facebook.com/v21.0/me/messages"
    res = requests.post(
        url,
        json={"recipient": {"id": recipient_id}, "message": {"text": text_reply}},
        headers={"Content-Type": "application/json"},
        params={"access_token": PAGE_ACCESS_TOKEN},
        timeout=10,
    )
    print(f"📤 IG Status {res.status_code}: {res.text[:200]}", flush=True)
    if res.status_code >= 400:
        print(f"❌ Gagal kirim ke {recipient_id}", flush=True)


# ─── 6. Form Registrasi Step-by-step ─────────────────────────────────────────
FORM_STEPS = {
    "nama":   "📝 Silakan ketik *Nama Lengkap* kamu ya Kak:",
    "alamat": "🏠 Sekarang ketik *Alamat Pengiriman/Domisili* kamu Kak:",
    "no_hp":  "📱 Ketik *Nomor HP/WhatsApp* yang bisa dihubungi ya Kak:",
    "produk": "🛍️ Terakhir, ketik *Produk atau Workshop* yang ingin kamu pesan:",
}
STEP_ORDER = ["nama", "alamat", "no_hp", "produk"]


def handle_form(sender_id: str, user_text: str) -> str:
    session = user_sessions.get(sender_id, {})
    step    = session.get("step")
    data    = session.get("data", {})

    if not step:
        # Mulai form
        user_sessions[sender_id] = {"step": "nama", "data": {}}
        return (
            "📋 *Form Pemesanan DynoBoo*\n\n"
            "Halo Kak! Yuk isi form berikut untuk melanjutkan pesananmu 😊\n\n"
            + FORM_STEPS["nama"]
        )

    # Simpan jawaban step sebelumnya
    data[step] = user_text.strip()

    # Cari step berikutnya
    idx = STEP_ORDER.index(step)
    if idx + 1 < len(STEP_ORDER):
        next_step = STEP_ORDER[idx + 1]
        user_sessions[sender_id] = {"step": next_step, "data": data}
        return FORM_STEPS[next_step]
    else:
        # Form selesai → simpan ke Supabase
        try:
            save_pesanan(sender_id, data)
            del user_sessions[sender_id]
            return (
                "✅ *Pesananmu sudah tercatat!*\n\n"
                f"📌 Nama    : {data['nama']}\n"
                f"🏠 Alamat  : {data['alamat']}\n"
                f"📱 No. HP  : {data['no_hp']}\n"
                f"🛍️ Produk  : {data['produk']}\n\n"
                "Admin DynoBoo akan segera menghubungimu untuk konfirmasi pesanan ya Kak! 🦖"
            )
        except Exception as e:
            print(f"❌ Gagal simpan pesanan: {e}", flush=True)
            del user_sessions[sender_id]
            return (
                "Maaf Kak, ada kendala saat menyimpan pesananmu. "
                "Silakan coba lagi atau hubungi admin via WhatsApp di 0851-9591-6540 ya!"
            )


# ─── 7. Router Pesan Utama ────────────────────────────────────────────────────
def process_message(sender_id: str, user_text: str):
    text_lower = user_text.strip().lower()

    # Cek apakah user sedang dalam proses form registrasi
    if sender_id in user_sessions and user_sessions[sender_id].get("step"):
        reply  = handle_form(sender_id, user_text)
        intent = "FORM_REGISTRATION"
        send_instagram_message(sender_id, reply)
        log_chat(sender_id, user_text, reply, intent)
        return

    # Trigger mulai form registrasi
    if text_lower in ["pesan", "order", "daftar", "registrasi", "beli"]:
        reply  = handle_form(sender_id, user_text)
        intent = "START_REGISTRATION"
        send_instagram_message(sender_id, reply)
        log_chat(sender_id, user_text, reply, intent)
        return

    # Default: tanya ke Gemini AI
    try:
        reply  = generate_ai_reply(user_text)
        intent = "AI_GEMINI"
    except Exception as e:
        print(f"❌ Gemini error: {e}", flush=True)
        reply  = "Maaf Kak, DynoMin sedang gangguan sesaat. Coba lagi beberapa saat ya! 🙏"
        intent = "AI_GEMINI"

    send_instagram_message(sender_id, reply)
    log_chat(sender_id, user_text, reply, intent)


# ─── 8. Webhook GET (Verifikasi Meta) ────────────────────────────────────────
@app.route("/webhook", methods=["GET"])
def verify_webhook():
    mode      = request.args.get("hub.mode")
    token     = request.args.get("hub.verify_token")
    challenge = request.args.get("hub.challenge")

    if mode == "subscribe" and token == META_VERIFY_TOKEN:
        print("✅ Webhook Terverifikasi!", flush=True)
        return challenge, 200
    return "Forbidden", 403


# ─── 9. Webhook POST (Terima Pesan Masuk) ────────────────────────────────────
@app.route("/webhook", methods=["POST"])
def handle_messages():
    data = request.get_json()
    print(f"\n📥 Payload: {data}", flush=True)

    if data.get("object") in ["instagram", "page"]:
        for entry in data.get("entry", []):
            for event in entry.get("messaging", []):
                msg = event.get("message", {})
                if msg and not msg.get("is_echo"):
                    sender_id = event["sender"]["id"]
                    user_text = msg.get("text", "").strip()
                    if user_text:
                        print(f"📩 [{sender_id}]: {user_text}", flush=True)
                        process_message(sender_id, user_text)
        return "EVENT_RECEIVED", 200

    return "Not Found", 404


# ─── 10. Health Check ─────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "DynoBoo Chatbot v2"}), 200


if __name__ == "__main__":
    app.run(port=5000, debug=True)
