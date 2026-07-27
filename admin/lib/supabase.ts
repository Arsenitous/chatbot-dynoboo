import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types ────────────────────────────────────────────────────────────────────

export type PilihanJawaban = {
  opsi: string;
  jawaban: string;
};

export type KnowledgeBase = {
  id: number;
  keywords: string;
  jawaban_utama: string;
  pilihan_jawaban: PilihanJawaban[] | null;
  keterangan: string | null;
  edited_by?: string;
  created_at: string;
};

export type Workshop = {
  id: number;
  nama_workshop: string;
  tanggal: string;
  harga_promo: string | null;
  harga_normal: string | null;
  fasilitas: string | null;
  status: "ACTIVE" | "UPCOMING" | "CLOSED";
  edited_by?: string;
  created_at: string;
};

export type Pesanan = {
  id: number;
  sender_id: string;
  nama: string;
  alamat: string;
  no_hp: string;
  produk: string;
  created_at: string;
};

export type ChatLog = {
  id: number;
  sender_id: string;
  user_message: string;
  bot_response: string;
  intent: "AI_GEMINI" | "FORM_REGISTRATION" | "START_REGISTRATION";
  created_at: string;
};

export type AdminUser = {
  id: number;
  username: string;
  role: "superadmin" | "admin";
  created_at: string;
};
