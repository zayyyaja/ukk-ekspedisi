"use client";

import {
  addPdfHeader,
  addPdfSummary,
  addPdfTable,
  createPdfDocument,
  downloadPdf,
  formatCurrency,
} from "@/lib/pdf";
import type { PdfReportOptions } from "@/types/report";

export function exportManagerRevenuePdf(data: Record<string, unknown>, options: PdfReportOptions) {
  const revenueByBranch = (data.revenueByBranch ?? {}) as Record<string, number>;
  const doc = createPdfDocument(options.title, "p");
  addPdfHeader(doc, options);
  addPdfSummary(doc, {
    "Total Revenue": formatCurrency(Number(data.totalRevenue ?? 0)),
    "Revenue This Month": formatCurrency(Number(data.monthlyRevenue ?? data.totalRevenue ?? 0)),
    "Revenue Today": formatCurrency(Number(data.todayRevenue ?? 0)),
    "Total Paid Transaction": Number(data.totalPaid ?? 0),
    "Total Pending Transaction": Number(data.totalPending ?? 0),
    "Total Failed Transaction": Number(data.totalFailed ?? 0),
  });
  addPdfTable(
    doc,
    ["No", "Branch", "Total Shipment", "Total Revenue", "Paid Transaction", "Pending Transaction"],
    Object.entries(revenueByBranch).map(([branch, revenue], index) => [
      index + 1,
      branch,
      "-",
      formatCurrency(revenue),
      "-",
      "-",
    ]),
  );
  downloadPdf(doc, "laporan-revenue-manager.pdf");
}
