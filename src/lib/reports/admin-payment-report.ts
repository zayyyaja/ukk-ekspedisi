"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/pdf";
import type { Payment } from "@/types/customer-portal";
import type { PdfReportOptions } from "@/types/report";

export function exportAdminPaymentPdf(data: Payment[], options: PdfReportOptions) {
  const paid = data.filter((payment) => payment.payment_status === "paid");
  const pending = data.filter((payment) => payment.payment_status === "pending");
  const failed = data.filter((payment) => payment.payment_status === "failed");
  
  const totalRevenue = paid.reduce((sum, payment) => sum + Number(payment.amount), 0);

  const doc = new jsPDF("l", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ==========================================
  // BRANDING HEADER
  // ==========================================
  doc.setFillColor(251, 191, 36); // Amber 400
  doc.setDrawColor(15, 23, 42);   // Slate 900
  doc.setLineWidth(0.5);
  doc.rect(14, 14, pageWidth - 28, 24, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(options.title.toUpperCase(), 20, 24);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`// SYSTEM_GEN_DATE: ${formatDate(new Date().toISOString())} | RENDER_MODE: SYSTEM_MANIFEST`, 20, 31);

  // ==========================================
  // METRIC SUMMARY GRID (Sudah Diperbaiki)
  // ==========================================
  const startY = 44;
  const cardWidth = (pageWidth - 28 - 12) / 5;
  const cardHeight = 20;

  // Mendefinisikan warna secara eksplisit agar TS tidak bingung
  const metrics = [
    { label: "TOTAL TRANSAKSI", value: String(data.length), bg: [255, 255, 255], textColor: [15, 23, 42], fontSize: 12 },
    { label: "STATUS LUNAS", value: String(paid.length), bg: [209, 250, 229], textColor: [15, 23, 42], fontSize: 12 },
    { label: "STATUS PENDING", value: String(pending.length), bg: [254, 243, 199], textColor: [15, 23, 42], fontSize: 12 },
    { label: "STATUS GAGAL", value: String(failed.length), bg: [254, 226, 226], textColor: [15, 23, 42], fontSize: 12 },
    { label: "TOTAL PENDAPATAN", value: formatCurrency(totalRevenue), bg: [15, 23, 42], textColor: [255, 255, 255], fontSize: 10 },
  ];

  metrics.forEach((metric, index) => {
    const x = 14 + index * (cardWidth + 3);
    
    // Kotak Kard latar belakang
    doc.setFillColor(metric.bg[0], metric.bg[1], metric.bg[2]);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.rect(x, startY, cardWidth, cardHeight, "FD");

    // Cetak Label (Gunakan warna abu netral untuk sub-label)
    if (metric.label === "TOTAL PENDAPATAN") {
      doc.setTextColor(148, 163, 184); // Teks terang untuk bg hitam
    } else {
      doc.setTextColor(100, 116, 139); // Teks gelap untuk bg cerah
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(metric.label, x + 4, startY + 6);

    // Cetak Nilai Utama (Aman dari eror parameter terbaca banyak)
    doc.setTextColor(metric.textColor[0], metric.textColor[1], metric.textColor[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(metric.fontSize);
    doc.text(metric.value, x + 4, startY + 14);
  });

  // ==========================================
  // TABLE DATA
  // ==========================================
  const tableHeaders = [
    "NO", "NOMOR RESI", "PENGIRIM", "CABANG ASAL", 
    "METODE", "STATUS", "TOTAL BIAYA", "TANGGAL", "TRANS REFIID"
  ];

  const tableRows = data.map((payment, index) => [
    index + 1,
    payment.shipments?.tracking_number ?? "-",
    (payment.shipments?.customers_shipments_sender_idTocustomers?.name ?? "-").toUpperCase(),
    (payment.shipments?.branches_shipments_origin_branch_idTobranches?.name ?? "-").toUpperCase(),
    payment.payment_method.toUpperCase(),
    payment.payment_status.toUpperCase(),
    formatCurrency(payment.amount),
    formatDate(payment.payment_date),
    payment.transaction_reference ?? "-",
  ]);

  autoTable(doc, {
    startY: startY + cardHeight + 6,
    margin: { left: 14, right: 14 },
    head: [tableHeaders],
    body: tableRows,
    theme: "grid",
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
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      lineWidth: 0.1,
      lineColor: [226, 232, 240],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      5: { halign: "center" },
      6: { halign: "right" },
    },
    didParseCell: function (dataCell) {
      if (dataCell.section === "body" && dataCell.column.index === 5) {
        const status = String(dataCell.cell.raw).toLowerCase();
        if (status === "paid") {
          dataCell.cell.styles.fillColor = [209, 250, 229];
        } else if (status === "pending") {
          dataCell.cell.styles.fillColor = [254, 243, 199];
        } else if (status === "failed") {
          dataCell.cell.styles.fillColor = [254, 226, 226];
        }
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  if (finalY < pageHeight - 20) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`[ END_OF_MANIFEST_DATA_RAW - SECURITY LOG SECURITY CONSOLE ]`, 14, finalY);
  }

  doc.save("laporan-payment-admin.pdf");
}