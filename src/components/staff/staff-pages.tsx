"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { BarChart3, Building2, CreditCard, Eye, PackageCheck, Truck, Users } from "lucide-react";
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
import {
  addPdfHeader,
  addPdfSummary,
  addPdfTable,
  createPdfDocument,
  downloadPdf,
} from "@/lib/pdf";
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
import type { PdfReportOptions, ReportFilters, ReportGenerator } from "@/types/report";

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
    error: query.error instanceof Error ? query.error.message : query.isError ? "Gagal memuat data." : "",
  };
}

function StatePanel({ loading, error, onRetry }: { loading: boolean; error: string; onRetry?: () => void }) {
  if (loading) {
    return <div className="panel">Memuat data...</div>;
  }

  if (error) {
    return (
      <div className="alert error">
        {error}
        {onRetry && <button className="button secondary" onClick={onRetry} type="button">Retry</button>}
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
        const user = response.data as { name?: string; role?: string; branchId?: number | null };
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
  const doc = createPdfDocument(title, columns.length > 6 ? "l" : "p");
  const options = reportOptions(title, "admin", generator, filters);
  addPdfHeader(doc, options);
  addPdfSummary(doc, { "Total Data": rows.length });
  addPdfTable(doc, columns, rows);
  downloadPdf(doc, filename);
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
    <section className="content">
      <PageHeader title="Admin dashboard" description="Ringkasan operasional global ekspedisi." />
      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid metrics">
            <StatCard icon={Users} label="Total Customer" value={data.totalCustomers} />
            <StatCard icon={Users} label="Total Staff" value={data.totalStaff} />
            <StatCard icon={Building2} label="Total Branch" value={data.totalBranches} />
            <StatCard icon={Truck} label="Total Vehicle" value={data.totalVehicles} />
            <StatCard icon={PackageCheck} label="Total Shipment" value={data.totalShipments} />
            <StatCard icon={CreditCard} label="Total Revenue" value={formatCurrency(data.totalRevenue)} />
            <StatCard label="Pending Shipment" value={data.totalPendingShipment} />
            <StatCard label="Delivered Shipment" value={data.totalDeliveredShipment} />
          </div>
          <div className="grid two-col">
            <DashboardChart data={chartData(data.shipmentChart)} title="Shipment by Status" />
            <DashboardChart data={chartData(data.paymentChart)} title="Payment by Status" />
          </div>
          <RecentTables payments={data.recentPayments} shipments={data.recentShipments} />
        </>
      )}
    </section>
  );
}

function RecentTables({ shipments, payments }: { shipments: Shipment[]; payments: Payment[] }) {
  return (
    <div className="grid two-col">
      <section className="panel">
        <h2>Recent Shipments</h2>
        <SimpleShipmentTable shipments={shipments} />
      </section>
      <section className="panel">
        <h2>Recent Payments</h2>
        <SimplePaymentTable payments={payments} />
      </section>
    </div>
  );
}

function SimpleShipmentTable({ shipments }: { shipments: Shipment[] }) {
  if (shipments.length === 0) return <p className="muted">Belum ada shipment.</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Resi</th><th>Origin</th><th>Destination</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>
          {shipments.slice(0, 8).map((shipment) => (
            <tr key={shipment.id}>
              <td>{shipment.tracking_number}</td>
              <td>{shipment.branches_shipments_origin_branch_idTobranches?.city ?? "-"}</td>
              <td>{shipment.branches_shipments_destination_branch_idTobranches?.city ?? "-"}</td>
              <td><StatusBadge status={shipment.status} /></td>
              <td>{formatCurrency(shipment.total_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SimplePaymentTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) return <p className="muted">Belum ada payment.</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Resi</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {payments.slice(0, 8).map((payment) => (
            <tr key={payment.id}>
              <td>{payment.shipments?.tracking_number ?? "-"}</td>
              <td>{formatCurrency(payment.amount)}</td>
              <td>{payment.payment_method}</td>
              <td><StatusBadge status={payment.payment_status} /></td>
              <td>{formatDate(payment.payment_date)}</td>
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
  const { data, loading, error } = useApiData<Branch[]>("/api/v1/admin/branches?limit=100", [], refresh);
  const filtered = data.filter((branch) => `${branch.name} ${branch.city}`.toLowerCase().includes(search.toLowerCase()));

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
        readOnly ? "Read only" : (
          <button className="button danger" onClick={() => remove(row.original.id)} type="button">Delete</button>
        ),
    },
  ];

  return (
    <section className="content">
      <PageHeader title={readOnly ? "Branches" : "Admin branches"} description={readOnly ? "Read only branch monitoring." : "Kelola cabang ekspedisi."} />
      {!readOnly && (
        <>
          <ReportFilter onChange={setReportFilters} value={reportFilters} />
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
        </>
      )}
      {!readOnly && (
        <MasterForm fields={["name", "city", "address", "phone"]} onSubmit={save} title="Create branch" />
      )}
      <FilterBar onSearch={setSearch} search={search} />
      <StatePanel error={error} loading={loading} onRetry={() => setRefresh((value) => value + 1)} />
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
      setError(currentError instanceof Error ? currentError.message : "Gagal menyimpan data.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <h2>{title}</h2>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {fields.map((field) => (
          <div className="field" key={field}>
            <label>{field}</label>
            <input className="input" name={field} type={field.toLowerCase().includes("password") ? "password" : "text"} />
          </div>
        ))}
      </div>
      {error && <div className="alert error">{error}</div>}
      <button className="button primary" disabled={busy} type="submit">
        {busy ? "Menyimpan..." : "Save"}
      </button>
    </form>
  );
}

export function StaffUsersPage() {
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator("admin");
  const { data, loading, error } = useApiData<StaffUser[]>("/api/v1/admin/users?limit=100", [], refresh);
  const filtered = data.filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(search.toLowerCase()));

  async function create(formData: FormData) {
    const body = Object.fromEntries(formData);
    await apiPost("/api/v1/admin/users", {
      ...body,
      branchId: body.branchId ? Number(body.branchId) : null,
    });
    setRefresh((value) => value + 1);
  }

  async function toggle(id: string, active: boolean) {
    await apiPatch(`/api/v1/admin/users/${id}/${active ? "activate" : "deactivate"}`, {});
    setRefresh((value) => value + 1);
  }

  const columns: ColumnDef<StaffUser>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
    { header: "Branch", accessorKey: "branch_id" },
    { header: "Status", cell: ({ row }) => row.original.is_active ? "Active" : "Inactive" },
    {
      header: "Action",
      cell: ({ row }) => (
        <button className="button secondary" onClick={() => toggle(row.original.id, !row.original.is_active)} type="button">
          {row.original.is_active ? "Deactivate" : "Activate"}
        </button>
      ),
    },
  ];

  return (
    <section className="content">
      <PageHeader title="Admin staff" description="Tambah dan aktifkan staff internal." />
      <ReportFilter onChange={setReportFilters} value={reportFilters} />
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
      <MasterForm fields={["name", "email", "password", "role", "branchId"]} onSubmit={create} title="Create staff" />
      <FilterBar onSearch={setSearch} search={search} />
      <StatePanel error={error} loading={loading} onRetry={() => setRefresh((value) => value + 1)} />
      {!loading && !error && <DataTable columns={columns} data={filtered} />}
    </section>
  );
}

export function CustomersPage() {
  const [search, setSearch] = useState("");
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator("admin");
  const { data, loading, error } = useApiData<CustomerRecord[]>("/api/v1/admin/customers?limit=100", []);
  const filtered = data.filter((customer) => `${customer.name} ${customer.email} ${customer.city}`.toLowerCase().includes(search.toLowerCase()));
  const columns: ColumnDef<CustomerRecord>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "City", accessorKey: "city" },
    { header: "Phone", accessorKey: "phone" },
    { header: "Verified", cell: ({ row }) => row.original.email_verified_at ? "Verified" : "Unverified" },
  ];
  return (
    <section className="content">
      <PageHeader title="Customers" description="Monitoring customer terdaftar." />
      <ReportFilter onChange={setReportFilters} value={reportFilters} />
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
      <FilterBar onSearch={setSearch} search={search} />
      <StatePanel error={error} loading={loading} />
      {!loading && !error && <DataTable columns={columns} data={filtered} />}
    </section>
  );
}

export function RatesPage() {
  const [refresh, setRefresh] = useState(0);
  const { data, loading, error } = useApiData<Rate[]>("/api/v1/admin/rates?limit=100", [], refresh);
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
    { header: "Price/Kg", cell: ({ row }) => formatCurrency(row.original.price_per_kg) },
    { header: "Days", accessorKey: "estimated_days" },
    { header: "Action", cell: ({ row }) => <button className="button danger" onClick={() => remove(row.original.id)} type="button">Delete</button> },
  ];
  return (
    <section className="content">
      <PageHeader title="Admin rates" description="Kelola tarif rute pengiriman." />
      <MasterForm fields={["originCity", "destinationCity", "pricePerKg", "estimatedDays"]} onSubmit={create} title="Create rate" />
      <StatePanel error={error} loading={loading} onRetry={() => setRefresh((value) => value + 1)} />
      {!loading && !error && <DataTable columns={columns} data={data} />}
    </section>
  );
}

export function VehiclesPage() {
  const [refresh, setRefresh] = useState(0);
  const { data, loading, error } = useApiData<Vehicle[]>("/api/v1/admin/vehicles?limit=100", [], refresh);
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
    { header: "Courier", cell: ({ row }) => row.original.users?.name ?? row.original.courier_id },
    { header: "Action", cell: ({ row }) => <button className="button danger" onClick={() => remove(row.original.id)} type="button">Delete</button> },
  ];
  return (
    <section className="content">
      <PageHeader title="Admin vehicles" description="Kelola kendaraan kurir." />
      <MasterForm fields={["plateNumber", "type", "courierId"]} onSubmit={create} title="Create vehicle" />
      <StatePanel error={error} loading={loading} onRetry={() => setRefresh((value) => value + 1)} />
      {!loading && !error && <DataTable columns={columns} data={data} />}
    </section>
  );
}

function branchMatches(branchId?: string | number | null, currentBranchId?: string | null) {
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Detail Pesanan</h2>
            <p className="text-slate-500">Resi: {shipment.tracking_number}</p>
          </div>
          <button className="button secondary" onClick={onClose} type="button">Tutup</button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
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
          <DetailField label="Berat Paket" value={item?.weight ? `${item.weight} kg` : `${shipment.total_weight} kg`} />
          <DetailField label="Cabang Asal" value={shipment.branches_shipments_origin_branch_idTobranches?.name} />
          <DetailField label="Cabang Tujuan" value={shipment.branches_shipments_destination_branch_idTobranches?.name} />
          <DetailField label="Metode Penyerahan" value={shipment.handover_method === "pickup" ? "Jemput Paket" : "Drop Off"} />
          <DetailField label="Metode Pembayaran" value={shipment.payments?.payment_method} />
          <DetailField label="Status Pembayaran" value={shipment.payments?.payment_status} />
          <DetailField label="Status Pengiriman" value={shipment.status} />
          <DetailField label="Courier Code" value={shipment.users?.courier_code} />
          <DetailField label="Total Harga" value={formatCurrency(shipment.total_price)} />
        </div>

        {item?.photo ? (
          <img alt="Foto paket saat serah terima" className="mt-5 h-48 w-full rounded-2xl object-cover" src={item.photo} />
        ) : null}
        {shipment.status === "delivered" && shipment.photo ? (
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-slate-700">Bukti paket telah diterima</p>
            <img alt="Bukti penyerahan kurir" className="h-48 w-full rounded-2xl object-cover" src={shipment.photo} />
          </div>
        ) : null}
        {(shipment.shipment_trackings?.length ?? 0) > 0 ? (
          <div className="mt-6">
            <h3 className="font-bold text-slate-900">Riwayat Tracking & Kurir</h3>
            <div className="mt-3 grid gap-3">
              {(shipment.shipment_trackings ?? []).map((tracking) => (
                <div className="rounded-2xl bg-slate-50 p-4" key={tracking.id}>
                  <div className="font-semibold capitalize">{tracking.status.replaceAll("_", " ")}</div>
                  <div className="text-sm text-slate-500">
                    {tracking.location} - {formatDate(tracking.tracked_at)}
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{tracking.description}</p>
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
    <div className={`rounded-2xl bg-slate-50 p-4 ${wide ? "md:col-span-2" : ""}`}>
      <div className="text-xs font-semibold uppercase text-slate-400">{label}</div>
      <div className="mt-1 font-semibold text-slate-900">{value ?? "-"}</div>
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
  const reportGenerator = useReportGenerator(mode === "manager" ? "manager" : "admin");
  const endpoint = mode === "courier" ? "/api/v1/courier/shipments?limit=100" : "/api/v1/admin/shipments?limit=100";
  const { data, loading, error } = useApiData<Shipment[]>(`${endpoint}${status ? `&status=${status}` : ""}`, [], refresh);
  const [arrivalReceipts, setArrivalReceipts] = useState<Record<string, string>>({});
  const [courierCodes, setCourierCodes] = useState<Record<string, string>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const [deliveryPhotoFiles, setDeliveryPhotoFiles] = useState<Record<string, File>>({}); // actual File objects
  const [deliveryPhotoPreviews, setDeliveryPhotoPreviews] = useState<Record<string, string>>({}); // object URLs for preview
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
  const currentBranchId = currentUser.data?.branchId != null
    ? String(currentUser.data.branchId)
    : null;

  async function updateStatus(id: string, nextStatus: string, photo?: string) {
    const path = mode === "courier" ? `/api/v1/courier/shipments/${id}/status` : `/api/v1/admin/shipments/${id}/status`;
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
      toast.error(error instanceof Error ? error.message : "Status pengiriman gagal diperbarui.");
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
      await apiPatch(`/api/v1/admin/shipments/${id}/assign-courier`, { courierCode });
      toast.success("Kurir pengantaran berhasil ditugaskan.");
      setCourierCodes((current) => ({ ...current, [id]: "" }));
      setRefresh((value) => value + 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kurir gagal ditugaskan.";
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
      await apiPost("/api/v1/admin/shipments/receive", { shipmentId: id, trackingNumber });
      toast.success("Paket berhasil diterima cabang tujuan.");
      setArrivalReceipts((current) => ({ ...current, [id]: "" }));
      setRefresh((value) => value + 1);
    } catch (error) {
      setRowError(id, error instanceof Error ? error.message : "Paket gagal diterima.");
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
      cell: ({ row }) => row.original.tracking_number,
    },
    { header: "Courier Code", cell: ({ row }) => row.original.users?.courier_code ?? "-" },
    { header: "Sender", cell: ({ row }) => row.original.customers_shipments_sender_idTocustomers?.name ?? "-" },
    { header: "Receiver", cell: ({ row }) => row.original.customers_shipments_receiver_idTocustomers?.name ?? "-" },
    { header: "Origin", cell: ({ row }) => row.original.branches_shipments_origin_branch_idTobranches?.city ?? "-" },
    { header: "Destination", cell: ({ row }) => row.original.branches_shipments_destination_branch_idTobranches?.city ?? "-" },
    { header: "Total", cell: ({ row }) => formatCurrency(row.original.total_price) },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: "Payment", cell: ({ row }) => <StatusBadge status={row.original.payments?.payment_status} /> },
    ...(mode === "admin"
      ? [{
          header: "Detail",
          cell: ({ row }: { row: { original: Shipment } }) => (
            <button
              aria-label={`Detail pesanan ${row.original.tracking_number}`}
              className="button secondary"
              onClick={async () => {
                try {
                  const response = await apiGet<Shipment>(`/api/v1/admin/shipments/${row.original.id}`);
                  setDetailShipment(response.data);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Gagal memuat detail pesanan.");
                }
              }}
              type="button"
            >
              <Eye size={16} />
            </button>
          ),
        } as ColumnDef<Shipment>]
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
          return <span className="muted">Tidak ada aksi</span>;
        }

        return (
          <ActionMenu>
            {originAdminAction ? (
              <button className="button primary" onClick={() => updateStatus(shipment.id, "in_transit")} type="button">
                Konfirmasi Keberangkatan
              </button>
            ) : null}
            {destinationArrivalAction ? (
              <form
                className="inline-action"
                onSubmit={(event) => {
                  event.preventDefault();
                  receiveDestinationShipment(shipment.id);
                }}
              >
                <span className="text-xs font-semibold text-slate-600">Langkah 1: Konfirmasi tiba di cabang</span>
                <input
                  aria-label={`Nomor resi ${shipment.tracking_number}`}
                  className="input"
                  onChange={(event) =>
                    setArrivalReceipts((current) => ({
                      ...current,
                      [shipment.id]: event.target.value,
                    }))
                  }
                  placeholder={`Input resi: ${shipment.tracking_number}`}
                  value={arrivalReceipts[shipment.id] ?? ""}
                />
                <button className="button primary" disabled={rowBusy[shipment.id]} type="submit">
                  {rowBusy[shipment.id] ? "Memproses..." : "Konfirmasi Arrived at Branch"}
                </button>
                {rowErrors[shipment.id] ? <span className="inline-error">{rowErrors[shipment.id]}</span> : null}
              </form>
            ) : null}
            {destinationAssignAction ? (
              <form
                className="inline-action"
                onSubmit={(event) => {
                  event.preventDefault();
                  assignCourier(shipment.id);
                }}
              >
                <span className="text-xs font-semibold text-slate-600">Langkah 2: Assign Kurir Pengantaran</span>
                <input
                  aria-label={`Courier code shipment ${shipment.tracking_number}`}
                  className="input"
                  inputMode="numeric"
                  maxLength={5}
                  onChange={(event) =>
                    setCourierCodes((current) => ({
                      ...current,
                      [shipment.id]: event.target.value.replace(/\D/g, "").slice(0, 5),
                    }))
                  }
                  placeholder="Courier Code (5 digit)"
                  value={courierCodes[shipment.id] ?? ""}
                />
                <button className="button secondary" disabled={rowBusy[shipment.id]} type="submit">
                  {rowBusy[shipment.id] ? "Memproses..." : "Assign Kurir Pengantaran"}
                </button>
                {rowErrors[shipment.id] ? <span className="inline-error">{rowErrors[shipment.id]}</span> : null}
              </form>
            ) : null}
            {destinationAwaitingCourierAction ? (
              <div className="inline-action" style={{ background: "#fffbeb", borderRadius: 8, padding: "8px 12px" }}>
                <span style={{ fontSize: 12, color: "#b45309", fontWeight: 600 }}>
                  Langkah 3: Menunggu kurir konfirmasi siap antar (out for delivery)
                </span>
              </div>
            ) : null}
            {courierReadyAction ? (
              <button
                className="button primary"
                disabled={rowBusy[shipment.id]}
                onClick={async () => {
                  setRowBusy((current) => ({ ...current, [shipment.id]: true }));
                  clearRowError(shipment.id);
                  try {
                    await updateStatus(shipment.id, "out_for_delivery");
                  } catch (err) {
                    setRowError(shipment.id, err instanceof Error ? err.message : "Konfirmasi gagal.");
                  } finally {
                    setRowBusy((current) => ({ ...current, [shipment.id]: false }));
                  }
                }}
                type="button"
              >
                {rowBusy[shipment.id] ? "Memproses..." : "Langkah 3: Konfirmasi Out for Delivery"}
              </button>
            ) : null}
            {courierCompleteAction ? (
              <form
                className="inline-action"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const photoFile = deliveryPhotoFiles[shipment.id];
                  if (!photoFile) {
                    setRowError(shipment.id, "Foto bukti penyerahan wajib diunggah.");
                    return;
                  }
                  setRowBusy((current) => ({ ...current, [shipment.id]: true }));
                  clearRowError(shipment.id);
                  try {
                    // Step 1: Upload the photo file to get a URL
                    const formData = new FormData();
                    formData.append("file", photoFile);
                    const uploadRes = await fetch("/api/v1/staff/upload", {
                      method: "POST",
                      body: formData,
                    });
                    const uploadData = await uploadRes.json();
                    if (!uploadRes.ok) {
                      throw new Error(uploadData.message || "Gagal mengunggah foto bukti");
                    }
                    const photoUrl = uploadData.data.url as string;

                    // Step 2: Update shipment status with the uploaded photo URL
                    await updateStatus(shipment.id, "delivered", photoUrl);

                    // Clean up
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
                    setRowError(shipment.id, err instanceof Error ? err.message : "Konfirmasi gagal.");
                  } finally {
                    setRowBusy((current) => ({ ...current, [shipment.id]: false }));
                  }
                }}
              >
                <label className="text-xs text-slate-500" htmlFor={`photo-${shipment.id}`}>
                  Langkah 4: Foto bukti paket telah tiba
                </label>
                <input
                  accept="image/*"
                  id={`photo-${shipment.id}`}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    // Revoke previous preview URL to avoid memory leaks
                    if (deliveryPhotoPreviews[shipment.id]) {
                      URL.revokeObjectURL(deliveryPhotoPreviews[shipment.id]);
                    }
                    const previewUrl = URL.createObjectURL(file);
                    setDeliveryPhotoFiles((current) => ({ ...current, [shipment.id]: file }));
                    setDeliveryPhotoPreviews((current) => ({ ...current, [shipment.id]: previewUrl }));
                  }}
                  style={{ display: "block", marginTop: 4 }}
                  type="file"
                />
                {deliveryPhotoPreviews[shipment.id] ? (
                  <img
                    alt="preview foto bukti"
                    src={deliveryPhotoPreviews[shipment.id]}
                    style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, marginTop: 4 }}
                  />
                ) : null}
                <button
                  className="button primary"
                  disabled={rowBusy[shipment.id] || !deliveryPhotoFiles[shipment.id]}
                  type="submit"
                >
                  {rowBusy[shipment.id] ? "Memproses..." : "Konfirmasi Delivered"}
                </button>
                {rowErrors[shipment.id] ? <span className="inline-error">{rowErrors[shipment.id]}</span> : null}
              </form>
            ) : null}
          </ActionMenu>
        );
      },
    },
  ];

  const pageTitle = mode === "courier" ? "Pengiriman" : `${mode} shipments`;
  const pageDescription = mode === "courier"
    ? "Daftar seluruh request pengiriman yang ditugaskan ke Anda, terbaru hingga terlama."
    : "Monitoring shipment dan tracking timeline.";

  return (
    <section className="content">
      <PageHeader title={pageTitle} description={pageDescription} />
      {mode === "admin" && (
        <>
          <ReportFilter onChange={setReportFilters} showBranch showStatus value={reportFilters} />
          <PdfExportButton
            label="Export Shipment PDF"
            onExport={async () => {
              validateReportFilters(reportFilters);
              const reportData = await getAdminShipmentReport(reportFilters);
              exportAdminShipmentPdf(
                reportData,
                reportOptions("Laporan Shipment Admin", "admin", reportGenerator, reportFilters),
              );
            }}
          />
        </>
      )}
      {mode === "manager" && (
        <>
          <ReportFilter onChange={setReportFilters} showBranch showStatus value={reportFilters} />
          <div className="staff-filter">
            <PdfExportButton
              label="Export Shipment PDF"
              onExport={async () => {
                validateReportFilters(reportFilters);
                const reportData = await getManagerShipmentReport(reportFilters);
                exportManagerShipmentPdf(
                  reportData,
                  reportOptions("Laporan Shipment Manager", "manager", reportGenerator, reportFilters),
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
                  reportOptions("Laporan Performa Kurir", "manager", reportGenerator, reportFilters),
                );
              }}
            />
          </div>
        </>
      )}
      <FilterBar>
        <select className="select" onChange={(event) => setStatus(event.target.value)} value={status}>
          <option value="">Semua status</option>
          <option value="pending">pending</option>
          <option value="picked_up">picked_up</option>
          <option value="in_transit">in_transit</option>
          <option value="arrived_at_branch">arrived_at_branch</option>
          <option value="out_for_delivery">out_for_delivery</option>
          <option value="delivered">delivered</option>
        </select>
      </FilterBar>
      <StatePanel error={error} loading={loading} onRetry={() => setRefresh((value) => value + 1)} />
      {!loading && !error && <DataTable columns={columns} data={shipments} />}
      {detailShipment ? (
        <ShipmentDetailModal onClose={() => setDetailShipment(null)} shipment={detailShipment} />
      ) : null}
    </section>
  );
}

export function PaymentsPage({ mode }: { mode: "admin" | "cashier" | "manager" }) {
  const endpoint = mode === "cashier" ? "/api/v1/cashier/payments?limit=100" : "/api/v1/admin/payments?limit=100";
  const [status, setStatus] = useState("");
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator(mode === "cashier" ? "cashier" : mode === "manager" ? "manager" : "admin");
  const { data, loading, error } = useApiData<Payment[]>(`${endpoint}${status ? `&paymentStatus=${status}` : ""}`, []);
  const columns: ColumnDef<Payment>[] = [
    { header: "Tracking", cell: ({ row }) => row.original.shipments?.tracking_number ?? "-" },
    { header: "Amount", cell: ({ row }) => formatCurrency(row.original.amount) },
    { header: "Method", accessorKey: "payment_method" },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.payment_status} /> },
    { header: "Reference", accessorKey: "transaction_reference" },
    { header: "Date", cell: ({ row }) => formatDate(row.original.payment_date) },
  ];
  return (
    <section className="content">
      <PageHeader title={`${mode} payments`} description="Monitoring status pembayaran." />
      <ReportFilter onChange={setReportFilters} showStatus value={reportFilters} />
      {mode === "admin" && (
        <PdfExportButton
          label="Export Payment PDF"
          onExport={async () => {
            validateReportFilters(reportFilters);
            const reportData = await getAdminPaymentReport(reportFilters);
            exportAdminPaymentPdf(
              reportData,
              reportOptions("Laporan Payment Admin", "admin", reportGenerator, reportFilters),
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
              reportOptions("Laporan Payment Cashier", "cashier", reportGenerator, reportFilters),
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
              reportOptions("Laporan Revenue Manager", "manager", reportGenerator, reportFilters),
            );
          }}
        />
      )}
      <FilterBar>
        <select className="select" onChange={(event) => setStatus(event.target.value)} value={status}>
          <option value="">Semua status</option>
          <option value="pending">pending</option>
          <option value="paid">paid</option>
          <option value="failed">failed</option>
        </select>
      </FilterBar>
      <StatePanel error={error} loading={loading} />
      {!loading && !error && <DataTable columns={columns} data={data} />}
    </section>
  );
}

export function CashVerificationPage() {
  const [refresh, setRefresh] = useState(0);
  const [reportFilters, setReportFilters] = useState<ReportFilters>({ status: "pending" });
  const reportGenerator = useReportGenerator("cashier");
  const { data, loading, error } = useApiData<Payment[]>("/api/v1/cashier/payments?limit=100&paymentStatus=pending&paymentMethod=cash", [], refresh);
  async function verify(payment: Payment) {
    const paidAmount = window.prompt("Paid amount", String(payment.amount));
    if (!paidAmount) return;
    await apiPatch(`/api/v1/cashier/payments/${payment.id}/verify-cash`, { paidAmount: Number(paidAmount) });
    setRefresh((value) => value + 1);
  }
  const columns: ColumnDef<Payment>[] = [
    { header: "Tracking", cell: ({ row }) => row.original.shipments?.tracking_number ?? "-" },
    { header: "Amount", cell: ({ row }) => formatCurrency(row.original.amount) },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.payment_status} /> },
    { header: "Action", cell: ({ row }) => <button className="button primary" onClick={() => verify(row.original)} type="button">Verify cash</button> },
  ];
  return (
    <section className="content">
      <PageHeader title="Cash verification" description="Verifikasi cash payment cabang sendiri." />
      <ReportFilter onChange={setReportFilters} showStatus value={reportFilters} />
      <PdfExportButton
        label="Export Cash Verification PDF"
        onExport={async () => {
          validateReportFilters(reportFilters);
          const reportData = await getCashierPaymentReport({ ...reportFilters, status: "pending" });
          exportCashierPaymentPdf(
            reportData.filter((payment) => payment.payment_method === "cash"),
            reportOptions("Laporan Cash Verification", "cashier", reportGenerator, reportFilters),
          );
        }}
      />
      <StatePanel error={error} loading={loading} onRetry={() => setRefresh((value) => value + 1)} />
      {!loading && !error && <DataTable columns={columns} data={data} />}
    </section>
  );
}

export function CourierDashboardPage() {
  const { data, loading, error } = useApiData<Shipment[]>("/api/v1/courier/shipments?limit=100", []);
  const recentShipments = [...data]
    .sort((left, right) => new Date(right.shipment_date).getTime() - new Date(left.shipment_date).getTime())
    .slice(0, 3);

  return (
    <section className="content">
      <PageHeader title="Beranda" description="Statistik pengiriman dan request terbaru." />
      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid metrics">
            <StatCard label="Siap Antar" value={data.filter((shipment) => shipment.status === "arrived_at_branch").length} />
            <StatCard label="Sedang Diantar" value={data.filter((shipment) => shipment.status === "out_for_delivery").length} />
            <StatCard label="Terkirim Hari Ini" value={data.filter((shipment) => shipment.status === "delivered").length} />
            <StatCard label="Aktif" value={data.filter((shipment) => shipment.status !== "delivered" && shipment.status !== "cancelled").length} />
          </div>
          <section className="panel">
            <h2>Request Pengiriman Terbaru</h2>
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
  const { data, loading, error } = useApiData<DashboardSummary>("/api/v1/manager/dashboard", {
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
  });
  return (
    <section className="content">
      <PageHeader title="Manager dashboard" description="Read only analytics operasional." />
      <ReportFilter onChange={setReportFilters} value={reportFilters} />
      <div className="staff-filter">
        <PdfExportButton
          label="Export Revenue PDF"
          onExport={async () => {
            validateReportFilters(reportFilters);
            const reportData = await getManagerRevenueReport();
            exportManagerRevenuePdf(
              reportData,
              reportOptions("Laporan Revenue Manager", "manager", reportGenerator, reportFilters),
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
              reportOptions("Laporan Shipment Manager", "manager", reportGenerator, reportFilters),
            );
          }}
        />
      </div>
      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid metrics">
            <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} />
            <StatCard label="Total Shipment" value={data.totalShipments} />
            <StatCard label="Total Customer" value={data.totalCustomers} />
            <StatCard label="Total Branch" value={data.totalBranches} />
            <StatCard label="Total Courier" value={data.totalVehicles} />
          </div>
          <div className="grid two-col">
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
  const { data, loading, error } = useApiData<Record<string, unknown>>("/api/v1/manager/payments/summary", {});
  const chart = useMemo(
    () => Object.entries((data.revenueByBranch as Record<string, number> | undefined) ?? {}).map(([name, value]) => ({ name, value })),
    [data],
  );
  return (
    <section className="content">
      <PageHeader title="Manager analytics" description="Analisa revenue dan performa cabang." />
      <ReportFilter onChange={setReportFilters} value={reportFilters} />
      <div className="staff-filter">
        <PdfExportButton
          label="Export Revenue PDF"
          onExport={async () => {
            validateReportFilters(reportFilters);
            const reportData = await getManagerRevenueReport();
            exportManagerRevenuePdf(
              reportData,
              reportOptions("Laporan Revenue Manager", "manager", reportGenerator, reportFilters),
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
              reportOptions("Laporan Performa Kurir", "manager", reportGenerator, reportFilters),
            );
          }}
        />
      </div>
      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid metrics">
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
  const { data, loading, error } = useApiData<DashboardSummary>("/api/v1/owner/dashboard", {
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
  });
  return (
    <section className="content">
      <PageHeader
        title="Owner Dashboard"
        description="Statistik keseluruhan perusahaan ekspedisi — hanya baca."
      />
      <ReportFilter onChange={setReportFilters} value={reportFilters} />
      <div className="staff-filter">
        <PdfExportButton
          label="Export Revenue PDF"
          onExport={async () => {
            validateReportFilters(reportFilters);
            const reportData = await getManagerRevenueReport();
            exportManagerRevenuePdf(
              reportData,
              reportOptions("Laporan Revenue Perusahaan", "owner", reportGenerator, reportFilters),
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
              reportOptions("Laporan Shipment Perusahaan", "owner", reportGenerator, reportFilters),
            );
          }}
        />
      </div>
      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid metrics">
            <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={CreditCard} />
            <StatCard label="Total Shipment" value={data.totalShipments} icon={PackageCheck} />
            <StatCard label="Pending Shipment" value={data.totalPendingShipment} icon={Truck} />
            <StatCard label="Delivered" value={data.totalDeliveredShipment} icon={PackageCheck} />
            <StatCard label="Total Customer" value={data.totalCustomers} icon={Users} />
            <StatCard label="Total Branch" value={data.totalBranches} icon={Building2} />
            <StatCard label="Total Staff" value={data.totalStaff} icon={Users} />
            <StatCard label="Total Kendaraan" value={data.totalVehicles} icon={Truck} />
          </div>
          <div className="grid two-col">
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
  const { data, loading, error } = useApiData<Record<string, unknown>>("/api/v1/owner/payments/summary", {});
  const chart = useMemo(
    () =>
      Object.entries((data.revenueByBranch as Record<string, number> | undefined) ?? {}).map(
        ([name, value]) => ({ name, value }),
      ),
    [data],
  );
  return (
    <section className="content">
      <PageHeader
        title="Owner Analytics"
        description="Analisa revenue dan performa seluruh cabang."
      />
      <ReportFilter onChange={setReportFilters} value={reportFilters} />
      <div className="staff-filter">
        <PdfExportButton
          label="Export Revenue PDF"
          onExport={async () => {
            validateReportFilters(reportFilters);
            const reportData = await getManagerRevenueReport();
            exportManagerRevenuePdf(
              reportData,
              reportOptions("Laporan Revenue Perusahaan", "owner", reportGenerator, reportFilters),
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
              reportOptions("Laporan Performa Kurir", "owner", reportGenerator, reportFilters),
            );
          }}
        />
      </div>
      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid metrics">
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
