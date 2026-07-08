"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/pdf";
import type { Shipment } from "@/types/customer-portal";
import type { PdfReportOptions } from "@/types/report";

const shipmentStatuses = [
  "pending",
  "picked_up",
  "in_transit",
  "arrived_at_branch",
  "delivered",
  "cancelled",
];

export function exportAdminShipmentPdf(data: Shipment[], options: PdfReportOptions) {
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
  doc.rect(14, 14, pageWidth - 28, 24, "FD"); // Border kotak tebal pejal

  // Text Header Utama
  doc.setTextColor(15, 23, 42);
  doc.setFont("courier", "bold");
  doc.setFontSize(18);
  doc.text(options.title.toUpperCase(), 20, 24);
  
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.text(`// LOG_MANIFEST_GEN_DATE: ${formatDate(new Date().toISOString())} | PROTECTION_MODE: SYSTEM_SECURE`, 20, 31);

  // ==========================================
  // METRIC SUMMARY GRID (7 KOTAK STATUS PEJAL)
  // ==========================================
  const startY = 44;
  const totalCards = 7;
  const gap = 2;
  const cardWidth = (pageWidth - 28 - (gap * (totalCards - 1))) / totalCards; 
  const cardHeight = 20;

  // Pemetaan metrik data persis sesuai logika bawaan asli
  const metrics = [
    { label: "TOTAL SHIPMENT", value: String(data.length), bg: [255, 255, 255], text: [15, 23, 42] },
    { label: "PENDING", value: String(data.filter((item) => item.status === "pending").length), bg: [254, 243, 199], text: [15, 23, 42] },
    { label: "PICKED UP", value: String(data.filter((item) => item.status === "picked_up").length), bg: [243, 244, 246], text: [15, 23, 42] },
    { label: "IN TRANSIT", value: String(data.filter((item) => item.status === "in_transit").length), bg: [219, 234, 254], text: [15, 23, 42] },
    { label: "ARRIVED AT BRANCH", value: String(data.filter((item) => item.status === "arrived_at_branch").length), bg: [233, 213, 255], text: [15, 23, 42] },
    { label: "DELIVERED", value: String(data.filter((item) => item.status === "delivered").length), bg: [209, 250, 229], text: [15, 23, 42] },
    { label: "CANCELLED", value: String(data.filter((item) => item.status === "cancelled").length), bg: [254, 226, 226], text: [15, 23, 42] },
  ];

  metrics.forEach((metric, index) => {
    const x = 14 + index * (cardWidth + gap);
    
    // Background Card Kotak Solid
    doc.setFillColor(metric.bg[0], metric.bg[1], metric.bg[2]);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.rect(x, startY, cardWidth, cardHeight, "FD");

    // Sub-Label Atas Kotak
    doc.setTextColor(100, 116, 139);
    doc.setFont("courier", "bold");
    doc.setFontSize(6);
    doc.text(metric.label, x + 3, startY + 6);

    // Nilai Angka Utama (Aman dari penumpukan argumen compiler)
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
    "NO", "TRACKING NUMBER", "SENDER", "RECEIVER", 
    "ORIGIN", "DESTINATION", "COURIER", "STATUS", "TOTAL PRICE", "SHIPMENT DATE"
  ];

  // Map baris data 100% menggunakan properti asli tanpa perubahan struktur nilai
  const tableRows = data.map((shipment, index) => [
    index + 1,
    shipment.tracking_number,
    (shipment.customers_shipments_sender_idTocustomers?.name ?? "-").toUpperCase(),
    (shipment.customers_shipments_receiver_idTocustomers?.name ?? "-").toUpperCase(),
    (shipment.branches_shipments_origin_branch_idTobranches?.city ?? "-").toUpperCase(),
    (shipment.branches_shipments_destination_branch_idTobranches?.city ?? "-").toUpperCase(),
    (shipment.users?.name ?? "-").toUpperCase(),
    shipment.status.toUpperCase(),
    formatCurrency(shipment.total_price),
    formatDate(shipment.shipment_date),
  ]);

  autoTable(doc, {
    startY: startY + cardHeight + 6,
    margin: { left: 14, right: 14 },
    head: [tableHeaders],
    body: tableRows,
    theme: "plain", // Menghapus gaya default bawaan jspdf yang monoton
    styles: {
      font: "courier",
      fontSize: 7.5,
      fontStyle: "bold",
      textColor: [15, 23, 42],
      lineColor: [15, 23, 42],
      lineWidth: 0.5,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [15, 23, 42], // Header Hitam Pekat
      textColor: [255, 255, 255],
      lineWidth: 0.5,
      lineColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" }, // No
      7: { halign: "center" },                // Status
      8: { halign: "right" },                 // Total Price
    },
    didParseCell: function (dataCell) {
      // Pewarnaan status sel manifest kargo kaku langsung di dalam kolom tabel status
      if (dataCell.section === "body" && dataCell.column.index === 7) {
        const currentStatus = String(dataCell.cell.raw).toLowerCase();
        if (currentStatus === "delivered") {
          dataCell.cell.styles.fillColor = [209, 250, 229]; // Hijau
        } else if (currentStatus === "pending") {
          dataCell.cell.styles.fillColor = [254, 243, 199]; // Kuning
        } else if (currentStatus === "cancelled") {
          dataCell.cell.styles.fillColor = [254, 226, 226]; // Merah
        } else if (["picked_up", "in_transit", "arrived_at_branch"].includes(currentStatus)) {
          dataCell.cell.styles.fillColor = [243, 244, 246]; // Abu Logistik
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
    doc.text(`[ END_OF_CARGO_MANIFEST_BATCH_RAW - VERIFIED DATA AUTOMATION ]`, 14, finalY);
  }

  // Mengunduh berkas laporan kaku
  doc.save("laporan-shipment-admin.pdf");
}

// 100% Utuh & Tidak Diubah Sesuai Request
export function getShipmentStatusSummary(data: Shipment[]) {
  return Object.fromEntries(
    shipmentStatuses.map((status) => [
      status,
      data.filter((shipment) => shipment.status === status).length,
    ]),
  );
}