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

export function exportManagerCourierPerformancePdf(
  data: Shipment[],
  options: PdfReportOptions,
) {
  const assigned = data.filter((shipment) => shipment.users?.name);
  const courierMap = assigned.reduce<Record<string, Shipment[]>>((summary, shipment) => {
    const name = shipment.users?.name ?? "Unknown";
    summary[name] = [...(summary[name] ?? []), shipment];
    return summary;
  }, {});
  const delivered = assigned.filter((shipment) => shipment.status === "delivered").length;
  const doc = createPdfDocument(options.title, "l");
  addPdfHeader(doc, options);
  addPdfSummary(doc, {
    "Total Courier": Object.keys(courierMap).length,
    "Total Delivered": delivered,
    "Average Delivery Success Rate": successRate(delivered, assigned.length),
  });
  addPdfTable(
    doc,
    ["No", "Courier Name", "Branch", "Assigned Shipment", "Delivered", "Cancelled", "Success Rate"],
    Object.entries(courierMap).map(([courier, shipments], index) => {
      const courierDelivered = shipments.filter((shipment) => shipment.status === "delivered").length;
      return [
        index + 1,
        courier,
        shipments[0]?.branches_shipments_origin_branch_idTobranches?.name ?? "-",
        shipments.length,
        courierDelivered,
        shipments.filter((shipment) => shipment.status === "cancelled").length,
        successRate(courierDelivered, shipments.length),
      ];
    }),
  );
  downloadPdf(doc, "laporan-performa-kurir.pdf");
}
