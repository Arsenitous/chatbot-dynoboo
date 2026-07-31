import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabase
    .from("pesanan")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

