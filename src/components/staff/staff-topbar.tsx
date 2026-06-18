"use client";

import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { logout } from "@/lib/auth-client";
import type { CurrentUser } from "@/types/customer-portal";

export function StaffTopbar({ user }: { user: CurrentUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const crumb = pathname.split("/").filter(Boolean).slice(1).join(" / ");

  async function handleLogout() {
    await logout().catch(() => null);
    router.replace("/staff/login");
  }

  return (
    <header className="staff-topbar">
      <div>
        <span className="muted">{crumb}</span>
        <strong>{user?.name ?? "Staff"}</strong>
      </div>
      <button className="button secondary" onClick={handleLogout} type="button">
        <LogOut size={17} />
        Logout
      </button>
    </header>
  );
}
