import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("items")
    .select("*, item_type:item_types(*), stock:stocks(*)")
    .eq("id", id)
    .single();
  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json(data);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { qty_available, ...itemBody } = body;
  const { data, error } = await supabase.from("items").update(itemBody).eq("id", id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (qty_available !== undefined) {
    await supabase.from("stocks").upsert({ item_id: Number(id), qty_available }, { onConflict: "item_id" });
  }
  return Response.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Detach from invoice items first to prevent foreign key constraint errors
  await supabase.from("invoice_items").update({ item_id: null }).eq("item_id", id);
  
  // Delete associated stock
  await supabase.from("stocks").delete().eq("item_id", id);
  
  // Finally, delete the item itself
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  
  return Response.json({ ok: true });
}
