import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const invoiceId = searchParams.get("invoice_id");
  let query = supabase.from("payments").select("*").order("created_at", { ascending: false });
  if (invoiceId) query = query.eq("invoice_id", invoiceId);
  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const cookieStore = await cookies();
  const user = cookieStore.get("dynoboo_user")?.value ?? "superadmin";

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({ ...body, dicatat_oleh: user })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Recalculate dp_amount and update invoice status
  const { data: allPayments } = await supabase
    .from("payments")
    .select("jumlah")
    .eq("invoice_id", body.invoice_id);
  const { data: invoice } = await supabase
    .from("invoices")
    .select("grand_total")
    .eq("id", body.invoice_id)
    .single();

  const totalPaid = (allPayments ?? []).reduce((s, p) => s + Number(p.jumlah), 0);
  const grandTotal = Number(invoice?.grand_total ?? 0);
  const sisaTagihan = Math.max(0, grandTotal - totalPaid);
  let newStatus = "UNPAID";
  if (totalPaid >= grandTotal && grandTotal > 0) newStatus = "PAID";
  else if (totalPaid > 0) newStatus = "DP";

  await supabase
    .from("invoices")
    .update({ dp_amount: totalPaid, sisa_tagihan: sisaTagihan, status_pembayaran: newStatus })
    .eq("id", body.invoice_id);

  return Response.json({ payment, new_status: newStatus }, { status: 201 });
}

