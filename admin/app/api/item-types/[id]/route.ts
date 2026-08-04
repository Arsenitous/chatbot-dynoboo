import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { data, error } = await supabase.from("item_types").update(body).eq("id", id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Detach type from items to prevent foreign key constraint error
  await supabase.from("items").update({ item_type_id: null }).eq("item_type_id", id);

  const { error } = await supabase.from("item_types").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
