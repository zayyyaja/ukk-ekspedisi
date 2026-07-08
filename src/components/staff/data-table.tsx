"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, TableProperties } from "lucide-react";

export function DataTable<T>({
  columns,
  data,
  empty = "Belum ada data.",
  pageSize = 10,
}: {
  columns: ColumnDef<T>[];
  data: T[];
  empty?: string;
  pageSize?: number;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  
  const paginatedData = useMemo(
    () => data.slice((page - 1) * pageSize, page * pageSize),
    [data, page, pageSize],
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Tampilan jika data manifes kosong total
  if (data.length === 0) {
    return (
      <div className="w-full border-4 border-slate-900 bg-white p-8 text-center font-mono shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md">
        <span className="text-2xs font-black uppercase tracking-wider text-slate-400">
          [ EMPTY MANIFEST ] {empty.toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 font-mono">
      {/* Pembungkus Tabel Utama Bergaris Tebal */}
      <div className="w-full overflow-x-auto border-4 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md">
        <table className="w-full border-collapse text-left">
          {/* Header Tabel (Papan Nama Kolom Kaku) */}
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b-4 border-slate-900 bg-slate-950">
                {group.headers.map((header) => (
                  <th 
                    key={header.id}
                    className="p-3.5 text-2xs font-black uppercase tracking-wider text-amber-400 border-r-2 border-slate-800 last:border-r-0"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Isi Baris Data (Zebra Striping Kontras) */}
          <tbody className="divide-y-2 divide-slate-900">
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id} 
                className="bg-white hover:bg-slate-50 transition-colors odd:bg-amber-50/20"
              >
                {row.getVisibleCells().map((cell) => (
                  <td 
                    key={cell.id}
                    className="p-3 text-2xs font-bold uppercase tracking-wide text-slate-900 border-r-2 border-slate-900/10 last:border-r-0 whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Panel Navigasi Halaman (Pagination Kontrol Kontainer) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-2 border-slate-900 bg-white p-3 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rounded-sm">
        {/* Informasi Status Halaman */}
        <div className="flex items-center gap-2 text-2xs font-black uppercase text-slate-700">
          <TableProperties size={14} className="stroke-[2.5]" />
          <span>
            LOG FILING: PAGE <span className="text-slate-950 bg-amber-400 px-1.5 py-0.5 border border-slate-900">{page}</span> DARI {totalPages}
          </span>
        </div>

        {/* Sepasang Tombol Navigasi Brutalist */}
        <div className="flex items-center gap-2">
          {/* Tombol Sebelumnya */}
          <button
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            type="button"
            className="
              inline-flex h-9 items-center justify-center gap-1.5 border-2 border-slate-900 
              bg-white px-4 text-2xs font-black uppercase tracking-wider text-slate-900 
              shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer
              hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]
              active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]
              disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none
            "
          >
            <ArrowLeft size={13} className="stroke-[2.5]" />
            SEBELUMNYA
          </button>

          {/* Tombol Berikutnya */}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            type="button"
            className="
              inline-flex h-9 items-center justify-center gap-1.5 border-2 border-slate-900 
              bg-white px-4 text-2xs font-black uppercase tracking-wider text-slate-900 
              shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer
              hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]
              active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]
              disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none
            "
          >
            BERIKUTNYA
            <ArrowRight size={13} className="stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}