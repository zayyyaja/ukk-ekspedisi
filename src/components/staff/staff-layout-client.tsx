"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { RoleGuard } from "@/components/auth/role-guard";
import { StaffSidebar } from "@/components/layout/staff-sidebar";
import { StaffTopbar } from "@/components/layout/staff-topbar";
import type { StaffRole } from "@/types/customer-portal";

function roleFromPath(pathname: string): StaffRole | undefined {
  const role = pathname.split("/")[2];
  if (role === "admin" || role === "cashier" || role === "courier" || role === "manager" || role === "owner") {
    return role;
  }

  return undefined;
}

export function StaffLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = roleFromPath(pathname);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchInterval: 4_000,
            refetchOnWindowFocus: true,
            staleTime: 2_000,
          },
        },
      }),
  );

  if (!role) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RoleGuard allowedRoles={[role]}>
        <div className="min-h-screen bg-[#f8fbff] text-slate-950">
          <StaffSidebar role={role} />
          <div className="min-h-screen lg:pl-[260px]">
            <StaffTopbar role={role} />
            <main className="min-w-0">{children}</main>
          </div>
        </div>
      </RoleGuard>
    </QueryClientProvider>
  );
}
