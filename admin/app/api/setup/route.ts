import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";

export const dynamic = 'force-dynamic';

/**
 * One-time setup endpoint: buat superadmin pertama di database.
 * Kunjungi GET /api/setup sekali setelah menjalankan SQL migration.
 * Setelah superadmin terbuat, endpoint ini tidak bisa digunakan lagi.
 */
export async function GET() {
  // Cek apakah superadmin sudah ada
  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("role", "superadmin")
    .limit(1);

  if (existing && existing.length > 0) {
    return Response.json({
      ok: false,
      message: "SuperAdmin sudah ada di database. Setup tidak perlu dijalankan lagi.",
    }, { status: 409 });
  }

  // Buat superadmin dari env vars
  const username = process.env.ADMIN_USERNAME ?? "superadmin";
  const password = process.env.ADMIN_PASSWORD ?? "DynoBoo@2026";
  const hash = await hashPassword(password);

  const { error } = await supabase.from("admin_users").insert({
    username,
    password_hash: hash,
    role: "superadmin",
  });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    message: `✅ SuperAdmin "${username}" berhasil dibuat di database! Sekarang login bisa menggunakan data dari Supabase.`,
  });
}

