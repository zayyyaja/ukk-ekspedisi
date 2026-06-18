"use client";

import {
  addPdfHeader,
  addPdfSummary,
  addPdfTable,
  createPdfDocument,
  downloadPdf,
} from "@/lib/pdf";
import type { Shipment } from "@/types/customer-portal";
import type { PdfReportOptions } from "@/types/report";

function successRate(delivered: number, total: number) {
  return total === 0 ? "0%" : `${Math.round((delivered / total) * 100)}%`;
}

export function exportManagerShipmentPdf(data: Shipment[], options: PdfReportOptions) {
  const delivered = data.filter((shipment) => shipment.status === "delivered").length;
  const cancelled = data.filter((shipment) => shipment.status === "cancelled").length;
  const branchMap = data.reduce<Record<string, Shipment[]>>((summary, shipment) => {
    const branch = shipment.branches_shipments_origin_branch_idTobranches?.name ?? "Unknown";
    summary[branch] = [...(summary[branch] ?? []), shipment];
    return summary;
  }, {});
  const doc = createPdfDocument(options.title, "l");
  addPdfHeader(doc, options);
  addPdfSummary(doc, {
    "Total Shipment": data.length,
    Delivered: delivered,
    Cancelled: cancelled,
    Pending: data.filter((shipment) => shipment.status === "pending").length,
    "In Transit": data.filter((shipment) => shipment.status === "in_transit").length,
    "Success Rate": successRate(delivered, data.length),
  });
  addPdfTable(
    doc,
    ["No", "Branch", "Total Shipment", "Delivered", "Cancelled", "Success Rate"],
    Object.entries(branchMap).map(([branch, shipments], index) => {
      const branchDelivered = shipments.filter((shipment) => shipment.status === "delivered").length;
      return [
        index + 1,
        branch,
        shipments.length,
        branchDelivered,
        shipments.filter((shipment) => shipment.status === "cancelled").length,
        successRate(branchDelivered, shipments.length),
      ];
    }),
  );
  downloadPdf(doc, "laporan-shipment-manager.pdf");
}
