import { CustomerGuard } from "@/components/auth/customer-guard";
import { CustomerSidebar } from "@/components/layout/customer-sidebar";
import { CustomerTopbar } from "@/components/layout/customer-topbar";

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerGuard>
      <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[260px_minmax(0,1fr)]">
        <CustomerSidebar />
        <main className="min-w-0">
          <CustomerTopbar />
          {children}
        </main>
      </div>
    </CustomerGuard>
  );
}
