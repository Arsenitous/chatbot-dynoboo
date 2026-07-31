import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// PATCH /api/pesanan/[id]/selesai — tandai pesanan sebagai selesai
export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const user = cookieStore.get("dynoboo_user")?.value ?? "superadmin";

  const { data, error } = await supabase
    .from("pesanan")
    .update({
      status: "SELESAI",
      selesai_at: new Date().toISOString(),
      diselesaikan_oleh: user,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
