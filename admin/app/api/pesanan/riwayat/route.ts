import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// GET /api/pesanan/riwayat — ambil semua pesanan dengan status SELESAI
export async function GET() {
  const { data, error } = await supabase
    .from("pesanan")
    .select("*")
    .eq("status", "SELESAI")
    .order("selesai_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}
