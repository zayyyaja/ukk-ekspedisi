"use client";

import { LogOut, Package2, ChevronLeft, ChevronRight, Settings, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { customerMenu } from "@/components/layout/navigation";
import { getCurrentUser, logout } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/customer") return pathname === "/customer";
  return pathname.startsWith(href);
}

export function CustomerSidebar({ isCollapsed, onToggle }: { isCollapsed: boolean, onToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<{name?: string; email?: string} | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((response) => setUser(response.data as {name?: string; email?: string}))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    setBusy(true);
    await logout().catch(() => null);
    router.replace("/customer/login");
  }

  const customerName = user?.name ? String(user.name) : (user?.email ? String(user.email).split("@")[0] : "Customer");

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 hidden flex-col bg-surface border border-border/40 lg:flex font-body transition-all duration-300 ease-in-out m-4 h-[calc(100vh-32px)] rounded-2xl shadow-sm",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex items-center justify-between px-4 py-5 mb-2 relative group">
        <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", isCollapsed ? "w-8" : "w-full")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Package2 size={16} strokeWidth={2} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-300">
              <span className="truncate text-[13px] font-semibold tracking-tight text-ink">DRG Ekspedisi</span>
              <span className="truncate text-[10px] font-medium text-muted uppercase tracking-wider">
                Customer Portal
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

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-6 flex flex-col">
        {/* Main Navigation Group */}
        <div>
          {!isCollapsed && (
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-tight text-muted/60 animate-in fade-in duration-300">
              Ruang kerja
            </div>
          )}
          <nav className="flex flex-col gap-1">
            {customerMenu.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-background shadow-sm border border-border/40 text-primary"
                      : "text-muted hover:bg-background hover:text-ink border border-transparent",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  {active && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}
                  <Icon
                    size={18}
                    strokeWidth={1.5}
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

        {/* System Group */}
        <div className="mt-auto pt-6">
          {!isCollapsed && (
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-tight text-muted/60 animate-in fade-in duration-300">
              System
            </div>
          )}
          <nav className="flex flex-col gap-1">
            {[
              { label: "Settings", icon: Settings, href: "/customer/profile" },
              { label: "Support", icon: LifeBuoy, href: "#" }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "w-full group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-muted hover:bg-background hover:text-ink border border-transparent",
                    isCollapsed && "justify-center px-0"
                  )}
                >
                  <Icon size={18} strokeWidth={1.5} className="shrink-0 text-muted group-hover:text-ink transition-colors" />
                  {!isCollapsed && <span className="truncate animate-in fade-in duration-300">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User & Logout Section */}
      <div className="border-t border-border/40 p-4 mt-auto">
        {!isCollapsed && (
          <div className="mb-4 flex items-center gap-3 px-2 animate-in fade-in duration-300">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-muted font-semibold text-xs border border-border/50">
              {customerName.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-[13px] font-semibold text-ink">
                {customerName}
              </span>
              <span className="truncate text-[11px] text-muted">
                Customer
              </span>
            </div>
          </div>
        )}

        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-50",
            isCollapsed ? "justify-center px-0" : "px-3 animate-in fade-in duration-300"
          )}
          title={isCollapsed ? "Keluar" : undefined}
          disabled={busy}
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={20} className={cn("text-muted", isCollapsed && "mx-auto")} />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
