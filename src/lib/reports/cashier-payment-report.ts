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

export function exportCashierPaymentPdf(data: Payment[], options: PdfReportOptions) {
  const paid = data.filter((payment) => payment.payment_status === "paid");
  const cash = data.filter((payment) => payment.payment_method === "cash");
  const doc = createPdfDocument(options.title, "l");
  addPdfHeader(doc, options);
  addPdfSummary(doc, {
    "Branch Name": options.generatedBy.branchName ?? "-",
    "Total Payment Cabang": data.length,
    "Total Cash Payment": cash.length,
    "Total Online Payment": data.length - cash.length,
    "Total Paid": paid.length,
    "Total Pending": data.filter((payment) => payment.payment_status === "pending").length,
    "Total Revenue Cabang": formatCurrency(paid.reduce((sum, payment) => sum + Number(payment.amount), 0)),
  });
  addPdfTable(
    doc,
    ["No", "Tracking Number", "Sender", "Receiver", "Payment Method", "Payment Status", "Amount", "Payment Date"],
    data.map((payment, index) => [
      index + 1,
      payment.shipments?.tracking_number ?? "-",
      payment.shipments?.customers_shipments_sender_idTocustomers?.name ?? "-",
      payment.shipments?.customers_shipments_receiver_idTocustomers?.name ?? "-",
      payment.payment_method,
      payment.payment_status,
      formatCurrency(payment.amount),
      formatDate(payment.payment_date),
    ]),
  );
  downloadPdf(doc, "laporan-payment-cashier.pdf");
}
