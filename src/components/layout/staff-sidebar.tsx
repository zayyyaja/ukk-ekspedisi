"use client";

import { LogOut, Package2, ChevronLeft, ChevronRight, Settings, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { staffMenus } from "@/components/layout/navigation";
import { getCurrentUser, logout } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { CurrentUser, StaffRole } from "@/types/customer-portal";

const roleLabel: Record<StaffRole, string> = {
  admin: "Administrator",
  cashier: "Cashier",
  courier: "Courier",
  manager: "Manager",
  owner: "Owner",
};

function isActive(pathname: string, href: string) {
  return href.endsWith("/dashboard") ? pathname === href : pathname.startsWith(href);
}

function SidebarBrand({ role, user, isCollapsed, onToggle }: { role: StaffRole; user: CurrentUser | null, isCollapsed: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-5 mb-2 relative group">
      <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", isCollapsed ? "w-8" : "w-full")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
          <Package2 size={15} strokeWidth={2} />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0 animate-in fade-in duration-300">
            <span className="truncate text-[13px] font-semibold tracking-tight text-ink">DRG Ekspedisi</span>
            <span className="truncate text-[10px] font-medium text-muted uppercase tracking-wider">
              {roleLabel[role]}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={onToggle}
        className={cn(
          "absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface shadow-sm text-muted hover:text-ink transition-all focus:outline-none focus:ring-2 focus:ring-primary/30",
          isCollapsed ? "opacity-100 translate-x-1.5" : "opacity-0 group-hover:opacity-100"
        )}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
}

export function StaffSidebar({ role, isCollapsed, onToggle }: { role: StaffRole, isCollapsed: boolean, onToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((response) => setUser(response.data as CurrentUser))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    setBusy(true);
    await logout().catch(() => null);
    router.replace("/staff/login");
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden flex-col bg-sidebar border-r border-border lg:flex font-body transition-all duration-300 ease-in-out h-screen",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <SidebarBrand role={role} user={user} isCollapsed={isCollapsed} onToggle={onToggle} />

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-6 flex flex-col">
        <div>
          {!isCollapsed && (
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted animate-in fade-in duration-300">
              Workspace
            </div>
          )}
          <nav className="flex flex-col gap-0.5">
            {staffMenus[role].map((item: any) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-sidebar-active text-ink font-semibold"
                      : "text-muted hover:bg-sidebar-hover hover:text-ink",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  {active && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                  )}
                  <Icon
                    size={17}
                    strokeWidth={active ? 2 : 1.5}
                    className={cn(
                      "shrink-0 transition-colors",
                      active ? "text-primary" : "text-muted group-hover:text-ink"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate animate-in fade-in duration-300">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto pt-6">
          {!isCollapsed && (
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted animate-in fade-in duration-300">
              System
            </div>
          )}
          <nav className="flex flex-col gap-0.5">
            {[
              { label: "Settings", icon: Settings },
              { label: "Support", icon: LifeBuoy }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "w-full group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-muted hover:bg-sidebar-hover hover:text-ink",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <Icon size={17} strokeWidth={1.5} className="shrink-0 text-muted group-hover:text-ink transition-colors" />
                  {!isCollapsed && <span className="truncate animate-in fade-in duration-300">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="border-t border-border p-4 mt-auto">
        {!isCollapsed && (
          <div className="mb-4 flex items-center gap-3 px-2 animate-in fade-in duration-300">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-hover text-muted font-semibold text-xs border border-border">
              {(user?.name ?? roleLabel[role]).slice(0, 1).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-[13px] font-semibold text-ink">
                {user?.name ?? roleLabel[role]}
              </span>
              <span className="truncate text-[10px] font-medium text-muted uppercase tracking-wider">
                {roleLabel[role]}
              </span>
            </div>
          </div>
        )}

        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:pointer-events-none disabled:opacity-50",
            isCollapsed ? "justify-center px-0" : "px-3 animate-in fade-in duration-300"
          )}
          title={isCollapsed ? "Log Out" : undefined}
          disabled={busy}
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={17} strokeWidth={1.5} className="shrink-0" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
