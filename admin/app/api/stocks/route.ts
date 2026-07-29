import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("stocks")
    .select("*, item:items(id, nama, satuan, harga_normal, harga_promo, is_active, item_type:item_types(nama, icon))")
    .order("id");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
