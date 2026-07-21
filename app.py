import os
import gspread
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from google import genai

# pyrefly: ignore [missing-import]
from google.genai import types
from oauth2client.service_account import ServiceAccountCredentials
import requests

# 1. Paksa reload file .env agar token baru langsung aktif tanpa terhalang cache memori
load_dotenv(override=True)

app = Flask(__name__)

# Config Env
PAGE_ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN")
PAGE_ID = os.getenv("PAGE_ID")
META_VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Inisialisasi Gemini Client
client_ai = genai.Client(api_key=GEMINI_API_KEY)


# 1. Fungsi Ambil Knowledge Base dari Google Sheet
def get_knowledge_base():
    try:
        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive",
        ]
        creds = ServiceAccountCredentials.from_json_keyfile_name(
            "credentials.json", scope
        )
        client_sheet = gspread.authorize(creds)

        sheet_url = os.getenv("SHEET_URL")
        sheet = client_sheet.open_by_url(sheet_url).sheet1
        data = sheet.get_all_records()

        knowledge_base = (
            "Berikut adalah data bisnis DynoBoo (Gunakan ini sebagai acuan"
            " menjawab):\n"
        )
        for row in data:
            knowledge_base += f"- Topik: {row.get('Keywords')}\n"
            knowledge_base += f"  Jawaban Utama: {row.get('Jawaban-1')}\n"
            if row.get("Pilihan Jawaban"):
                knowledge_base += (
                    f"  Pilihan: {row.get('Pilihan Jawaban')} ->"
                    f" {row.get('Jawaban-2')}\n"
                )
            if row.get("Keterangan"):
                knowledge_base += f"  Catatan Tambahan: {row.get('Keterangan')}\n\n"
        return knowledge_base
    except Exception as e:
        print(f"Error membaca Google Sheet: {e}")
        return "Informasi toko DynoBoo sedang disiapkan admin."


# 2. Fungsi Hasilkan Balasan Gemini
def generate_ai_reply(user_message):
    knowledge_base = get_knowledge_base()

    system_instruction = (
        "Kamu adalah 'DynoMin', admin chatbot pintar, ramah, dan solutif untuk"
        " bisnis kerajinan tangan 'DynoBoo'. Tugasmu adalah menjawab"
        " pertanyaan customer dengan sopan menggunakan bahasa Indonesia yang"
        " santai tapi profesional (gunakan panggilan 'Kak'). JAWABLAH HANYA"
        " berdasarkan informasi dari data bisnis yang disediakan di bawah ini."
        " Jika ditanya hal yang tidak ada di data bisnis, minta customer"
        " menunggu balasan langsung dari admin fisik dengan sopan.\n\n"
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


# 3. Fungsi Kirim Balasan via Facebook Graph API (Instagram DM)
def send_instagram_message(recipient_id, text_reply):
    if not PAGE_ACCESS_TOKEN:
        print("⚠️ PAGE_ACCESS_TOKEN (INSTAGRAM_ACCESS_TOKEN) belum di-set di .env")
        return

    # Verifikasi prefix token di terminal
    token_preview = PAGE_ACCESS_TOKEN[:15] if PAGE_ACCESS_TOKEN else "EMPTY"
    print(f"🔑 Mengirim via PAGE_ID: {PAGE_ID} | Token Prefix: {token_preview}...")

    # Endpoint Graph API Facebook menggunakan PAGE_ID spesifik
    url = f"https://graph.facebook.com/v25.0/{PAGE_ID}/messages"
    headers = {
        "Authorization": f"Bearer {PAGE_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "recipient": {"id": recipient_id},
        "message": {"text": text_reply},
    }

    res = requests.post(url, json=payload, headers=headers)
    print(f"Status Pengiriman IG: {res.status_code}")
    print(f"Response Body: {res.text}")

    if res.status_code >= 400:
        print(
            f"❌ Gagal kirim pesan ke {recipient_id}. Cek Response Body di atas"
            " untuk detail error."
        )


# 4. Webhook Verification (GET Request dari Meta)
@app.route("/webhook", methods=["GET"])
def verify_webhook():
    mode = request.args.get("hub.mode")
    token = request.args.get("hub.verify_token")
    challenge = request.args.get("hub.challenge")

    if mode and token:
        if mode == "subscribe" and token == META_VERIFY_TOKEN:
            print("✅ Webhook Meta Berhasil Terverifikasi!")
            return challenge, 200
        else:
            return "Token verifikasi salah", 403
    return "Bad Request", 400


# 5. Handle Incoming Messages (POST Request dari Meta)
@app.route("/webhook", methods=["POST"])
def handle_messages():
    data = request.get_json()
    print(f"\n📥 Payload masuk: {data}")

    # Menerima event baik dari object 'instagram' maupun 'page'
    if data.get("object") in ["instagram", "page"]:
        for entry in data.get("entry", []):
            for messaging_event in entry.get("messaging", []):
                # Memastikan event berisi pesan teks dan bukan balasan/echo bot sendiri
                if messaging_event.get("message") and not messaging_event[
                    "message"
                ].get("is_echo"):
                    sender_id = messaging_event["sender"]["id"]
                    user_text = messaging_event["message"].get("text")

                    if user_text:
                        print(f"\n📩 Pesan Masuk dari {sender_id}: {user_text}")
                        # Dapatkan balasan AI
                        ai_reply = generate_ai_reply(user_text)
                        print(f"🤖 Balasan DynoMin: {ai_reply}")
                        # Kirim balasan ke IG
                        send_instagram_message(sender_id, ai_reply)

        return "EVENT_RECEIVED", 200
    return "Not a valid event", 404


if __name__ == "__main__":
    app.run(port=5000, debug=True)
