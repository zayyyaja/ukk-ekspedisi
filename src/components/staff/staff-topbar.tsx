"use client";

import { LogOut, Radio } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

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

  // Mengambil nama user, atau fallback ke role, atau default ke "STAFF OPERASIONAL"
  const identityName = user?.name ?? (role ? String(role) : "Staff Operasional");

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b-4 border-slate-900 bg-white px-4 font-mono sm:px-6 lg:px-8">
      {/* Sisi Kiri: Informasi Transmisi Jalur Menu & Operator */}
      <div className="flex items-center gap-3">
        {/* Lampu Indikator Transmisi Sistem */}
        <div className="hidden h-8 w-8 items-center justify-center border-2 border-slate-900 bg-amber-400 text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-sm sm:flex">
          <Radio size={14} className="animate-pulse stroke-[2.5]" />
        </div>
        
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            NET_LOC // {crumb || "ROOT"}
          </span>
          <strong className="text-2xs font-black uppercase tracking-wide text-slate-900">
            OPERATOR: <span className="text-amber-600">[{identityName}]</span>
          </strong>
        </div>
      </div>

      {/* Sisi Kanan: Tombol Terminasi Sesi (Logout) */}
      <button 
        className="
          inline-flex h-10 items-center justify-center gap-2 border-2 border-slate-900 
          bg-rose-500 px-4 text-2xs font-black uppercase tracking-wider text-white 
          shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm cursor-pointer 
          hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] 
          active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]
        " 
        onClick={handleLogout} 
        type="button"
      >
        <LogOut size={14} className="stroke-3" />
        <span className="hidden sm:inline">TERMINATE SESI</span>
        <span className="sm:hidden">LOGOUT</span>
      </button>
    </header>
  );
}