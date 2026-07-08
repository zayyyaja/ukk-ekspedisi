"use client";

import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title = "Belum ada data",
  description = "Data akan muncul setelah aktivitas tersedia.",
  icon: Icon = PackageOpen,
  action,
  className,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full border-4 border-slate-900 bg-white p-8 font-mono shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md",
        className
      )}
    >
      <div className="mx-auto flex   max-w-md flex-col items-center justify-center text-center">
        {/* Kontainer Ikon Brutalist */}
        <div className="flex h-14 w-14 items-center justify-center border-2 border-slate-900 bg-amber-400 text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rounded-sm">
          <Icon className="h-6 w-6 stroke-[2.5]" />
        </div>

        {/* Blok Informasi Status Kosong */}
        <div className="mt-5 space-y-1.5">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
            [ NIHIL ] {title.toUpperCase()}
          </h3>
          <p className="text-2xs font-bold uppercase tracking-wide text-slate-500 max-w-xs mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Slot Tombol Tindakan Tambahan */}
        {action ? (
          <div className="mt-6 w-full border-t-2 border-dashed border-slate-900 pt-5">
            {action}
          </div>
        ) : null}
      </div>
    </div>
  );
}