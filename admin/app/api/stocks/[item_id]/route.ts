import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_: NextRequest, { params }: { params: Promise<{ item_id: string }> }) {
  const { item_id } = await params;
  const { data, error } = await supabase
    .from("stocks")
    .select("*, item:items(id, nama, satuan, harga_normal, harga_promo, is_active)")
    .eq("item_id", item_id)
    .single();
  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json(data);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ item_id: string }> }) {
  const { item_id } = await params;
  const body = await request.json();

  const { mode, qty_available, adjust_by } = body;

  let newQty: number;

  if (mode === "adjust" && adjust_by !== undefined) {
    // Adjustment mode: add/subtract from current qty
    const { data: existing } = await supabase
      .from("stocks")
      .select("qty_available")
      .eq("item_id", item_id)
      .single();
    const current = Number(existing?.qty_available ?? 0);
    newQty = Math.max(0, current + Number(adjust_by));
  } else {
    // Set mode: absolute value
    newQty = Math.max(0, Number(qty_available ?? 0));
  }

  const { data, error } = await supabase
    .from("stocks")
    .update({ qty_available: newQty, updated_at: new Date().toISOString() })
    .eq("item_id", item_id)
    .select()
    .single();

  if (error) {
    // If stock doesn't exist, create it
    const { data: inserted, error: insertErr } = await supabase
      .from("stocks")
      .insert({ item_id: Number(item_id), qty_available: newQty, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (insertErr) return Response.json({ error: insertErr.message }, { status: 500 });
    return Response.json(inserted);
  }

  return Response.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ item_id: string }> }) {
  const { item_id } = await params;
  // Reset stock to 0 instead of deleting
  const { data, error } = await supabase
    .from("stocks")
    .update({ qty_available: 0, qty_sold: 0, qty_reserved: 0, updated_at: new Date().toISOString() })
    .eq("item_id", item_id)
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
