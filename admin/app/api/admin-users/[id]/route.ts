import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const updatePayload: Record<string, any> = { role: body.role };
  
  if (body.permissions !== undefined) {
    updatePayload.permissions = body.permissions;
  }

  // Jika ada password baru, hash dulu
  if (body.password) {
    updatePayload.password_hash = await hashPassword(body.password);
  }

  const { data, error } = await supabase
    .from("admin_users")
    .update(updatePayload)
    .eq("id", id)
    .select("id, username, role, created_at, permissions")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  // Pastikan tidak hapus superadmin terakhir
  const { data: user } = await supabase
    .from("admin_users").select("role").eq("id", id).single();

  if (user?.role === "superadmin") {
    const { count } = await supabase
      .from("admin_users").select("*", { count: "exact", head: true }).eq("role", "superadmin");
    if ((count ?? 0) <= 1) {
      return Response.json({ error: "Tidak bisa menghapus SuperAdmin terakhir!" }, { status: 403 });
    }
  }

  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
