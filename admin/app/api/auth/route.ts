import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { verifyPassword } from "@/lib/auth";

// Session prefix - middleware just checks cookie exists and starts with this prefix
const SESSION_PREFIX = "dynoboo_";

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

  // Buat session token unik yang tidak bergantung ADMIN_SECRET
  const sessionToken = SESSION_PREFIX + username + "_" + Date.now().toString(36);

  const cookieStore = await cookies();
  cookieStore.set("dynoboo_session", sessionToken, {
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

  let userRole = user?.role;
  let userPerms = user?.permissions ?? [];

  if (!user && username === process.env.ADMIN_USERNAME) {
    userRole = "superadmin";
    userPerms = ["all"];
  } else if (!userRole) {
    userRole = "admin";
  }

  return Response.json({ 
    ok: true, 
    username, 
    role: userRole,
    permissions: userPerms 
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const username = cookieStore.get("dynoboo_user")?.value;
  const sessionToken = cookieStore.get("dynoboo_session")?.value;
  
  if (!username || !sessionToken) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const { data: user } = await supabase
    .from("admin_users")
    .select("role, permissions")
    .eq("username", username)
    .single();

  let userRole = user?.role;
  let userPerms = user?.permissions ?? [];

  if (!user && username === process.env.ADMIN_USERNAME) {
    userRole = "superadmin";
    userPerms = ["all"];
  } else if (!userRole) {
    userRole = "admin";
  }

  return Response.json({ 
    ok: true, 
    username, 
    role: userRole,
    permissions: userPerms 
  });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("dynoboo_session");
  cookieStore.delete("dynoboo_user");
  return Response.json({ ok: true });
}
