import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: workshops } = await supabase.from("workshops").select("*").order("id", { ascending: true });
  const { data: invoices } = await supabase.from("invoices").select("id").neq("status_pembayaran", "CANCELLED");
  
  if (!workshops) return NextResponse.json([]);
  if (!invoices || invoices.length === 0) {
    return NextResponse.json(workshops.map(w => ({ ...w, tiket_terjual: 0 })));
  }
  
  const activeInvoiceIds = invoices.map(i => i.id);

  const { data: invoiceItems } = await supabase
    .from("invoice_items")
    .select("*")
    .in("invoice_id", activeInvoiceIds);

  const soldMap: Record<string, number> = {};
  for (const item of (invoiceItems || [])) {
    if (item.description) {
      soldMap[item.description] = (soldMap[item.description] || 0) + item.qty;
    }
  }

  const result = workshops.map(w => ({
    ...w,
    tiket_terjual: soldMap[w.nama_workshop] || 0
  }));

  return NextResponse.json(result);
}
