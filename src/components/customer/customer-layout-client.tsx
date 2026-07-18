"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { CustomerSidebar } from "@/components/layout/customer-sidebar";
import { CustomerGuard } from "@/components/auth/customer-guard";
import { cn } from "@/lib/utils";

export function CustomerLayoutClient({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            staleTime: 3_000,
          },
        },
      }),
  );

  const [isCollapsed, setIsCollapsed] = useState(false);

  const pathname = usePathname();
  const isAuthRoute =
    pathname.startsWith("/customer/login") ||
    pathname.startsWith("/customer/register") ||
    pathname.startsWith("/customer/verify-email");

  if (isAuthRoute) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CustomerGuard>
        <div className="min-h-screen bg-background font-body text-ink antialiased">
          <CustomerSidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
          />

          <div
            className={cn(
              "min-h-screen flex flex-col transition-all duration-300 ease-in-out",
              isCollapsed ? "lg:pl-[104px]" : "lg:pl-[292px]"
            )}
          >
            <main className="w-full flex-1 px-4 py-6 md:px-8 lg:px-10 lg:py-10">
              <div className="mx-auto w-full max-w-[1400px] animate-in fade-in duration-500">
                {children}
              </div>
            </main>
          </div>
        </div>
      </CustomerGuard>
    </QueryClientProvider>
  );
}

