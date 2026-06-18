"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { BarChart3, Building2, CreditCard, PackageCheck, Truck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  CustomerRecord,
  DashboardSummary,
  Payment,
  Rate,
  Shipment,
  StaffUser,
  Vehicle,
} from "@/types/customer-portal";
import type { PdfReportOptions, ReportFilters, ReportGenerator } from "@/types/report";

type LoadState<T> = {
  data: T;
  loading: boolean;
  error: string;
};

function useApiData<T>(path: string, fallback: T, refreshKey = 0) {
  const [state, setState] = useState<LoadState<T>>({
    data: fallback,
    loading: true,
    error: "",
  });

  useEffect(() => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    apiGet<T>(path)
      .then((response) => setState({ data: response.data, loading: false, error: "" }))
      .catch((error) =>
        setState({
          data: fallback,
          loading: false,
          error: error instanceof Error ? error.message : "Gagal memuat data.",
        }),
      );
  }, [path, refreshKey]);

  return state;
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

function useReportGenerator(role: "admin" | "cashier" | "manager") {
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
  role: "admin" | "cashier" | "manager",
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
    { header: "Verified", cell: ({ row }) => row.original.is_verified ? "Verified" : "Unverified" },
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
              customer.email,
              customer.city,
              customer.phone,
              customer.is_verified ? "Verified" : "Unverified",
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
  const shipments = filter ? data.filter(filter) : data;

  async function updateStatus(id: string, nextStatus: string) {
    const path = mode === "courier" ? `/api/v1/courier/shipments/${id}/status` : `/api/v1/admin/shipments/${id}/status`;
    await apiPatch(path, {
      status: nextStatus,
      location: "Cabang operasional",
      description: `Status updated to ${nextStatus}`,
    });
    setRefresh((value) => value + 1);
  }

  async function assignCourier(id: string) {
    const courierId = window.prompt("Courier ID");
    if (!courierId) return;
    await apiPatch(`/api/v1/admin/shipments/${id}/assign-courier`, { courierId: Number(courierId) });
    setRefresh((value) => value + 1);
  }

  const columns: ColumnDef<Shipment>[] = [
    { header: "Tracking", accessorKey: "tracking_number" },
    { header: "Sender", cell: ({ row }) => row.original.customers_shipments_sender_idTocustomers?.name ?? "-" },
    { header: "Receiver", cell: ({ row }) => row.original.customers_shipments_receiver_idTocustomers?.name ?? "-" },
    { header: "Origin", cell: ({ row }) => row.original.branches_shipments_origin_branch_idTobranches?.city ?? "-" },
    { header: "Destination", cell: ({ row }) => row.original.branches_shipments_destination_branch_idTobranches?.city ?? "-" },
    { header: "Total", cell: ({ row }) => formatCurrency(row.original.total_price) },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: "Payment", cell: ({ row }) => <StatusBadge status={row.original.payments?.payment_status} /> },
    {
      header: "Action",
      cell: ({ row }) => (
        <ActionMenu>
          {mode === "admin" && <button className="button secondary" onClick={() => assignCourier(row.original.id)} type="button">Assign</button>}
          {mode !== "manager" && (
            <select className="select" onChange={(event) => event.target.value && updateStatus(row.original.id, event.target.value)} defaultValue="">
              <option value="">Update</option>
              <option value="picked_up">picked_up</option>
              <option value="in_transit">in_transit</option>
              <option value="arrived_at_branch">arrived_at_branch</option>
              <option value="out_for_delivery">out_for_delivery</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
          )}
        </ActionMenu>
      ),
    },
  ];

  return (
    <section className="content">
      <PageHeader title={`${mode} shipments`} description="Monitoring shipment dan tracking timeline." />
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

export function CashierDashboardPage() {
  const [reportFilters, setReportFilters] = useState<ReportFilters>({});
  const reportGenerator = useReportGenerator("cashier");
  const { data, loading, error } = useApiData<Payment[]>("/api/v1/cashier/payments?limit=100", []);
  const paidToday = data.filter((payment) => payment.payment_status === "paid" && payment.payment_date?.startsWith(new Date().toISOString().slice(0, 10)));
  const pendingCash = data.filter((payment) => payment.payment_method === "cash" && payment.payment_status === "pending");
  return (
    <section className="content">
      <PageHeader title="Cashier dashboard" description="Pembayaran cabang cashier." />
      <ReportFilter onChange={setReportFilters} showStatus value={reportFilters} />
      <PdfExportButton
        label="Export Cashier Payment PDF"
        onExport={async () => {
          validateReportFilters(reportFilters);
          const reportData = await getCashierPaymentReport(reportFilters);
          exportCashierPaymentPdf(
            reportData,
            reportOptions("Laporan Payment Cashier", "cashier", reportGenerator, reportFilters),
          );
        }}
      />
      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid metrics">
            <StatCard label="Paid Today" value={paidToday.length} />
            <StatCard label="Pending Cash" value={pendingCash.length} />
            <StatCard label="Failed Payment" value={data.filter((payment) => payment.payment_status === "failed").length} />
            <StatCard label="Branch Revenue" value={formatCurrency(data.filter((payment) => payment.payment_status === "paid").reduce((sum, payment) => sum + Number(payment.amount), 0))} />
          </div>
          <RecentTables payments={data} shipments={[]} />
        </>
      )}
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
  return (
    <section className="content">
      <PageHeader title="Courier dashboard" description="Task shipment yang assigned ke kurir." />
      <StatePanel error={error} loading={loading} />
      {!loading && !error && (
        <>
          <div className="grid metrics">
            <StatCard label="Pickup Task" value={data.filter((shipment) => shipment.handover_method === "pickup" && shipment.status === "pending").length} />
            <StatCard label="Delivery Task" value={data.filter((shipment) => shipment.status === "arrived_at_branch" || shipment.status === "out_for_delivery").length} />
            <StatCard label="Delivered Today" value={data.filter((shipment) => shipment.status === "delivered").length} />
            <StatCard label="Active Shipment" value={data.filter((shipment) => shipment.status !== "delivered" && shipment.status !== "cancelled").length} />
          </div>
          <SimpleShipmentTable shipments={data} />
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
