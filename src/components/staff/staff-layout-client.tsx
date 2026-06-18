"use client";

import { usePathname } from "next/navigation";

import { RoleGuard } from "@/components/auth/role-guard";
import { StaffSidebar } from "@/components/layout/staff-sidebar";
import { StaffTopbar } from "@/components/layout/staff-topbar";
import type { StaffRole } from "@/types/customer-portal";

function roleFromPath(pathname: string): StaffRole | undefined {
  const role = pathname.split("/")[2];
  if (role === "admin" || role === "cashier" || role === "courier" || role === "manager") {
    return role;
  }

  return undefined;
}

export function StaffLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = roleFromPath(pathname);

  if (!role) {
    return <>{children}</>;
  }

  return (
    <RoleGuard allowedRoles={[role]}>
      <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[272px_minmax(0,1fr)]">
        <StaffSidebar role={role} />
        <main className="min-w-0">
          <StaffTopbar role={role} />
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
