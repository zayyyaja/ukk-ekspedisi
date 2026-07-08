"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/pdf"; // Pastikan utilitas pembantu tetap diimpor jika diperlukan di modul lain
import type { Shipment } from "@/types/customer-portal";
import type { PdfReportOptions } from "@/types/report";

function successRate(delivered: number, total: number) {
  return total === 0 ? "0%" : `${Math.round((delivered / total) * 100)}%`;
}

export function exportManagerCourierPerformancePdf(
  data: Shipment[],
  options: PdfReportOptions,
) {
  // Logika Pemrosesan Data Asli (100% Utuh & Tidak Diubah)
  const assigned = data.filter((shipment) => shipment.users?.name);
  const courierMap = assigned.reduce<Record<string, Shipment[]>>((summary, shipment) => {
    const name = shipment.users?.name ?? "Unknown";
    summary[name] = [...(summary[name] ?? []), shipment];
    return summary;
  }, {});
  const delivered = assigned.filter((shipment) => shipment.status === "delivered").length;

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

  // Text Judul Dokumen
  doc.setTextColor(15, 23, 42);
  doc.setFont("courier", "bold");
  doc.setFontSize(18);
  doc.text(options.title.toUpperCase(), 20, 24);
  
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  const currentIsoDate = new Date().toISOString().split('T')[0];
  doc.text(`// PERFORMANCE_METRICS_DATE: ${currentIsoDate} | ARCHITECTURE_NODE: MANAGER_CONSOLE`, 20, 31);

  // ==========================================
  // METRIC SUMMARY GRID (3 KOTAK RINGKASAN BESAR)
  // ==========================================
  const startY = 44;
  const totalCards = 3;
  const gap = 4;
  const cardWidth = (pageWidth - 28 - (gap * (totalCards - 1))) / totalCards;
  const cardHeight = 20;

  // Pemetaan struktur metrik persis sesuai objek ringkasan asli
  const metrics = [
    { label: "TOTAL COURIER", value: String(Object.keys(courierMap).length), bg: [255, 255, 255], textColor: [15, 23, 42] },
    { label: "TOTAL DELIVERED", value: String(delivered), bg: [209, 250, 229], textColor: [15, 23, 42] },
    { label: "AVERAGE DELIVERY SUCCESS RATE", value: successRate(delivered, assigned.length), bg: [15, 23, 42], textColor: [255, 255, 255] },
  ];

  metrics.forEach((metric, index) => {
    const x = 14 + index * (cardWidth + gap);
    
    // Background Card Kotak Solid
    doc.setFillColor(metric.bg[0], metric.bg[1], metric.bg[2]);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.rect(x, startY, cardWidth, cardHeight, "FD");

    // Sub-Label Atas Kotak
    if (metric.label.includes("AVERAGE")) {
      doc.setTextColor(148, 163, 184); // Teks abu terang untuk bg hitam pekat
    } else {
      doc.setTextColor(100, 116, 139); // Teks abu gelap untuk bg cerah
    }
    doc.setFont("courier", "bold");
    doc.setFontSize(6.5);
    doc.text(metric.label, x + 4, startY + 6);

    // Nilai Angka Utama (Aman dari bentrokan parsing argumen array compiler TS)
    const txR = metric.textColor[0];
    const txG = metric.textColor[1];
    const txB = metric.textColor[2];
    doc.setTextColor(txR, txG, txB);
    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.text(metric.value, x + 4, startY + 14);
  });

  // ==========================================
  // TABLE DATA (NEO-BRUTALIST ROW GRID)
  // ==========================================
  const tableHeaders = [
    "NO", "COURIER NAME", "BRANCH", "ASSIGNED SHIPMENT", "DELIVERED", "CANCELLED", "SUCCESS RATE"
  ];

  // Map data baris tabel 100% menggunakan kompilasi data bawaan asli
  const tableRows = Object.entries(courierMap).map(([courier, shipments], index) => {
    const courierDelivered = shipments.filter((shipment) => shipment.status === "delivered").length;
    return [
      index + 1,
      courier.toUpperCase(),
      (shipments[0]?.branches_shipments_origin_branch_idTobranches?.name ?? "-").toUpperCase(),
      shipments.length,
      courierDelivered,
      shipments.filter((shipment) => shipment.status === "cancelled").length,
      successRate(courierDelivered, shipments.length),
    ];
  });

  autoTable(doc, {
    startY: startY + cardHeight + 6,
    margin: { left: 14, right: 14 },
    head: [tableHeaders],
    body: tableRows,
    theme: "plain", // Menghapus styling gradasi default jsPDF yang monoton
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
      3: { halign: "center" },                // Assigned
      4: { halign: "center" },                // Delivered
      5: { halign: "center" },                // Cancelled
      6: { halign: "right" },                 // Success Rate
    },
    didParseCell: function (dataCell) {
      // Highlight sel secara kaku jika memiliki performa sempurna (100%) atau kritis (0%)
      if (dataCell.section === "body" && dataCell.column.index === 6) {
        const rateStr = String(dataCell.cell.raw);
        if (rateStr === "100%") {
          dataCell.cell.styles.fillColor = [209, 250, 229]; // Hijau Stabil
        } else if (rateStr === "0%") {
          dataCell.cell.styles.fillColor = [254, 226, 226]; // Merah Peringatan
        }
      }
    },
  });

  // ==========================================
  // FOOTER MANAGER CODE SIGNATURE
  // ==========================================
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  if (finalY < pageHeight - 20) {
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`[ END_OF_PERFORMANCE_METRICS_RAW - VERIFIED BY MANAGER AUTHENTICATION NODE ]`, 14, finalY);
  }

  // Mengunduh berkas laporan kaku performa kurir
  doc.save("laporan-performa-kurir.pdf");
}