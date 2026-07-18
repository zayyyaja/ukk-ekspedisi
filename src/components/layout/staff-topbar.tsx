"use client";

import { Search, Bell, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { staffMenus } from "@/components/layout/navigation";
import { getCurrentUser } from "@/lib/auth-client";
import type { CurrentUser, StaffRole } from "@/types/customer-portal";
import { CommandMenu } from "@/components/shared/command-menu";

import { NotificationDrawer } from "@/components/staff/notification-drawer";

const roleLabel: Record<StaffRole, string> = {
  admin: "Administrator",
  cashier: "Cashier",
  courier: "Courier",
  manager: "Manager",
  owner: "Owner",
};

export function StaffTopbar({ role }: { role: StaffRole }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((response) => setUser(response.data as CurrentUser))
      .catch(() => setUser(null));
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-6 border-b border-border bg-surface/95 backdrop-blur-md px-4 md:px-8 text-ink">
        <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-6">
            <MobileSidebar menu={staffMenus[role]} title={`${roleLabel[role]} Menu`} />

            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex h-8 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-background/80 px-3 text-sm text-muted transition-colors hover:border-border/80 hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <Search size={15} strokeWidth={1.5} className="shrink-0" />
              <span className="flex-1 text-left font-medium text-[13px]">Cari...</span>
              <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-border/60 bg-surface px-1.5 font-mono text-[9px] font-medium text-muted">
                <span className="text-xs">&#8984;</span>K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-1 text-muted">
              <NotificationDrawer />
              <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-sidebar-hover transition-colors" aria-label="Settings">
                <Settings size={17} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex items-center gap-2.5 border-l border-border pl-3">
              <div className="text-right hidden sm:block">
                <span className="block text-[13px] font-semibold tracking-tight text-ink leading-tight">
                  {user?.name ?? roleLabel[role]}
                </span>
                <span className="block text-[10px] font-medium text-muted uppercase tracking-wider leading-tight">
                  {roleLabel[role]}
                </span>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-sidebar-hover text-muted font-semibold text-xs border border-border rounded-lg">
                {(user?.name ?? roleLabel[role]).slice(0, 1).toUpperCase()}
              </div>
            </div>
        </div>
      </header>

      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} role={role} />
    </>
  );
}
