import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const typeId = searchParams.get("type_id");
  const month = searchParams.get("month"); // format: "2607"

  let query = supabase
    .from("invoices")
    .select("*, invoice_type:invoice_types(id, nama, prefix)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status_pembayaran", status);
  if (typeId) query = query.eq("invoice_type_id", typeId);
  if (month) {
    const yr = "20" + month.slice(0, 2);
    const mo = month.slice(2, 4);
    const start = `${yr}-${mo}-01`;
    const endDate = new Date(Number(yr), Number(mo), 0);
    query = query.gte("invoice_date", start).lte("invoice_date", endDate.toISOString().split("T")[0]);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const cookieStore = await cookies();
  const user = cookieStore.get("dynoboo_user")?.value ?? "superadmin";

  // Get invoice type prefix
  const { data: invType } = await supabase
    .from("invoice_types")
    .select("id, prefix")
    .eq("id", body.invoice_type_id)
    .single();

  if (!invType) return Response.json({ error: "Invoice type tidak ditemukan" }, { status: 400 });

  // Auto-generate invoice number via Supabase function
  const { data: invoiceNo, error: noErr } = await supabase.rpc("get_next_invoice_no", {
    p_type_id: invType.id,
    p_prefix: invType.prefix,
  });
  if (noErr) return Response.json({ error: noErr.message }, { status: 500 });

  const { items, ...headerBody } = body;
  const payload = {
    ...headerBody,
    invoice_no: invoiceNo,
    created_by: user,
  };

  const { data: invoice, error } = await supabase.from("invoices").insert(payload).select("*, invoice_type:invoice_types(*)").single();
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Insert line items if provided
  if (items && items.length > 0) {
    const lineItems = items.map((item: { item_id?: number; description: string; qty: number; satuan: string; harga_satuan: number }) => ({
      invoice_id: invoice.id,
      item_id: item.item_id || null,
      description: item.description,
      qty: item.qty,
      satuan: item.satuan,
      harga_satuan: item.harga_satuan,
    }));
    await supabase.from("invoice_items").insert(lineItems);

    // Recalculate totals
    const subtotal = items.reduce((sum: number, i: { qty: number; harga_satuan: number }) => sum + i.qty * i.harga_satuan, 0);
    const grandTotal = subtotal - (payload.discount ?? 0);
    await supabase.from("invoices").update({ subtotal, grand_total: grandTotal }).eq("id", invoice.id);
    invoice.subtotal = subtotal;
    invoice.grand_total = grandTotal;
  }

  return Response.json(invoice, { status: 201 });
}

