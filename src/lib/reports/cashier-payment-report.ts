"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/pdf";
import type { Payment } from "@/types/customer-portal";
import type { PdfReportOptions } from "@/types/report";

export function exportCashierPaymentPdf(data: Payment[], options: PdfReportOptions) {
  const paid = data.filter((payment) => payment.payment_status === "paid");
  const cash = data.filter((payment) => payment.payment_method === "cash");

  // 1. Inisialisasi dokumen jsPDF posisi Landscape (A4)
  const doc = new jsPDF("l", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

  // ==========================================
  // BRANDING HEADER (INDUSTRIAL MANIFEST BOX)
  // ==========================================
  doc.setFillColor(251, 191, 36); // Amber 400 (Kuning Solid)
  doc.setDrawColor(15, 23, 42);   // Slate 900
  doc.setLineWidth(0.5);
  doc.rect(14, 14, pageWidth - 28, 24, "FD"); // Border kotak tebal pejal

  // Text Header Utama
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(options.title.toUpperCase(), 20, 24);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`// CASHIER_MANIFEST_DATE: ${formatDate(new Date().toISOString())} | RENDER_NODE: STATION_TERMINAL`, 20, 31);

  // ==========================================
  // METRIC SUMMARY GRID (7 KOTAK STATUS PEJAL)
  // ==========================================
  const startY = 44;
  const totalCards = 7;
  const gap = 2;
  const cardWidth = (pageWidth - 28 - (gap * (totalCards - 1))) / totalCards;
  const cardHeight = 20;

  const totalRevenue = paid.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const branchNameString = options.generatedBy.branchName ?? "-";

  // Pemetaan metrik data 100% persis sesuai objek asli tanpa mengubah formula
  const metrics = [
    { label: "BRANCH NAME", value: branchNameString, bg: [243, 244, 246], textColor: [15, 23, 42], fontSize: branchNameString.length > 12 ? 7 : 9 },
    { label: "TOTAL PAYMENT CABANG", value: String(data.length), bg: [255, 255, 255], textColor: [15, 23, 42], fontSize: 11 },
    { label: "TOTAL CASH PAYMENT", value: String(cash.length), bg: [243, 244, 246], textColor: [15, 23, 42], fontSize: 11 },
    { label: "TOTAL ONLINE PAYMENT", value: String(data.length - cash.length), bg: [219, 234, 254], textColor: [15, 23, 42], fontSize: 11 },
    { label: "TOTAL PAID", value: String(paid.length), bg: [209, 250, 229], textColor: [15, 23, 42], fontSize: 11 },
    { label: "TOTAL PENDING", value: String(data.filter((payment) => payment.payment_status === "pending").length), bg: [254, 243, 199], textColor: [15, 23, 42], fontSize: 11 },
    { label: "TOTAL REVENUE CABANG", value: formatCurrency(totalRevenue), bg: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8.5 },
  ];

  metrics.forEach((metric, index) => {
    const x = 14 + index * (cardWidth + gap);
    
    // Background Card Kotak Solid
    doc.setFillColor(metric.bg[0], metric.bg[1], metric.bg[2]);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.rect(x, startY, cardWidth, cardHeight, "FD");

    // Sub-Label Atas Kotak
    if (metric.label === "TOTAL REVENUE CABANG") {
      doc.setTextColor(148, 163, 184); // Teks abu terang jika latar hitam
    } else {
      doc.setTextColor(100, 116, 139); // Teks abu gelap jika latar cerah
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.text(metric.label, x + 3, startY + 6);

    // Nilai Angka Utama (Aman dari duplikasi argumen compiler TS)
    const txR = metric.textColor[0];
    const txG = metric.textColor[1];
    const txB = metric.textColor[2];
    doc.setTextColor(txR, txG, txB);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(metric.fontSize);
    doc.text(metric.value.toUpperCase(), x + 3, startY + 14);
  });

  // ==========================================
  // TABLE DATA (NEO-BRUTALIST ROW GRID)
  // ==========================================
  const tableHeaders = [
    "NO", "TRACKING NUMBER", "SENDER", "RECEIVER", "PAYMENT METHOD", "PAYMENT STATUS", "AMOUNT", "PAYMENT DATE"
  ];

  // Map baris data menggunakan properti asli tanpa mengubah struktur nilai bawaan
  const tableRows = data.map((payment, index) => [
    index + 1,
    payment.shipments?.tracking_number ?? "-",
    (payment.shipments?.customers_shipments_sender_idTocustomers?.name ?? "-").toUpperCase(),
    (payment.shipments?.customers_shipments_receiver_idTocustomers?.name ?? "-").toUpperCase(),
    payment.payment_method.toUpperCase(),
    payment.payment_status.toUpperCase(),
    formatCurrency(payment.amount),
    formatDate(payment.payment_date),
  ]);

  autoTable(doc, {
    startY: startY + cardHeight + 6,
    margin: { left: 14, right: 14 },
    head: [tableHeaders],
    body: tableRows,
    theme: "grid", // Menghapus styling default jspdf bawaan yang soft
    styles: {
      font: "helvetica",
      fontSize: 8,
      fontStyle: "bold",
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [15, 23, 42], // Header Hitam Legam
      textColor: [255, 255, 255],
      lineWidth: 0.1,
      lineColor: [226, 232, 240],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" }, // No
      4: { halign: "center" },                // Method
      5: { halign: "center" },                // Status
      6: { halign: "right" },                 // Amount
    },
    didParseCell: function (dataCell) {
      // Mewarnai background kaku cell status pada baris tabel (Kolom indeks ke-5)
      if (dataCell.section === "body" && dataCell.column.index === 5) {
        const currentStatus = String(dataCell.cell.raw).toLowerCase();
        if (currentStatus === "paid") {
          dataCell.cell.styles.fillColor = [209, 250, 229]; // Hijau Solid
        } else if (currentStatus === "pending") {
          dataCell.cell.styles.fillColor = [254, 243, 199]; // Kuning Solid
        } else if (currentStatus === "failed") {
          dataCell.cell.styles.fillColor = [254, 226, 226]; // Merah Solid
        }
      }
    },
  });

  // ==========================================
  // FOOTER SIGNATURE TERMINAL LOG
  // ==========================================
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  if (finalY < pageHeight - 20) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`[ END_OF_CASHIER_MANIFEST_BATCH_RAW - VERIFIED BY AUTHORIZED NODE SYSTEM ]`, 14, finalY);
  }

  // Mengunduh berkas manifest kasir
  doc.save("laporan-payment-cashier.pdf");
}