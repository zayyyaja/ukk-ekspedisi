"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { staffMenus } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";
import type { StaffRole } from "@/types/customer-portal";

function isActive(pathname: string, href: string) {
  return href.endsWith("/dashboard") ? pathname === href : pathname.startsWith(href);
}

export function StaffSidebar({ role }: { role: StaffRole }) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen border-r border-slate-800 bg-slate-950 px-4 py-5 text-white lg:block">
      <div className="px-2">
        <div className="text-lg font-bold">Ekspedisi Staff</div>
        <span className="mt-2 inline-flex rounded-full border border-slate-700 px-2 py-0.5 text-xs font-semibold uppercase text-slate-300">
          {role}
        </span>
      </div>
      <nav className="mt-8 grid gap-1">
        {staffMenus[role].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white",
                isActive(pathname, item.href) && "bg-slate-800 text-white",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
