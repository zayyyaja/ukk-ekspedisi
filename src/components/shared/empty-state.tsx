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
        "w-full rounded-2xl border border-border bg-surface p-8 shadow-sm",
        className
      )}
    >
      <div className="mx-auto flex   max-w-md flex-col items-center justify-center text-center">
        {/* Icon Container */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Icon className="h-6 w-6" />
        </div>

        {/* Empty State Info */}
        <div className="mt-5 space-y-1.5">
          <h3 className="text-base font-semibold tracking-tight text-ink">
            {title}
          </h3>
          <p className="mx-auto max-w-xs text-sm text-muted">
            {description}
          </p>
        </div>

        {/* Slot Tombol Tindakan Tambahan */}
        {action ? (
          <div className="mt-6 w-full pt-2">
            {action}
          </div>
        ) : null}
      </div>
    </div>
  );
}