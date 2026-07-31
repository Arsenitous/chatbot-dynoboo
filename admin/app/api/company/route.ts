import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabase
    .from("company_profiles")
    .select("*")
    .eq("is_active", true)
    .single();
  if (error && error.code !== "PGRST116") {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data ?? null);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { nama_toko, tagline, alamat, kota, no_hp, email, instagram, rekening, logo_url } = body;

  const updatePayload = {
    nama_toko,
    tagline: tagline || null,
    alamat: alamat || null,
    kota: kota || null,
    no_hp: no_hp || null,
    email: email || null,
    instagram: instagram || null,
    rekening: rekening ?? [],
    logo_url: logo_url || null,
  };

  // Try to find existing active profile
  const { data: existing } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("is_active", true)
    .single();

  if (!existing) {
    // Create new profile
    const { data, error } = await supabase
      .from("company_profiles")
      .insert({ ...updatePayload, is_active: true })
      .select()
      .single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
  }

  // Update existing
  const { data, error } = await supabase
    .from("company_profiles")
    .update(updatePayload)
    .eq("id", existing.id)
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE() {
  const { error } = await supabase
    .from("company_profiles")
    .update({ is_active: false })
    .eq("is_active", true);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

