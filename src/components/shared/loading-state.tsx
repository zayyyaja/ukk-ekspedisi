"use client";

import { Loader2 } from "lucide-react";

export function LoadingState({
  title = "Memuat data",
  rows = 3,
}: {
  title?: string;
  rows?: number;
}) {
  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="space-y-5">
        
        {/* Loading Indicator */}
        <div className="flex items-center gap-2.5 border-b border-border pb-3 text-sm font-semibold text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{title}...</span>
        </div>
        
        {/* Skeleton Rows */}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 rounded-xl border border-border bg-slate-50/50 p-2.5 animate-pulse"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Skeleton Block */}
              <div className="h-3 w-6 rounded-sm bg-slate-200 shrink-0" />
              
              {/* Skeleton Line */}
              <div className="h-2 w-full rounded-sm bg-slate-100" />
              
              {/* Skeleton Variation */}
              <div className="hidden h-2 rounded-sm bg-slate-100 sm:block" style={{ width: `${(index % 3 + 1) * 20}%` }} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}