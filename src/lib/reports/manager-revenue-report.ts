"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/pdf"; // Pastikan utilitas pembantu diimpor langsung
import type { PdfReportOptions } from "@/types/report";

export function exportManagerRevenuePdf(data: Record<string, unknown>, options: PdfReportOptions) {
  // Logika Pemrosesan Data Asli (100% Utuh & Tidak Diubah)
  const revenueByBranch = (data.revenueByBranch ?? {}) as Record<string, number>;

  // 1. Inisialisasi dokumen jsPDF posisi Portrait (A4)
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  // ==========================================
  // BRANDING HEADER (INDUSTRIAL MANIFEST BOX)
  // ==========================================
  doc.setFillColor(251, 191, 36); // Amber 400 (Kuning Solid)
  doc.setDrawColor(15, 23, 42);   // Slate 900
  doc.setLineWidth(1);
  doc.rect(14, 14, pageWidth - 28, 24, "FD"); // Kotak border pejal tebal

  // Text Judul Dokumen
  doc.setTextColor(15, 23, 42);
  doc.setFont("courier", "bold");
  doc.setFontSize(16);
  doc.text(options.title.toUpperCase(), 20, 24);
  
  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  const currentIsoDate = new Date().toISOString().split('T')[0];
  doc.text(`// REVENUE_MANIFEST_DATE: ${currentIsoDate} | ACCESS_LEVEL: MANAGER_EXECUTIVE`, 20, 31);

  // ==========================================
  // METRIC SUMMARY GRID (3 COLUMNS x 2 ROWS)
  // ==========================================
  const startY = 44;
  const totalColumns = 3;
  const gap = 3;
  const cardWidth = (pageWidth - 28 - (gap * (totalColumns - 1))) / totalColumns;
  const cardHeight = 16;

  // Pemetaan struktur metrik persis sesuai objek ringkasan bawaan asli
  const metrics = [
    { label: "TOTAL REVENUE", value: formatCurrency(Number(data.totalRevenue ?? 0)), bg: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8.5 },
    { label: "REVENUE THIS MONTH", value: formatCurrency(Number(data.monthlyRevenue ?? data.totalRevenue ?? 0)), bg: [243, 244, 246], textColor: [15, 23, 42], fontSize: 8.5 },
    { label: "REVENUE TODAY", value: formatCurrency(Number(data.todayRevenue ?? 0)), bg: [243, 244, 246], textColor: [15, 23, 42], fontSize: 8.5 },
    { label: "TOTAL PAID TRANSACTION", value: String(Number(data.totalPaid ?? 0)), bg: [209, 250, 229], textColor: [15, 23, 42], fontSize: 11 },
    { label: "TOTAL PENDING TRANSACTION", value: String(Number(data.totalPending ?? 0)), bg: [254, 243, 199], textColor: [15, 23, 42], fontSize: 11 },
    { label: "TOTAL FAILED TRANSACTION", value: String(Number(data.totalFailed ?? 0)), bg: [254, 226, 226], textColor: [15, 23, 42], fontSize: 11 },
  ];

  metrics.forEach((metric, index) => {
    // Menghitung baris dan kolom secara dinamis untuk layout Portrait
    const colIndex = index % totalColumns;
    const rowIndex = Math.floor(index / totalColumns);

    const x = 14 + colIndex * (cardWidth + gap);
    const y = startY + rowIndex * (cardHeight + gap);
    
    // Background Card Kotak Solid
    doc.setFillColor(metric.bg[0], metric.bg[1], metric.bg[2]);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.rect(x, y, cardWidth, cardHeight, "FD");

    // Sub-Label Atas Kotak
    if (metric.label === "TOTAL REVENUE") {
      doc.setTextColor(148, 163, 184); // Teks abu terang untuk bg hitam pekat
    } else {
      doc.setTextColor(100, 116, 139); // Teks abu gelap untuk bg cerah
    }
    doc.setFont("courier", "bold");
    doc.setFontSize(5.5);
    doc.text(metric.label, x + 3, y + 5);

    // Nilai Angka Utama (Aman dari bentrokan parsing argumen array compiler TS)
    const txR = metric.textColor[0];
    const txG = metric.textColor[1];
    const txB = metric.textColor[2];
    doc.setTextColor(txR, txG, txB);
    doc.setFont("courier", "bold");
    doc.setFontSize(metric.fontSize);
    doc.text(metric.value, x + 3, y + 11);
  });

  // ==========================================
  // TABLE DATA (NEO-BRUTALIST ROW GRID)
  // ==========================================
  const tableHeaders = [
    "NO", "BRANCH", "TOTAL SHIPMENT", "TOTAL REVENUE", "PAID TRANSACTION", "PENDING TRANSACTION"
  ];

  // Map data baris tabel 100% menggunakan susunan array statis asli bawaan data
  const tableRows = Object.entries(revenueByBranch).map(([branch, revenue], index) => [
    index + 1,
    branch.toUpperCase(),
    "-",
    formatCurrency(revenue),
    "-",
    "-",
  ]);

  autoTable(doc, {
    startY: startY + (cardHeight * 2) + gap + 6, // Mengompensasi space 2 baris grid metrik summary
    margin: { left: 14, right: 14 },
    head: [tableHeaders],
    body: tableRows,
    theme: "plain", // Menghapus styling gradasi default jsPDF yang monoton
    styles: {
      font: "courier",
      fontSize: 8,
      fontStyle: "bold",
      textColor: [15, 23, 42],
      lineColor: [15, 23, 42],
      lineWidth: 0.5,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [15, 23, 42], // Kepala tabel hitam legam kaku
      textColor: [255, 255, 255],
      lineWidth: 0.5,
      lineColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" }, // No
      2: { halign: "center" },                // Total Shipment (-)
      3: { halign: "right" },                 // Total Revenue
      4: { halign: "center" },                // Paid Tx (-)
      5: { halign: "center" },                // Pending Tx (-)
    },
  });

  // ==========================================
  // FOOTER SYSTEM CODE SIGNATURE
  // ==========================================
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  if (finalY < pageHeight - 15) {
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`[ END_OF_FINANCIAL_REVENUE_METRICS_RAW - SYSTEM AUTOMATION LOGS ]`, 14, finalY);
  }

  // Mengunduh berkas laporan kaku pendapatan manager
  doc.save("laporan-revenue-manager.pdf");
}