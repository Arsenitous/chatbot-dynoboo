import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Get invoice_id before deleting
  const { data: pmt } = await supabase.from("payments").select("invoice_id, jumlah").eq("id", id).single();
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (pmt) {
    // Recalculate
    const { data: allPayments } = await supabase.from("payments").select("jumlah").eq("invoice_id", pmt.invoice_id);
    const { data: invoice } = await supabase.from("invoices").select("grand_total").eq("id", pmt.invoice_id).single();
    const totalPaid = (allPayments ?? []).reduce((s, p) => s + Number(p.jumlah), 0);
    const grandTotal = Number(invoice?.grand_total ?? 0);
    const sisaTagihan = Math.max(0, grandTotal - totalPaid);
    let newStatus = "UNPAID";
    if (totalPaid >= grandTotal && grandTotal > 0) newStatus = "PAID";
    else if (totalPaid > 0) newStatus = "DP";
    await supabase.from("invoices").update({ dp_amount: totalPaid, sisa_tagihan: sisaTagihan, status_pembayaran: newStatus }).eq("id", pmt.invoice_id);
  }
  return Response.json({ ok: true });
}
