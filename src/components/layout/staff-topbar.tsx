"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { staffMenus } from "@/components/layout/navigation";
import { getCurrentUser } from "@/lib/auth-client";
import type { CurrentUser, StaffRole } from "@/types/customer-portal";

// Kamus Label Peran - Diubah ke format kapital manifes agar serasi dengan sistem
const roleLabel: Record<StaffRole, string> = {
  admin: "ADMINISTRATOR",
  cashier: "KASIR HUB",
  courier: "KURIR LAPANGAN",
  manager: "MANAJER WILAYAH",
  owner: "DIREKSI / OWNER",
};

function roleStatus(role: StaffRole, user: CurrentUser | null) {
  const branch = user?.branchId ? `Cabang #${user.branchId}` : "Staff";
  return `${roleLabel[role]} ${branch} - ${roleLabel[role]}`;
}

export function StaffTopbar({ role }: { role: StaffRole }) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((response) => setUser(response.data as CurrentUser))
      .catch(() => setUser(null));
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b-4 border-ink bg-paper px-4 text-ink lg:px-10">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Trigger Sidebar Mobile */}
        <MobileSidebar menu={staffMenus[role]} title={`${roleLabel[role]} MENU`} />
        
        {/* Search Bar - Format Kotak Bergaris Tebal & Efek Bayangan Stamp */}
        <div className="hidden h-12 w-full max-w-xl items-center gap-3 border-2 border-ink bg-paper px-4 text-ink rounded-app shadow-stamp-sm focus-within:shadow-stamp focus-within:-translate-x-px focus-within:-translate-y-px transition-all sm:flex">
          <Search size={18} className="text-steel stroke-[2.5] shrink-0" />
          <input 
            className="w-full bg-transparent font-body text-xs font-bold uppercase tracking-wider text-ink outline-none placeholder:text-steel/60" 
            placeholder="CARI DATA OPERASIONAL MANIFEST..." 
            type="search" 
          />
        </div>
      </div>

      {/* Sisi Kanan: Profil Informasi Pengguna Aktif */}
      <div className="flex items-center gap-3.5 shrink-0">
        {/* Teks Identitas - Tipografi Tegas Berbasis Grid */}
        <div className="text-right hidden sm:block">
          <strong className="block font-display text-xs font-black uppercase tracking-tight text-ink">
            {user?.name ?? roleLabel[role]}
          </strong>
          <span className="mt-0.5 block font-mono text-[9px] font-bold uppercase tracking-wide text-steel">
            {roleStatus(role, user)}
          </span>
        </div>

        {/* Avatar Inisial - Kotak Geometris Tebal Berwarna Cargo Amber (Tanpa Oranye) */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-ink bg-cargo-amber font-display text-sm font-black text-ink rounded-app shadow-stamp-sm">
          {(user?.name ?? roleLabel[role]).slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
}