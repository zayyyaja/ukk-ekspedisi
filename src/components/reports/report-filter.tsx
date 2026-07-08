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
    <section className="w-full border-4 border-slate-900 bg-amber-50 p-6 font-mono shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md">
      {/* Header Kecil Filter */}
      <div className="mb-6 border-b-2 border-dashed border-slate-900 pb-3">
        <span className="inline-block bg-slate-900 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
          KONTROL PARAMETER
        </span>
        <h4 className="mt-1 text-xs font-black uppercase tracking-wide text-slate-900">
          FILTER FILTER MANIFES & LOG FILING
        </h4>
      </div>

      {/* Grid Input Fields */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Input: From Date */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wider text-slate-700">
            <Calendar size={12} className="stroke-[2.5]" />
            PERIODE AWAL (FROM)
          </label>
          <input
            onChange={(event) => setField("fromDate", event.target.value)}
            type="date"
            value={value.fromDate ?? ""}
            className="h-11 w-full border-2 border-slate-900 bg-white px-3 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all focus:-translate-x-px focus:-translate-y-px focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:outline-none rounded-sm"
          />
        </div>

        {/* Input: To Date */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wider text-slate-700">
            <Calendar size={12} className="stroke-[2.5]" />
            BATAS AKHIR (TO)
          </label>
          <input
            onChange={(event) => setField("toDate", event.target.value)}
            type="date"
            value={value.toDate ?? ""}
            className="h-11 w-full border-2 border-slate-900 bg-white px-3 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all focus:-translate-x-px focus:-translate-y-px focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:outline-none rounded-sm"
          />
        </div>

        {/* Input: Branch ID (Conditional) */}
        {showBranch && (
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wider text-slate-700">
              <MapPin size={12} className="stroke-[2.5]" />
              KODE HUB / CABANG
            </label>
            <input
              onChange={(event) => setField("branchId", event.target.value)}
              placeholder="[ INPUT KODE HUB ]"
              value={value.branchId ?? ""}
              className="h-11 w-full border-2 border-slate-900 bg-white px-3 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all placeholder:text-slate-400 focus:-translate-x-px focus:-translate-y-px focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:outline-none rounded-sm"
            />
          </div>
        )}

        {/* Input: Status (Conditional) */}
        {showStatus && (
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wider text-slate-700">
              <Layers size={12} className="stroke-[2.5]" />
              STATUS KLIRING ARMADA
            </label>
            <div className="relative">
              <select
                onChange={(event) => setField("status", event.target.value)}
                value={value.status ?? ""}
                className="h-11 w-full border-2 border-slate-900 bg-white px-3 text-xs font-black uppercase tracking-wider text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all focus:-translate-x-px focus:-translate-y-px focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:outline-none rounded-sm cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
              >
                <option value="">[ SEMUA STATUS ]</option>
                <option value="pending">PENDING / ANTRIAN</option>
                <option value="paid">PAID / LUNAS</option>
                <option value="failed">FAILED / GAGAL</option>
                <option value="delivered">DELIVERED / TIBA</option>
                <option value="cancelled">CANCELLED / BATAL</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Validasi Error Interval Tanggal */}
      {invalid && (
        <div className="mt-5 flex items-center gap-2.5 border-2 border-slate-900 bg-red-100 p-3 text-2xs font-black uppercase tracking-wide text-red-800 rounded-sm">
          <AlertTriangle size={14} className="shrink-0 stroke-[2.5] text-red-600" />
          <span>[ANOMALI TIMELINE] TANGGAL AWAL TIDAK BOLEH MELEBIHI BATAS AKHIR LOG DATA.</span>
        </div>
      )}
    </section>
  );
}