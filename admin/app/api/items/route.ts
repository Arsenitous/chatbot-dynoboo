export const dynamic = 'force-dynamic';
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("items")
    .select("*, item_type:item_types(*), stock:stocks(*)")
    .order("id", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const cookieStore = await cookies();
  const user = cookieStore.get("dynoboo_user")?.value ?? "superadmin";

  const { data, error } = await supabase
    .from("items")
    .insert({ ...body, created_by: user })
    .select("*, item_type:item_types(*)")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Trigger auto-creates stock, but we ensure it anyway
  await supabase.from("stocks").upsert({ item_id: data.id, qty_available: body.qty_available ?? 0 }, { onConflict: "item_id" });

  return Response.json(data, { status: 201 });
}

