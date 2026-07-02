"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { staffMenus } from "@/components/layout/navigation";
import { getCurrentUser } from "@/lib/auth-client";
import type { CurrentUser, StaffRole } from "@/types/customer-portal";

const roleLabel: Record<StaffRole, string> = {
  admin: "Admin",
  cashier: "Cashier",
  courier: "Courier",
  manager: "Manager",
  owner: "Owner",
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
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur lg:px-10">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <MobileSidebar menu={staffMenus[role]} title={`${roleLabel[role]} menu`} />
        <div className="hidden h-12 w-full max-w-xl items-center gap-3 rounded-2xl bg-slate-100 px-4 text-slate-500 sm:flex">
          <Search size={20} />
          <input className="w-full bg-transparent text-sm outline-none" placeholder="Cari data operasional..." type="search" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
          {(user?.name ?? roleLabel[role]).slice(0, 1).toUpperCase()}
        </div>
        <div className="text-right">
          <strong className="block text-sm">{user?.name ?? roleLabel[role]}</strong>
          <span className="text-xs font-medium text-slate-500">{roleStatus(role, user)}</span>
        </div>
      </div>
    </header>
  );
}
