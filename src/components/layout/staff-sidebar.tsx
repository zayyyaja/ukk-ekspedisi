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
  admin: "ADMINISTRATOR",
  cashier: "KASIR HUB",
  courier: "KURIR LAPANGAN",
  manager: "MANAJER WILAYAH",
  owner: "DIREKSI / OWNER",
};

function isActive(pathname: string, href: string) {
  return href.endsWith("/dashboard") ? pathname === href : pathname.startsWith(href);
}

function branchText(user: CurrentUser | null) {
  if (user?.branchId) {
    return `KODE CABANG #${user.branchId}`;
  }
  return "CABANG STAFF";
}

function SidebarBrand({ role }: { role: StaffRole }) {
  const [logoReady, setLogoReady] = useState(false);

  return (
    <div className="p-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        {/* Logo Container - Kotak Geometris Tebal */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-ink bg-cargo-amber rounded-app shadow-stamp-sm">
          {!logoReady ? <Store size={22} className="text-ink stroke-[2.5]" /> : null}
          <img
            alt="Logo Ekspedisi"
            className={cn("h-10 w-10 object-contain grayscale", logoReady ? "block" : "hidden")}
            onError={() => setLogoReady(false)}
            onLoad={() => setLogoReady(true)}
            src="/images/staff-sidebar-logo.png"
          />
        </div>
        <div>
          <div className="font-display text-xs font-black tracking-widest text-steel uppercase">
            DANISH // STAFF
          </div>
          <div className="font-display text-sm font-black text-ink uppercase tracking-tight">
            {roleLabel[role]}
          </div>
        </div>
      </div>
      {/* Garis Pembatas Manifes */}
      <div className="w-full h-0.5 bg-ink" />
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
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-paper text-ink border-r-4 border-ink lg:flex">
      {/* Bagian Identitas Atas */}
      <SidebarBrand role={role} />

      {/* Navigasi Menu Utama */}
      <nav className="flex-1 px-4 overflow-y-auto grid gap-1.5 content-start py-2">
        {staffMenus[role].map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                "flex w-full items-center justify-start border-2 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all rounded-app",
                active
                  ? "bg-ink text-paper border-ink shadow-stamp-sm"
                  : "text-ink border-transparent hover:bg-ink/5 hover:border-ink"
              )}
            >
              <Icon className={cn("mr-3 h-4 w-4 stroke-[2.5]", active && "scale-105")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bagian Informasi Cabang & Tombol Log Keluar */}
      <div className="p-4 border-t-2 border-ink/10 bg-paper">
        <div className="flex items-center gap-3 mb-4 px-2 py-2 border-2 border-dashed border-ink/30 rounded-app bg-ink/2">
          <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse shrink-0" />
          <div className="min-w-0">
            <h4 className="font-mono text-[10px] font-bold text-ink truncate">
              {branchText(user)}
            </h4>
            <p className="font-mono text-[9px] text-steel tracking-wide uppercase">
              GATEWAY SECURE
            </p>
          </div>
        </div>

        {/* Button Logout - Neo-Brutalist Stamp Action */}
        <button
          className="flex w-full items-center justify-center border-2 border-ink bg-cargo-amber py-2.5 font-display text-xs font-bold uppercase tracking-wider text-ink shadow-stamp-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-stamp active:translate-x-0 active:translate-y-0 active:shadow-stamp-sm rounded-app disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          disabled={busy}
          onClick={handleLogout}
          type="button"
        >
          <LogOut className="mr-2 h-4 w-4 stroke-[2.5]" />
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
}