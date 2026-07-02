"use client";

import {
  addPdfHeader,
  addPdfSummary,
  addPdfTable,
  createPdfDocument,
  downloadPdf,
  formatCurrency,
  formatDate,
} from "@/lib/pdf";
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
  const doc = createPdfDocument(options.title, "l");
  addPdfHeader(doc, options);
  addPdfSummary(doc, {
    "Total Shipment": data.length,
    Pending: data.filter((item) => item.status === "pending").length,
    "Picked Up": data.filter((item) => item.status === "picked_up").length,
    "In Transit": data.filter((item) => item.status === "in_transit").length,
    "Arrived At Branch": data.filter((item) => item.status === "arrived_at_branch").length,
    Delivered: data.filter((item) => item.status === "delivered").length,
    Cancelled: data.filter((item) => item.status === "cancelled").length,
  });
  addPdfTable(
    doc,
    ["No", "Tracking Number", "Sender", "Receiver", "Origin", "Destination", "Courier", "Status", "Total Price", "Shipment Date"],
    data.map((shipment, index) => [
      index + 1,
      shipment.tracking_number,
      shipment.customers_shipments_sender_idTocustomers?.name ?? "-",
      shipment.customers_shipments_receiver_idTocustomers?.name ?? "-",
      shipment.branches_shipments_origin_branch_idTobranches?.city ?? "-",
      shipment.branches_shipments_destination_branch_idTobranches?.city ?? "-",
      shipment.users?.name ?? "-",
      shipment.status,
      formatCurrency(shipment.total_price),
      formatDate(shipment.shipment_date),
    ]),
  );
  downloadPdf(doc, "laporan-shipment-admin.pdf");
}

export function getShipmentStatusSummary(data: Shipment[]) {
  return Object.fromEntries(
    shipmentStatuses.map((status) => [
      status,
      data.filter((shipment) => shipment.status === status).length,
    ]),
  );
}
