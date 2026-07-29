import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const item = {
    invoice_id: Number(id),
    item_id: body.item_id || null,
    description: body.description,
    qty: body.qty,
    satuan: body.satuan || "Pcs",
    harga_satuan: body.harga_satuan,
  };

  const { data, error } = await supabase.from("invoice_items").insert(item).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Recalculate subtotal and grand_total
  const { data: allItems } = await supabase.from("invoice_items").select("total_harga").eq("invoice_id", id);
  const { data: inv } = await supabase.from("invoices").select("discount").eq("id", id).single();
  const subtotal = (allItems ?? []).reduce((sum, i) => sum + Number(i.total_harga), 0);
  const grand_total = subtotal - Number(inv?.discount ?? 0);
  await supabase.from("invoices").update({ subtotal, grand_total }).eq("id", id);

  return Response.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("item_id");
  if (!itemId) return Response.json({ error: "item_id required" }, { status: 400 });

  const { error } = await supabase.from("invoice_items").delete().eq("id", itemId).eq("invoice_id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Recalculate
  const { data: allItems } = await supabase.from("invoice_items").select("total_harga").eq("invoice_id", id);
  const { data: inv } = await supabase.from("invoices").select("discount").eq("id", id).single();
  const subtotal = (allItems ?? []).reduce((sum, i) => sum + Number(i.total_harga), 0);
  const grand_total = subtotal - Number(inv?.discount ?? 0);
  await supabase.from("invoices").update({ subtotal, grand_total }).eq("id", id);

  return Response.json({ ok: true });
}
