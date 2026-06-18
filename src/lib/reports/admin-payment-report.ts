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
import type { Payment } from "@/types/customer-portal";
import type { PdfReportOptions } from "@/types/report";

export function exportAdminPaymentPdf(data: Payment[], options: PdfReportOptions) {
  const paid = data.filter((payment) => payment.payment_status === "paid");
  const doc = createPdfDocument(options.title, "l");
  addPdfHeader(doc, options);
  addPdfSummary(doc, {
    "Total Payment": data.length,
    "Total Paid": paid.length,
    "Total Pending": data.filter((payment) => payment.payment_status === "pending").length,
    "Total Failed": data.filter((payment) => payment.payment_status === "failed").length,
    "Total Revenue": formatCurrency(paid.reduce((sum, payment) => sum + Number(payment.amount), 0)),
  });
  addPdfTable(
    doc,
    ["No", "Tracking Number", "Customer", "Branch", "Payment Method", "Payment Status", "Amount", "Payment Date", "Transaction Reference"],
    data.map((payment, index) => [
      index + 1,
      payment.shipments?.tracking_number ?? "-",
      payment.shipments?.customers_shipments_sender_idTocustomers?.name ?? "-",
      payment.shipments?.branches_shipments_origin_branch_idTobranches?.name ?? "-",
      payment.payment_method,
      payment.payment_status,
      formatCurrency(payment.amount),
      formatDate(payment.payment_date),
      payment.transaction_reference ?? "-",
    ]),
  );
  downloadPdf(doc, "laporan-payment-admin.pdf");
}
