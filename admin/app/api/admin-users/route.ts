import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, role, created_at")
    .order("id", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const { username, password, role } = await request.json();

  // Cek username belum ada
  const { data: existing } = await supabase
    .from("admin_users").select("id").eq("username", username).single();
  if (existing) {
    return Response.json({ error: "Username sudah digunakan" }, { status: 409 });
  }

  const hash = await hashPassword(password);

  // Dapatkan siapa yang menambah
  const cookieStore = await cookies();
  const addedBy = cookieStore.get("dynoboo_user")?.value ?? "unknown";

  const { data, error } = await supabase
    .from("admin_users")
    .insert({ username, password_hash: hash, role: role ?? "admin" })
    .select("id, username, role, created_at")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  console.log(`[admin_users] Added "${username}" by "${addedBy}"`);
  return Response.json(data, { status: 201 });
}
