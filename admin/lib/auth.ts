/** Hash password menggunakan Web Crypto API (tersedia di semua environment) */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(plain);
  return hashed === hash;
}

import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

/**
 * Memeriksa izin pengguna yang sedang login (berdasarkan cookie).
 * @param requiredPermission Izin yang dibutuhkan (misal: "produk:read")
 * @returns boolean true jika diizinkan, false jika ditolak
 */
export async function checkPermission(requiredPermission: string): Promise<boolean> {
  const cookieStore = await cookies();
  const username = cookieStore.get("dynoboo_user")?.value;

  if (!username) return false;

  const { data: user, error } = await supabase
    .from("admin_users")
    .select("role, permissions")
    .eq("username", username)
    .single();

  if (error || !user) return false;

  // Superadmin bypasses all
  if (user.role === "superadmin") return true;

  // Cek apakah permissions valid dan dalam bentuk array
  let perms: string[] = [];
  if (Array.isArray(user.permissions)) {
    perms = user.permissions;
  } else if (typeof user.permissions === "string") {
    try {
      perms = JSON.parse(user.permissions);
    } catch {
      perms = [];
    }
  }

  // Cek "all" bypass
  if (perms.includes("all")) return true;

  // Cek spesifik izin
  return perms.includes(requiredPermission);
}
