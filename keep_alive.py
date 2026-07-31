import os
import sys
import requests
from dotenv import load_dotenv

# Ensure utf-8 encoding for stdout
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Load environment variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def ping():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[ERROR] SUPABASE_URL atau SUPABASE_KEY belum di-set di .env", flush=True)
        return False

    url = f"{SUPABASE_URL}/rest/v1/chat_logs"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    payload = {
        "sender_id": "SYSTEM_KEEPALIVE",
        "user_message": "SCHEDULED_KEEP_ALIVE",
        "bot_response": "SUPABASE_PREVENT_PAUSE",
        "intent": "KEEPALIVE",
    }

    try:
        r = requests.post(url, headers=headers, json=payload, timeout=10)
        r.raise_for_status()
        print("[SUCCESS] Log keep-alive Supabase berhasil ditambahkan:", r.json(), flush=True)
        return True
    except Exception as e:
        print("[ERROR] Gagal mengirim log keep-alive ke Supabase:", e, flush=True)
        return False


if __name__ == "__main__":
    ping()
