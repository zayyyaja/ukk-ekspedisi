"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PageHeader({
  title,
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  const translationMap: Record<string, string> = {
    staff: "Staf",
    admin: "Admin",
    manager: "Manager",
    cashier: "Kasir",
    courier: "Kurir",
    branches: "Cabang",
    shipments: "Pengiriman",
    payments: "Pembayaran",
    vehicles: "Kendaraan",
    dashboard: "Beranda",
  };

  const roleNames = ["admin", "manager", "cashier", "courier"];

  const breadcrumbs = paths
    .map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join("/")}`;
      const label = translationMap[path] || (path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " "));
      
      const isRootStaff = index === 0 && path === "staff";
      const isRole = index === 1 && roleNames.includes(path);
      const isDashboard = path === "dashboard";
      
      return { href, label, isRootStaff, isRole, isDashboard };
    })
    .filter(crumb => !crumb.isRootStaff)
    .filter((crumb, _, arr) => {
      const hasDashboard = arr.some(c => c.isDashboard);
      if (crumb.isRole && hasDashboard) return false;
      return true;
    });

  // Jika setelah difilter, item terakhir adalah "dashboard" ("Beranda"), 
  // maka breadcrumb-nya akan jadi "Beranda > Beranda". 
  // Kita hilangkan "Beranda" di awal jika breadcrumbs.length === 1 dan itu adalah dashboard.
  const isOnlyDashboard = breadcrumbs.length === 1 && breadcrumbs[0].isDashboard;

  return (
    <div className="mb-6 flex w-full flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        {/* Breadcrumb System */}
        <nav className="flex items-center gap-1.5 text-[11px] font-medium text-muted uppercase tracking-wider mb-2">
          {!isOnlyDashboard && (
            <>
              <Link href="/" className="hover:text-ink transition-colors">Beranda</Link>
              {breadcrumbs.length > 0 && <ChevronRight size={12} className="opacity-50" />}
            </>
          )}
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.href} className="flex items-center gap-1.5">
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-ink font-semibold">{crumb.label}</span>
              ) : (
                <>
                  <Link href={crumb.href} className="hover:text-ink transition-colors">{crumb.label}</Link>
                  <ChevronRight size={12} className="opacity-50" />
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Page Title & Description */}
        {title && (
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm font-medium text-muted">
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {title && action && (
        <div className="mt-4 shrink-0 sm:mt-0">
          {action}
        </div>
      )}
    </div>
  );
}