import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("invoices")
    .select("*, invoice_type:invoice_types(*), invoice_items(*), payments(*)")
    .eq("id", id)
    .single();
  if (error) return Response.json({ error: error.message }, { status: 404 });
  return Response.json(data);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { data, error } = await supabase
    .from("invoices")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, invoice_type:invoice_types(*)")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
