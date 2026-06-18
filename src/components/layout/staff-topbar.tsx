"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { staffMenus } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout } from "@/lib/auth-client";
import type { CurrentUser, StaffRole } from "@/types/customer-portal";

export function StaffTopbar({ role }: { role: StaffRole }) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((response) => setUser(response.data as CurrentUser))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await logout().catch(() => null);
    router.replace("/staff/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar menu={staffMenus[role]} title={`${role} menu`} />
        <div>
          <p className="text-sm font-semibold text-foreground">{user?.name ?? "Staff"}</p>
          <p className="text-xs text-muted-foreground">{user?.email ?? role}</p>
        </div>
      </div>
      <Button onClick={handleLogout} size="sm" type="button" variant="outline">
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </header>
  );
}
