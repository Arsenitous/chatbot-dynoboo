import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_: NextRequest, { params }: { params: Promise<{ item_id: string }> }) {
  const { item_id } = await params;
  const { data, error } = await supabase.from("stocks").select("*").eq("item_id", item_id).single();
  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json(data);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ item_id: string }> }) {
  const { item_id } = await params;
  const body = await request.json();
  const { data, error } = await supabase
    .from("stocks")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("item_id", item_id)
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
