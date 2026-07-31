import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("stocks")
    .select("*, item:items(id, nama, satuan, harga_normal, harga_promo, is_active, item_type:item_types(nama, icon))")
    .order("id");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { item_id, qty_available } = body;
  if (!item_id) return Response.json({ error: "item_id diperlukan" }, { status: 400 });

  // Upsert stock for item (create if not exist, update if exist)
  const { data, error } = await supabase
    .from("stocks")
    .upsert(
      { item_id: Number(item_id), qty_available: Number(qty_available ?? 0), updated_at: new Date().toISOString() },
      { onConflict: "item_id" }
    )
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
