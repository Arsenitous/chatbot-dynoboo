import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { supabase } from "@/lib/supabase";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function fmtRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function buildEmailHtml(invoice: {
  invoice_no: string; invoice_date: string; invoice_type?: { nama: string };
  customer_name: string; customer_contact?: string | null; status_pembayaran: string;
  invoice_items?: { description: string; qty: number; satuan: string; harga_satuan: number; total_harga: number }[];
  subtotal: number; discount: number; dp_amount: number; grand_total: number; catatan?: string | null;
}, company: { nama_toko: string; logo_url?: string | null; instagram?: string | null; no_hp?: string | null }) {
  const statusColor: Record<string, string> = { PAID: "#10b981", DP: "#f59e0b", UNPAID: "#ef4444", CANCELLED: "#94a3b8" };
  const color = statusColor[invoice.status_pembayaran] ?? "#94a3b8";
  const itemsHtml = (invoice.invoice_items ?? []).map(it => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${it.description}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${it.qty} ${it.satuan}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">${fmtRp(it.harga_satuan)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${fmtRp(it.total_harga)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Invoice ${invoice.invoice_no}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
<div style="max-width:640px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:32px;text-align:center;">
    <h1 style="color:white;margin:0;font-size:28px;font-weight:700;">${company.nama_toko}</h1>
    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">Handmade Crochet Dolls & Beaded Accessories</p>
  </div>
  <!-- Invoice Info -->
  <div style="padding:28px 32px;border-bottom:1px solid #e2e8f0;">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;">
      <div>
        <p style="margin:0 0 4px;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;">Bill To</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">${invoice.customer_name}</p>
        ${invoice.customer_contact ? `<p style="margin:4px 0 0;font-size:13px;color:#64748b;">${invoice.customer_contact}</p>` : ""}
        <p style="margin:8px 0 0;font-size:13px;color:#7c3aed;font-weight:600;">${invoice.invoice_type?.nama ?? "Invoice"}</p>
      </div>
      <div style="text-align:right;">
        <p style="margin:0 0 4px;font-size:12px;color:#64748b;">Invoice Date: <strong style="color:#0f172a;">${new Date(invoice.invoice_date).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</strong></p>
        <p style="margin:0 0 12px;font-size:12px;color:#64748b;">Invoice No: <strong style="color:#0f172a;font-family:monospace;">${invoice.invoice_no}</strong></p>
        <span style="display:inline-block;padding:6px 16px;border-radius:999px;background:${color}20;color:${color};font-size:12px;font-weight:700;border:1px solid ${color}40;">${invoice.status_pembayaran}</span>
      </div>
    </div>
  </div>
  <!-- Items Table -->
  <div style="padding:0 32px;">
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;">Deskripsi</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;">Harga</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
  </div>
  <!-- Totals -->
  <div style="padding:0 32px 28px;">
    <div style="max-width:280px;margin-left:auto;">
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#64748b;"><span>Subtotal</span><span>${fmtRp(invoice.subtotal)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#64748b;"><span>Diskon</span><span>${fmtRp(invoice.discount)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#64748b;"><span>DP</span><span>${fmtRp(invoice.dp_amount)}</span></div>
      <div style="display:flex;justify-content:space-between;padding:14px 16px;background:linear-gradient(135deg,#7c3aed20,#ec489920);border-radius:8px;margin-top:8px;">
        <span style="font-size:16px;font-weight:700;color:#7c3aed;">Grand Total</span>
        <span style="font-size:16px;font-weight:700;color:#7c3aed;">${fmtRp(invoice.grand_total)}</span>
      </div>
    </div>
  </div>
  ${invoice.catatan ? `<div style="padding:0 32px 28px;"><p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:700;">Catatan:</p><p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">${invoice.catatan}</p></div>` : ""}
  <!-- CTA -->
  <div style="padding:0 32px 32px;text-align:center;">
    <a href="${APP_URL}/invoice/${invoice.invoice_no}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Lihat Invoice Online</a>
  </div>
  <!-- Footer -->
  <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">${company.nama_toko} ${company.instagram ? `• ${company.instagram}` : ""} ${company.no_hp ? `• ${company.no_hp}` : ""}</p>
  </div>
</div></body></html>`;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { customer_email } = await request.json();
  if (!customer_email) return Response.json({ error: "Email customer diperlukan" }, { status: 400 });

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

  if (!gmailUser || !gmailPass || gmailUser === "emailku@gmail.com" || gmailPass.includes("xxxx")) {
    return Response.json({
      error: "Konfigurasi Gmail belum lengkap di .env.local! Silakan atur GMAIL_USER dan GMAIL_APP_PASSWORD (16 karakter password aplikasi Google)."
    }, { status: 400 });
  }

  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .select("*, invoice_type:invoice_types(*), invoice_items(*)")
    .eq("id", id)
    .single();
  if (invErr || !invoice) return Response.json({ error: "Invoice tidak ditemukan" }, { status: 404 });

  const { data: company } = await supabase.from("company_profiles").select("*").eq("is_active", true).single();
  const comp = company ?? { nama_toko: "DynoBoo", logo_url: null, instagram: "@dynoboo", no_hp: null };

  const html = buildEmailHtml(invoice, comp);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    await transporter.sendMail({
      from: `"${comp.nama_toko}" <${gmailUser}>`,
      to: customer_email,
      subject: `Invoice ${invoice.invoice_no} dari ${comp.nama_toko}`,
      html,
    });

    // Save email to invoice record
    await supabase.from("invoices").update({ customer_email }).eq("id", id);
    return Response.json({ ok: true, to: customer_email });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Gagal mengirim email via Nodemailer";
    return Response.json({ error: errMsg }, { status: 500 });
  }
}
