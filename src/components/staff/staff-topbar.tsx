"use client";

import { LogOut, Radio, CloudOff } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/lib/auth-client";
import type { CurrentUser, StaffRole } from "@/types/customer-portal";

export function StaffTopbar({ 
  user, 
  role 
}: { 
  user?: CurrentUser | null; 
  role?: StaffRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Membuat breadcrumb/jejak navigasi otomatis uppercase khas manifes
  const crumb = pathname.split("/").filter(Boolean).slice(1).join(" / ");

  async function handleLogout() {
    await logout().catch(() => null);
    router.replace("/staff/login");
  }

  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    if (role !== "courier") return;
    
    const loadCount = async () => {
      try {
        const { getQueuedUpdates } = await import("@/lib/offline-queue");
        const updates = await getQueuedUpdates();
        setOfflineCount(updates.length);
      } catch (e) {}
    };

    loadCount();
    
    window.addEventListener("pwa-queue-updated", loadCount);
    return () => window.removeEventListener("pwa-queue-updated", loadCount);
  }, [role]);

  // Mengambil nama user, atau fallback ke role, atau default ke "STAFF OPERASIONAL"
  const identityName = user?.name ?? (role ? String(role) : "Staff Operasional");

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 font-body shadow-sm sm:px-6 lg:px-8">
      {/* Sisi Kiri: Informasi Transmisi Jalur Menu & Operator */}
      <div className="flex items-center gap-3">
        
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            {crumb || "Dashboard"}
          </span>
          <strong className="text-sm font-semibold tracking-tight text-ink">
            {identityName}
          </strong>
        </div>
      </div>

      {/* Sisi Kanan: Topbar Actions */}
      <div className="flex items-center gap-3">
        {offlineCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <CloudOff size={14} className="animate-pulse" />
            <span className="text-[10px] font-bold tracking-tight">
              {offlineCount} TERTUNDA
            </span>
          </div>
        )}

        <button 
          className="
            inline-flex h-9 items-center justify-center gap-2 border border-border 
            bg-surface px-4 text-xs font-semibold text-ink 
          shadow-sm transition-all rounded-xl cursor-pointer 
          hover:bg-slate-50 hover:text-destructive
        " 
        onClick={handleLogout} 
        type="button"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Keluar</span>
        <span className="sm:hidden">Keluar</span>
      </button>
      </div>
    </header>
  );
}