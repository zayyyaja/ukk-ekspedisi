"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorState({
  title = "Terjadi kesalahan",
  description = "Data tidak dapat dimuat saat ini.",
  actionLabel,
  onAction,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="w-full rounded-2xl border border-red-100 bg-red-50/50 p-8 shadow-sm">
      <div className="mx-auto flex min-h-55 max-w-md flex-col items-center justify-center text-center">
        
        {/* Error Indicator Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>

        {/* Error Info */}
        <div className="mt-5 space-y-1.5">
          <h3 className="text-base font-semibold tracking-tight text-red-900">
            {title}
          </h3>
          <p className="mx-auto max-w-xs text-sm text-red-700/80">
            {description}
          </p>
        </div>

        {/* Action Button */}
        {actionLabel && onAction ? (
          <div className="mt-6 w-full pt-2">
            <button
              onClick={onAction}
              type="button"
              className="
                inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 
                bg-white px-4 text-sm font-semibold text-red-900 
                shadow-sm transition-colors cursor-pointer
                hover:bg-red-50 active:bg-red-100
              "
            >
              <RefreshCw size={16} />
              {actionLabel}
            </button>
          </div>
        ) : null}

      </div>
    </div>
  );
}