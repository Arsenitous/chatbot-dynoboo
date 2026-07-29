import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase
    .from("company_profiles")
    .select("*")
    .eq("is_active", true)
    .single();
  // Return null if no profile yet — frontend handles empty state
  return Response.json(data ?? null);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { data: existing } = await supabase.from("company_profiles").select("id").eq("is_active", true).single();
  if (!existing) {
    const { data, error } = await supabase.from("company_profiles").insert(body).select().single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
  }
  const { data, error } = await supabase.from("company_profiles").update(body).eq("id", existing.id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
