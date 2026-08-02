import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    color: "#1e293b",
    backgroundColor: "#ffffff",
    padding: "48 56",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  // Left col
  colLeft: { flex: 1 },
  billToLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#6ca0a8", marginBottom: 4 },
  customerName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0f172a", marginBottom: 2 },
  customerSub: { fontSize: 9, color: "#64748b", marginBottom: 1 },
  typeRow: { flexDirection: "row", marginTop: 12 },
  typeLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#6ca0a8" },
  typeValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#0f172a", marginLeft: 4 },
  // Center col
  colCenter: { flex: 1, alignItems: "center" },
  logoImage: { width: 100, height: 40, objectFit: "contain", marginBottom: 4 },
  logoText: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#6ca0a8", marginBottom: 4 },
  logoSubtitle: { fontSize: 7, color: "#94a3b8" },
  // Right col
  colRight: { flex: 1, alignItems: "flex-end" },
  metaRow: { flexDirection: "row", marginBottom: 4 },
  metaLabel: { fontSize: 9, color: "#94a3b8" },
  metaValue: { fontSize: 9, color: "#475569", fontFamily: "Helvetica-Bold", marginLeft: 4 },
  statusLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#475569", marginTop: 12, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 4 },
  statusText: { fontSize: 10, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
  
  divider: { height: 1.5, backgroundColor: "#1e293b", marginVertical: 16 },
  
  // Table
  table: { width: "100%", marginBottom: 16 },
  tableHeader: { flexDirection: "row", backgroundColor: "#e8f4f6", padding: "10 12" },
  thLeft: { flex: 3, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6ca0a8", letterSpacing: 0.5 },
  thCenter: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6ca0a8", textAlign: "center", letterSpacing: 0.5 },
  thRight: { flex: 1.5, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#6ca0a8", textAlign: "right", letterSpacing: 0.5 },
  
  tableRow: { flexDirection: "row", padding: "12 12", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  tdLeft: { flex: 3, fontSize: 10, color: "#1e293b" },
  tdCenter: { flex: 1, fontSize: 10, color: "#1e293b", textAlign: "center" },
  tdRight: { flex: 1.5, fontSize: 10, color: "#1e293b", textAlign: "right" },
  tdTotal: { flex: 1.5, fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1e293b", textAlign: "right" },

  // Totals
  totalsContainer: { alignItems: "flex-end", marginBottom: 20 },
  totalsBox: { width: 240 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalLabel: { fontSize: 10, color: "#475569", fontFamily: "Helvetica-Bold" },
  totalValue: { fontSize: 10, color: "#475569" },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#e8f4f6", padding: "10 12", borderRadius: 6, marginTop: 6 },
  grandTotalLabel: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#6ca0a8" },
  grandTotalValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#6ca0a8" },
  
  // Payment totals
  paidRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, marginTop: 6 },
  paidLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#10b981" },
  paidValue: { fontSize: 10, color: "#10b981" },
  
  lunasRow: { flexDirection: "row", justifyContent: "space-between", padding: "10 12", borderRadius: 6, marginTop: 4 },
  lunasLabel: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  lunasValue: { fontSize: 11, fontFamily: "Helvetica-Bold" },

  // Catatan
  catatanBox: { borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 16, marginTop: 8 },
  catatanLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#6ca0a8", marginBottom: 6 },
  catatanText: { fontSize: 9, color: "#64748b", lineHeight: 1.5 },
});

type InvoiceItem = {
  description: string;
  qty: number;
  satuan: string;
  harga_satuan: number;
  total_harga: number;
};

type InvoiceData = {
  invoice_no: string;
  invoice_date: string;
  invoice_type?: { nama: string };
  customer_name: string;
  customer_contact?: string | null;
  status_pembayaran: string;
  invoice_items?: InvoiceItem[];
  subtotal: number;
  discount: number;
  dp_amount: number;
  grand_total: number;
  catatan?: string | null;
};

type CompanyData = {
  nama_toko: string;
  logo_url?: string | null;
  instagram?: string | null;
  no_hp?: string | null;
};

function fmtRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PAID: { bg: "rgba(16,185,129,0.15)", text: "#10b981", border: "rgba(16,185,129,0.3)" },
  DP: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", border: "rgba(245,158,11,0.3)" },
  UNPAID: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", border: "rgba(239,68,68,0.25)" },
  CANCELLED: { bg: "rgba(100,116,139,0.1)", text: "#94a3b8", border: "rgba(100,116,139,0.2)" },
};

export function InvoicePDFDocument({
  invoice,
  company,
  appUrl,
}: {
  invoice: InvoiceData;
  company: CompanyData;
  appUrl: string;
}) {
  const items = invoice.invoice_items ?? [];
  const status = invoice.status_pembayaran;
  const statusStyle = STATUS_COLORS[status] ?? STATUS_COLORS.CANCELLED;
  
  const subtotalNet = invoice.subtotal - invoice.discount;
  const sisaTagihan = Math.max(0, subtotalNet - invoice.dp_amount);
  const isLunas = invoice.dp_amount > 0 && sisaTagihan === 0;
  
  // Use absolute URL for the logo for react-pdf
  const logoSrc = `${appUrl}/Logo_DynoBoo.png`;

  return (
    <Document title={`Invoice ${invoice.invoice_no}`}>
      <Page size="A4" style={styles.page}>
        
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.colLeft}>
            <Text style={styles.billToLabel}>Bill To :</Text>
            <Text style={styles.customerName}>{invoice.customer_name}</Text>
            {invoice.customer_contact ? (
              <Text style={styles.customerSub}>{invoice.customer_contact}</Text>
            ) : null}
            <View style={styles.typeRow}>
              <Text style={styles.typeLabel}>Type :</Text>
              <Text style={styles.typeValue}>{invoice.invoice_type?.nama ?? "Invoice"}</Text>
            </View>
          </View>
          
          <View style={styles.colCenter}>
            <Image src={logoSrc} style={styles.logoImage} />
            <Text style={styles.logoSubtitle}>CROCHET DOLLS &amp; BEADED ACCESSORIES</Text>
          </View>
          
          <View style={styles.colRight}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice Date :</Text>
              <Text style={styles.metaValue}>{fmtDate(invoice.invoice_date)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice No :</Text>
              <Text style={styles.metaValue}>{invoice.invoice_no}</Text>
            </View>
            <Text style={styles.statusLabel}>Status Pembayaran</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, border: `1pt solid ${statusStyle.border}` }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.thLeft}>DESCRIPTION</Text>
            <Text style={styles.thCenter}>QTY.</Text>
            <Text style={styles.thRight}>PRICE</Text>
            <Text style={styles.thRight}>TOTAL</Text>
          </View>
          
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tdLeft}>{item.description}</Text>
              <Text style={styles.tdCenter}>{item.qty} {item.satuan}</Text>
              <Text style={styles.tdRight}>{fmtRp(item.harga_satuan)}</Text>
              <Text style={styles.tdTotal}>{fmtRp(item.total_harga)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{fmtRp(invoice.subtotal)}</Text>
            </View>
            
            {invoice.discount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={[styles.totalValue, { color: "#ef4444" }]}>- {fmtRp(invoice.discount)}</Text>
              </View>
            )}
            
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{fmtRp(subtotalNet)}</Text>
            </View>
            
            {invoice.dp_amount > 0 && (
              <>
                <View style={styles.paidRow}>
                  <Text style={styles.paidLabel}>DP Dibayar</Text>
                  <Text style={styles.paidValue}>- {fmtRp(invoice.dp_amount)}</Text>
                </View>
                
                <View style={[
                  styles.lunasRow, 
                  { backgroundColor: isLunas ? "rgba(16,185,129,0.12)" : "#fff3cd" }
                ]}>
                  <Text style={[styles.lunasLabel, { color: isLunas ? "#10b981" : "#d97706" }]}>
                    {isLunas ? "✓ LUNAS" : "Sisa Tagihan"}
                  </Text>
                  <Text style={[styles.lunasValue, { color: isLunas ? "#10b981" : "#d97706" }]}>
                    {fmtRp(sisaTagihan)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Catatan */}
        {invoice.catatan ? (
          <View style={styles.catatanBox}>
            <Text style={styles.catatanLabel}>Catatan :</Text>
            <Text style={styles.catatanText}>{invoice.catatan}</Text>
          </View>
        ) : null}
        
      </Page>
    </Document>
  );
}
