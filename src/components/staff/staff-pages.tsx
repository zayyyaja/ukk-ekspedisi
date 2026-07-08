"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  BarChart3,
  Building2,
  CreditCard,
  Eye,
  PackageCheck,
  Truck,
  Users,
  AlertTriangle,
  Loader2,
  FileText,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PdfExportButton } from "@/components/reports/pdf-export-button";
import { ReportFilter } from "@/components/reports/report-filter";
import { StatusBadge } from "@/components/status-badge";
import { ActionMenu } from "@/components/staff/action-menu";
import { DashboardChart } from "@/components/staff/dashboard-chart";
import { DataTable } from "@/components/staff/data-table";
import { FilterBar } from "@/components/staff/filter-bar";
import { PageHeader } from "@/components/staff/page-header";
import { StatCard } from "@/components/staff/stat-card";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { getCurrentUser } from "@/lib/auth-client";
import { formatCurrency, formatDate } from "@/lib/customer-format";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getAdminBranchReport,
  getAdminCustomerReport,
  getAdminPaymentReport,
  getAdminStaffReport,
  getAdminShipmentReport,
  getCashierPaymentReport,
  getManagerCourierPerformanceReport,
  getManagerRevenueReport,
  getManagerShipmentReport,
} from "@/lib/report-client";
import { exportAdminPaymentPdf } from "@/lib/reports/admin-payment-report";
import { exportAdminShipmentPdf } from "@/lib/reports/admin-shipment-report";
import { exportCashierPaymentPdf } from "@/lib/reports/cashier-payment-report";
import { exportManagerCourierPerformancePdf } from "@/lib/reports/manager-courier-performance-report";
import { exportManagerRevenuePdf } from "@/lib/reports/manager-revenue-report";
import { exportManagerShipmentPdf } from "@/lib/reports/manager-shipment-report";
import type {
  Branch,
  CurrentUser,
  CustomerRecord,
  DashboardSummary,
  Payment,
  Rate,
  Shipment,
  StaffUser,
  Vehicle,
} from "@/types/customer-portal";
import type {
  PdfReportOptions,
  ReportFilters,
  ReportGenerator,
} from "@/types/report";

function useApiData<T>(path: string, fallback: T, refreshKey = 0) {
  const query = useQuery({
    queryKey: ["staff-api", path, refreshKey],
    queryFn: async () => {
      const response = await apiGet<T>(path);
      return response.data;
    },
    refetchInterval: 4_000,
  });

  return {
    data: query.data ?? fallback,
    loading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.isError
          ? "Gagal memuat data."
          : "",
  };
}

function StatePanel({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: string;
  onRetry?: () => void;
}) {
  if (loading) {
    return (
      <div className="flex w-full items-center gap-3 border-4 border-slate-900 bg-white p-5 font-mono text-sm font-black uppercase text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm">
        <Loader2 className="animate-spin text-amber-500 stroke-3" size={18} />
        <span>[ TRANSMISI DATA ] MEMUAT MANIFES GUDANG...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full flex-col gap-4 border-4 border-slate-900 bg-rose-100 p-5 font-mono text-sm shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm">
        <div className="flex items-center gap-2.5 font-black text-rose-900 uppercase">
          <AlertTriangle className="stroke-3" size={18} />
          <span>[ GALAT SISTEM ] INTERUPSI JARINGAN OPERASIONAL</span>
        </div>
        <p className="font-bold text-rose-950/80 uppercase text-xs tracking-wide">{error}</p>
        {onRetry && (
          <button
            className="w-fit inline-flex h-9 items-center justify-center border-2 border-slate-900 bg-white px-4 text-2xs font-black uppercase tracking-wider text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]"
            onClick={onRetry}
            type="button"
          >
            MUAT ULANG DATA
          </button>
        )}
      </div>
    );
  }

  return null;
}

function chartData(record?: Record<string, number>) {
  return Object.entries(record ?? {}).map(([name, value]) => ({ name, value }));
}

function validateReportFilters(filters: ReportFilters) {
  if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate) {
    throw new Error("From date tidak boleh lebih besar dari to date.");
  }
}

function useReportGenerator(role: "admin" | "cashier" | "manager" | "owner") {
  const [generator, setGenerator] = useState<ReportGenerator>({
    name: "Staff",
    role,
    branchName: null,
  });

  useEffect(() => {
    getCurrentUser()
      .then((response) => {
        const user = response.data as {
          name?: string;
          role?: string;
          branchId?: number | null;
        };
        setGenerator({
          name: user.name ?? "Staff",
          role,
          branchName: user.branchId ? `Branch #${user.branchId}` : null,
        });
      })
      .catch(() => null);
  }, [role]);

  return generator;
}

function reportOptions(
  title: string,
  role: "admin" | "cashier" | "manager" | "owner",
  generator: ReportGenerator,
  filters: ReportFilters,
): PdfReportOptions {
  return {
    title,
    period: { fromDate: filters.fromDate, toDate: filters.toDate },
    generatedBy: { ...generator, role },
  };
}

function exportSimpleAdminPdf(
  title: string,
  filename: string,
  columns: string[],
  rows: (string | number)[][],
  generator: ReportGenerator,
  filters: ReportFilters,
) {
  // 1. Logika penentuan posisi halaman (Kaku & Otomatis sesuai bawaan asli)
  const orientation = columns.length > 6 ? "l" : "p";
  const doc = new jsPDF(orientation, "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ==========================================
  // BRANDING HEADER (INDUSTRIAL MANIFEST BOX)
  // ==========================================
  doc.setFillColor(251, 191, 36); // Amber 400 (Kuning Solid)
  doc.setDrawColor(15, 23, 42);   // Slate 900
  doc.setLineWidth(1);
  doc.rect(14, 14, pageWidth - 28, 24, "FD"); // Kotak border tebal pejal

  // Text Title Header
  doc.setTextColor(15, 23, 42);
  doc.setFont("courier", "bold");
  doc.setFontSize(16);
  doc.text(title.toUpperCase(), 20, 24);
  
  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  const currentIsoDate = new Date().toISOString().split('T')[0];
  doc.text(`// GENERATED_DATE: ${currentIsoDate} | ARCHITECTURE_MODE: DYNAMIC_COMPILATION`, 20, 31);

  // ==========================================
  // METRIC SUMMARY CARD (TOTAL DATA SINGLE BOX)
  // ==========================================
  const startY = 44;
  const cardWidth = orientation === "l" ? 55 : 50; 
  const cardHeight = 18;

  doc.setFillColor(255, 255, 255); // Putih Solid
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.rect(14, startY, cardWidth, cardHeight, "FD");

  // Sub-Label Card
  doc.setTextColor(100, 116, 139);
  doc.setFont("courier", "bold");
  doc.setFontSize(6.5);
  doc.text("TOTAL DATA REKORD", 18, startY + 5.5);

  // Nilai Data Utama
  doc.setTextColor(15, 23, 42);
  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.text(String(rows.length), 18, startY + 13);

  // ==========================================
  // TABLE DATA (NEO-BRUTALIST ROW GRID)
  // ==========================================
  const tableHeaders = columns.map((col) => col.toUpperCase());
  const tableRows = rows.map((row) => row.map((cell) => String(cell ?? "-").toUpperCase()));

  autoTable(doc, {
    startY: startY + cardHeight + 6,
    margin: { left: 14, right: 14 },
    head: [tableHeaders],
    body: tableRows,
    theme: "plain", // Menghapus styling default jspdf bawaan yang kaku monoton
    styles: {
      font: "courier",
      fontSize: columns.length > 8 ? 7 : 8, // Mengecilkan font otomatis jika kolom terlalu padat
      fontStyle: "bold",
      textColor: [15, 23, 42],
      lineColor: [15, 23, 42],
      lineWidth: 0.5,
      cellPadding: 2.5,
    },
    headStyles: {
      fillColor: [15, 23, 42], // Header Blok Hitam Legam
      textColor: [255, 255, 255],
      lineWidth: 0.5,
      lineColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" }, // Kolom nomor urut otomatis ke tengah jika ada
    },
    didParseCell: function (dataCell) {
      // Deteksi dinamis status untuk mewarnai baris/cell secara brutalist (karena tabel ini bersifat dinamis)
      if (dataCell.section === "body") {
        const rawValue = String(dataCell.cell.raw).toLowerCase();
        if (["paid", "delivered", "sukses", "success", "lunas"].includes(rawValue)) {
          dataCell.cell.styles.fillColor = [209, 250, 229]; // Hijau
        } else if (["pending", "proses", "in_transit", "diperjalanan"].includes(rawValue)) {
          dataCell.cell.styles.fillColor = [254, 243, 199]; // Kuning
        } else if (["failed", "gagal", "cancelled", "batal"].includes(rawValue)) {
          dataCell.cell.styles.fillColor = [254, 226, 226]; // Merah
        }
      }
    },
  });

  // ==========================================
  // FOOTER SYSTEM CODE SIGNATURE
  // ==========================================
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  if (finalY < pageHeight - 15) {
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`[ END_OF_DYNAMIC_COMPILATION_MANIFEST_RAW - VERIFIED BY ADMIN NODE ]`, 14, finalY);
  }

  // Simpan/Unduh berkas sesuai nama file asli
  doc.save(filename);
}

export function AdminDashboardPage() {
  const { data, loading, error } = useApiData<DashboardSummary>(
    "/api/v1/admin/dashboard",
    {
      totalCustomers: 0,
      totalStaff: 0,
      totalBranches: 0,
      totalVehicles: 0,
      totalShipments: 0,
      totalPendingShipment: 0,
      totalDeliveredShipment: 0,
      totalRevenue: 0,
      shipmentChart: {},
      paymentChart: {},
      recentShipments: [],
      recentPayments: [],
    },
  );

  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title="Admin dashboard"
        description="Ringkasan operasional global ekspedisi."
      />
      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          {/* Grid Metrik Utama Kontainer */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard icon={Users} label="Total Customer" value={data.totalCustomers} />
            <StatCard icon={Users} label="Total Staff" value={data.totalStaff} />
            <StatCard icon={Building2} label="Total Branch" value={data.totalBranches} />
            <StatCard icon={Truck} label="Total Vehicle" value={data.totalVehicles} />
            <StatCard icon={PackageCheck} label="Total Shipment" value={data.totalShipments} />
            <StatCard icon={CreditCard} label="Total Revenue" value={formatCurrency(data.totalRevenue)} />
            <StatCard label="Pending Shipment" value={data.totalPendingShipment} />
            <StatCard label="Delivered Shipment" value={data.totalDeliveredShipment} />
          </div>
          
          {/* Grid Dual Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashboardChart data={chartData(data.shipmentChart)} title="Shipment by Status" />
            <DashboardChart data={chartData(data.paymentChart)} title="Payment by Status" />
          </div>

          <RecentTables payments={data.recentPayments} shipments={data.recentShipments} />
        </>
      )}
    </section>
  );
}

function RecentTables({
  shipments,
  payments,
}: {
  shipments: Shipment[];
  payments: Payment[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Panel Log Shipment */}
      <section className="w-full border-4 border-slate-900 bg-white p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md">
        <div className="mb-4 flex items-center gap-2 border-b-2 border-slate-900 pb-2">
          <FileText className="text-slate-900 stroke-[2.5]" size={16} />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Recent Shipments Log
          </h2>
        </div>
        <SimpleShipmentTable shipments={shipments} />
      </section>

      {/* Panel Log Payment */}
      <section className="w-full border-4 border-slate-900 bg-white p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md">
        <div className="mb-4 flex items-center gap-2 border-b-2 border-slate-900 pb-2">
          <CreditCard className="text-slate-900 stroke-[2.5]" size={16} />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Recent Payments Log
          </h2>
        </div>
        <SimplePaymentTable payments={payments} />
      </section>
    </div>
  );
}

function SimpleShipmentTable({ shipments }: { shipments: Shipment[] }) {
  if (shipments.length === 0) {
    return (
      <p className="text-2xs font-black uppercase tracking-wider text-slate-400 py-4 text-center border-2 border-dashed border-slate-900/10">
        [ KOSONG ] Belum ada data shipment.
      </p>
    );
  }
  return (
    <div className="w-full overflow-x-auto border-2 border-slate-900 rounded-sm">
      <table className="w-full border-collapse text-left text-2xs font-mono">
        <thead>
          <tr className="border-b-2 border-slate-900 bg-slate-900 text-amber-400">
            <th className="p-2.5 font-black uppercase tracking-wider">Resi</th>
            <th className="p-2.5 font-black uppercase tracking-wider">Origin</th>
            <th className="p-2.5 font-black uppercase tracking-wider">Destination</th>
            <th className="p-2.5 font-black uppercase tracking-wider">Status</th>
            <th className="p-2.5 font-black uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y border-slate-900">
          {shipments.slice(0, 8).map((shipment) => (
            <tr key={shipment.id} className="odd:bg-slate-50 hover:bg-amber-50/20 transition-colors">
              <td className="p-2.5 font-bold text-slate-950">{shipment.tracking_number}</td>
              <td className="p-2.5 text-slate-700">{shipment.branches_shipments_origin_branch_idTobranches?.city ?? "-"}</td>
              <td className="p-2.5 text-slate-700">{shipment.branches_shipments_destination_branch_idTobranches?.city ?? "-"}</td>
              <td className="p-2.5"><StatusBadge status={shipment.status} /></td>
              <td className="p-2.5 font-black text-slate-950">{formatCurrency(shipment.total_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SimplePaymentTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <p className="text-2xs font-black uppercase tracking-wider text-slate-400 py-4 text-center border-2 border-dashed border-slate-900/10">
        [ KOSONG ] Belum ada data payment.
      </p>
    );
  }
  return (
    <div className="w-full overflow-x-auto border-2 border-slate-900 rounded-sm">
      <table className="w-full border-collapse text-left text-2xs font-mono">
        <thead>
          <tr className="border-b-2 border-slate-900 bg-slate-900 text-amber-400">
            <th className="p-2.5 font-black uppercase tracking-wider">Resi</th>
            <th className="p-2.5 font-black uppercase tracking-wider">Amount</th>
            <th className="p-2.5 font-black uppercase tracking-wider">Method</th>
            <th className="p-2.5 font-black uppercase tracking-wider">Status</th>
            <th className="p-2.5 font-black uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y border-slate-900">
          {payments.slice(0, 8).map((payment) => (
            <tr key={payment.id} className="odd:bg-slate-50 hover:bg-amber-50/20 transition-colors">
              <td className="p-2.5 font-bold text-slate-950">{payment.shipments?.tracking_number ?? "-"}</td>
              <td className="p-2.5 font-black text-slate-900">{formatCurrency(payment.amount)}</td>
              <td className="p-2.5 text-slate-700 uppercase font-bold">{payment.payment_method}</td>
              <td className="p-2.5"><StatusBadge status={payment.payment_status} /></td>
              <td className="p-2.5 text-slate-600">{formatDate(payment.payment_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BranchesPage({ readOnly = false }: { readOnly?: boolean }) {
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator(readOnly ? "manager" : "admin");
  const { data, loading, error } = useApiData<Branch[]>(
    "/api/v1/admin/branches?limit=100",
    [],
    refresh,
  );
  const filtered = data.filter((branch) =>
    `${branch.name} ${branch.city}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  async function save(formData: FormData) {
    await apiPost("/api/v1/admin/branches", Object.fromEntries(formData));
    setRefresh((value) => value + 1);
  }

  async function remove(id: string) {
    await apiDelete(`/api/v1/admin/branches/${id}`);
    setRefresh((value) => value + 1);
  }

  const columns: ColumnDef<Branch>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "City", accessorKey: "city" },
    { header: "Address", accessorKey: "address" },
    { header: "Phone", accessorKey: "phone" },
    {
      header: "Action",
      cell: ({ row }) =>
        readOnly ? (
          <span className="text-2xs font-bold uppercase text-slate-400">[ READ ONLY ]</span>
        ) : (
          <button
            className="inline-flex h-7 items-center justify-center border border-slate-900 bg-rose-500 px-3 text-3xs font-black uppercase tracking-wider text-white shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer hover:translate-x-[-0.5px] hover:translate-y-[-0.5px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none"
            onClick={() => remove(row.original.id)}
            type="button"
          >
            Delete
          </button>
        ),
    },
  ];

  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title={readOnly ? "Branches" : "Admin branches"}
        description={
          readOnly ? "Read only branch monitoring." : "Kelola cabang ekspedisi."
        }
      />
      {!readOnly && (
        <div className="flex flex-col gap-4 border-4 border-slate-900 bg-amber-50/20 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-md sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 max-w-md"><ReportFilter onChange={setReportFilters} value={reportFilters} /></div>
          <PdfExportButton
            label="Export Branch PDF"
            onExport={async () => {
              validateReportFilters(reportFilters);
              const reportData = await getAdminBranchReport(reportFilters);
              exportSimpleAdminPdf(
                "Laporan Branch Admin",
                "laporan-branch-admin.pdf",
                ["No", "Name", "City", "Address", "Phone"],
                reportData.map((branch, index) => [
                  index + 1,
                  branch.name,
                  branch.city,
                  branch.address,
                  branch.phone,
                ]),
                reportGenerator,
                reportFilters,
              );
            }}
          />
        </div>
      )}
      {!readOnly && (
        <MasterForm
          fields={["name", "city", "address", "phone"]}
          onSubmit={save}
          title="Create branch"
        />
      )}
      <FilterBar onSearch={setSearch} search={search} />
      <StatePanel
        error={error}
        loading={loading}
        onRetry={() => setRefresh((value) => value + 1)}
      />
      {!loading && !error && <DataTable columns={columns} data={filtered} />}
    </section>
  );
}

function MasterForm({
  title,
  fields,
  onSubmit,
}: {
  title: string;
  fields: string[];
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit(new FormData(event.currentTarget));
      event.currentTarget.reset();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Gagal menyimpan data.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="w-full border-4 border-slate-900 bg-white p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
        <FileSpreadsheet className="text-slate-900 stroke-[2.5]" size={16} />
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">{title}</h2>
      </div>
      
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
        {fields.map((field) => (
          <div className="flex flex-col gap-1" key={field}>
            <label className="text-3xs font-black uppercase tracking-wider text-slate-500">[ {field} ]</label>
            <input
              className="h-10 w-full border-2 border-slate-900 bg-white px-3 text-2xs font-bold uppercase tracking-wide text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus:outline-none focus:bg-amber-50/20 rounded-sm"
              name={field}
              type={field.toLowerCase().includes("password") ? "password" : "text"}
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="border-2 border-slate-900 bg-rose-100 p-3 text-3xs font-black uppercase tracking-wide text-rose-900 rounded-sm">
          ⚠️ ERROR: {error}
        </div>
      )}

      <button
        className="inline-flex h-10 items-center justify-center border-2 border-slate-900 bg-amber-400 px-5 text-2xs font-black uppercase tracking-wider text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] disabled:opacity-50 disabled:pointer-events-none"
        disabled={busy}
        type="submit"
      >
        {busy ? "MENYIMPAN DOKUMEN..." : "SIMPAN DATA REGISTRASI"}
      </button>
    </form>
  );
}

export function StaffUsersPage() {
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator("admin");
  const { data, loading, error } = useApiData<StaffUser[]>(
    "/api/v1/admin/users?limit=100",
    [],
    refresh,
  );
  const filtered = data.filter((user) =>
    `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  async function create(formData: FormData) {
    const body = Object.fromEntries(formData);
    await apiPost("/api/v1/admin/users", {
      ...body,
      branchId: body.branchId ? Number(body.branchId) : null,
    });
    setRefresh((value) => value + 1);
  }

  async function toggle(id: string, active: boolean) {
    await apiPatch(
      `/api/v1/admin/users/${id}/${active ? "activate" : "deactivate"}`,
      {},
    );
    setRefresh((value) => value + 1);
  }

  const columns: ColumnDef<StaffUser>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
    { header: "Branch", accessorKey: "branch_id" },
    {
      header: "Status",
      cell: ({ row }) => (
        <span className={`text-3xs font-black uppercase px-2 py-0.5 border ${row.original.is_active ? "bg-emerald-400 text-slate-950 border-slate-900" : "bg-slate-200 text-slate-500 border-slate-400"}`}>
          {row.original.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <button
          className="inline-flex h-7 items-center justify-center border border-slate-900 bg-white px-3 text-3xs font-black uppercase tracking-wider text-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer hover:translate-x-[-0.5px] hover:translate-y-[-0.5px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[0.5px] active:translate-y-[0.5px]"
          onClick={() => toggle(row.original.id, !row.original.is_active)}
          type="button"
        >
          {row.original.is_active ? "Deactivate" : "Activate"}
        </button>
      ),
    },
  ];

  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title="Admin staff"
        description="Tambah dan aktifkan staff internal."
      />
      <div className="flex flex-col gap-4 border-4 border-slate-900 bg-amber-50/20 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-md sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 max-w-md"><ReportFilter onChange={setReportFilters} value={reportFilters} /></div>
        <PdfExportButton
          label="Export Staff PDF"
          onExport={async () => {
            validateReportFilters(reportFilters);
            const reportData = await getAdminStaffReport(reportFilters);
            exportSimpleAdminPdf(
              "Laporan Staff Admin",
              "laporan-staff-admin.pdf",
              ["No", "Name", "Email", "Role", "Branch", "Status"],
              reportData.map((staff, index) => [
                index + 1,
                staff.name,
                staff.email,
                staff.role,
                staff.branch_id ?? "-",
                staff.is_active ? "Active" : "Inactive",
              ]),
              reportGenerator,
              reportFilters,
            );
          }}
        />
      </div>
      <MasterForm
        fields={["name", "email", "password", "role", "branchId"]}
        onSubmit={create}
        title="Create staff"
      />
      <FilterBar onSearch={setSearch} search={search} />
      <StatePanel
        error={error}
        loading={loading}
        onRetry={() => setRefresh((value) => value + 1)}
      />
      {!loading && !error && <DataTable columns={columns} data={filtered} />}
    </section>
  );
}

export function CustomersPage() {
  const [search, setSearch] = useState("");
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator("admin");
  const { data, loading, error } = useApiData<CustomerRecord[]>(
    "/api/v1/admin/customers?limit=100",
    [],
  );
  const filtered = data.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.city}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const columns: ColumnDef<CustomerRecord>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "City", accessorKey: "city" },
    { header: "Phone", accessorKey: "phone" },
    {
      header: "Verified",
      cell: ({ row }) => (
        <span className={`text-3xs font-black uppercase px-2 py-0.5 border ${row.original.email_verified_at ? "bg-emerald-400 text-slate-950 border-slate-900" : "bg-amber-100 text-amber-800 border-amber-300"}`}>
          {row.original.email_verified_at ? "Verified" : "Unverified"}
        </span>
      ),
    },
  ];
  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title="Customers"
        description="Monitoring customer terdaftar."
      />
      <div className="flex flex-col gap-4 border-4 border-slate-900 bg-amber-50/20 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-md sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 max-w-md"><ReportFilter onChange={setReportFilters} value={reportFilters} /></div>
        <PdfExportButton
          label="Export Customer PDF"
          onExport={async () => {
            validateReportFilters(reportFilters);
            const reportData = await getAdminCustomerReport(reportFilters);
            exportSimpleAdminPdf(
              "Laporan Customer Admin",
              "laporan-customer-admin.pdf",
              ["No", "Name", "Email", "City", "Phone", "Verified"],
              reportData.map((customer, index) => [
                index + 1,
                customer.name,
                customer.email ?? "-",
                customer.city,
                customer.phone,
                customer.email_verified_at ? "Verified" : "Unverified",
              ]),
              reportGenerator,
              reportFilters,
            );
          }}
        />
      </div>
      <FilterBar onSearch={setSearch} search={search} />
      <StatePanel error={error} loading={loading} />
      {!loading && !error && <DataTable columns={columns} data={filtered} />}
    </section>
  );
}

export function RatesPage() {
  const [refresh, setRefresh] = useState(0);
  const { data, loading, error } = useApiData<Rate[]>(
    "/api/v1/admin/rates?limit=100",
    [],
    refresh,
  );
  async function create(formData: FormData) {
    const body = Object.fromEntries(formData);
    await apiPost("/api/v1/admin/rates", {
      originCity: body.originCity,
      destinationCity: body.destinationCity,
      pricePerKg: Number(body.pricePerKg),
      estimatedDays: Number(body.estimatedDays),
    });
    setRefresh((value) => value + 1);
  }
  async function remove(id: string) {
    await apiDelete(`/api/v1/admin/rates/${id}`);
    setRefresh((value) => value + 1);
  }
  const columns: ColumnDef<Rate>[] = [
    { header: "Origin", accessorKey: "origin_city" },
    { header: "Destination", accessorKey: "destination_city" },
    {
      header: "Price/Kg",
      cell: ({ row }) => formatCurrency(row.original.price_per_kg),
    },
    { header: "Days", accessorKey: "estimated_days" },
    {
      header: "Action",
      cell: ({ row }) => (
        <button
          className="inline-flex h-7 items-center justify-center border border-slate-900 bg-rose-500 px-3 text-3xs font-black uppercase tracking-wider text-white shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer hover:translate-x-[-0.5px] hover:translate-y-[-0.5px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[0.5px] active:translate-y-[0.5px]"
          onClick={() => remove(row.original.id)}
          type="button"
         >
          Delete
        </button>
      ),
    },
  ];
  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title="Admin rates"
        description="Kelola tarif rute pengiriman."
      />
      <MasterForm
        fields={[
          "originCity",
          "destinationCity",
          "pricePerKg",
          "estimatedDays",
        ]}
        onSubmit={create}
        title="Create rate"
      />
      <StatePanel
        error={error}
        loading={loading}
        onRetry={() => setRefresh((value) => value + 1)}
      />
      {!loading && !error && <DataTable columns={columns} data={data} />}
    </section>
  );
}

export function VehiclesPage() {
  const [refresh, setRefresh] = useState(0);
  const { data, loading, error } = useApiData<Vehicle[]>(
    "/api/v1/admin/vehicles?limit=100",
    [],
    refresh,
  );
  async function create(formData: FormData) {
    const body = Object.fromEntries(formData);
    await apiPost("/api/v1/admin/vehicles", {
      plateNumber: body.plateNumber,
      type: body.type,
      courierId: Number(body.courierId),
    });
    setRefresh((value) => value + 1);
  }
  async function remove(id: string) {
    await apiDelete(`/api/v1/admin/vehicles/${id}`);
    setRefresh((value) => value + 1);
  }
  const columns: ColumnDef<Vehicle>[] = [
    { header: "Plate", accessorKey: "plate_number" },
    { header: "Type", accessorKey: "type" },
    {
      header: "Courier",
      cell: ({ row }) => row.original.users?.name ?? row.original.courier_id,
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <button
          className="inline-flex h-7 items-center justify-center border border-slate-900 bg-rose-500 px-3 text-3xs font-black uppercase tracking-wider text-white shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer hover:translate-x-[-0.5px] hover:translate-y-[-0.5px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-x-[0.5px] active:translate-y-[0.5px]"
          onClick={() => remove(row.original.id)}
          type="button"
        >
          Delete
        </button>
      ),
    },
  ];
  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title="Admin vehicles"
        description="Kelola kendaraan kurir."
      />
      <MasterForm
        fields={["plateNumber", "type", "courierId"]}
        onSubmit={create}
        title="Create vehicle"
      />
      <StatePanel
        error={error}
        loading={loading}
        onRetry={() => setRefresh((value) => value + 1)}
      />
      {!loading && !error && <DataTable columns={columns} data={data} />}
    </section>
  );
}

function branchMatches(
  branchId?: string | number | null,
  currentBranchId?: string | null,
) {
  if (branchId == null || currentBranchId == null) {
    return false;
  }

  return String(branchId) === String(currentBranchId);
}

function ShipmentDetailModal({
  shipment,
  onClose,
}: {
  shipment: Shipment;
  onClose: () => void;
}) {
  const sender = shipment.customers_shipments_sender_idTocustomers;
  const receiver = shipment.customers_shipments_receiver_idTocustomers;
  const item = shipment.shipment_items?.[0];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 font-mono backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-md">
        <div className="flex items-start justify-between gap-4 border-b-4 border-slate-900 pb-4">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">[ RESI MANIFES DETIL ]</span>
            <h2 className="text-lg font-black uppercase text-slate-900">Detail Pesanan</h2>
            <p className="text-xs font-black text-amber-500">KODE TRK: {shipment.tracking_number}</p>
          </div>
          <button 
            className="inline-flex h-9 w-9 items-center justify-center border-2 border-slate-900 bg-slate-950 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer hover:bg-rose-500"
            onClick={onClose} 
            type="button"
          >
            <X size={16} className="stroke-3" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 grid-cols-1 md:grid-cols-2">
          <DetailField label="Nama Pengirim" value={sender?.name} />
          <DetailField label="Email Pengirim" value={sender?.email} />
          <DetailField label="Telepon Pengirim" value={sender?.phone} />
          <DetailField label="Kota Pengirim" value={sender?.city} />
          <DetailField label="Alamat Pengirim" value={sender?.address} wide />
          <DetailField label="Nama Penerima" value={receiver?.name} />
          <DetailField label="Email Penerima" value={receiver?.email} />
          <DetailField label="Telepon Penerima" value={receiver?.phone} />
          <DetailField label="Kota Penerima" value={receiver?.city} />
          <DetailField label="Alamat Penerima" value={receiver?.address} wide />
          <DetailField label="Nama Paket" value={item?.item_name} />
          <DetailField
            label="Berat Paket"
            value={
              item?.weight ? `${item.weight} kg` : `${shipment.total_weight} kg`
            }
          />
          <DetailField
            label="Cabang Asal"
            value={shipment.branches_shipments_origin_branch_idTobranches?.name}
          />
          <DetailField
            label="Cabang Tujuan"
            value={
              shipment.branches_shipments_destination_branch_idTobranches?.name
            }
          />
          <DetailField
            label="Metode Penyerahan"
            value={
              shipment.handover_method === "pickup"
                ? "Jemput Paket"
                : "Drop Off"
            }
          />
          <DetailField
            label="Metode Pembayaran"
            value={shipment.payments?.payment_method}
          />
          <DetailField
            label="Status Pembayaran"
            value={shipment.payments?.payment_status}
          />
          <DetailField label="Status Pengiriman" value={shipment.status} />
          <DetailField
            label="Courier Code"
            value={shipment.users?.courier_code}
          />
          <DetailField
            label="Total Harga"
            value={formatCurrency(shipment.total_price)}
          />
        </div>

        {item?.photo ? (
          <div className="mt-5 border-2 border-slate-900 p-2 bg-slate-50">
            <span className="block text-3xs font-black text-slate-500 uppercase mb-1">[ FOTO SERAH TERIMA AWAL ]</span>
            <img
              alt="Foto paket saat serah terima"
              className="h-48 w-full border border-slate-900 object-cover"
              src={item.photo}
            />
          </div>
        ) : null}
        {shipment.status === "delivered" && shipment.photo ? (
          <div className="mt-5 border-2 border-slate-900 p-2 bg-slate-50">
            <p className="mb-1 text-3xs font-black uppercase text-slate-500">
              [ BUKTI DOKUMENTASI FISIK PENERIMA ]
            </p>
            <img
              alt="Bukti penyerahan kurir"
              className="h-48 w-full border border-slate-900 object-cover"
              src={shipment.photo}
            />
          </div>
        ) : null}
        
        {(shipment.shipment_trackings?.length ?? 0) > 0 ? (
          <div className="mt-6 border-t-4 border-dashed border-slate-900 pt-4">
            <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">
              [ TIMELINE ] Riwayat Tracking & Kurir
            </h3>
            <div className="mt-3 grid gap-2">
              {(shipment.shipment_trackings ?? []).map((tracking) => (
                <div className="border-2 border-slate-900 bg-slate-50 p-3 rounded-sm" key={tracking.id}>
                  <div className="font-black text-2xs uppercase text-slate-900 tracking-wide">
                    {tracking.status.replaceAll("_", " ")}
                  </div>
                  <div className="text-3xs font-bold text-slate-500 uppercase mt-0.5">
                    LOC: {tracking.location} — {formatDate(tracking.tracked_at)}
                  </div>
                  <p className="mt-1.5 text-2xs font-medium text-slate-700 leading-relaxed">
                    // {tracking.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  wide,
}: {
  label: string;
  value?: string | number | null;
  wide?: boolean;
}) {
  return (
    <div
      className={`border-2 border-slate-900 bg-slate-50 p-3 rounded-sm ${wide ? "md:col-span-2" : ""}`}
    >
      <div className="text-3xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-0.5 text-2xs font-black uppercase text-slate-900">{value ?? "-"}</div>
    </div>
  );
}

export function ShipmentsPage({
  mode,
  filter,
}: {
  mode: "admin" | "courier" | "manager";
  filter?: (shipment: Shipment) => boolean;
}) {
  const [refresh, setRefresh] = useState(0);
  const [status, setStatus] = useState("");
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator(
    mode === "manager" ? "manager" : "admin",
  );
  const endpoint =
    mode === "courier"
      ? "/api/v1/courier/shipments?limit=100"
      : "/api/v1/admin/shipments?limit=100";
  const { data, loading, error } = useApiData<Shipment[]>(
    `${endpoint}${status ? `&status=${status}` : ""}`,
    [],
    refresh,
  );
  const [arrivalReceipts, setArrivalReceipts] = useState<
    Record<string, string>
  >({});
  const [courierCodes, setCourierCodes] = useState<Record<string, string>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const [deliveryPhotoFiles, setDeliveryPhotoFiles] = useState<
    Record<string, File>
  >({}); 
  const [deliveryPhotoPreviews, setDeliveryPhotoPreviews] = useState<
    Record<string, string>
  >({}); 
  const [detailShipment, setDetailShipment] = useState<Shipment | null>(null);
  const currentUser = useQuery({
    queryKey: ["current-staff-user"],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response.data as CurrentUser;
    },
    staleTime: 60_000,
  });
  const shipments = filter ? data.filter(filter) : data;
  const currentBranchId =
    currentUser.data?.branchId != null
      ? String(currentUser.data.branchId)
      : null;

  async function updateStatus(id: string, nextStatus: string, photo?: string) {
    const path =
      mode === "courier"
        ? `/api/v1/courier/shipments/${id}/status`
        : `/api/v1/admin/shipments/${id}/status`;
    try {
      await apiPatch(path, {
        status: nextStatus,
        location: "Cabang operasional",
        description: `Status updated to ${nextStatus}`,
        ...(photo ? { photo } : {}),
      });
      toast.success("Status pengiriman berhasil diperbarui.");
      setRefresh((value) => value + 1);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Status pengiriman gagal diperbarui.",
      );
    }
  }

  function setRowError(id: string, message: string) {
    setRowErrors((current) => ({ ...current, [id]: message }));
  }

  function clearRowError(id: string) {
    setRowErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  async function assignCourier(id: string) {
    const courierCode = courierCodes[id]?.trim();
    if (!courierCode) {
      setRowError(id, "Courier code wajib diisi.");
      return;
    }

    setRowBusy((current) => ({ ...current, [id]: true }));
    clearRowError(id);
    try {
      await apiPatch(`/api/v1/admin/shipments/${id}/assign-courier`, {
        courierCode,
      });
      toast.success("Kurir pengantaran berhasil ditugaskan.");
      setCourierCodes((current) => ({ ...current, [id]: "" }));
      setRefresh((value) => value + 1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Kurir gagal ditugaskan.";
      setRowError(id, message);
      toast.error(message);
    } finally {
      setRowBusy((current) => ({ ...current, [id]: false }));
    }
  }

  async function receiveDestinationShipment(id: string) {
    const trackingNumber = arrivalReceipts[id]?.trim();
    if (!trackingNumber) {
      setRowError(id, "Nomor resi wajib diisi.");
      return;
    }

    setRowBusy((current) => ({ ...current, [id]: true }));
    clearRowError(id);
    try {
      await apiPost("/api/v1/admin/shipments/receive", {
        shipmentId: id,
        trackingNumber,
      });
      toast.success("Paket berhasil diterima cabang tujuan.");
      setArrivalReceipts((current) => ({ ...current, [id]: "" }));
      setRefresh((value) => value + 1);
    } catch (error) {
      setRowError(
        id,
        error instanceof Error ? error.message : "Paket gagal diterima.",
      );
    } finally {
      setRowBusy((current) => ({ ...current, [id]: false }));
    }
  }

  function isOriginBranch(shipment: Shipment) {
    return branchMatches(
      shipment.branches_shipments_origin_branch_idTobranches?.id,
      currentBranchId,
    );
  }

  function isDestinationBranch(shipment: Shipment) {
    return branchMatches(
      shipment.branches_shipments_destination_branch_idTobranches?.id,
      currentBranchId,
    );
  }

  const columns: ColumnDef<Shipment>[] = [
    {
      header: "Tracking",
      cell: ({ row }) => <span className="font-black text-slate-900">{row.original.tracking_number}</span>,
    },
    {
      header: "Courier Code",
      cell: ({ row }) => row.original.users?.courier_code ?? "-",
    },
    {
      header: "Sender",
      cell: ({ row }) => row.original.customers_shipments_sender_idTocustomers?.name ?? "-",
    },
    {
      header: "Receiver",
      cell: ({ row }) => row.original.customers_shipments_receiver_idTocustomers?.name ?? "-",
    },
    {
      header: "Origin",
      cell: ({ row }) => row.original.branches_shipments_origin_branch_idTobranches?.city ?? "-",
    },
    {
      header: "Destination",
      cell: ({ row }) => row.original.branches_shipments_destination_branch_idTobranches?.city ?? "-",
    },
    {
      header: "Total",
      cell: ({ row }) => <span className="font-black">{formatCurrency(row.original.total_price)}</span>,
    },
    {
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      header: "Payment",
      cell: ({ row }) => <StatusBadge status={row.original.payments?.payment_status} />,
    },
    ...(mode === "admin"
      ? [
          {
            header: "Detail",
            cell: ({ row }: { row: { original: Shipment } }) => (
              <button
                aria-label={`Detail pesanan ${row.original.tracking_number}`}
                className="inline-flex h-8 w-8 items-center justify-center border border-slate-900 bg-white text-slate-900 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] rounded-sm cursor-pointer hover:bg-amber-400"
                onClick={async () => {
                  try {
                    const response = await apiGet<Shipment>(
                      `/api/v1/admin/shipments/${row.original.id}`,
                    );
                    setDetailShipment(response.data);
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Gagal memuat detail pesanan.",
                    );
                  }
                }}
                type="button"
              >
                <Eye size={14} className="stroke-[2.5]" />
              </button>
            ),
          } as ColumnDef<Shipment>,
        ]
      : []),
    {
      header: "Action",
      cell: ({ row }) => {
        const shipment = row.original;
        const originAdminAction =
          mode === "admin" &&
          shipment.status === "picked_up" &&
          isOriginBranch(shipment);
        const destinationArrivalAction =
          mode === "admin" &&
          shipment.status === "in_transit" &&
          isDestinationBranch(shipment);
        const destinationAssignAction =
          mode === "admin" &&
          shipment.status === "arrived_at_branch" &&
          isDestinationBranch(shipment) &&
          !shipment.courier_id;
        const courierReadyAction =
          mode === "courier" &&
          shipment.status === "arrived_at_branch" &&
          shipment.courier_id != null &&
          String(shipment.courier_id) === String(currentUser.data?.id ?? "");
        const courierCompleteAction =
          mode === "courier" &&
          shipment.status === "out_for_delivery" &&
          shipment.courier_id != null &&
          String(shipment.courier_id) === String(currentUser.data?.id ?? "");

        const destinationAwaitingCourierAction =
          mode === "admin" &&
          shipment.status === "arrived_at_branch" &&
          isDestinationBranch(shipment) &&
          Boolean(shipment.courier_id);

        if (
          !originAdminAction &&
          !destinationArrivalAction &&
          !destinationAssignAction &&
          !destinationAwaitingCourierAction &&
          !courierReadyAction &&
          !courierCompleteAction
        ) {
          return <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider">[ KUNCI ] NO ACTION</span>;
        }

        return (
          <ActionMenu>
            {originAdminAction ? (
              <button
                className="inline-flex h-9 items-center justify-center border-2 border-slate-900 bg-amber-400 px-4 text-3xs font-black uppercase tracking-wider text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-sm cursor-pointer hover:translate-x-[-0.5px] hover:translate-y-[-0.5px] hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                onClick={() => updateStatus(shipment.id, "in_transit")}
                type="button"
              >
                Konfirmasi Keberangkatan
              </button>
            ) : null}
            {destinationArrivalAction ? (
              <form
                className="flex flex-col gap-1.5 p-1 bg-white border border-slate-900 rounded-sm"
                onSubmit={(event) => {
                  event.preventDefault();
                  receiveDestinationShipment(shipment.id);
                }}
              >
                <span className="text-3xs font-black text-slate-500 uppercase">
                  Langkah 1: Tiba di Cabang
                </span>
                <div className="flex gap-1.5">
                  <input
                    aria-label={`Nomor resi ${shipment.tracking_number}`}
                    className="h-8 border border-slate-900 bg-white px-2 text-3xs font-bold uppercase tracking-wider text-slate-900 focus:outline-none"
                    onChange={(event) =>
                      setArrivalReceipts((current) => ({
                        ...current,
                        [shipment.id]: event.target.value,
                      }))
                    }
                    placeholder={`Input resi: ${shipment.tracking_number}`}
                    value={arrivalReceipts[shipment.id] ?? ""}
                  />
                  <button
                    className="h-8 border border-slate-900 bg-slate-900 text-amber-400 px-3 text-3xs font-black uppercase tracking-wider disabled:opacity-40"
                    disabled={rowBusy[shipment.id]}
                    type="submit"
                  >
                    {rowBusy[shipment.id] ? "PROSES..." : "KONFIRMASI"}
                  </button>
                </div>
                {rowErrors[shipment.id] ? (
                  <span className="text-3xs font-black text-rose-600 uppercase">// {rowErrors[shipment.id]}</span>
                ) : null}
              </form>
            ) : null}
            {destinationAssignAction ? (
              <form
                className="flex flex-col gap-1.5 p-1 bg-white border border-slate-900 rounded-sm"
                onSubmit={(event) => {
                  event.preventDefault();
                  assignCourier(shipment.id);
                }}
              >
                <span className="text-3xs font-black text-slate-500 uppercase">
                  Langkah 2: Assign Kurir
                </span>
                <div className="flex gap-1.5">
                  <input
                    aria-label={`Courier code shipment ${shipment.tracking_number}`}
                    className="h-8 w-32 border border-slate-900 bg-white px-2 text-3xs font-bold uppercase tracking-wider text-slate-900 focus:outline-none"
                    inputMode="numeric"
                    maxLength={5}
                    onChange={(event) =>
                      setCourierCodes((current) => ({
                        ...current,
                        [shipment.id]: event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 5),
                      }))
                    }
                    placeholder="CODE (5 DIGIT)"
                    value={courierCodes[shipment.id] ?? ""}
                  />
                  <button
                    className="h-8 border border-slate-900 bg-slate-950 text-white px-3 text-3xs font-black uppercase tracking-wider disabled:opacity-40"
                    disabled={rowBusy[shipment.id]}
                    type="submit"
                  >
                    {rowBusy[shipment.id] ? "ASGN..." : "ASSIGN"}
                  </button>
                </div>
                {rowErrors[shipment.id] ? (
                  <span className="text-3xs font-black text-rose-600 uppercase">// {rowErrors[shipment.id]}</span>
                ) : null}
              </form>
            ) : null}
            {destinationAwaitingCourierAction ? (
              <div className="border border-amber-300 bg-amber-50 px-2 py-1.5 text-3xs font-bold text-amber-800 uppercase tracking-wide rounded-sm max-w-50">
                ⚠️ L-3: Menunggu konfirmasi kurir (Out for delivery)
              </div>
            ) : null}
            {courierReadyAction ? (
              <button
                className="inline-flex h-9 items-center justify-center border-2 border-slate-900 bg-amber-400 px-4 text-3xs font-black uppercase tracking-wider text-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-sm cursor-pointer disabled:opacity-50"
                disabled={rowBusy[shipment.id]}
                onClick={async () => {
                  setRowBusy((current) => ({
                    ...current,
                    [shipment.id]: true,
                  }));
                  clearRowError(shipment.id);
                  try {
                    await updateStatus(shipment.id, "out_for_delivery");
                  } catch (err) {
                    setRowError(
                      shipment.id,
                      err instanceof Error ? err.message : "Konfirmasi gagal.",
                    );
                  } finally {
                    setRowBusy((current) => ({
                      ...current,
                      [shipment.id]: false,
                    }));
                  }
                }}
                type="button"
              >
                {rowBusy[shipment.id]
                  ? "MEMPROSES..."
                  : "Langkah 3: Konfirmasi Out for Delivery"}
              </button>
            ) : null}
            {courierCompleteAction ? (
              <form
                className="flex flex-col gap-2 p-2 bg-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-sm"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const photoFile = deliveryPhotoFiles[shipment.id];
                  if (!photoFile) {
                    setRowError(
                      shipment.id,
                      "Foto bukti penyerahan wajib diunggah.",
                    );
                    return;
                  }
                  setRowBusy((current) => ({
                    ...current,
                    [shipment.id]: true,
                  }));
                  clearRowError(shipment.id);
                  try {
                    const formData = new FormData();
                    formData.append("file", photoFile);
                    const uploadRes = await fetch("/api/v1/staff/upload", {
                      method: "POST",
                      body: formData,
                    });
                    const uploadData = await uploadRes.json();
                    if (!uploadRes.ok) {
                      throw new Error(
                        uploadData.message || "Gagal mengunggah foto bukti",
                      );
                    }
                    const photoUrl = uploadData.data.url as string;

                    await updateStatus(shipment.id, "delivered", photoUrl);

                    setDeliveryPhotoFiles((current) => {
                      const next = { ...current };
                      delete next[shipment.id];
                      return next;
                    });
                    setDeliveryPhotoPreviews((current) => {
                      const next = { ...current };
                      if (next[shipment.id]) {
                        URL.revokeObjectURL(next[shipment.id]);
                      }
                      delete next[shipment.id];
                      return next;
                    });
                  } catch (err) {
                    setRowError(
                      shipment.id,
                      err instanceof Error ? err.message : "Konfirmasi gagal.",
                    );
                  } finally {
                    setRowBusy((current) => ({
                      ...current,
                      [shipment.id]: false,
                    }));
                  }
                }}
              >
                <label
                  className="text-3xs font-black text-slate-500 uppercase"
                  htmlFor={`photo-${shipment.id}`}
                >
                  Langkah 4: Upload Bukti Tiba
                </label>
                <input
                  accept="image/*"
                  id={`photo-${shipment.id}`}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (deliveryPhotoPreviews[shipment.id]) {
                      URL.revokeObjectURL(deliveryPhotoPreviews[shipment.id]);
                    }
                    const previewUrl = URL.createObjectURL(file);
                    setDeliveryPhotoFiles((current) => ({
                      ...current,
                      [shipment.id]: file,
                    }));
                    setDeliveryPhotoPreviews((current) => ({
                      ...current,
                      [shipment.id]: previewUrl,
                    }));
                  }}
                  className="text-3xs font-bold uppercase tracking-wider mt-0.5"
                  type="file"
                />
                {deliveryPhotoPreviews[shipment.id] ? (
                  <img
                    alt="preview foto bukti"
                    src={deliveryPhotoPreviews[shipment.id]}
                    className="w-16 h-16 object-cover border border-slate-900 mt-1 rounded-sm"
                  />
                ) : null}
                <button
                  className="h-8 border border-slate-900 bg-emerald-400 text-slate-950 text-3xs font-black uppercase tracking-wider disabled:opacity-40"
                  disabled={
                    rowBusy[shipment.id] || !deliveryPhotoFiles[shipment.id]
                  }
                  type="submit"
                >
                  {rowBusy[shipment.id]
                    ? "MEMPROSES..."
                    : "KONFIRMASI DELIVERED"}
                </button>
                {rowErrors[shipment.id] ? (
                  <span className="text-3xs font-black text-rose-600 uppercase">// {rowErrors[shipment.id]}</span>
                ) : null}
              </form>
            ) : null}
          </ActionMenu>
        );
      },
    },
  ];

  const pageTitle = mode === "courier" ? "Pengiriman" : `${mode} shipments`;
  const pageDescription =
    mode === "courier"
      ? "Daftar seluruh request pengiriman yang ditugaskan ke Anda, terbaru hingga terlama."
      : "Monitoring shipment dan tracking timeline.";

  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader title={pageTitle} description={pageDescription} />
      
      {/* Panel Filter dan Export Berdasar Mode Akun */}
      {mode === "admin" && (
        <div className="flex flex-col gap-4 border-4 border-slate-900 bg-amber-50/20 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-md sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 max-w-lg">
            <ReportFilter onChange={setReportFilters} showBranch showStatus value={reportFilters} />
          </div>
          <PdfExportButton
            label="Export Shipment PDF"
            onExport={async () => {
              validateReportFilters(reportFilters);
              const reportData = await getAdminShipmentReport(reportFilters);
              exportAdminShipmentPdf(
                reportData,
                reportOptions(
                  "Laporan Shipment Admin",
                  "admin",
                  reportGenerator,
                  reportFilters,
                ),
              );
            }}
          />
        </div>
      )}

      {mode === "manager" && (
        <div className="flex flex-col gap-4 border-4 border-slate-900 bg-amber-50/20 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-md">
          <ReportFilter onChange={setReportFilters} showBranch showStatus value={reportFilters} />
          <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-slate-900/10 pt-3">
            <PdfExportButton
              label="Export Shipment PDF"
              onExport={async () => {
                validateReportFilters(reportFilters);
                const reportData = await getManagerShipmentReport(reportFilters);
                exportManagerShipmentPdf(
                  reportData,
                  reportOptions(
                    "Laporan Shipment Manager",
                    "manager",
                    reportGenerator,
                    reportFilters,
                  ),
                );
              }}
            />
            <PdfExportButton
              label="Export Courier Performance PDF"
              onExport={async () => {
                validateReportFilters(reportFilters);
                const reportData = await getManagerCourierPerformanceReport(reportFilters);
                exportManagerCourierPerformancePdf(
                  reportData,
                  reportOptions(
                    "Laporan Performa Kurir",
                    "manager",
                    reportGenerator,
                    reportFilters,
                  ),
                );
              }}
            />
          </div>
        </div>
      )}

      {/* Bar Filter Sortir Manifes */}
      <FilterBar>
        <div className="flex flex-col gap-1">
          <label className="text-3xs font-black text-slate-500 uppercase tracking-wider">[ URUT STATUS ]</label>
          <select
            className="h-10 border-2 border-slate-900 bg-white px-3 text-2xs font-black uppercase tracking-wider text-slate-900 focus:outline-none rounded-sm shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="">Semua status</option>
            <option value="pending">pending</option>
            <option value="picked_up">picked_up</option>
            <option value="in_transit">in_transit</option>
            <option value="arrived_at_branch">arrived_at_branch</option>
            <option value="out_for_delivery">out_for_delivery</option>
            <option value="delivered">delivered</option>
          </select>
        </div>
      </FilterBar>

      <StatePanel
        error={error}
        loading={loading}
        onRetry={() => setRefresh((value) => value + 1)}
      />
      {!loading && !error && <DataTable columns={columns} data={shipments} />}
      
      {detailShipment ? (
        <ShipmentDetailModal
          onClose={() => setDetailShipment(null)}
          shipment={detailShipment}
        />
      ) : null}
    </section>
  );
}

export function PaymentsPage({
  mode,
}: {
  mode: "admin" | "cashier" | "manager";
}) {
  const endpoint =
    mode === "cashier"
      ? "/api/v1/cashier/payments?limit=100"
      : "/api/v1/admin/payments?limit=100";
  const [status, setStatus] = useState("");
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator(
    mode === "cashier" ? "cashier" : mode === "manager" ? "manager" : "admin",
  );
  const { data, loading, error } = useApiData<Payment[]>(
    `${endpoint}${status ? `&paymentStatus=${status}` : ""}`,
    [],
  );
  const columns: ColumnDef<Payment>[] = [
    {
      header: "Tracking",
      cell: ({ row }) => <span className="font-bold">{row.original.shipments?.tracking_number ?? "-"}</span>,
    },
    {
      header: "Amount",
      cell: ({ row }) => <span className="font-black text-slate-900">{formatCurrency(row.original.amount)}</span>,
    },
    { header: "Method", accessorKey: "payment_method" },
    {
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.payment_status} />,
    },
    { header: "Reference", accessorKey: "transaction_reference" },
    {
      header: "Date",
      cell: ({ row }) => formatDate(row.original.payment_date),
    },
  ];
  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title={`${mode} payments`}
        description="Monitoring status pembayaran."
      />
      <div className="flex flex-col gap-4 border-4 border-slate-900 bg-amber-50/20 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-md">
        <ReportFilter onChange={setReportFilters} showStatus value={reportFilters} />
        
        <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-slate-900/10 pt-3">
          {mode === "admin" && (
            <PdfExportButton
              label="Export Payment PDF"
              onExport={async () => {
                validateReportFilters(reportFilters);
                const reportData = await getAdminPaymentReport(reportFilters);
                exportAdminPaymentPdf(
                  reportData,
                  reportOptions(
                    "Laporan Payment Admin",
                    "admin",
                    reportGenerator,
                    reportFilters,
                  ),
                );
              }}
            />
          )}
          {mode === "cashier" && (
            <PdfExportButton
              label="Export Payment Cabang PDF"
              onExport={async () => {
                validateReportFilters(reportFilters);
                const reportData = await getCashierPaymentReport(reportFilters);
                exportCashierPaymentPdf(
                  reportData,
                  reportOptions(
                    "Laporan Payment Cashier",
                    "cashier",
                    reportGenerator,
                    reportFilters,
                  ),
                );
              }}
            />
          )}
          {mode === "manager" && (
            <PdfExportButton
              label="Export Revenue PDF"
              onExport={async () => {
                validateReportFilters(reportFilters);
                const reportData = await getManagerRevenueReport();
                exportManagerRevenuePdf(
                  reportData,
                  reportOptions(
                    "Laporan Revenue Manager",
                    "manager",
                    reportGenerator,
                    reportFilters,
                  ),
                );
              }}
            />
          )}
        </div>
      </div>

      <FilterBar>
        <div className="flex flex-col gap-1">
          <label className="text-3xs font-black text-slate-500 uppercase tracking-wider">[ URUT METODE ]</label>
          <select
            className="h-10 border-2 border-slate-900 bg-white px-3 text-2xs font-black uppercase tracking-wider text-slate-900 focus:outline-none rounded-sm shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="">Semua status</option>
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="failed">failed</option>
          </select>
        </div>
      </FilterBar>

      <StatePanel error={error} loading={loading} />
      {!loading && !error && <DataTable columns={columns} data={data} />}
    </section>
  );
}

export function CashVerificationPage() {
  const [refresh, setRefresh] = useState(0);
  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    status: "pending",
  });
  const reportGenerator = useReportGenerator("cashier");
  const { data, loading, error } = useApiData<Payment[]>(
    "/api/v1/cashier/payments?limit=100&paymentStatus=pending&paymentMethod=cash",
    [],
    refresh,
  );
  async function verify(payment: Payment) {
    const paidAmount = window.prompt("Paid amount", String(payment.amount));
    if (!paidAmount) return;
    await apiPatch(`/api/v1/cashier/payments/${payment.id}/verify-cash`, {
      paidAmount: Number(paidAmount),
    });
    setRefresh((value) => value + 1);
  }
  const columns: ColumnDef<Payment>[] = [
    {
      header: "Tracking",
      cell: ({ row }) => <span className="font-bold">{row.original.shipments?.tracking_number ?? "-"}</span>,
    },
    {
      header: "Amount",
      cell: ({ row }) => <span className="font-black text-slate-950">{formatCurrency(row.original.amount)}</span>,
    },
    {
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.payment_status} />,
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <button
          className="inline-flex h-8 items-center justify-center border border-slate-900 bg-amber-400 px-3 text-3xs font-black uppercase tracking-wider text-slate-950 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] rounded-sm cursor-pointer hover:translate-x-[-0.5px] hover:translate-y-[-0.5px]"
          onClick={() => verify(row.original)}
          type="button"
        >
          Verify cash
        </button>
      ),
    },
  ];
  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title="Cash verification"
        description="Verifikasi cash payment cabang sendiri."
      />
      <div className="flex flex-col gap-4 border-4 border-slate-900 bg-amber-50/20 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-md sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 max-w-lg"><ReportFilter onChange={setReportFilters} showStatus value={reportFilters} /></div>
        <PdfExportButton
          label="Export Cash Verification PDF"
          onExport={async () => {
            validateReportFilters(reportFilters);
            const reportData = await getCashierPaymentReport({
              ...reportFilters,
              status: "pending",
            });
            exportCashierPaymentPdf(
              reportData.filter((payment) => payment.payment_method === "cash"),
              reportOptions(
                "Laporan Cash Verification",
                "cashier",
                reportGenerator,
                reportFilters,
              ),
            );
          }}
        />
      </div>
      <StatePanel
        error={error}
        loading={loading}
        onRetry={() => setRefresh((value) => value + 1)}
      />
      {!loading && !error && <DataTable columns={columns} data={data} />}
    </section>
  );
}

export function CourierDashboardPage() {
  const { data, loading, error } = useApiData<Shipment[]>(
    "/api/v1/courier/shipments?limit=100",
    [],
  );
  const recentShipments = [...data]
    .sort(
      (left, right) =>
        new Date(right.shipment_date).getTime() -
        new Date(left.shipment_date).getTime(),
    )
    .slice(0, 3);

  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title="Beranda"
        description="Statistik pengiriman dan request terbaru."
      />
      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard
              label="Siap Antar"
              value={data.filter((shipment) => shipment.status === "arrived_at_branch").length}
            />
            <StatCard
              label="Sedang Diantar"
              value={data.filter((shipment) => shipment.status === "out_for_delivery").length}
            />
            <StatCard
              label="Terkirim Hari Ini"
              value={data.filter((shipment) => shipment.status === "delivered").length}
            />
            <StatCard
              label="Aktif"
              value={
                data.filter(
                  (shipment) =>
                    shipment.status !== "delivered" &&
                    shipment.status !== "cancelled",
                ).length
              }
            />
          </div>
          
          <section className="w-full border-4 border-slate-900 bg-white p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md">
            <div className="mb-4 flex items-center gap-2 border-b-2 border-slate-900 pb-2">
              <Truck className="text-slate-900 stroke-[2.5]" size={16} />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Request Pengiriman Terbaru
              </h2>
            </div>
            <SimpleShipmentTable shipments={recentShipments} />
          </section>
        </>
      )}
    </section>
  );
}

export function ManagerDashboardPage() {
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator("manager");
  const { data, loading, error } = useApiData<DashboardSummary>(
    "/api/v1/manager/dashboard",
    {
      totalCustomers: 0,
      totalStaff: 0,
      totalBranches: 0,
      totalVehicles: 0,
      totalShipments: 0,
      totalPendingShipment: 0,
      totalDeliveredShipment: 0,
      totalRevenue: 0,
      shipmentChart: {},
      paymentChart: {},
      recentShipments: [],
      recentPayments: [],
    },
  );
  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title="Manager dashboard"
        description="Read only analytics operasional."
      />
      <div className="flex flex-col gap-4 border-4 border-slate-900 bg-amber-50/20 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-md">
        <ReportFilter onChange={setReportFilters} value={reportFilters} />
        <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-slate-900/10 pt-3">
          <PdfExportButton
            label="Export Revenue PDF"
            onExport={async () => {
              validateReportFilters(reportFilters);
              const reportData = await getManagerRevenueReport();
              exportManagerRevenuePdf(
                reportData,
                reportOptions(
                  "Laporan Revenue Manager",
                  "manager",
                  reportGenerator,
                  reportFilters,
                ),
              );
            }}
          />
          <PdfExportButton
            label="Export Shipment PDF"
            onExport={async () => {
              validateReportFilters(reportFilters);
              const reportData = await getManagerShipmentReport(reportFilters);
              exportManagerShipmentPdf(
                reportData,
                reportOptions(
                  "Laporan Shipment Manager",
                  "manager",
                  reportGenerator,
                  reportFilters,
                ),
              );
            }}
          />
        </div>
      </div>

      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-5">
            <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} />
            <StatCard label="Total Shipment" value={data.totalShipments} />
            <StatCard label="Total Customer" value={data.totalCustomers} />
            <StatCard label="Total Branch" value={data.totalBranches} />
            <StatCard label="Total Courier" value={data.totalVehicles} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashboardChart data={chartData(data.shipmentChart)} title="Shipment by Status" />
            <DashboardChart data={chartData(data.paymentChart)} title="Payment by Status" />
          </div>
          <RecentTables payments={data.recentPayments} shipments={data.recentShipments} />
        </>
      )}
    </section>
  );
}

export function ManagerAnalyticsPage() {
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator("manager");
  const { data, loading, error } = useApiData<Record<string, unknown>>(
    "/api/v1/manager/payments/summary",
    {},
  );
  const chart = useMemo(
    () =>
      Object.entries(
        (data.revenueByBranch as Record<string, number> | undefined) ?? {},
      ).map(([name, value]) => ({ name, value })),
    [data],
  );
  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title="Manager analytics"
        description="Analisa revenue dan performa cabang."
      />
      <div className="flex flex-col gap-4 border-4 border-slate-900 bg-amber-50/20 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-md">
        <ReportFilter onChange={setReportFilters} value={reportFilters} />
        <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-slate-900/10 pt-3">
          <PdfExportButton
            label="Export Revenue PDF"
            onExport={async () => {
              validateReportFilters(reportFilters);
              const reportData = await getManagerRevenueReport();
              exportManagerRevenuePdf(
                reportData,
                reportOptions(
                  "Laporan Revenue Manager",
                  "manager",
                  reportGenerator,
                  reportFilters,
                ),
              );
            }}
          />
          <PdfExportButton
            label="Export Courier Performance PDF"
            onExport={async () => {
              validateReportFilters(reportFilters);
              const reportData = await getManagerCourierPerformanceReport(reportFilters);
              exportManagerCourierPerformancePdf(
                reportData,
                reportOptions(
                  "Laporan Performa Kurir",
                  "manager",
                  reportGenerator,
                  reportFilters,
                ),
              );
            }}
          />
        </div>
      </div>

      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard label="Total Revenue" value={formatCurrency(Number(data.totalRevenue ?? 0))} />
            <StatCard label="Paid" value={String(data.totalPaid ?? 0)} />
            <StatCard label="Pending" value={String(data.totalPending ?? 0)} />
            <StatCard label="Failed" value={String(data.totalFailed ?? 0)} />
          </div>
          <DashboardChart data={chart} title="Revenue by Branch" />
        </>
      )}
    </section>
  );
}

export function OwnerDashboardPage() {
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator("owner");
  const { data, loading, error } = useApiData<DashboardSummary>(
    "/api/v1/owner/dashboard",
    {
      totalCustomers: 0,
      totalStaff: 0,
      totalBranches: 0,
      totalVehicles: 0,
      totalShipments: 0,
      totalPendingShipment: 0,
      totalDeliveredShipment: 0,
      totalRevenue: 0,
      shipmentChart: {},
      paymentChart: {},
      recentShipments: [],
      recentPayments: [],
    },
  );
  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title="Owner Dashboard"
        description="Statistik keseluruhan perusahaan ekspedisi — hanya baca."
      />
      <div className="flex flex-col gap-4 border-4 border-slate-900 bg-amber-50/20 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-md">
        <ReportFilter onChange={setReportFilters} value={reportFilters} />
        <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-slate-900/10 pt-3">
          <PdfExportButton
            label="Export Revenue PDF"
            onExport={async () => {
              validateReportFilters(reportFilters);
              const reportData = await getManagerRevenueReport();
              exportManagerRevenuePdf(
                reportData,
                reportOptions(
                  "Laporan Revenue Perusahaan",
                  "owner",
                  reportGenerator,
                  reportFilters,
                ),
              );
            }}
          />
          <PdfExportButton
            label="Export Shipment PDF"
            onExport={async () => {
              validateReportFilters(reportFilters);
              const reportData = await getManagerShipmentReport(reportFilters);
              exportManagerShipmentPdf(
                reportData,
                reportOptions(
                  "Laporan Shipment Perusahaan",
                  "owner",
                  reportGenerator,
                  reportFilters,
                ),
              );
            }}
          />
        </div>
      </div>

      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={CreditCard} />
            <StatCard label="Total Shipment" value={data.totalShipments} icon={PackageCheck} />
            <StatCard label="Pending Shipment" value={data.totalPendingShipment} icon={Truck} />
            <StatCard label="Delivered" value={data.totalDeliveredShipment} icon={PackageCheck} />
            <StatCard label="Total Customer" value={data.totalCustomers} icon={Users} />
            <StatCard label="Total Branch" value={data.totalBranches} icon={Building2} />
            <StatCard label="Total Staff" value={data.totalStaff} icon={Users} />
            <StatCard label="Total Kendaraan" value={data.totalVehicles} icon={Truck} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashboardChart data={chartData(data.shipmentChart)} title="Shipment by Status" />
            <DashboardChart data={chartData(data.paymentChart)} title="Payment by Status" />
          </div>
          <RecentTables payments={data.recentPayments} shipments={data.recentShipments} />
        </>
      )}
    </section>
  );
}

export function OwnerAnalyticsPage() {
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator("owner");
  const { data, loading, error } = useApiData<Record<string, unknown>>(
    "/api/v1/owner/payments/summary",
    {},
  );
  const chart = useMemo(
    () =>
      Object.entries(
        (data.revenueByBranch as Record<string, number> | undefined) ?? {},
      ).map(([name, value]) => ({ name, value })),
    [data],
  );
  return (
    <section className="w-full space-y-6 font-mono">
      <PageHeader
        title="Owner Analytics"
        description="Analisa revenue dan performa seluruh cabang."
      />
      <div className="flex flex-col gap-4 border-4 border-slate-900 bg-amber-50/20 p-5 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-md">
        <ReportFilter onChange={setReportFilters} value={reportFilters} />
        <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-slate-900/10 pt-3">
          <PdfExportButton
            label="Export Revenue PDF"
            onExport={async () => {
              validateReportFilters(reportFilters);
              const reportData = await getManagerRevenueReport();
              exportManagerRevenuePdf(
                reportData,
                reportOptions(
                  "Laporan Revenue Perusahaan",
                  "owner",
                  reportGenerator,
                  reportFilters,
                ),
              );
            }}
          />
          <PdfExportButton
            label="Export Performa Kurir PDF"
            onExport={async () => {
              validateReportFilters(reportFilters);
              const reportData = await getManagerCourierPerformanceReport(reportFilters);
              exportManagerCourierPerformancePdf(
                reportData,
                reportOptions(
                  "Laporan Performa Kurir",
                  "owner",
                  reportGenerator,
                  reportFilters,
                ),
              );
            }}
          />
        </div>
      </div>

      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard label="Total Revenue" value={formatCurrency(Number(data.totalRevenue ?? 0))} icon={CreditCard} />
            <StatCard label="Paid" value={String(data.totalPaid ?? 0)} icon={BarChart3} />
            <StatCard label="Pending" value={String(data.totalPending ?? 0)} icon={PackageCheck} />
            <StatCard label="Failed" value={String(data.totalFailed ?? 0)} icon={Truck} />
          </div>
          <DashboardChart data={chart} title="Revenue by Branch" />
        </>
      )}
    </section>
  );
}