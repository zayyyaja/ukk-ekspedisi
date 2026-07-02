"use client";

import { LogOut, Store } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { staffMenus } from "@/components/layout/navigation";
import { getCurrentUser, logout } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { CurrentUser, StaffRole } from "@/types/customer-portal";

const roleLabel: Record<StaffRole, string> = {
  admin: "Admin",
  cashier: "Cashier",
  courier: "Courier",
  manager: "Manager",
  owner: "Owner",
};

function isActive(pathname: string, href: string) {
  return href.endsWith("/dashboard") ? pathname === href : pathname.startsWith(href);
}

function branchText(user: CurrentUser | null) {
  if (user?.branchId) {
    return `Cabang #${user.branchId}`;
  }

  return "Cabang Staff";
}

function SidebarBrand({ role }: { role: StaffRole }) {
  const [logoReady, setLogoReady] = useState(false);

  return (
    <div className="p-6 pb-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-lg">
          {!logoReady ? <Store size={28} /> : null}
          <img
            alt="Logo Ekspedisi"
            className={cn("h-12 w-12 object-contain", logoReady ? "block" : "hidden")}
            onError={() => setLogoReady(false)}
            onLoad={() => setLogoReady(true)}
            src="/images/staff-sidebar-logo.png"
          />
        </div>
        <div>
          <div className="text-base font-semibold text-white">Staff</div>
          <div className="text-xs text-orange-100">{roleLabel[role]}</div>
        </div>
      </div>
      <div className="w-full h-px bg-orange-300/30" />
    </div>
  );
}

export function StaffSidebar({ role }: { role: StaffRole }) {
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
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-slate-950 text-white lg:flex">
      <SidebarBrand role={role} />

      <nav className="flex-1 px-4 overflow-y-auto">
        {staffMenus[role].map((item, i) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex w-full items-center justify-start rounded-lg text-left py-3 px-4 transition-all duration-300",
                i !== staffMenus[role].length - 1 && "mb-3",
                active
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-white/80 hover:bg-white/10 hover:text-orange-100"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 pt-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-8 h-8 flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{branchText(user)}</h4>
            <p className="text-[10px] text-orange-100">{roleLabel[role]}</p>
          </div>
        </div>

        <button
          className="flex w-full items-center justify-center rounded-lg bg-white py-2.5 text-sm font-medium text-slate-950 shadow-md transition-all duration-300 hover:bg-orange-50"
          disabled={busy}
          onClick={handleLogout}
          type="button"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
