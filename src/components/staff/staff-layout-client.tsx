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
        {/* Kontainer Utama Arsitektur Gudang (Industrial Grid Layout) */}
        <div className="min-h-screen bg-slate-100 font-mono text-slate-950 selection:bg-amber-400 selection:text-slate-950">
          
          {/* Komponen Navigasi Samping */}
          <StaffSidebar role={role} />
          
          {/* Sisi Kanan Layout: Area Topbar dan Ruang Kerja Konten */}
          <div className="min-h-screen lg:pl-67.5 transition-all duration-300">
            {/* Topbar Utama */}
            <StaffTopbar role={role} />
            
            {/* Ruang Konten Kerja Manifes (Gaya Kotak Kargo) */}
            <main className="min-w-0 p-4 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-[1600px] animate-fade-in">
                {children}
              </div>
            </main>
          </div>

        </div>
      </RoleGuard>
    </QueryClientProvider>
  );
}