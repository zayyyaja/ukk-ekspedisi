"use client";

import { Bell, Search, Settings } from "lucide-react";
import { useEffect, useState } from "react";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { customerMenu } from "@/components/layout/navigation";
import { getCurrentUser } from "@/lib/auth-client";
import { CommandMenu } from "@/components/shared/command-menu";

export function BentoHeader() {
  const [user, setUser] = useState<{name?: string; email?: string} | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((response) => setUser(response.data as {name?: string; email?: string}))
      .catch(() => setUser(null));
  }, []);

  const customerName = user?.name ? String(user.name) : (user?.email ? String(user.email).split("@")[0] : "Customer");

  return (
    <>
      <div className="col-span-1 md:col-span-4 lg:col-span-12 flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Trigger */}
          <div className="lg:hidden">
            <MobileSidebar menu={customerMenu} title="Customer Menu" />
          </div>

          {/* Grid-Aligned Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-full max-w-[320px] items-center gap-2 rounded-xl border border-border/40 bg-surface px-3 text-sm text-muted shadow-sm transition-all hover:border-border/80 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <Search size={16} strokeWidth={2} className="shrink-0" />
            <span className="flex-1 text-left font-medium">Search shipments...</span>
            <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-border/50 bg-background px-1.5 font-mono text-[10px] font-medium text-muted">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Grid-Aligned Quick Actions & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-surface text-muted shadow-sm transition-all hover:text-ink hover:border-border/80">
            <Bell size={18} strokeWidth={1.5} />
            {/* Example unread badge */}
            <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-primary" />
          </button>
          
          <div className="h-6 w-px bg-border/40 hidden sm:block" />

          <button className="flex items-center gap-2 rounded-xl border border-border/40 bg-surface p-1 pr-3 shadow-sm transition-all hover:border-border/80">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted font-semibold text-xs border border-border/50">
              {customerName.slice(0, 1).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-semibold tracking-tight text-ink">
              {customerName}
            </span>
          </button>
        </div>
      </div>

      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} role={"admin"} />
    </>
  );
}
