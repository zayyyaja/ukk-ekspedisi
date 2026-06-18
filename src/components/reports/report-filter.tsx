"use client";

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
    <section className="panel staff-filter">
      <div className="field">
        <label>From date</label>
        <input
          className="input"
          onChange={(event) => setField("fromDate", event.target.value)}
          type="date"
          value={value.fromDate ?? ""}
        />
      </div>
      <div className="field">
        <label>To date</label>
        <input
          className="input"
          onChange={(event) => setField("toDate", event.target.value)}
          type="date"
          value={value.toDate ?? ""}
        />
      </div>
      {showBranch && (
        <div className="field">
          <label>Branch ID</label>
          <input
            className="input"
            onChange={(event) => setField("branchId", event.target.value)}
            placeholder="Opsional"
            value={value.branchId ?? ""}
          />
        </div>
      )}
      {showStatus && (
        <div className="field">
          <label>Status</label>
          <select
            className="select"
            onChange={(event) => setField("status", event.target.value)}
            value={value.status ?? ""}
          >
            <option value="">Semua</option>
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="failed">failed</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
      )}
      {invalid && <div className="alert error">From date tidak boleh lebih besar dari to date.</div>}
    </section>
  );
}
