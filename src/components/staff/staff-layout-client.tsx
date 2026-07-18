"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { RoleGuard } from "@/components/auth/role-guard";
import { StaffSidebar } from "@/components/layout/staff-sidebar";
import { StaffTopbar } from "@/components/layout/staff-topbar";
import { OpsStatusBar } from "@/components/staff/enterprise/ops-status-bar";
import { cn } from "@/lib/utils";
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
            refetchOnWindowFocus: true,
            staleTime: 2_000,
          },
        },
      }),
  );

  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!role) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RoleGuard allowedRoles={[role]}>
        <div className="min-h-screen bg-background font-body text-ink antialiased">
          <StaffSidebar
            role={role}
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
          />

          <div
            className={cn(
              "min-h-screen transition-all duration-300 ease-in-out",
              isCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
            )}
          >
            <StaffTopbar role={role} />
            <OpsStatusBar />

            <main className="w-full px-4 py-6 md:px-8 lg:px-10 lg:py-8">
              <div className="mx-auto w-full max-w-[1400px] animate-in fade-in duration-500">
                {children}
              </div>
            </main>
          </div>
        </div>
      </RoleGuard>
    </QueryClientProvider>
  );
}
