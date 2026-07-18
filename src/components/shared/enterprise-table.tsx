"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, TableProperties, Inbox } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function EnterpriseTable<T>({
  columns,
  data,
  emptyTitle = "Belum ada data",
  emptyDescription = "Belum ada data yang tersedia untuk ditampilkan.",
  pageSize = 10,
}: {
  columns: ColumnDef<T>[];
  data: T[];
  emptyTitle?: string;
  emptyDescription?: string;
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

  if (data.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} icon={Inbox} className="mt-4" />
    );
  }

  return (
    <div className="w-full space-y-5 font-body">
      <div className="w-full overflow-x-auto overflow-y-auto max-h-[600px] border border-border/40 bg-surface rounded-2xl shadow-sm">
        <table className="w-full table-fixed border-collapse text-left relative">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-border/40 bg-slate-50/90 backdrop-blur-md sticky top-0 z-10">
                {group.headers.map((header) => (
                  <th 
                    key={header.id}
                    className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted whitespace-nowrap"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-border/40">
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id} 
                className="bg-transparent hover:bg-slate-50/50 transition-colors duration-200"
              >
                {row.getVisibleCells().map((cell) => {
                  const val = cell.getValue();
                  const titleStr = typeof val === 'string' || typeof val === 'number' ? String(val) : undefined;
                  return (
                    <td 
                      key={cell.id}
                      className="py-3 px-4 text-sm font-medium text-ink truncate max-w-[200px]"
                      title={titleStr}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="flex items-center gap-2 text-sm font-medium text-muted">
          <TableProperties size={16} className="text-muted" strokeWidth={1.5} />
          <span>
            Halaman <strong className="text-ink font-semibold">{page}</strong> dari {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            type="button"
            className="
              inline-flex h-9 items-center justify-center gap-2 border border-border/50 
              bg-surface px-4 text-xs font-semibold text-ink 
              shadow-sm transition-all rounded-lg cursor-pointer
              hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
              disabled:pointer-events-none disabled:opacity-40
            "
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Sebelumnya
          </button>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            type="button"
            className="
              inline-flex h-9 items-center justify-center gap-2 border border-border/50 
              bg-surface px-4 text-xs font-semibold text-ink 
              shadow-sm transition-all rounded-lg cursor-pointer
              hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
              disabled:pointer-events-none disabled:opacity-40
            "
          >
            Selanjutnya
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
