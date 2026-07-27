import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { verifyPassword } from "@/lib/auth";

const ADMIN_SECRET = process.env.ADMIN_SECRET!;

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  // Cari user di Supabase
  const { data: user, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("username", username)
    .single();

  let authenticated = false;

  if (!error && user) {
    // Cek password hash dari Supabase
    authenticated = await verifyPassword(password, user.password_hash);
  } else {
    // Fallback ke .env.local (backward compat)
    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;
    authenticated = username === envUser && password === envPass;
  }

  if (!authenticated) {
    return Response.json({ ok: false, error: "Username atau password salah" }, { status: 401 });
  }

  const cookieStore = await cookies();
  // Session secret
  cookieStore.set("dynoboo_session", ADMIN_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });
  // Username cookie untuk audit trail
  cookieStore.set("dynoboo_user", username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });

  return Response.json({ ok: true, username, role: user?.role ?? "superadmin" });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("dynoboo_session");
  cookieStore.delete("dynoboo_user");
  return Response.json({ ok: true });
}
