"use client";

import { Calendar, Layers, MapPin, AlertTriangle } from "lucide-react";
import type { ReportFilters } from "@/types/report";

type ReportFilterProps = {
  value: ReportFilters;
  onChange: (value: ReportFilters) => void;
  showBranch?: boolean;
  showStatus?: boolean;
};

export function ReportFilter({
  value,
  onChange,
  showBranch = false,
  showStatus = false,
}: ReportFilterProps) {
  const invalid = value.fromDate && value.toDate && value.fromDate > value.toDate;

  function setField(field: keyof ReportFilters, nextValue: string) {
    onChange({ ...value, [field]: nextValue || undefined });
  }

  return (
    <section className="w-full">
      {/* Filter Header */}
      <div className="mb-4 border-b border-border/40 pb-3 flex items-center gap-2.5">
        <div className="flex items-center justify-center text-muted">
          <Calendar size={16} strokeWidth={1.5} />
        </div>
        <div>
          <h4 className="text-sm font-semibold tracking-tight text-ink">
            Parameter Filter
          </h4>
        </div>
      </div>

      {/* Grid Input Fields */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Input: From Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-muted">
            Periode Awal
          </label>
          <input
            onChange={(event) => setField("fromDate", event.target.value)}
            type="date"
            value={value.fromDate ?? ""}
            className="h-10 w-full rounded-xl border border-border/40 bg-slate-50/50 px-3 text-sm font-medium text-ink transition-colors focus:border-primary focus:outline-none focus:bg-surface focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Input: To Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-muted">
            Batas Akhir
          </label>
          <input
            onChange={(event) => setField("toDate", event.target.value)}
            type="date"
            value={value.toDate ?? ""}
            className="h-10 w-full rounded-xl border border-border/40 bg-slate-50/50 px-3 text-sm font-medium text-ink transition-colors focus:border-primary focus:outline-none focus:bg-surface focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Input: Branch ID (Conditional) */}
        {showBranch && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-muted">
              Kode Cabang
            </label>
            <input
              onChange={(event) => setField("branchId", event.target.value)}
              placeholder="Masukkan kode..."
              value={value.branchId ?? ""}
              className="h-10 w-full rounded-xl border border-border/40 bg-slate-50/50 px-3 text-sm font-medium text-ink transition-colors placeholder:text-muted focus:border-primary focus:outline-none focus:bg-surface focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {/* Input: Status (Conditional) */}
        {showStatus && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-muted">
              Status
            </label>
            <div className="relative">
              <select
                onChange={(event) => setField("status", event.target.value)}
                value={value.status ?? ""}
                className="h-10 w-full appearance-none rounded-xl border border-border/40 bg-slate-50/50 px-3 pr-8 text-sm font-medium text-ink transition-colors focus:border-primary focus:outline-none focus:bg-surface focus:ring-1 focus:ring-primary cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error Validation */}
      {invalid && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-600">
          <AlertTriangle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          <span>Tanggal awal tidak boleh melebihi batas akhir.</span>
        </div>
      )}
    </section>
  );
}