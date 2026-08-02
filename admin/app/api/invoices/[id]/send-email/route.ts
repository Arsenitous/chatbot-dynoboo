import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { supabase } from "@/lib/supabase";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { InvoicePDFDocument } from "@/lib/invoice-pdf";

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
  const statusColors: Record<string, {bg: string; text: string; border: string}> = { 
    PAID: {bg: "rgba(16,185,129,0.15)", text: "#10b981", border: "rgba(16,185,129,0.3)"}, 
    DP: {bg: "rgba(245,158,11,0.15)", text: "#f59e0b", border: "rgba(245,158,11,0.3)"}, 
    UNPAID: {bg: "rgba(239,68,68,0.12)", text: "#ef4444", border: "rgba(239,68,68,0.25)"}, 
    CANCELLED: {bg: "rgba(100,116,139,0.1)", text: "#94a3b8", border: "rgba(100,116,139,0.2)"} 
  };
  const st = statusColors[invoice.status_pembayaran] ?? statusColors.CANCELLED;
  const itemsHtml = (invoice.invoice_items ?? []).map(it => `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b;">${it.description}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b;text-align:center;">${it.qty} ${it.satuan}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b;text-align:right;">${fmtRp(it.harga_satuan)}</td>
      <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b;text-align:right;font-weight:600;">${fmtRp(it.total_harga)}</td>
    </tr>`).join("");
    
  const subtotalNet = invoice.subtotal - invoice.discount;
  const sisaTagihan = Math.max(0, subtotalNet - invoice.dp_amount);
  const isLunas = invoice.dp_amount > 0 && sisaTagihan === 0;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Invoice ${invoice.invoice_no}</title></head>
<body style="margin:0;padding:32px 16px;background:#f1f5f9;font-family:Arial,sans-serif;">
<div style="max-width:800px;margin:0 auto;background:white;border-radius:12px;padding:40px 48px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  
  <!-- Header Grid -->
  <table style="width:100%;margin-bottom:24px;" cellpadding="0" cellspacing="0">
    <tr>
      <td style="vertical-align:top;width:33%;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#6ca0a8;">Bill To :</p>
        <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#0f172a;">${invoice.customer_name}</p>
        ${invoice.customer_contact ? `<p style="margin:0;font-size:13px;color:#64748b;">${invoice.customer_contact}</p>` : ""}
        <p style="margin:16px 0 0;font-size:14px;font-weight:600;color:#6ca0a8;">Type : <strong style="color:#0f172a;">${invoice.invoice_type?.nama ?? "Invoice"}</strong></p>
      </td>
      <td style="vertical-align:top;text-align:center;width:33%;">
        <img src="${APP_URL}/Logo_DynoBoo.png" alt="DynoBoo" style="max-height:60px;max-width:140px;object-fit:contain;" />
        <p style="margin:4px 0 0;font-size:10px;color:#94a3b8;">CROCHET DOLLS &amp; BEADED ACCESSORIES</p>
      </td>
      <td style="vertical-align:top;text-align:right;width:33%;">
        <p style="margin:0 0 6px;font-size:13px;color:#475569;"><span style="color:#94a3b8;">Invoice Date : </span><strong style="color:#475569;">${new Date(invoice.invoice_date).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</strong></p>
        <p style="margin:0 0 16px;font-size:13px;color:#475569;"><span style="color:#94a3b8;">Invoice No : </span><strong style="font-family:monospace;color:#475569;">${invoice.invoice_no}</strong></p>
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#475569;">Status Pembayaran</p>
        <span style="display:inline-block;padding:8px 20px;border-radius:6px;background:${st.bg};color:${st.text};font-size:13px;font-weight:700;border:1px solid ${st.border};letter-spacing:0.05em;">${invoice.status_pembayaran}</span>
      </td>
    </tr>
  </table>

  <!-- Divider -->
  <div style="height:1.5px;background:#1e293b;margin:24px 0;"></div>

  <!-- Table -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:#e8f4f6;">
        <th style="padding:12px 16px;text-align:left;font-size:12px;font-weight:700;letter-spacing:0.08em;color:#6ca0a8;">DESCRIPTION</th>
        <th style="padding:12px 16px;text-align:center;font-size:12px;font-weight:700;letter-spacing:0.08em;color:#6ca0a8;">QTY.</th>
        <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:700;letter-spacing:0.08em;color:#6ca0a8;">PRICE</th>
        <th style="padding:12px 16px;text-align:right;font-size:12px;font-weight:700;letter-spacing:0.08em;color:#6ca0a8;">TOTAL</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <!-- Divider -->
  <div style="height:1.5px;background:#1e293b;margin:24px 0;"></div>

  <!-- Totals -->
  <table style="width:100%;margin-bottom:24px;" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:60%;"></td>
      <td style="width:40%;">
        <table style="width:100%;font-size:14px;color:#475569;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;text-align:right;font-weight:600;">Total</td>
            <td style="padding:6px 0;text-align:right;width:120px;">${fmtRp(invoice.subtotal)}</td>
          </tr>
          ${invoice.discount > 0 ? `
          <tr>
            <td style="padding:6px 0;text-align:right;font-weight:600;">Discount</td>
            <td style="padding:6px 0;text-align:right;color:#ef4444;">- ${fmtRp(invoice.discount)}</td>
          </tr>` : ""}
          <tr>
            <td colspan="2" style="padding-top:8px;">
              <table style="width:100%;background:#e8f4f6;border-radius:8px;padding:14px 20px;">
                <tr>
                  <td style="text-align:right;font-weight:700;font-size:18px;color:#6ca0a8;">Grand Total</td>
                  <td style="text-align:right;font-weight:700;font-size:18px;color:#6ca0a8;width:120px;">${fmtRp(subtotalNet)}</td>
                </tr>
              </table>
            </td>
          </tr>
          ${invoice.dp_amount > 0 ? `
          <tr>
            <td style="padding:14px 0 6px;text-align:right;font-weight:600;color:#10b981;">DP Dibayar</td>
            <td style="padding:14px 0 6px;text-align:right;color:#10b981;width:120px;">- ${fmtRp(invoice.dp_amount)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:4px;">
              <table style="width:100%;background:${isLunas ? "rgba(16,185,129,0.12)" : "#fff3cd"};border-radius:8px;padding:14px 20px;">
                <tr>
                  <td style="text-align:right;font-weight:700;color:${isLunas ? "#10b981" : "#d97706"};">${isLunas ? "✓ LUNAS" : "Sisa Tagihan"}</td>
                  <td style="text-align:right;font-weight:700;color:${isLunas ? "#10b981" : "#d97706"};width:120px;">${fmtRp(sisaTagihan)}</td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ""}
        </table>
      </td>
    </tr>
  </table>

  <!-- Catatan -->
  ${invoice.catatan ? `<div style="border-top:1px solid #e2e8f0;padding-top:16px;margin-bottom:32px;"><p style="margin:0 0 6px;font-size:12px;color:#6ca0a8;font-weight:700;">Catatan :</p><p style="margin:0;font-size:12px;color:#64748b;line-height:1.7;white-space:pre-line;">${invoice.catatan}</p></div>` : ""}

  <div style="text-align:center;margin-top:24px;">
    <a href="${APP_URL}/invoice/${invoice.invoice_no}" style="display:inline-block;padding:12px 28px;background:#0f172a;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Lihat Invoice Online</a>
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

  // Generate PDF buffer from invoice data
  let pdfBuffer: Buffer;
  try {
    const pdfDoc = React.createElement(
      InvoicePDFDocument,
      { invoice, company: comp, appUrl: APP_URL }
    ) as React.ReactElement<DocumentProps>;
    const uint8Array = await renderToBuffer(pdfDoc);
    pdfBuffer = Buffer.from(uint8Array);
  } catch (pdfErr: unknown) {
    const msg = pdfErr instanceof Error ? pdfErr.message : "Gagal generate PDF";
    return Response.json({ error: `Gagal membuat PDF: ${msg}` }, { status: 500 });
  }

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
      attachments: [
        {
          filename: `Invoice-${invoice.invoice_no}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    // Save email to invoice record
    await supabase.from("invoices").update({ customer_email }).eq("id", id);
    return Response.json({ ok: true, to: customer_email });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Gagal mengirim email via Nodemailer";
    return Response.json({ error: errMsg }, { status: 500 });
  }
}
