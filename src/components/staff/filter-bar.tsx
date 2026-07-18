"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

export function FilterBar({
  search,
  onSearch,
  children,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  children?: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className="flex w-full flex-col gap-4 border border-border/40 bg-surface p-4 font-body shadow-sm rounded-2xl md:flex-row md:items-center">
      
      {/* Search Input */}
      {onSearch && (
        <div className="relative flex flex-1 items-center max-w-md">
          <div className="absolute left-3.5 text-muted pointer-events-none">
            <Search size={16} strokeWidth={1.5} />
          </div>
          <input
            ref={inputRef}
            className="
              h-10 w-full rounded-xl border border-border/40 bg-slate-50/50 pl-10 pr-24 
              text-sm font-medium text-ink transition-colors
              placeholder:text-muted focus:bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
            "
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Cari data..."
            value={search ?? ""}
          />
          <div className="absolute right-3 flex items-center gap-1.5">
            {search ? (
              <button
                onClick={() => onSearch("")}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/50 text-muted hover:bg-slate-200 hover:text-ink transition-colors"
                type="button"
                aria-label="Clear search"
              >
                <X size={12} strokeWidth={2} />
              </button>
            ) : null}
            <div className="pointer-events-none hidden select-none items-center gap-1 rounded border border-border/60 bg-surface px-1.5 font-mono text-[10px] font-medium text-muted opacity-100 sm:flex">
              <span>⌘</span>K
            </div>
          </div>
        </div>
      )}

      {/* Children Filter Container */}
      {children && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-4 md:border-t-0 md:pt-0">
          {children}
        </div>
      )}
    </section>
  );
}