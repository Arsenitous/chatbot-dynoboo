import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const activeOnly = searchParams.get("active") === "true";

  let query = supabase.from("loyalty").select("*").order("nama");
  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabase
    .from("loyalty")
    .insert({
      nama: body.nama,
      no_hp: body.no_hp || null,
      email: body.email || null,
      alamat: body.alamat || null,
      catatan: body.catatan || null,
      is_active: body.is_active ?? true,
    })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
