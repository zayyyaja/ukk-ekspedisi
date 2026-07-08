"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/pdf"; // Impor utilitas pembantu untuk format manifest
import type { Shipment } from "@/types/customer-portal";
import type { PdfReportOptions } from "@/types/report";

function successRate(delivered: number, total: number) {
  return total === 0 ? "0%" : `${Math.round((delivered / total) * 100)}%`;
}

export function exportManagerShipmentPdf(data: Shipment[], options: PdfReportOptions) {
  // Logika Pemrosesan Data Asli (100% Utuh & Kaku Sesuai Bawaan Asli)
  const delivered = data.filter((shipment) => shipment.status === "delivered").length;
  const cancelled = data.filter((shipment) => shipment.status === "cancelled").length;
  const branchMap = data.reduce<Record<string, Shipment[]>>((summary, shipment) => {
    const branch = shipment.branches_shipments_origin_branch_idTobranches?.name ?? "Unknown";
    summary[branch] = [...(summary[branch] ?? []), shipment];
    return summary;
  }, {});

  // 1. Inisialisasi dokumen jsPDF posisi Landscape (A4)
  const doc = new jsPDF("l", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210mm

  // ==========================================
  // BRANDING HEADER (INDUSTRIAL MANIFEST BOX)
  // ==========================================
  doc.setFillColor(251, 191, 36); // Amber 400 (Kuning Solid)
  doc.setDrawColor(15, 23, 42);   // Slate 900
  doc.setLineWidth(1);
  doc.rect(14, 14, pageWidth - 28, 24, "FD"); // Kotak border pejal tebal

  // Text Judul Utama
  doc.setTextColor(15, 23, 42);
  doc.setFont("courier", "bold");
  doc.setFontSize(18);
  doc.text(options.title.toUpperCase(), 20, 24);
  
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  const currentIsoDate = new Date().toISOString().split('T')[0];
  doc.text(`// LOG_SHIPMENT_MANAGER_METRICS: ${currentIsoDate} | DATA_INTEGRITY: COMPLIANT`, 20, 31);

  // ==========================================
  // METRIC SUMMARY GRID (6 KOTAK STATUS PEJAL)
  // ==========================================
  const startY = 44;
  const totalCards = 6;
  const gap = 2;
  const cardWidth = (pageWidth - 28 - (gap * (totalCards - 1))) / totalCards;
  const cardHeight = 20;

  // Pemetaan metrik ringkasan data persis sesuai objek bawaan asli
  const metrics = [
    { label: "TOTAL SHIPMENT", value: String(data.length), bg: [255, 255, 255], text: [15, 23, 42] },
    { label: "DELIVERED", value: String(delivered), bg: [209, 250, 229], text: [15, 23, 42] },
    { label: "CANCELLED", value: String(cancelled), bg: [254, 226, 226], text: [15, 23, 42] },
    { label: "PENDING", value: String(data.filter((shipment) => shipment.status === "pending").length), bg: [254, 243, 199], text: [15, 23, 42] },
    { label: "IN TRANSIT", value: String(data.filter((shipment) => shipment.status === "in_transit").length), bg: [219, 234, 254], text: [15, 23, 42] },
    { label: "SUCCESS RATE", value: successRate(delivered, data.length), bg: [15, 23, 42], text: [255, 255, 255] },
  ];

  metrics.forEach((metric, index) => {
    const x = 14 + index * (cardWidth + gap);
    
    // Background Card Kotak Solid
    doc.setFillColor(metric.bg[0], metric.bg[1], metric.bg[2]);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.rect(x, startY, cardWidth, cardHeight, "FD");

    // Sub-Label Atas Kotak
    if (metric.label === "SUCCESS RATE") {
      doc.setTextColor(148, 163, 184); // Teks abu terang jika latar belakang hitam
    } else {
      doc.setTextColor(100, 116, 139); // Teks abu gelap jika latar belakang cerah
    }
    doc.setFont("courier", "bold");
    doc.setFontSize(6.5);
    doc.text(metric.label, x + 3, startY + 6);

    // Nilai Angka Utama (Aman dari batasan overloading parser compiler TS)
    const txR = metric.text[0];
    const txG = metric.text[1];
    const txB = metric.text[2];
    doc.setTextColor(txR, txG, txB);
    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.text(metric.value, x + 3, startY + 14);
  });

  // ==========================================
  // TABLE DATA (NEO-BRUTALIST ROW GRID)
  // ==========================================
  const tableHeaders = [
    "NO", "BRANCH", "TOTAL SHIPMENT", "DELIVERED", "CANCELLED", "SUCCESS RATE"
  ];

  // Map data baris tabel 100% menggunakan properti asli bawaan pengelompokan branch data
  const tableRows = Object.entries(branchMap).map(([branch, shipments], index) => {
    const branchDelivered = shipments.filter((shipment) => shipment.status === "delivered").length;
    return [
      index + 1,
      branch.toUpperCase(),
      shipments.length,
      branchDelivered,
      shipments.filter((shipment) => shipment.status === "cancelled").length,
      successRate(branchDelivered, shipments.length),
    ];
  });

  autoTable(doc, {
    startY: startY + cardHeight + 6,
    margin: { left: 14, right: 14 },
    head: [tableHeaders],
    body: tableRows,
    theme: "plain", // Membersihkan styling bawaan jspdf default yang halus/soft
    styles: {
      font: "courier",
      fontSize: 8.5,
      fontStyle: "bold",
      textColor: [15, 23, 42],
      lineColor: [15, 23, 42],
      lineWidth: 0.5,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [15, 23, 42], // Kepala tabel hitam legam pejal
      textColor: [255, 255, 255],
      lineWidth: 0.5,
      lineColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" }, // No
      2: { halign: "center" },                // Total Shipment
      3: { halign: "center" },                // Delivered
      4: { halign: "center" },                // Cancelled
      5: { halign: "right" },                 // Success Rate
    },
    didParseCell: function (dataCell) {
      // Pewarnaan kaku sel tabel tingkat keberhasilan kargo (Kolom indeks ke-5)
      if (dataCell.section === "body" && dataCell.column.index === 5) {
        const rateStr = String(dataCell.cell.raw);
        if (rateStr === "100%") {
          dataCell.cell.styles.fillColor = [209, 250, 229]; // Hijau Solid
        } else if (rateStr === "0%") {
          dataCell.cell.styles.fillColor = [254, 226, 226]; // Merah Solid
        }
      }
    },
  });

  // ==========================================
  // FOOTER CONSOLE SYSTEM SIGNATURE
  // ==========================================
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  if (finalY < pageHeight - 20) {
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`[ END_OF_MANAGER_SHIPMENT_MANIFEST_RAW - VERIFIED DATA AUTOMATION ]`, 14, finalY);
  }

  // Mengunduh berkas laporan kaku
  doc.save("laporan-shipment-manager.pdf");
}