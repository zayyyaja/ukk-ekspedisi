"use client";

import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { fetchCashierReport } from "@/components/cashier/cashier-api";
import { CashierFiltersBar } from "@/components/cashier/cashier-filters";
import { CashierQueryProvider } from "@/components/cashier/cashier-query-provider";
import { CashierShell } from "@/components/cashier/cashier-shell";
import type { CashierFilters } from "@/components/cashier/cashier-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/customer-format";

const initialFilters: CashierFilters = { search: "", period: "30d", paymentMethod: "", paymentStatus: "", shipmentStatus: "", fromDate: "", toDate: "", page: 1, limit: 100 };

function ReportContent() {
  const [filters, setFilters] = useState(initialFilters);
  const report = useQuery({ queryKey: ["cashier-report", filters], queryFn: () => fetchCashierReport(filters) });
  const data = report.data;

  function exportPdf() {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Laporan Cashier Cabang", 14, 18);
    doc.setFontSize(10);
    doc.text(`Nama Cabang: ${data.branch?.name ?? "-"}`, 14, 28);
    doc.text(`Periode: ${filters.period}`, 14, 34);
    doc.text(`Total Pemasukan: ${formatCurrency(data.summary.totalRevenue)}`, 14, 42);
    doc.text(`Total Cash: ${formatCurrency(data.summary.totalCash)}`, 14, 48);
    doc.text(`Total Online: ${formatCurrency(data.summary.totalOnline)}`, 14, 54);
    doc.text(`Total Pending: ${data.summary.totalPending}`, 14, 60);
    doc.text(`Total Failed: ${data.summary.totalFailed}`, 14, 66);
    doc.text(`Jumlah Transaksi: ${data.summary.totalTransactions}`, 14, 72);
    autoTable(doc, {
      startY: 80,
      head: [["Tanggal", "Pemasukan Harian"]],
      body: (data.chartDaily ?? data.chart).map((item) => [
        item.date,
        formatCurrency(item.revenue),
      ]),
    });
    const dailyTableEnd = (
      doc as jsPDF & { lastAutoTable?: { finalY: number } }
    ).lastAutoTable?.finalY ?? 80;
    autoTable(doc, {
      startY: dailyTableEnd + 8,
      head: [["Bulan", "Pemasukan Bulanan"]],
      body: (data.chartMonthly ?? []).map((item) => [
        item.month,
        formatCurrency(item.revenue),
      ]),
    });
    const monthlyTableEnd = (
      doc as jsPDF & { lastAutoTable?: { finalY: number } }
    ).lastAutoTable?.finalY ?? dailyTableEnd;
    autoTable(doc, {
      startY: monthlyTableEnd + 8,
      head: [["No Resi", "Customer", "Amount", "Method", "Status"]],
      body: data.transactions.map((payment) => [
        payment.shipments?.tracking_number ?? "-",
        payment.shipments?.customers_shipments_sender_idTocustomers?.name ?? "-",
        formatCurrency(payment.amount),
        payment.payment_method,
        payment.payment_status,
      ]),
    });
    doc.save("laporan-cashier.pdf");
  }

  return (
    <CashierShell branchName={data?.branch?.name}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Laporan</h1>
          <p className="mt-2 text-sm font-medium text-muted">Chart pemasukan dan rekap transaksi cabang.</p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90" onClick={exportPdf} type="button">
          <Download size={18} />
          Unduh PDF
        </button>
      </div>
      <div className="mt-6">
        <CashierFiltersBar filters={filters} onChange={setFilters} />
      </div>
      <div className="mt-7 grid gap-5 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Total Pemasukan" value={formatCurrency(data?.summary.totalRevenue ?? 0)} />
        <Metric label="Total Cash" value={formatCurrency(data?.summary.totalCash ?? 0)} />
        <Metric label="Total Online" value={formatCurrency(data?.summary.totalOnline ?? 0)} />
        <Metric label="Total Pending" value={data?.summary.totalPending ?? 0} />
        <Metric label="Total Failed" value={data?.summary.totalFailed ?? 0} />
        <Metric label="Jumlah Transaksi" value={data?.summary.totalTransactions ?? 0} />
      </div>
      <Tabs className="mt-8" defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Harian</TabsTrigger>
          <TabsTrigger value="monthly">Bulanan</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <RevenueChart
            data={data?.chartDaily ?? data?.chart ?? []}
            dataKey="date"
            title="Pemasukan Harian"
          />
        </TabsContent>
        <TabsContent value="monthly">
          <RevenueChart
            data={data?.chartMonthly ?? []}
            dataKey="month"
            title="Pemasukan Bulanan"
          />
        </TabsContent>
      </Tabs>
    </CashierShell>
  );
}

function RevenueChart({
  data,
  dataKey,
  title,
}: {
  data: Array<{ revenue: number; date?: string; month?: string }>;
  dataKey: "date" | "month";
  title: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-6 h-80">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={dataKey} />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <div className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</div>
    </div>
  );
}

export default function CashierLaporanPage() {
  return <CashierQueryProvider><ReportContent /></CashierQueryProvider>;
}
